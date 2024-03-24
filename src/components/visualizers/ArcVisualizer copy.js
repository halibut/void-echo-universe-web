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

const TWO_PI = 3.14159 * 2;

/** Uses HTML canvas animate the screen to the music */
const ArcVisualizer = () => {
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
        ctxt.globalCompositeOperation = "source-over";
        ctxt.clearRect(0, 0, w, h);
        ctxt.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctxt.fillRect(0, 0, w, h);

        //Set our arc style so that it removes alpha wherever it's drawn
        ctxt.strokeStyle = "rgba(0, 0, 0, 1.0)";
        ctxt.globalCompositeOperation = "xor";
        
        const fftData = SoundService.getFFTData();
        
        if (fftData) {
            Utils.fftDataToSmallerArray(fftData, barArray);

            const hw = Math.floor(w / 2);
            const hh = Math.floor(h / 2);

            const segments = barArray.length;
            const segWidth = Math.floor(Math.max(hw, hh) / segments);

            let widthOffset = 0;
            for (let i = 1; i < segments; i++) {
                const value = Math.max(0, Math.min(barArray[i], 255)) / 255;

                const ratio = i / segments;

                const awidth = Math.floor(((1 - ratio) * (1 - ratio)) * segWidth * 3.5);
                
                const arcLength = (3.14159 * value / 2);

                ctxt.lineWidth = awidth;
                
                //ctxt.moveTo(hh, hw);
                ctxt.beginPath();
                ctxt.arc(hw, hh, widthOffset + awidth/2, -arcLength, arcLength)
                ctxt.stroke();

                ctxt.beginPath();
                ctxt.arc(hw, hh, widthOffset + awidth/2, 3.14159 - arcLength, 3.14159 + arcLength)
                ctxt.stroke();
                
                widthOffset += awidth;
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

export default ArcVisualizer;