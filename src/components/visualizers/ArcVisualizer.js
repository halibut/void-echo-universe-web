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

const TWO_PI = 3.14159 * 2;

/** Uses HTML canvas animate the screen to the music */
const ArcVisualizer = ({options}) => {

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
        const {primary, secondary, gradientTimes} = optsRef.current;
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

                const radius = widthOffset + awidth/2;
                
                //Set our arc style so that it removes alpha wherever it's drawn
                ctxt.strokeStyle = "rgba(0, 0, 0, 1.0)";
                ctxt.globalCompositeOperation = "xor";
                ctxt.beginPath();
                ctxt.arc(hw, hh, radius, -arcLength, arcLength)
                ctxt.stroke();

                ctxt.beginPath();
                ctxt.arc(hw, hh, radius, 3.14159 - arcLength, 3.14159 + arcLength)
                ctxt.stroke();

                //Now draw everything again with our primary color
                ctxt.strokeStyle = pc.getRGBAColorString();
                ctxt.globalCompositeOperation = primaryMixMode;
                ctxt.beginPath();
                ctxt.arc(hw, hh, radius, -arcLength, arcLength)
                ctxt.stroke();

                ctxt.beginPath();
                ctxt.arc(hw, hh, radius, 3.14159 - arcLength, 3.14159 + arcLength)
                ctxt.stroke();
                
                //Update our width offset for higher-frequence arcs
                widthOffset += awidth;
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

export default ArcVisualizer;