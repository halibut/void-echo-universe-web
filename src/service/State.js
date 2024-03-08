import Subscription from "./Subscription";

class StateApi {

    constructor() {
        this.stateSubscribers = new Subscription("global-state"); 
    }


    getStateValue = (key, defaultVal) => {
        const val = localStorage.getItem(key);
        if(val !== undefined && val !== null) {
            return JSON.parse(val);
        }
        else {
            return defaultVal;
        }
    } 

    setStateValue = (key, value) => {
        if(value === null || value === undefined) {
            localStorage.removeItem(key);
            this.stateSubscribers.notifySubscribers({
                state: key,
                value: null,
            });
        }
        else {
            localStorage.setItem(key, JSON.stringify(value));
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

    getCurrentTrack = () => {
        return this.getStateValue("currentTrack", 1);
    }

    setCurrentTrack = (trackNumber) => {
        this.setStateValue("currentTrack", trackNumber);
    }

    getImageQuality = () => {
        return this.getStateValue("img-quality", "md");
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