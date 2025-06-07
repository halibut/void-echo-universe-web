import Subscription from "./Subscription";

const StateKeyValues = [
    "last-volume", "muted", "current-track", "img-quality", "audio-controls-expanded",
    "visualizer-type", "show-notes", "zen-mode", "full-screen", "repeat",
    "image-attribution", "debug-mode"
] as const;

export type StateKey = typeof StateKeyValues[number];

export type StateEvent = {
    state: StateKey,
    value: any,
}

class StateApi {
    state:{[key: string]:any} = {};
    
    stateSubscribers = new Subscription<StateEvent>("global-state");

    constructor() {
        this.state = {
            "last-volume": 1,
            "muted": false,
            "current-track": 1,
            "img-quality": "large",
            "audio-controls-expanded": false,
            "visualizer-type": "default",
            "show-notes": false,
            "zen-mode": false,
            "full-screen": false,
            "repeat": "none",
            "image-attribution": false,
            "debug-mode": false,
        }

        const appStateStr = localStorage.getItem("app-state");
        if (appStateStr) {
            const storedState = JSON.parse(appStateStr);
            this.state = {
                ...this.state,
                ...storedState,
            };
            console.log("Loading app state: "+JSON.stringify(this.state));
        }
    }

    getStateValue = (key:StateKey, defaultVal:any) => {
        const val = this.state[key];
        if(val !== undefined && val !== null) {
            return val;
        }
        else {
            return defaultVal;
        }
    } 

    setStateValue = (key:StateKey, value:any) => {
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

    subscribeToStateChanges = (subscriberFunction:(evt:StateEvent)=>void) => {
        return this.stateSubscribers.subscribe(subscriberFunction);
    }
}

const State = new StateApi();

export default State;