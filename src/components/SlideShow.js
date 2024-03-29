import { useCallback, useEffect, useReducer, useRef } from "react";
import Utils from "../utils/Utils";
import SoundService from "../service/SoundService";
import State from "../service/State";
import NasaImagesApi from "../service/NasaImagesApi";
import BackgroundService from "../service/BackgroundService";


function bgImageReducer(state, action){
    if (action.type === "load-images") {
        const songData = action.songData;

        const imgData = songData.nasaImages.map(ni => {
            const shuffledImages = ni.images.slice();
            Utils.shuffleArray(shuffledImages);
            return {
                ...ni,
                images: shuffledImages,
            };
        });

        return {
            songImages: imgData,
            imageCategory: null,
            imageIndex: null,
        }
    }
    else if (action.type === "next-image") {
        const songPos = action.songPosition ? action.songPosition : 0;
        const {songImages, imageIndex} = state;

        let cat = 0;
        while (cat < songImages.length-1 && songImages[cat].time >= songPos) {
            cat++;
        }

        const newInd = imageIndex !== null ? imageIndex + 1 : 0;
        
        return {
            songImages: songImages,
            imageCategory: cat,
            imageIndex: newInd,
        };
    }
}

const SlideShow = ({songData, onLoadImageMetadata}) => {
    const [state, dispatch] = useReducer(bgImageReducer, {songImages:[], imageCategory:null, imageIndex:null});

    const nextImgTimeout = useRef(null);

    const {songImages, imageCategory, imageIndex} = state;

    //When component loads, load our images and display whatever is first (next-image)
    useEffect(() => {
        dispatch({type: "load-images", songData});
        dispatch({type: "next-image", songPosition:0});
        
        return () => {

            //Clean up any next image timeout we might have
            if (nextImgTimeout.current) {
                window.clearTimeout(nextImgTimeout.current);
                nextImgTimeout.current = null;
            }
        }
    }, [songData])

    const showNextImage = useCallback(async (nasaId, slideTimeMillis) => {
        const quality = State.getStateValue(State.KEYS.IMG_QUALITY, "large");

        if (quality === "none") {
            return;
        }

        const imageURLsResult = await NasaImagesApi.getImageURLs(nasaId);

        if (imageURLsResult) {
            let imgURL = imageURLsResult[quality];

            //Set a transition time (fade-in time) proportional to the slide time
            const transTime = Math.max(1000, Math.floor(slideTimeMillis * .2));

            //Set an animaiton time (img-zoom-pan) a little longer than the slide time, so nothing ever stops moving
            const animTime = Math.floor(slideTimeMillis * 1.25);
            
            BackgroundService.setBgImage(imgURL, {
                transitionTime: transTime,
                imageClass: "img-zoom-pan",
                imageStyle:{
                    animationDuration: `${animTime}ms`,
                },
                imageCSSProps:{
                    '--bg-final-x': (Math.random()*30 - 15)+"%",
                    '--bg-final-y': (Math.random()*30 - 15)+"%",
                    '--bg-final-zoom': (Math.random()*2 + 1),
                },
            });
        }

        const metadataResult = await NasaImagesApi.getImageMetadata(nasaId);
        if (metadataResult && onLoadImageMetadata) {
            onLoadImageMetadata(metadataResult);
        }
    }, [onLoadImageMetadata]);

    useEffect(() => {
        //songImages, and showNextImage should never change,
        //so if any other state changes, this will tell the
        //BackgroundService to display the next image.
        //
        //We do not show any images if the page is loading out
        if (songImages && songImages.length > 0 &&  imageCategory !== null && imageIndex !== null) {
            const categoryData = songImages[imageCategory];
            const imageSet = categoryData.images;

            //Calculate the number of miliseconds to display the image
            //Note slideTime from the image set is in seconds
            const slideTimeMillis = Math.max(5000, categoryData.slideTime * 1000);

            //Determine the image to display
            const toDisplayId = imageSet[imageIndex % imageSet.length];

            showNextImage(toDisplayId, slideTimeMillis);

            //Set a timer to display the next image after some time.
            nextImgTimeout.current = window.setTimeout(() => {
                const songPosition = SoundService.getCurrentTime();
                dispatch({type: "next-image", songPosition:songPosition});
            }, slideTimeMillis);
        }
    }, [imageCategory, imageIndex, songImages, showNextImage])


    return null;
}

export default SlideShow;