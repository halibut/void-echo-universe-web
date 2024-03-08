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

class SoundServiceCls {

    constructor() {
        this.audioChangeHandler = null;
        this.soundSubscribers = new Subscription("sound-subs");
        this.sound = null;
        this.soundSrc = null;
        this.soundOptions = {};
        this.init();
    }

    init = () => {
        try {
            
            this.ac = new AudioContext({latencyHint:'interactive'});
            console.log("Audio Context: "+this.ac.state);

            //Create a Gain node. This node will solely be used
            //to control output volume. Attach to the destination node.
            this.gainNode = this.ac.createGain();
            this.gainNode.connect(this.ac.destination);


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
            console.log("Last volume: "+State.getLastVolume());
            this.gainNode.gain.value = State.getLastVolume();
        }
        catch(e) {
            console.log("Error initializing AudioContext. Probably awaiting user input event.", e);
        }
    };

    isSuspended = () => {
        return !this.ac || this.ac.state === 'suspended';
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

    setSound = (source, options) => {
        if (this.soundSrc === source) {
            console.log("Same sound requested.");
            return;
        }

        this.soundSrc = source;
        this.soundOptions = options;
        if (this.audioChangeHandler) {
            this.audioChangeHandler({src:source, options});
        }
        else {
            console.warn("No audioChangeHandler set.");
        }
    };

    loadFromAudioElement = (element) => {
        const source = this.ac.createMediaElementSource(element);

        source.connect(this.mediaTargetNode);

        this.soundSubscribers.notifySubscribers(element);

        return source;
    };

    getFFTData = () => {
        this.fftNode.getByteFrequencyData(this.fftBuffer);
        return this.fftBuffer;
    }

    getVolume = () => {
        return this.gainNode.gain.value;
    }

    setVolume = (vol) => {
        //This is called based on a mouse move event, so it's likely that volume events could overlap
        //This cancels any previous event and then schedules a new event to change the volume within .1 seconds
        //We do this to prevent popping/clicking sounds
        this.gainNode.gain.cancelScheduledValues(this.ac.currentTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ac.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(vol, 1)), this.ac.currentTime + 0.1);
        State.setLastVolume(vol);
    }

    fadeOut = (targetTime) => {
        //linear ramp starts at the time of the last event, so we need to create an event
        //first that sets the current gain to its existing value at the current time.
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ac.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.0, this.ac.currentTime + targetTime);
    }

    setMuted = (muted) => {
        if(muted) {
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ac.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(0, this.ac.currentTime + 0.1);
        }
        else {
            this.gainNode.gain.setValueAtTime(0, this.ac.currentTime);
            this.gainNode.gain.linearRampToValueAtTime(State.getLastVolume(), this.ac.currentTime + 0.1);
        }
    };
    
    isMuted = () => {
        return this.gainNode.gain.value === 0 && State.getLastVolume() !== 0;
    }

    addSoundSubscriber = (handler) => {
        return this.soundSubscribers.subscribe(handler);
    }

    setAudioChangeHandler = (handler) => {
        this.audioChangeHandler = handler;
    }
    
}

const SoundService = new SoundServiceCls();

export default SoundService;