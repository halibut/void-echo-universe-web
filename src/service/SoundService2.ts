import State from "./State";
import Subscription from "./Subscription";
import debug from "../components/Debug";
import { SongSourceType, TrackDataType } from "./SongData";

declare global {
    interface Window { webkitAudioContext: AudioContext; }
}

const AudioContext = window.AudioContext || window.webkitAudioContext;

//This class attempts to set up an audio context and processing
//chain with volume control and FFT analysis. The final chain will look
//something like this.
//
// [media source]--
//                 \
// [media source]--[mediaTargetNode]---[fftNode]---[gainNode]---[destination]
//                 /                
// [media source]--                  
//
//Note that most of the time there will only be one [media source] at a time
//but all of them will connect to the same [mediaTargetNode]

const READY_STATES = {
    CAN_PLAY_THROUGH: 4
};

type SoundElementData = {
    element:HTMLAudioElement|null;
    data:TrackDataType|null;
    touched:boolean;
    touchPromise:Promise<any>|null;
    loop?:boolean;
    mediaSource:MediaElementAudioSourceNode|null;
}

type TimeEventHandler = (handlerTime:number, currentSongTime:number)=>void

type TimeEventData = {
    time:number;
    repeatable:boolean;
    safeHandler:TimeEventHandler;
    executeIfPassed:boolean;
}

export type SoundServiceEvent = {
    event: "canplaythrough" | "30secondwarning" | "5secondwarning" | "1secondwarning" |
           "seeked" | "playing" | "paused" | "ended" | "soundmounted",
    seekTime?: number,
    timeRemaining?: number,
}

export type SoundServiceStateEvent = {
    enabled: boolean,
    audioContextState: AudioContextState,
}

export type SetSoundOptions = {
    play?:boolean,
    loop?:boolean,
    fadeOutBeforePlay?:number,
}

export class SoundService2Cls {
    ac:AudioContext | null = null;
    gainNode:GainNode | null = null;
    fftNode:AnalyserNode | null = null;
    fftBuffer:Uint8Array | null = null;
    mediaTargetNode:GainNode | null = null;

    soundSubscribers:Subscription<HTMLAudioElement> = new Subscription("sound-subs");
    eventSubscribers:Subscription<SoundServiceEvent> = new Subscription("sound-events");
    enabledSubscribers:Subscription<SoundServiceStateEvent> = new Subscription("ac-enabled-subs");
    activeIndex:number = -1;
    options:SetSoundOptions = {loop:false};
    soundElements:SoundElementData[] = [];
    timeEvents:TimeEventData[] = [];
    nextTimeEventInd:number = 0;

    private _readyToPlay:boolean = false;
    private _readyState:number = -1;
    private _warn30Seconds:boolean = false;
    private _warn5Seconds:boolean = false;
    private _warn1Second:boolean = false;

    static EVENTS = {
        CAN_PLAY_THROUGH: "canplaythrough",
        WARN_30_SECONDS_REMAINING: "30secondwarning",
        WARN_5_SECONDS_REMAINING: "5secondwarning",
        WARN_1_SECOND_REMAINING: "1secondwarning",
        SEEKED: "seeked",
        PLAYING: "playing",
        PAUSED: "paused",
        ENDED: "ended",
        SOUND_MOUNTED: "soundmounted",
    };

    constructor() {
        this.init();
    }

    setSongData = (songData:{ [key: string]: TrackDataType} ) => {
       this.soundElements = Object.keys(songData).map(k => {
            const sd = songData[k];
            return {
                title: sd.title,
                data: sd,
                element: null,
                mediaSource: null,
                touchPromise: null,
                touched: false,
            }
        });
    }

