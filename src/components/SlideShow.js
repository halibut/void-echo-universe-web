import { useCallback, useEffect, useRef } from "react";
import SoundService2 from "../service/SoundService2";
import State from "../service/State";
import NasaImagesApi from "../service/NasaImagesApi";
import BackgroundService from "../service/BackgroundService";
import Utils from "../utils/Utils";


const SlideShow = ({songData, onLoadImageMetadata}) => {
    const songImagesRef = useRef({imageSet:[], slideTimeMillis:30000});
    const imageIndexRef = useRef(0);
    
    const nextImgTimeout = useRef(null);

    // Cleanup for component unmounting, or image category switching
    const cancelTimeouts = () => {
        if (nextImgTimeout.current) {
            window.clearTimeout(nextImgTimeout.current);
            nextImgTimeout.current = null;
        }
    }

    const showNextImage = useCallback(async (nasaId, slideTimeMillis) => {
        const quality = State.getStateValue(State.KEYS.IMG_QUALITY, "large");

        console.log(`Next Image [${nasaId}] (${slideTimeMillis}ms - quality=${quality})`);

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

    // Starts the slideshow for the specified imageSet
    const startSlideshow = useCallback(() => {
        cancelTimeouts();

        const songImages = songImagesRef.current;
        const imageIndex = imageIndexRef.current;

        const numImages = songImages.imageSet.length;
        if (numImages > 0) {
            const imageId = songImages.imageSet[imageIndex % numImages];
            showNextImage(imageId, songImages.slideTimeMillis);
        }

        nextImgTimeout.current = window.setTimeout(() => {
            nextImgTimeout.current = null;
            imageIndexRef.current++;
            startSlideshow();
        }, songImages.slideTimeMillis);  
    }, [showNextImage]);

    //When component loads, set up our time-based events for 
    //switching categories
    useEffect(() => {

        //Register background image events, basically times when we change
        //image sets for the song
        if (songData.nasaImages) {
            songData.nasaImages.forEach(i => {
                const setBgImages = () => {
                    const imageList = i.images.slice();
                    Utils.shuffleArray(imageList);
                    songImagesRef.current = {
                        imageSet: imageList,
                        slideTimeMillis: i.slideTime * 1000, 
                    };
                    imageIndexRef.current = 0;

                    startSlideshow();
                }
                SoundService2.registerTimeEvent(i.time, setBgImages, true, true);
            })
        }

        return () => {
            //Clean up any next image timeout we might have
            cancelTimeouts();   
        }
    }, [songData, startSlideshow]);


    return null;
}

export default SlideShow;