import Subscription from "./Subscription";

class StateApi {

    constructor() {
        this.stateSubscribers = new Subscription("global-state");
        this.state = {}

        this.KEYS = {
            LAST_VOLUME: "last-volume",
            MUTED: "muted",
            CURRENT_TRACK: "current-track",
            IMG_QUALITY: "img-quality",
            AUDIO_CONTROLS_EXPANDED: "audio-controls-expanded",
            SHOW_VISUALIZER: "show-visual",
            SHOW_NOTES: "show-notes",
            ZEN_MODE: "zen-mode",
            FULL_SCREEN: "full-screen",
            REPEAT_MODE: "repeat",
            SHOW_IMAGE_ATTRIBUTION: "image-attribution"
        }

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

    subscribeToStateChanges = (subscriberFunction) => {
        return this.stateSubscribers.subscribe(subscriberFunction);
    }
}

const State = new StateApi();

export default State;