import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 200;
const HIGH_FREQ = 2000;

/** Uses CSS variables to animate aspects of a div to the music */
const BlendBgVisualizer = () => {
    const frameAnimRef = useRef(null);
    const elemRef = useRef(null);

    const dataRef = useRef({
        barArray: new Array(50),
        w: 10,
        h: 10,
    });
    
    const doFrame = (canvas) => {
        const {barArray, w, h} = dataRef.current;
        const ctxt = canvas.getContext("2d");

        if (canvas.width !== w) {
            canvas.width = w;
        }
        if (canvas.height !== h) {
            canvas.height = h;
        }
        
        //Set the background to all black
        ctxt.clearRect(0, 0, w, h);
        
        const fftData = SoundService.getFFTData();
        
        if (fftData) {
            const {low, mid, high} = Utils.getFreqRangeAmounts(fftData, SoundService.getSampleRate(), LOW_FREQ, HIGH_FREQ);

            const br = Math.min(255, Math.floor(mid * MID_MULTIPLIER * 255));

            //ctxt.globalCompositeOperation = "overlay";

            ctxt.fillStyle = `rgba(${br}, ${br}, ${br}, 1)`;
            ctxt.fillRect(0, 0, w, h);

        }
    };

    const resizeCanvas = useCallback((w,h) => {
        dataRef.current.w = Math.floor(w);
        dataRef.current.h = Math.floor(h);
    }, []);

    return (
        <Canvas drawFrame={doFrame} onResize={resizeCanvas} style={{mixBlendMode:"overlay"}}/>
    )

}

export default BlendBgVisualizer;