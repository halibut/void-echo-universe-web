import Subscription from "./Subscription";

class BackgroundServiceCls {
    constructor() {
        this.bgImage = null;
        this.attribData = null;
        this.changeHandler = null;
        this.bgSubscribers = new Subscription("background-changes");
    }

    setBgChangeHandler = (handleFunc) => {
        this.changeHandler = handleFunc;
    }

    setBgImage = (src, options) => {
        this.bgImage = {src:src, options:options};

        if (this.changeHandler) {
            this.changeHandler(this.bgImage);
        }
    }

    setBgAttribData = (data) => {
        this.attribData = data;
        this.bgSubscribers.notifySubscribers(data);
    }

    getCurrentBgAttribData = () => {
        return this.attribData;
    }

    subscribeToAttribData = (handler) => {
        return this.bgSubscribers.subscribe(handler);
    }
}

const BackgroundService = new BackgroundServiceCls();

export default BackgroundService;

export function setBackgroundImage(src, options) {
    BackgroundService.setBgImage(src, options);
}

export function setDefaultBackground(transitionTime) {
    setBackgroundImage(require("../images/chapter_00_bg.jpg"), {
        staticStyle: {transform:`scale(2.5)`, opacity:0.75},
        imageClass: "spin-bg-slow",
        transitionTime: transitionTime ? transitionTime : 0,
    });
    
    BackgroundService.setBgAttribData(null);
}
