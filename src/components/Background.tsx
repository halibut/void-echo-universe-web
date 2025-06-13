import { CSSProperties, FC, ReactNode, useCallback, useEffect, useReducer, useRef} from "react";

import BackgroundService, { BackgroundImageData } from "../service/BackgroundService";

type ImageContainerProps = {
    imgSrc:string,
    options:{
        imageCSSProps?:CSSProperties,
        staticStyle?:CSSProperties,
        imageClass?:string,
        imageStyle?:CSSProperties,
        transitionTime?:number,
    },
    isLoadingIn:boolean,
}

const ImgContainer:FC<ImageContainerProps> = ({imgSrc, options, isLoadingIn}) => {
    const imgRef = useRef<HTMLImageElement|null>(null);

    const setRef = (elm:HTMLImageElement) => {
        imgRef.current = elm;

        if (elm && elm.style && options.imageCSSProps) {
            Object.keys(options.imageCSSProps).forEach((key) => {
                const cssPropVal = options.imageCSSProps![key as keyof CSSProperties]!;
                elm.style.setProperty(key, cssPropVal.toString());
            });
        }
    }

    let outerStyle = options.staticStyle ? {...options.staticStyle} : {};
    let outerClass = "";
    let imageClass = options.imageClass ? options.imageClass : "";
    let imageStyle = options.imageStyle ? options.imageStyle : {};
    if (isLoadingIn) {
        outerStyle.animationDuration = (options.transitionTime ? options.transitionTime : 1000) + "ms";
        outerClass = "fade-in";
    }

    return (
        <div className={'bg-image-container '+outerClass} style={outerStyle}>
            <img ref={setRef} className={'bg-image '+imageClass} style={imageStyle} src={imgSrc} alt="" />
        </div>
    )
}

type ImageActionOptions = {
    forceReplace?:boolean
    transitionTime?:number
}

interface BackgroundImage extends BackgroundImageData {
    options:ImageActionOptions,
    src: string,
    key?: number,
}

type BackgroundReducerState = {
    bgImage:BackgroundImage|null,
    loadingImage:BackgroundImage|null,
}

type BackgroundReducerAction = {
    type: "newImg" | "endAnim" | "clear",
    img?: BackgroundImage
}

//Reducer takes the components initial state, and the action to be performed (the argument
//when component calls dispatch), and returns the new state
function bgReducer(state:BackgroundReducerState, action:BackgroundReducerAction):BackgroundReducerState {
    const {bgImage, loadingImage} = state;

    if (action.type === "newImg" && action.img) {
        const newImg = action.img;

        const opts = newImg.options ? newImg.options : {};

        if (bgImage !== null && newImg.src === bgImage.src) {
            if (!opts.forceReplace) {
                return state;
            }
        }
        
        const transTime = opts.transitionTime ? opts.transitionTime : 0;

        const img = {
            src: newImg.src,
            options: opts,
            key: (new Date()).getTime()
        }

        if (transTime > 0) {
            return {
                bgImage: bgImage,
                loadingImage: img,
            };
        }
        else {
            return {
                bgImage: img,
                loadingImage: null,
            }
        }
    }
    else if (action.type === "endAnim") {
        if (loadingImage) {
            return {
                bgImage: loadingImage,
                loadingImage: null,
            };
        } else {
            return state;
        }
        
    }
    else if (action.type === "clear") {
        return {
            bgImage: null,
            loadingImage: null,
        }
    }
    else {
        return state;
    }
}

const Background = () => {
    //Trying out managing state via reducer, rather than individual state items
    const [state, dispatch] = useReducer(bgReducer, {bgImage: null, loadingImage: null});

    const loadingTimeout = useRef<number|null>(null);

    const updateBgImage = useCallback((newImg:BackgroundImageData) => {
        //Handle any existing loading animations
        if (loadingTimeout.current !== null) {
            window.clearTimeout(loadingTimeout.current);
            loadingTimeout.current = null;
            dispatch({type:"endAnim"});
        }

        if (newImg === null) {
            dispatch({type:"clear"});
        }
        else {
            dispatch({type:"newImg", img:newImg});

            if (newImg?.options?.transitionTime && newImg.options.transitionTime > 0) {
                loadingTimeout.current = window.setTimeout(() => {
                    loadingTimeout.current = null;
                    dispatch({type:"endAnim"});
                }, newImg.options.transitionTime);
            }
        }
    }, []);

    useEffect(() => {
        BackgroundService.setBgChangeHandler(updateBgImage);
    }, [updateBgImage])

    const {bgImage, loadingImage} = state;

    const imgs:ReactNode[] = [];
    if (bgImage) {
        imgs.push(
            <ImgContainer key={bgImage.key} imgSrc={bgImage.src} options={bgImage.options} isLoadingIn={false} />
        );
    }

    if (loadingImage) {
        imgs.push(
            <ImgContainer key={loadingImage.key} imgSrc={loadingImage.src} options={loadingImage.options} isLoadingIn={true} />
        );
    }

    return <>{imgs}</>

    /*
    let imgObj = null;
    if (bgImage) {
        imgObj = (<img className='bg-image spin-bg-slow' style={{opacity:0.3}} src={bgImage.src} alt="" />);
    }

    return (
        <div key='bg' className='bg-image' style={{transform:`scale(3)`}}>
            {imgObj}
        </div>
    )
    */
};

export default Background;

