import State from "./State";
import Subscription from "./Subscription";

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

class SoundServiceCls {

    constructor() {
        this.soundSubscribers = new Subscription("sound-subs");
        this.eventSubscribers = new Subscription("sound-events");
        this.enabledSubscribers = new Subscription("ac-enabled-subs");

        this.audioChangeHandler = null;
        this.sound = null;
        this.soundElement = null;

        this.queuedAudioChangeHandler = null;
        this.queuedSound = null;

        this.timeEvents = []
        this.nextTimeEventInd = 0;

        this.EVENTS = {
            CAN_PLAY_THROUGH: "canplaythrough",
            WARN_30_SECONDS_REMAINING: "30secondwarning",
            WARN_5_SECONDS_REMAINING: "5secondwarning",
            WARN_1_SECOND_REMAINING: "1secondwarning",
            SEEKED: "seeked",
            PLAYING: "playing",
            PAUSED: "paused",
            SOUND_MOUNTED: "soundmounted",
        }

        this.init();
    }

    init = () => {
        try {
            
            this.ac = new AudioContext({latencyHint:'interactive'});
            console.log("Audio Context: "+this.ac.state);

            this.ac.addEventListener("statechange", this._handleStateChange);

            //Create a Gain node. This node will solely be used
            //to control output volume. Attach to the destination node.
            this.gainNode = this.ac.createGain();
            this.gainNode.connect(this.ac.destination);
            if (State.getStateValue(State.KEYS.MUTED, false)) {
                this.gainNode.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.1);
            } else {
                const lastVol = State.getStateValue(State.KEYS.LAST_VOLUME, 1);
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

            console.log("FFT Buffer: "+bufferLength);


            //Create a node that we can connect audio media to
            //It's just a convenient node that we can attach other 
            //nodes to (like the fft/analyser node)
            //Attatch to the gain node
            this.mediaTargetNode = this.ac.createGain();
            this.mediaTargetNode.gain.value = 1;
            this.mediaTargetNode.connect(this.fftNode);

            //Set the gain/volume to whatever was last set by the user
            if (State.getStateValue(State.KEYS.MUTED, false)) {
                console.log("Sound was muted last session.");
                this.gainNode.gain.value = 0;
            } else {
                const lastVol = State.getStateValue(State.KEYS.LAST_VOLUME, 1);
                console.log("Last volume: "+lastVol);
                this.gainNode.gain.value = lastVol;
            }
            
        }
        catch(e) {
            console.log("Error initializing AudioContext. Probably awaiting user input event.", e);
        }
    };

    _handleStateChange = (evt) => {
        const state = evt.state;
        this.enabledSubscribers.notifySubscribers({
            enabled: state === "running",
            audioContextState: state,
        });
    }

    isSuspended = () => {
        return !this.ac || this.ac.state === 'suspended' || this.ac.state === 'interrupted';
    }

