import Subscription from "./Subscription";

class StateApi {

    constructor() {
        this.stateSubscribers = new Subscription("global-state");
        this.state = {}

        const appStateStr = localStorage.getItem("app-state");
        if (appStateStr) {
            this.state = JSON.parse(appStateStr);
            console.log("Loading app state: "+JSON.stringify(this.state));
        }
    }

    getStateValue = (key, defaultVal) => {
        const val = this.state[key];
        if(val !== undefined && val !== null) {
            return val;
        }
        else {
            return defaultVal;
        }
    } 

    setStateValue = (key, value) => {
        if(value === null || value === undefined) {
            delete this.state[key];
            localStorage.setItem("app-state", JSON.stringify(this.state));
            this.stateSubscribers.notifySubscribers({
                state: key,
                value: null,
            });
        }
        else {
            this.state[key] = value;
            localStorage.setItem("app-state", JSON.stringify(this.state));
            this.stateSubscribers.notifySubscribers({
                state: key,
                value: value,
            });
        }
    }

    setLastVolume = (vol) => {
        this.setStateValue("last-volume", vol);
    }

    getLastVolume = () => {
        return this.getStateValue("last-volume", 1);
    }

    setMuted = (muted) =>{
        this.setStateValue("muted", muted);
    }

    isMuted = () =>{
        return this.getStateValue("muted", false);
    }

    getCurrentTrack = () => {
        return this.getStateValue("currentTrack", 1);
    }

    setCurrentTrack = (trackNumber) => {
        this.setStateValue("currentTrack", trackNumber);
    }

    getImageQuality = () => {
        return this.getStateValue("img-quality", "large");
    }

    setImageQuality = qual => {
        this.setStateValue("img-quality", qual);
    }

    subscribeToStateChanges = (subscriberFunction) => {
        return this.stateSubscribers.subscribe(subscriberFunction);
    }
}

const State = new StateApi();

export default State;