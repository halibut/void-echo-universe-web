import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 400;
const HIGH_FREQ = 4000;

/** Uses CSS variables to animate aspects of a div to the music */
const BlendBgVisualizer = () => {
    const frameAnimRef = useRef(null);
    const elemRef = useRef(null);
    
    useEffect(() => {
        const doFrame = () => {
            if (elemRef.current) {
                const elm = elemRef.current;
                const fftData = SoundService.getFFTData();
    
                if (fftData) {
                    const {low, mid, high} = Utils.getFreqRangeAmounts(fftData, SoundService.getSampleRate(), LOW_FREQ, HIGH_FREQ);
    
                    elm.style.setProperty("--low", low * LOW_MULTIPLIER);
                    elm.style.setProperty("--mid", mid * MID_MULTIPLIER);
                    elm.style.setProperty("--high", high * HIGH_MULTIPLIER);
                }
            }
    
            frameAnimRef.current = window.requestAnimationFrame(doFrame);
            //frameAnimRef.current = window.setTimeout(doFrame, 5000);
        };

        doFrame();

        return ()=> {
            if (frameAnimRef.current) {
                window.cancelAnimationFrame(frameAnimRef.current);
                //window.clearTimeout(frameAnimRef.current);
                frameAnimRef.current = null;
            }
        }
    }, []);

    return (
        <div ref={elemRef} className="blend-bg-visualizer">

        </div>
    )

}

export default BlendBgVisualizer;