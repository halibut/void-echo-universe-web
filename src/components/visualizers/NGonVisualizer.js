import { useCallback, useEffect, useRef } from "react"
import Sound from "../Sound";
import SoundService2 from "../../service/SoundService2";
import Utils from "../../utils/Utils";
import Canvas from "../Canvas";
import { Color } from "../../utils/Color";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 400;
const HIGH_FREQ = 4000;

const TWO_PI = 3.14159 * 2;

function createNGonPaths(innerRad, outerRad, numSides, segments, dutyCycle) {
    const dc = dutyCycle ? dutyCycle : .75;
    const paths = new Array(segments);
    
    const pathWidth = (outerRad - innerRad) / segments;

    let lastRingInner = innerRad;

    let circMod = dc;
    let ratioMod = (-TWO_PI * .25) - (dc * .5 * TWO_PI / numSides);
    let gapMod = (1-dc) * TWO_PI / (numSides);
    if (numSides === 1) {
        circMod = .25;
        ratioMod = -TWO_PI * .375;
    } else if (numSides === 2) {
        circMod = .5;
        gapMod = .25 * TWO_PI;
        ratioMod = -TWO_PI * .375;
    }
    
    for (let i = 0 ; i < segments; i++) {
        const p = new Path2D();
        paths[i] = p;

        const ringOuter = lastRingInner + pathWidth;

        //const ir = Math.floor(lastRingInner);
        //const or = Math.floor(ringOuter);

        for (let j = 0; j < numSides; j++) {
            const gap = gapMod * j;
            const ratio0 = circMod * j / numSides;
            const ratio1 = circMod * (j+1) / numSides;
            const cosj0 = Math.cos(gap + ratioMod + (ratio0 * TWO_PI));
            const sinj0 = Math.sin(gap + ratioMod + (ratio0 * TWO_PI));
            const cosj1 = Math.cos(gap + ratioMod + (ratio1 * TWO_PI));
            const sinj1 = Math.sin(gap + ratioMod + (ratio1 * TWO_PI));

            p.moveTo(lastRingInner * cosj0, lastRingInner * sinj0);
            p.lineTo(lastRingInner * cosj1, lastRingInner * sinj1);
            p.lineTo(ringOuter * cosj1, ringOuter * sinj1);
            p.lineTo(ringOuter * cosj0, ringOuter * sinj0);
        }

        lastRingInner = ringOuter;
    }

    return paths;
}

/** Uses HTML canvas animate the screen to the music */
const NGonVisualizer = ({options}) => {

    const dataRef = useRef({
        barArray: new Array(50),
        paths: null,
        clearPath: null,
        currentNumSides: 3,
        w: 10,
        h: 10,
        primaryMixMode: "source-over",
        secondaryMixMode: "source-over",
    });
    const optsRef = useRef({
        primary: Color(255, 255, 255, .5),
        secondary: Color(0, 0, 0, .8),
        numSides: 3,
        inverse: false,
    });

    useEffect(() => {
        //Update "global" values from options
        if (options) {
            optsRef.current = options;
        }
    }, [options])
    
    const doFrame = (canvas) => {
        const {barArray, w, h, primaryMixMode, secondaryMixMode} = dataRef.current;
        let {paths, currentNumSides, clearPath} = dataRef.current;
        const {primary, secondary, gradientTimes, inverse} = optsRef.current;
        let numSides = optsRef.current?.numSides ? optsRef.current.numSides : 3;
        const ctxt = canvas.getContext("2d");

        const inv = inverse === true;

        const hw = Math.floor(w / 2);
        const hh = Math.floor(h / 2);

        //If anything changes about the screen size or number of sides, recalculate all our paths
        if (!paths || currentNumSides !== numSides || canvas.width !== w || canvas.height !== h) {
            const outerRad = Math.max(hw, hh) * (numSides <= 2 ? 2 : 1.5 );
            //const outerRad = 200;
            paths = createNGonPaths(0, outerRad, numSides, barArray.length);
            clearPath = createNGonPaths(0, outerRad * 3, numSides, 1)[0];
            dataRef.current.paths = paths;
            dataRef.current.clearPath = clearPath;
            dataRef.current.currentNumSides = numSides;
        }

        if (canvas.width !== w) {
            canvas.width = w;
        }
        if (canvas.height !== h) {
            canvas.height = h;
        }
        
        //Set the background to all black
        ctxt.globalCompositeOperation = "source-over";
        ctxt.clearRect(0, 0, w, h);
        ctxt.setTransform(1, 0, 0, 1, 0, 0);

        //Calculate gradient colors if we have any 
        const songPos = SoundService2.getCurrentTime();
        const tx = gradientTimes ? ( songPos - gradientTimes[0]) / ( gradientTimes[1] - gradientTimes[0]) : 0;

        const pc = primary.getGradientColor(tx);
        const sc = secondary.getGradientColor(tx);

        ctxt.globalCompositeOperation = secondaryMixMode;
        ctxt.fillStyle = sc.getRGBAColorString();
        ctxt.fillRect(0, 0, w, h);

        const fftData = SoundService2.getFFTData();
        
        if (fftData) {
            Utils.fftDataToSmallerArrayLogarithmic(fftData, barArray, {freqStart: 0, freqEnd: 1});

            if (numSides === 1) {
                ctxt.translate(hw, h);
            }
            if (numSides > 1) {
                ctxt.translate(hw, hh);
                ctxt.rotate(songPos * TWO_PI / 120)
            }

            //Set our arc style so that it removes alpha wherever it's drawn, and remove the clearPath
            ctxt.fillStyle = "rgba(0, 0, 0, 1.0)";
            ctxt.globalCompositeOperation = "xor";
            ctxt.fill(clearPath);

            //ctxt.globalCompositeOperation = "source-over";
            //ctxt.fillStyle = "#ffff";
            //ctxt.fill(clearPath);

            const segments = barArray.length;

            //Now loop through each bar segment and calculate the intensity of the primary color
            //and draw the corresponding path
            for (let i = 0; i < segments; i++) {
                const p = paths[i];

                const barInd = inv ? segments - i - 1 : i;
                const barIntensity = (Math.max(0, barArray[barInd] / 128) );
                const c = pc.scalarMultiplyNoAlpha(barIntensity);
                //const c = pc.scalarMultiplyAlphaOnly(barIntensity);

                ctxt.fillStyle = c.getRGBAColorString();
                ctxt.globalCompositeOperation = primaryMixMode;
                ctxt.fill(p);
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

export default NGonVisualizer;