
export type BackgroundImageOptions = {
    transitionTime?:number,
    imageClass?:string,
    staticStyle?:React.CSSProperties,
    imageStyle?:{
        animationDuration: string,
    },
    imageCSSProps?:{
        '--bg-final-x': string,
        '--bg-final-y': string,
        '--bg-final-zoom': number,
    },
}

export type BackgroundImageData = {
    src:string,
    options:BackgroundImageOptions,
}

class BackgroundServiceCls {
    bgImage:BackgroundImageData|null = null;
    changeHandler:(newImg:BackgroundImageData)=>void = ()=>{};
    
    //TODO: remove this once we know there are no references
    //attribData:
    //bgSubscribers = new Subscription("background-changes");

    setBgChangeHandler = (handleFunc:(newImg:BackgroundImageData)=>void) => {
        this.changeHandler = handleFunc;
    }

    setBgImage = (src:string, options:BackgroundImageOptions) => {
        this.bgImage = {src:src, options:options};

        if (this.changeHandler) {
            this.changeHandler(this.bgImage);
        }
    }

    //TODO: remove once we've checked references
    // setBgAttribData = (data) => {
    //     this.attribData = data;
    //     this.bgSubscribers.notifySubscribers(data);
    // }

    // getCurrentBgAttribData = () => {
    //     return this.attribData;
    // }

    // subscribeToAttribData = (handler) => {
    //     return this.bgSubscribers.subscribe(handler);
    // }
}

const BackgroundService = new BackgroundServiceCls();

export default BackgroundService;

export function setBackgroundImage(src:string, options:BackgroundImageOptions) {
    BackgroundService.setBgImage(src, options);
}

export function setDefaultBackground(transitionTime:number) {
    setBackgroundImage(require("../images/chapter_00_bg.jpg"), {
        staticStyle: {transform:`scale(2.5)`, opacity:0.75},
        imageClass: "spin-bg-slow",
        transitionTime: transitionTime ? transitionTime : 0,
    });
    
    //TODO: remove after we check references
    //BackgroundService.setBgAttribData(null);
}
