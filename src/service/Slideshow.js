import Utils from "../utils/Utils";
import BackgroundService, { setDefaultBackground } from "./BackgroundService";
import NasaImagesApi from "./NasaImagesApi";
import SoundService2 from "./SoundService2";
import State from "./State";
import Subscription from "./Subscription";

class SlideShowCls {
    constructor() {
        this.subscribers = new Subscription("slideshow");
        this.currentSound = null;
        this.imageSet = [];
        this.slideTimeMillis = 30000;
        this.nextImgTimeout = null;

        SoundService2.subscribeEvents(this.#handleSongEvents);
    }

    #handleSongEvents = (evt) => {
        switch (evt.event) {
            case SoundService2.EVENTS.PLAYING:
                const soundData = SoundService2.getSoundData();
                if (soundData) {
                    if (soundData !== this.currentSound) {
                        if (soundData.nasaImages && soundData.nasaImages.length > 0) {
                            soundData.nasaImages.forEach(ni => {
                                SoundService2.registerTimeEvent(ni.time, () => {
                                    this.#switchImageSet(ni.images, ni.slideTime * 1000);
                                })
                            });
                        } else {
                            //If there are no nasa images, just load the default background back in
                            this.#clearTimeouts();
                            setDefaultBackground(1000);
                            this.imageSet = [];
                            this.imageIndex = null;
                        }
                        this.currentSound = soundData;
                    } else {
                        //do nothing because the song hasn't changed
                    }
                } else {
                    //If there's no sound data, load the default background
                    this.#clearTimeouts();
                    setDefaultBackground(1000);
                    this.imageSet = [];
                    this.imageIndex = null;
                }
                break;
            default:
                break;
        }
    }

    #clearTimeouts = () => {
        if (this.nextImgTimeout) {
            window.clearTimeout(this.nextImgTimeout);
            this.nextImgTimeout = null;
        }
    }

    #switchImageSet = (imageSet, slideTimeMillis) => {
        const imgs = imageSet.slice();
        Utils.shuffleArray(imgs);
        this.imageSet = imgs;
        this.slideTimeMillis = slideTimeMillis;
        this.imageIndex = 0;

        this.#nextImage();
    } 

    #nextImage = () => {
        this.#clearTimeouts();

        const numImages = this.imageSet.length;
        if (numImages > 0) {
            const imageId = this.imageSet[this.imageIndex % numImages];
            this.#showImage(imageId, this.slideTimeMillis);
        }

        this.nextImgTimeout = window.setTimeout(() => {
            this.nextImgTimeout = null;
            this.imageIndex++;
            this.#nextImage();
        }, this.slideTimeMillis);  
    }

    #showImage = async (nasaId, slideTimeMillis) => {
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
        if (metadataResult) {
            this.subscribers.notifySubscribers(metadataResult);
        }
    }

    subscribeToImageMetadata = (handler) => {
        return this.subscribers.subscribe(handler);
    }
}

const SlideShow = new SlideShowCls();
export default SlideShow;