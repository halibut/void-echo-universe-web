class BackgroundServiceCls {
    constructor() {
        this.bgImage = null;
        this.changeHandler = null;
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
}

const BackgroundService = new BackgroundServiceCls();

export default BackgroundService;

export function setBackgroundImage(src, options) {
    BackgroundService.setBgImage(src, options);
}
