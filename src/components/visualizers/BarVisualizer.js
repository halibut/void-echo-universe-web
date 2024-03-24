import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 400;
const HIGH_FREQ = 4000;

/** Uses html canvas to animate an FFT effect */
const BarVisualizer = () => {
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
        ctxt.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctxt.fillRect(0, 0, w, h);
        
        const fftData = SoundService.getFFTData();
        
        if (fftData) {
            Utils.fftDataToSmallerArray(fftData, barArray);

            const hw = Math.floor(w / 2);
            const hh = Math.floor(h / 2);

            const segments = barArray.length;
            const segWidth = Math.floor(1.25 * hw / segments);

            let xOffset = 0;
            for (let i = 1; i < segments; i++) {
                const value = Math.max(0, Math.min(barArray[i], 255)) / 255 * hh;
                //ctxt.clearRect(hw - ((i + 1) * segWidth), -value, segWidth, value * 2);
                const y = hh - value;
                ctxt.clearRect(hw - (xOffset + segWidth), y, segWidth, value * 2);
                ctxt.clearRect(hw + xOffset, y, segWidth, value * 2);

                xOffset += segWidth;
            }
        }
    };

    const resizeCanvas = useCallback((w,h) => {
        dataRef.current.w = Math.floor(w);
        dataRef.current.h = Math.floor(h);
    }, []);

    return (
        <Canvas drawFrame={doFrame} onResize={resizeCanvas} />
    )

}

export default BarVisualizer;