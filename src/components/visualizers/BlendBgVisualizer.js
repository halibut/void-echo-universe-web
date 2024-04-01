import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";
import { Color } from "../../utils/Color";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 300;
const HIGH_FREQ = 2000;

/** Uses CSS variables to animate aspects of a div to the music */
const BlendBgVisualizer = ({options}) => {
    const dataRef = useRef({
        w: 10,
        h: 10,
        pCalc: new Array(4),
        sCalc: new Array(4),
        primaryMixMode: "source-over",
        secondaryMixMode: "hue",
    });
    const optsRef = useRef({
        primary: Color(255, 255, 255, .5),
        secondary: Color(255, 0, 0, 1),
    });

    useEffect(() => {
        //Update "global" values from options
        if (options) {
            optsRef.current = options;
        }
    }, [options])
    
    const doFrame = (canvas) => {
        const {w, h, pCalc, sCalc, primaryMixMode, secondaryMixMode} = dataRef.current;
        const {primary, secondary, gradientTimes} = optsRef.current;
        const ctxt = canvas.getContext("2d");

        if (canvas.width !== w) {
            canvas.width = w;
        }
        if (canvas.height !== h) {
            canvas.height = h;
        }

        const songPos = SoundService.getCurrentTime();
        
        const tx = gradientTimes ? ( songPos - gradientTimes[0]) / ( gradientTimes[1] - gradientTimes[0]) : 0;

        const pc = primary.getGradientColor(tx);
        const sc = secondary.getGradientColor(tx);
        
        //Set the background to all black
        ctxt.clearRect(0, 0, w, h);
        
        const fftData = SoundService.getFFTData();
        
        if (fftData) {
            const {low, mid, high} = Utils.getFreqRangeAmounts(fftData, SoundService.getSampleRate(), LOW_FREQ, HIGH_FREQ);


            const alpha = Math.min(1, Math.max(low * LOW_MULTIPLIER, 0));
            //const br = Math.min(255, Math.floor(mid * MID_MULTIPLIER * 255));
            const br = 255;

            const nlow = low * LOW_MULTIPLIER;
            const nmid = mid * MID_MULTIPLIER; 

            const lowColor = pc.scalarMultiplyNoAlpha(nlow);
            const midColor = sc.scalarMultiplyNoAlpha(nmid);

            ctxt.globalCompositeOperation = primaryMixMode;
            ctxt.fillStyle = lowColor.getRGBAColorString();
            ctxt.fillRect(0, 0, w, h);

            ctxt.globalCompositeOperation = secondaryMixMode;
            ctxt.fillStyle = midColor.getRGBAColorString();
            ctxt.fillRect(0, 0, w, h);

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

export default BlendBgVisualizer;