    init = () => {
        debug("Initializing Audio Context...");

        try {
            
            this.ac = new AudioContext({latencyHint:'interactive'});
            debug("Audio Context: "+this.ac.state);

            this.ac.addEventListener("statechange", this._handleStateChange);

            //Create a Gain node. This node will solely be used
            //to control output volume. Attach to the destination node.
            this.gainNode = this.ac.createGain();
            this.gainNode.connect(this.ac.destination);
            if (State.getStateValue("muted", false)) {
                this.gainNode.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.1);
            } else {
                const lastVol = State.getStateValue("last-volume", 1);
                this.gainNode.gain.linearRampToValueAtTime(lastVol, this.ac.currentTime + 0.1);
            }

            //Create a FFT/analyser node.
            //Will provide FFT analysis for all sounds passed through
            //the target node, before final volume controls
            this.fftNode = this.ac.createAnalyser();
            this.fftNode.fftSize = 2048;
            const bufferLength = this.fftNode.frequencyBinCount;
            this.fftBuffer = new Uint8Array(bufferLength);
            this.fftNode.connect(this.gainNode);

            debug("FFT Buffer: "+bufferLength);

            //Create a node that we can connect audio media to
            //It's just a convenient node that we can attach other 
            //nodes to (like the fft/analyser node)
            //Attatch to the gain node
            this.mediaTargetNode = this.ac.createGain();
            this.mediaTargetNode.gain.value = 1;
            this.mediaTargetNode.connect(this.fftNode);

            //Set the gain/volume to whatever was last set by the user
            if (State.getStateValue("muted", false)) {
                debug("Sound was muted last session.");
                this.gainNode.gain.value = 0;
            } else {
                const lastVol = State.getStateValue("last-volume", 1);
                debug("Last volume: "+lastVol);
                this.gainNode.gain.value = lastVol;
            }
            
        }
        catch(e) {
            this.ac = null;
            debug("Error initializing AudioContext. Probably awaiting user input event." + e);
            console.error(e);
        }
    };

    _handleStateChange = () => {
        const state = this.ac?.state;
        this.enabledSubscribers.notifySubscribers({
            enabled: state === "running",
            audioContextState: state ? state : "closed",
        });
    }

    isSuspended = () => {
        //debug("AC state: "+this.ac.state);
        return this.ac && this.ac.state !== 'running';
    }

    /**
     * Attempt to initialize the AudioContext and make sure it is not suspended.
     * Parts of this function may happen synchronously and some may happen asynchronously.
     * The callback will be called synchronously whenever possible.
     * @param {*} callback 
     */
    tryResume = (callback?:(success:boolean)=>void) => {

        //Some browsers won't let us set up an AudioContext at all until the user
        //has provided an input event. So this detects this case and tries to re-initialize
        if(!this.ac) {
            this.init();
            if (!this.ac) {
                debug("Wow, AudioContext init unsuccessful.");
                return;
            }
        }

        //If the AudioContext is suspended, then try to resume it. 
        if(this.isSuspended()) {
            try {
                debug("Sound AudioContext suspended. Trying to resume.")
                const resumePromise = this.ac.resume();
                if (/*!Utils.isIOS() &&*/ resumePromise) {
                    resumePromise.then(() => {
                        debug("AudioContext resumed.");
                        if (callback) {
                            callback(true);
                        }
                    }).catch((e) => {
                        debug("AudioContext could not be resumed."+e);
                        console.error(e);
                        if (callback) {
                            callback(false);
                        }
                    });
                } else {
                    debug("No resume promise, or we're on IOS!");
                    if (callback) {
                        callback(true);
                    }
                }
            } catch (e) {
                debug("Error attempting to resume AudioContext."+e);
                console.error(e);
            }
        } else {
            if (callback) {
                callback(true);
            }
        }
    }

    registerElement = (element:HTMLAudioElement, index:number) => {
        this.soundElements[index].element = element;
        debug("Song["+index+"] registered.");
    }

    /**
     * Attempt to initialize the specified sound and prepare it for automated control.
     * Some aspects of initialization are asynchronous, hence the callback. We'd use promises,
     * except that IOS isn't good about propagating user click events to the play method 
     * of the html element. So the callback is only called asynchronously if strictly necessary.
     * Most of the time it will execute synchronously.
     * 
     * Initial play() of the sound element is always synchronous, as it's attempted before 
     * trying to initialize the AudioContext
     * @param {*} source 
     * @param {*} callback 
     */
    touchSound = (source:SongSourceType[], callback?:(success:boolean)=>void) => {
        //Special case for IOS, just always try to resume
        this.tryResume();
        
        const index = this.soundElements.findIndex(s => s.data?.songSources === source);

        const soundData = this.soundElements[index];
        const element = soundData?.element;

        if (!element) {
            debug("Sound element not loaded yet.");
            if (callback) {
                callback(false);
            }
            return
        }

        if (soundData.touched) {
            debug("Sound element already touched.");
            if (callback) {
                callback(true);
            }

        } else if (soundData.touchPromise) {
            debug("Sound element waiting for touched status to change to true.");
            if (callback) {
                soundData.touchPromise.then(() => {
                    callback(true);
                }).catch(e => {
                    callback(false);
                });
            }

        } else {
            debug("Initializing touch.");
            element.volume = 0;
            element.muted = true;
            soundData.touchPromise = element.play();

            if (soundData.touchPromise) {
                soundData.touchPromise.then(() => {
                    debug("touch played");
                    element.pause();
                    soundData.touched = true;
                    soundData.touchPromise = null;
                    
                    if (callback) {
                        callback(true);
                    }    
                }).catch((e) => {
                    console.log("Error touching audio element.", e);
                    soundData.touchPromise = null;
                    if (callback) {
                        callback(false);
                    }
                });
            } else {
                if (callback) {
                    callback(true);
                }    
            }
        }
    }

    /**
     * 
     * @param {*} source 
     * @param {*} options list of optional parameters:
     *   loop: true/false (loop the song - default is false)
     *   play: true/false (play the song automatically - default is false)
     *   fadeOutBeforePlay: n (seconds to fade out existing sound before starting new sound)
     * @returns 
     */
    setSound = (source:SongSourceType[], options:SetSoundOptions) => {
        debug("Attempting to set the sound.");
        //touchSound initializes the sound and makes sure it can play before calling our callback
        //function
        this.touchSound(source, (touchSuccessful) => {
            debug("Init touch successful: "+touchSuccessful);

            const index = this.soundElements.findIndex(s => s.data?.songSources === source);

            if (this.activeIndex === index) {
                debug("Same sound requested.");
                return;
            } else {
                debug("new sound requested.");
            }

            const playNewSong = () => {
                this.loadFromAudioElement(index, options);
            }

            if (/*!Utils.isIOS() && */this.activeIndex >= 0 && options?.fadeOutBeforePlay && options.fadeOutBeforePlay > 0) {
                this.fadeOut(options.fadeOutBeforePlay);
                window.setTimeout(playNewSong, (1000 * options.fadeOutBeforePlay)+50);
            }
            else {
                playNewSong();
            }
        });
    };

    _handleReadyToPlay = () => {
        if (!this._readyToPlay) {
            debug("Initial Ready-To-Play")

            const soundElement = this.getAudioElement();
            if (!soundElement) {
                return;
            }

            this.eventSubscribers.notifySubscribers({event: "canplaythrough"});
            if (this.options.loop === true) {
                soundElement.loop = true;
            }
            if (this.options.play) {
                soundElement.currentTime = 0;
                soundElement.muted = false;
                soundElement.volume = 1;
                debug("Attempting to play.")
                soundElement.play().then(result => {
                    debug("... playing... "+result);
                }).catch(e => {
                    debug("... error playing... "+e);
                });
                if (!State.getStateValue("muted", false)) {
                    const lastVol = State.getStateValue("last-volume", 1);
                    this.setVolume(lastVol);
                } 
            }
        }
        this._readyToPlay = true;
    }

    _handleCanPlayThroughEvent = () => {
        this._readyState = READY_STATES.CAN_PLAY_THROUGH;

        this._handleReadyToPlay();
    };

    _handleTimeUpdateEvent = (e:Event) => {
        const elm = e.target as HTMLAudioElement;
        const currentTime = elm.currentTime;
        const timeRemaining = elm.duration - currentTime;
        if (!this._warn30Seconds && timeRemaining <= 30) {
            this._warn30Seconds = true;
            this.eventSubscribers.notifySubscribers({event: "30secondwarning", timeRemaining:timeRemaining});
        }
        if (!this._warn5Seconds && timeRemaining <= 5) {
            this._warn5Seconds = true;
            this.eventSubscribers.notifySubscribers({event: "5secondwarning", timeRemaining:timeRemaining});
        }
        if (!this._warn1Second && timeRemaining <= 1) {
            this._warn1Second = true;
            this.eventSubscribers.notifySubscribers({event: "1secondwarning", timeRemaining:timeRemaining});
        }

        //Check to see if any registered time events need to fire
        if (this.nextTimeEventInd < this.timeEvents.length) {
            let nextEvent:TimeEventData|null = this.timeEvents[this.nextTimeEventInd];
            
            //The .5 second lead time is because the timeUpdateEvent is only accurate potentially to
            //the quarter second. So this allows us to schedule with a little more fine-grained timing.
            while (nextEvent && (nextEvent.time <= currentTime+.5)) {
                const eventToFire = nextEvent;  //copy this because we reference it in an anyonymous function
                const tte = eventToFire.time - this.getCurrentTime(); 
                
                window.setTimeout(() => {
                    eventToFire.safeHandler(eventToFire.time, currentTime + tte);
                }, 1000 * tte);

                if (nextEvent.repeatable === true) {
                    this.nextTimeEventInd++;
                } else {
                    //if it's not a repeatable event, then remove it from the array
                    this.timeEvents.splice(this.nextTimeEventInd, 1);
                }

                if (this.nextTimeEventInd < this.timeEvents.length) {
                    nextEvent = this.timeEvents[this.nextTimeEventInd];
                } else {
                    nextEvent = null;
                }
            }
        }
    };

    _handleSeekedEvent = (e:Event) => {
        const elm = e.target as HTMLAudioElement;
        const currentTime = elm.currentTime;
        const timeRemaining = elm.duration - currentTime;
        if (timeRemaining >= 30) {
            this._warn30Seconds = false;
        }
        if (timeRemaining >= 5) {
            this._warn5Seconds = false;
        }
        if (timeRemaining >= 1) {
            this._warn1Second = false;
        }
        this.eventSubscribers.notifySubscribers({event: "seeked", seekTime:currentTime});

        //Handle any timeEvents that need to fire on passed time
        this.nextTimeEventInd = 0;
        if (this.timeEvents.length > 0) {
            let nextEvent:TimeEventData|null = this.timeEvents[this.nextTimeEventInd];
            while(nextEvent && nextEvent.time < currentTime) {
                if (nextEvent.executeIfPassed) {
                    nextEvent.safeHandler(nextEvent.time, currentTime);
                }
                
                this.nextTimeEventInd++;

                if (this.nextTimeEventInd < this.timeEvents.length) {
                    nextEvent = this.timeEvents[this.nextTimeEventInd];
                } else {
                    nextEvent = null;
                }
            }
        }
    };

    _handleProgressEvent = () => {
        const element = this.getAudioElement();

        if(!element) {
            return;
        }

        this._readyState = element.readyState;

        if (this._readyState === READY_STATES.CAN_PLAY_THROUGH) {
            this._handleReadyToPlay();
        }
    };

    _handlePlayEvent = () => {
        debug("Started playing")
        this.eventSubscribers.notifySubscribers({event: "playing"});
    };

    _handlePauseEvent = () => {
        debug("Paused")
        this.eventSubscribers.notifySubscribers({event: "paused"});
    };

    _handleEndedEvent = () => {
        debug("Ended");
        this.eventSubscribers.notifySubscribers({event: "ended"});
    };

    loadFromAudioElement = (index:number, options:SetSoundOptions) => {
        if(!this.ac) {
            return;
        }

        const existingElement = this.getAudioElement();

        if (existingElement) {
            existingElement.removeEventListener("canplaythrough", this._handleCanPlayThroughEvent);
            existingElement.removeEventListener("timeupdate", this._handleTimeUpdateEvent);
            existingElement.removeEventListener("seeked", this._handleSeekedEvent);
            existingElement.removeEventListener("progress", this._handleProgressEvent);
            existingElement.removeEventListener("play", this._handlePlayEvent);
            existingElement.removeEventListener("pause", this._handlePauseEvent);
            existingElement.removeEventListener("ended", this._handleEndedEvent);
            existingElement.pause();
        }

        this.activeIndex = index;
        const sound = this.soundElements[this.activeIndex];
        const element = sound?.element;
        
        if (element && this.mediaTargetNode) {
            this.options = options;
            element.load();

            let source = sound.mediaSource;
            if (!source) {
                sound.mediaSource = this.ac.createMediaElementSource(element);
                source = sound.mediaSource;
            }
            
            source.connect(this.mediaTargetNode);

            this.timeEvents = [];
            this.nextTimeEventInd = 0;
            this._warn30Seconds = false;
            this._warn5Seconds = false;
            this._warn1Second = false;
            this._readyToPlay = false;
            this._readyState = element.readyState;
            
            element.addEventListener("canplaythrough", this._handleCanPlayThroughEvent);
            element.addEventListener("timeupdate", this._handleTimeUpdateEvent);
            element.addEventListener("seeked", this._handleSeekedEvent);
            element.addEventListener("progress", this._handleProgressEvent);
            element.addEventListener("play", this._handlePlayEvent);
            element.addEventListener("pause", this._handlePauseEvent);
            element.addEventListener("ended", this._handleEndedEvent);

            //Handle the case where the audio element has already mounted and loaded enough to be able to play
            //through before this loadFromAudioElement function is invoked. This will make sure subscribers
            //still get a "canplaythrough" event.
            if (this._readyState === READY_STATES.CAN_PLAY_THROUGH) {
                this._handleReadyToPlay();
            }

            this.soundSubscribers.notifySubscribers(element);
            this.eventSubscribers.notifySubscribers({event: "soundmounted"});

            return source;
        }
    };

    /**
    * Return the current audio element
    * @returns 
    */
    getAudioElement = ():HTMLAudioElement|null => {
        return this.soundElements[this.activeIndex]?.element;
    }

    /**
    * Return the sound data associated with the current sound
    * @returns 
    */
    getSoundData = () => {
        return this.soundElements[this.activeIndex]?.data;
    }

    getSampleRate = () => {
        if (this.ac) {
            return this.ac.sampleRate;
        }
        else {
            return 44100;
        }
    }

    getFFTData = () => {
        if (this.fftNode && this.fftBuffer) {
            this.fftNode.getByteFrequencyData(this.fftBuffer);
            return this.fftBuffer;
        }
        else {
            return null;
        }
    }

    getVolume = () => {
        if (this.gainNode) {
            return this.gainNode.gain.value;
        } else {
            return 0;
        }
    }

    setVolume = (vol:number) => {
        if(!this.ac || !this.gainNode) {
            return;
        }

        //This is called based on a mouse move event, so it's likely that volume events could overlap
        //This cancels any previous event and then schedules a new event to change the volume within .1 seconds
        //We do this to prevent popping/clicking sounds
        this.gainNode.gain.cancelScheduledValues(this.ac.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
        this.gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(vol, 1)), this.ac.currentTime + 0.1);
        State.setStateValue("last-volume", vol);
    }

    /**
     * Fade out sound over the specified time
     * @param {*} fadeDuration time in seconds
     */
    fadeOut = (fadeDuration:number) => {
        if(!this.ac || !this.gainNode) {
            return;
        }

        //linear ramp starts at the time of the last event, so we need to create an event
        //first that sets the current gain to its existing value at the current time.
        this.gainNode.gain.cancelScheduledValues(this.ac.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
        this.gainNode.gain.linearRampToValueAtTime(0.0, this.ac.currentTime + fadeDuration);
    }

    setMuted = (muted:boolean) => {
        if(!this.ac || !this.gainNode) {
            return;
        }

        if(muted) {
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
            this.gainNode.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.1);
        }
        else {
            const lastVol = State.getStateValue("last-volume", 1);
            this.gainNode.gain.setValueAtTime(0, 0);
            this.gainNode.gain.linearRampToValueAtTime(lastVol, this.ac.currentTime + 0.1);
        }
        State.setStateValue("muted", muted);
    };

    play = () => {
        if (this.ac) {
            this.ac.resume();
        }
        const element = this.getAudioElement();
        if (element) {
            element.muted = false;
            element.volume = 1;
            element.play();
        }
    }

    pause = () => {
        const element = this.getAudioElement();
        if (element) {
            element.pause();
        }
    }

    seekTo = (time:number) => {
        const element = this.getAudioElement();
        if (element) {
            element.currentTime = time;
        }
    }

    getCurrentTime = ():number => {
        const element = this.getAudioElement();
        if (element) {
            return element.currentTime;
        } else {
            return -1;
        }
    }

    getDuration = ():number => {
        const element = this.getAudioElement();
        if (element) {
            return element.duration;
        } else {
            return -1;
        }
    }

    isPaused = ():boolean => {
        const element = this.getAudioElement();
        if (element) {
            return element.paused;
        } else {
            return false;
        }
    }
    
    isMuted = ():boolean => {
        if (!this.gainNode) {
            return true;
        }

        const lastVol = State.getStateValue("last-volume", 1);
        return this.gainNode.gain.value === 0 && lastVol !== 0;
    }

    addSoundSubscriber = (handler:(elm:HTMLAudioElement)=>void) => {
        return this.soundSubscribers.subscribe(handler);
    }

    addSoundEnabledSubscriber = (handler:(evt:SoundServiceStateEvent)=>void) => {
        return this.enabledSubscribers.subscribe(handler);
    }

    subscribeEvents = (handler:(evt:SoundServiceEvent)=>void) => {
        return this.eventSubscribers.subscribe(handler);
    }

    registerTimeEvent = (time:number, handler:TimeEventHandler, repeatable:boolean, executeIfPassed:boolean) => {
        //this.timeEvents is a sorted array of time/handler pairs
        //When we register a new timeEvent, we just need to make sure it stays sorted

        const safeHandler = (handlerTime:number, currentSongTime:number) => {
            try {
                handler(handlerTime, currentSongTime);
            } catch (e) {
                console.error(`Error in time [${time}] event handler function.`, e);
            }
        }

        const firstIndexAfterTime = this.timeEvents.findIndex(te => te.time > time);
        if (firstIndexAfterTime < 0) {
            debug("Added time event handler to end of event list.");
            this.timeEvents.push({time, safeHandler, repeatable, executeIfPassed});
        } else {
            debug(`Added time event handler index ${firstIndexAfterTime} of event list.`);
            this.timeEvents.splice(firstIndexAfterTime, 0, {time, safeHandler, repeatable, executeIfPassed});

            if (firstIndexAfterTime > this.nextTimeEventInd) {
                this.nextTimeEventInd++;
            }
        }

        //Special case where we try to register a time event and the time has already passed
        if (executeIfPassed === true && this.nextTimeEventInd > 0) {
            const nextEvent = this.timeEvents[this.nextTimeEventInd];
            if (time > nextEvent.time) {
                safeHandler(time, this.getCurrentTime());
            }
        }
    }

    resetTimeEventsToStart = () => {
        this.nextTimeEventInd = 0;
    }


    /*
    setAudioChangeHandler = (handler) => {
        this.audioChangeHandler = handler;
    }

    setQueuedAudioChangeHandler = (handler) => {
        this.queuedAudioChangeHandler = handler;
    }
    */

}

const SoundService2 = new SoundService2Cls();

export default SoundService2;