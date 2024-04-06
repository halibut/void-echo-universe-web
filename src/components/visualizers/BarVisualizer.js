import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";
import { Color } from "../../utils/Color";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 400;
const HIGH_FREQ = 4000;

/** Uses html canvas to animate an FFT effect */
const BarVisualizer = ({options}) => {
    
    const dataRef = useRef({
        barArray: new Array(50),
        w: 10,
        h: 10,
        primaryMixMode: "source-over",
        secondaryMixMode: "source-over",
    });
    const optsRef = useRef({
        primary: Color(255, 255, 255, .5),
        secondary: Color(0, 0, 0, .8),
    });

    useEffect(() => {
        //Update "global" values from options
        if (options) {
            optsRef.current = options;
        }
    }, [options])
    
    const doFrame = (canvas) => {
        const {barArray, w, h, primaryMixMode, secondaryMixMode} = dataRef.current;
        const {primary, secondary, gradientTimes, heightScale} = optsRef.current;
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

        //Calculate gradient colors if we have any 
        const songPos = SoundService.getCurrentTime();
        const tx = gradientTimes ? ( songPos - gradientTimes[0]) / ( gradientTimes[1] - gradientTimes[0]) : 0;

        const pc = primary.getGradientColor(tx);
        const sc = secondary.getGradientColor(tx);

        ctxt.fillStyle = sc.getRGBAColorString();
        ctxt.fillRect(0, 0, w, h);
        
        const fftData = SoundService.getFFTData();
        
        if (fftData) {
            Utils.fftDataToSmallerArrayLogarithmic(fftData, barArray);

            const hw = Math.floor(w / 2);
            const hh = Math.floor(h / 2);

            const segments = barArray.length;
            const segWidth = Math.floor(1.25 * hw / segments);

            const s = heightScale ? heightScale : 1;

            let xOffset = 0;
            for (let i = 1; i < segments; i++) {
                const value = s * Math.max(0, Math.min(barArray[i], 255)) / 255 * hh;
                //ctxt.clearRect(hw - ((i + 1) * segWidth), -value, segWidth, value * 2);
                const y = hh - value;
                ctxt.fillStyle = "rgba(0, 0, 0, 1.0)";
                ctxt.globalCompositeOperation = "xor";
                ctxt.fillRect(hw - (xOffset + segWidth), y, segWidth, value * 2);
                ctxt.fillRect(hw + xOffset, y, segWidth, value * 2);

                //Now draw everything again with our primary color
                ctxt.fillStyle = pc.getRGBAColorString();
                ctxt.globalCompositeOperation = primaryMixMode;
                ctxt.fillRect(hw - (xOffset + segWidth), y, segWidth, value * 2);
                ctxt.fillRect(hw + xOffset, y, segWidth, value * 2);

                xOffset += segWidth;
            }
        }
    };

    const resizeCanvas = useCallback((w,h) => {
        dataRef.current.w = Math.floor(w);
        dataRef.current.h = Math.floor(h);
    }, []);

    return (
        <Canvas key={"c"} drawFrame={doFrame} onResize={resizeCanvas} style={{mixBlendMode: options?.blendMode ? options.blendMode : "overlay"}}/>
    )

}

export default BarVisualizer;