    tryResume = async () => {

        //Some browsers won't let us set up an AudioContext at all until the user
        //has provided an input event. So this detects this case and tries to re-initialize
        if(!this.ac) {
            this.init();
        }

        //If the AudioContext is suspended, then try to resume it. 
        if(this.isSuspended()) {
            try {
                await this.ac.resume();
                
                return this.ac.state === 'running';
            }
            catch(e) {
                console.log("Error resuming audio context.", e);
                return false;
            }
        } else {
            return true;
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
    setSound = async (source, options) => {
        await this.tryResume();

        if (this.sound?.source === source) {
            console.log("Same sound requested.");
            return;
        }

        const playNewSong = () => {
            this.sound = {
                source: source,
                options: options,
                key: Date.now(),
            };
            if (this.audioChangeHandler) {
                this.audioChangeHandler(this.sound);
            }
            else {
                console.warn("No audioChangeHandler set.");
            }
        }

        if (options?.fadeOutBeforePlay && options.fadeOutBeforePlay > 0) {
            this.fadeOut(options.fadeOutBeforePlay);
            window.setTimeout(playNewSong, (1000 * options.fadeOutBeforePlay)+50);
        }
        else {
            playNewSong();
        }
    };

    queueSound = (source, options) => {
        if (this.sound?.source === source || this.queuedSound?.source === source) {
            console.log(`Same sound queued: ${JSON.stringify(source)}`);
            return;
        }

        console.log(`Queueing new sound:  ${JSON.stringify(source)}`);

        this.queuedSound ={
            source: source,
            options: options,
            key: Date.now(),
        };
        if (this.queuedAudioChangeHandler) {
            this.queuedAudioChangeHandler(this.queuedSound);
        }
    }

    _handleReadyToPlay = () => {
        if (!this._readyToPlay) {
            console.log("Initial Ready-To-Play")

            this.eventSubscribers.notifySubscribers({event: this.EVENTS.CAN_PLAY_THROUGH});
            if (this.sound?.options.loop === true) {
                this.soundElement.loop = true;
            }
            if (this.sound?.options.play) {
                this.soundElement.currentTime = 0;
                this.soundElement.muted = false;
                this.soundElement.volume = 1;
                this.soundElement.play();
                if (!State.getStateValue(State.KEYS.MUTED, false)) {
                    const lastVol = State.getStateValue(State.KEYS.LAST_VOLUME, 1);
                    this.setVolume(lastVol);
                } 
            }
        }
        this._readyToPlay = true;
    }

    _handleCanPlayThroughEvent = (e) => {
        this._readyState = READY_STATES.CAN_PLAY_THROUGH;

        this._handleReadyToPlay();
    };

    _handleTimeUpdateEvent = (e) => {
        const elm = e.target;
        const currentTime = elm.currentTime;
        const timeRemaining = elm.duration - currentTime;
        if (!this._warn30Seconds && timeRemaining <= 30) {
            this._warn30Seconds = true;
            this.eventSubscribers.notifySubscribers({event: this.EVENTS.WARN_30_SECONDS_REMAINING, timeRemaining:timeRemaining});
        }
        if (!this._warn5Seconds && timeRemaining <= 5) {
            this._warn5Seconds = true;
            this.eventSubscribers.notifySubscribers({event: this.EVENTS.WARN_5_SECONDS_REMAINING, timeRemaining:timeRemaining});
        }
        if (!this._warn1Second && timeRemaining <= 1) {
            this._warn1Second = true;
            this.eventSubscribers.notifySubscribers({event: this.EVENTS.WARN_1_SECOND_REMAINING, timeRemaining:timeRemaining});
        }

        //Check to see if any registered time events need to fire
        if (this.nextTimeEventInd < this.timeEvents.length) {
            let nextEvent = this.timeEvents[this.nextTimeEventInd];
            while (nextEvent && nextEvent.time <= currentTime) {
                nextEvent.safeHandler(nextEvent.time, currentTime);

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

    _handleSeekedEvent = (e) => {
        const elm = e.target;
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
        this.eventSubscribers.notifySubscribers({event: this.EVENTS.SEEKED, seekTime:currentTime});

        //Handle any timeEvents that need to fire on passed time
        this.nextTimeEventInd = 0;
        if (this.timeEvents.length > 0) {
            let nextEvent = this.timeEvents[this.nextTimeEventInd];
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

    _handleProgressEvent = (e) => {
        this._readyState = this.soundElement.readyState;

        if (this._readyState === READY_STATES.CAN_PLAY_THROUGH) {
            this._handleReadyToPlay();
        }
    };

    _handlePlayEvent = (e) => {
        console.log("Started playing")
        this.eventSubscribers.notifySubscribers({event: this.EVENTS.PLAYING});
    };

    _handlePauseEvent = (e) => {
        console.log("Paused")
        this.eventSubscribers.notifySubscribers({event: this.EVENTS.PAUSED});
    };

    loadFromAudioElement = (element) => {
        if (this.soundElement === element) {
            console.log("Loaded same audio element.");
            return;
        }

        console.log("Mounted audio element.");

        if (this.soundElement) {
            this.soundElement.removeEventListener("canplaythrough", this._handleCanPlayThroughEvent);
            this.soundElement.removeEventListener("timeupdate", this._handleTimeUpdateEvent);
            this.soundElement.removeEventListener("seeked", this._handleSeekedEvent);
            this.soundElement.removeEventListener("progress", this._handleProgressEvent);
            this.soundElement.removeEventListener("play", this._handlePlayEvent);
            this.soundElement.removeEventListener("pause", this._handlePauseEvent);
        }

        this.soundElement = element;

        if (element) {
            element.load();

            const source = this.ac.createMediaElementSource(element);
            
            source.connect(this.mediaTargetNode);

            this.timeEvents = [];
            this.nextTimeEventInd = 0;
            this._warn30Seconds = false;
            this._warn5Seconds = false;
            this._warn1Second = false;
            this._readyToPlay = false;
            this._readyState = element.readyState;
            
            this.soundElement.addEventListener("canplaythrough", this._handleCanPlayThroughEvent);
            this.soundElement.addEventListener("timeupdate", this._handleTimeUpdateEvent);
            this.soundElement.addEventListener("seeked", this._handleSeekedEvent);
            this.soundElement.addEventListener("progress", this._handleProgressEvent);
            this.soundElement.addEventListener("play", this._handlePlayEvent);
            this.soundElement.addEventListener("pause", this._handlePauseEvent);

            //Handle the case where the audio element has already mounted and loaded enough to be able to play
            //through before this loadFromAudioElement function is invoked. This will make sure subscribers
            //still get a "canplaythrough" event.
            if (this._readyState === READY_STATES.CAN_PLAY_THROUGH) {
                this._handleReadyToPlay();
            }

            this.soundSubscribers.notifySubscribers(element);
            this.eventSubscribers.notifySubscribers({event: this.EVENTS.SOUND_MOUNTED});

            return source;
        }
    };

    _handleQueueElementStatus = (e) => {
        console.log("Queued Element Status: " + e.target.readyState);
        if (e.target.readyState === READY_STATES.CAN_PLAY_THROUGH) {
            console.log("Queued Element Ready to Play.");
        }
    };

    queuedElementMounted = (qElement) => {
        qElement.addEventListener("progress", this._handleQueueElementStatus);
        qElement.load();
    }

    /**
    * Return the current audio element
    * @returns 
    */
    getAudioElement = () => {
        return this.soundElement;
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
        if (this.fftNode) {
            this.fftNode.getByteFrequencyData(this.fftBuffer);
            return this.fftBuffer;
        }
        else {
            return null;
        }
    }

    getVolume = () => {
        return this.gainNode.gain.value;
    }

    setVolume = (vol) => {
        //This is called based on a mouse move event, so it's likely that volume events could overlap
        //This cancels any previous event and then schedules a new event to change the volume within .1 seconds
        //We do this to prevent popping/clicking sounds
        this.gainNode.gain.cancelScheduledValues(this.ac.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
        this.gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(vol, 1)), this.ac.currentTime + 0.1);
        State.setStateValue(State.KEYS.LAST_VOLUME, vol);
    }

    /**
     * Fade out sound over the specified time
     * @param {*} fadeDuration time in seconds
     */
    fadeOut = (fadeDuration) => {
        //linear ramp starts at the time of the last event, so we need to create an event
        //first that sets the current gain to its existing value at the current time.
        this.gainNode.gain.cancelScheduledValues(this.ac.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
        this.gainNode.gain.linearRampToValueAtTime(0.0, this.ac.currentTime + fadeDuration);
    }

    setMuted = (muted) => {
        if(muted) {
            if (this.isSuspended()) {
                this.tryResume();
            }
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, 0);
            this.gainNode.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.1);
        }
        else {
            const lastVol = State.getStateValue(State.KEYS.LAST_VOLUME, 1);
            this.gainNode.gain.setValueAtTime(0, 0);
            this.gainNode.gain.linearRampToValueAtTime(lastVol, this.ac.currentTime + 0.1);
        }
        State.setStateValue(State.KEYS.MUTED, muted);
    };

    play = () => {
        if (this.soundElement) {
            this.soundElement.play();
        }
    }

    pause = () => {
        if (this.soundElement) {
            this.soundElement.pause();
        }
    }

    seekTo = (time) => {
        if (this.soundElement) {
            this.soundElement.currentTime = time;
        }
    }

    getCurrentTime = () => {
        if (this.soundElement) {
            return this.soundElement.currentTime;
        } else {
            return -1;
        }
    }

    getDuration = () => {
        if (this.soundElement) {
            return this.soundElement.duration;
        } else {
            return -1;
        }
    }

    isPaused = () => {
        if (this.soundElement) {
            return this.soundElement.paused;
        } else {
            return false;
        }
    }
    
    isMuted = () => {
        const lastVol = State.getStateValue(State.KEYS.LAST_VOLUME, 1);
        return this.gainNode.gain.value === 0 && lastVol !== 0;
    }

    addSoundSubscriber = (handler) => {
        return this.soundSubscribers.subscribe(handler);
    }

    addSoundEnabledSubscriber = (handler) => {
        return this.enabledSubscribers.subscribe(handler);
    }

    subscribeEvents = (handler) => {
        return this.eventSubscribers.subscribe(handler);
    }

    registerTimeEvent = (time, handler, repeatable, executeIfPassed) => {
        //this.timeEvents is a sorted array of time/handler pairs
        //When we register a new timeEvent, we just need to make sure it stays sorted

        const safeHandler = (handlerTime, currentSongTime) => {
            try {
                handler(handlerTime, currentSongTime);
            } catch (e) {
                console.error(`Error in time [${time}] event handler function.`, e);
            }
        }

        const firstIndexAfterTime = this.timeEvents.findIndex(te => te.time > time);
        if (firstIndexAfterTime < 0) {
            console.log("Added time event handler to end of event list.");
            this.timeEvents.push({time, safeHandler, repeatable, executeIfPassed});
        } else {
            console.log(`Added time event handler index ${firstIndexAfterTime} of event list.`);
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

    setAudioChangeHandler = (handler) => {
        this.audioChangeHandler = handler;
    }

    setQueuedAudioChangeHandler = (handler) => {
        this.queuedAudioChangeHandler = handler;
    }

}

const SoundService = new SoundServiceCls();

export default SoundService;