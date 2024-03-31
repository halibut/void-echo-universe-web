import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService from "../../service/SoundService";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";


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
    });
    const optsRef = useRef({
        primary: [255, 255, 255, .5],
        secondary: [255, 0, 0, 1],
        primaryMixMode: "source-over",
        secondaryMixMode: "hue",
    });

    useEffect(() => {
        //Update "global" values from options
        if (options) {
            optsRef.current = {
                ...optsRef.current,
                ...options
            }
        }
    }, [options])
    
    const doFrame = (canvas) => {
        const {w, h, pCalc, sCalc} = dataRef.current;
        const {primary, secondary, primaryMixMode, secondaryMixMode} = optsRef.current;
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


            const alpha = Math.min(1, Math.max(low * LOW_MULTIPLIER, 0));
            //const br = Math.min(255, Math.floor(mid * MID_MULTIPLIER * 255));
            const br = 255;

            const nlow = Math.max(0, Math.min(low * LOW_MULTIPLIER, 1));
            const nmid = Math.max(0, Math.min(mid * MID_MULTIPLIER, 1)); 

            for (let i = 0; i < 3; i++) {
                pCalc[i] = Math.floor(primary[i] * nlow);
                sCalc[i] = Math.floor(secondary[i] * nmid);
            }
            pCalc[3] = primary[3];
            sCalc[3] = secondary[3];

            ctxt.globalCompositeOperation = primaryMixMode;
            ctxt.fillStyle = `rgba(${pCalc[0]}, ${pCalc[1]}, ${pCalc[2]}, ${pCalc[3]})`;
            ctxt.fillRect(0, 0, w, h);

            ctxt.globalCompositeOperation = secondaryMixMode;
            ctxt.fillStyle = `rgba(${sCalc[0]}, ${sCalc[1]}, ${sCalc[2]}, ${sCalc[3]})`;
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