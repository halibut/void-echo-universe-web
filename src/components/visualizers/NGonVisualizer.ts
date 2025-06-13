import SoundService2 from "../../service/SoundService2";
import Utils from "../../utils/Utils";
import { Color } from "../../utils/Color";
import { VisualizerI, VisualizerOptionsType } from "../Visualizer";


const TWO_PI = 3.14159 * 2;

function createNGonPaths(innerRad:number, outerRad:number, numSides:number, segments:number, dutyCycle?:number) {
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

class NGonVisualizerCls implements VisualizerI {
    barArray:number[] = new Array(50);
    paths:Path2D[]|null = null;
    clearPath:Path2D|null = null;
    currentNumSides:number = 3;
    primaryMixMode:GlobalCompositeOperation = "source-over";
    secondaryMixMode:GlobalCompositeOperation = "source-over";
    options:VisualizerOptionsType = {
        primary: Color(255, 255, 255, .5),
        secondary: Color(0, 0, 0, .8),
        numSides: 3,
        inverse: false,
    }

    setOptions = (opts:VisualizerOptionsType) => {
        this.options = opts;
    }
    
    doFrame = (canvas:HTMLCanvasElement, ctxt:CanvasRenderingContext2D, w:number, h:number) => {
        let {paths, currentNumSides, clearPath} = this;
        const {primary, secondary, gradientTimes, inverse} = this.options;
        let numSides = this.options?.numSides ? this.options.numSides : 3;
        
        const inv = inverse === true;

        const hw = Math.floor(w / 2);
        const hh = Math.floor(h / 2);

        //If anything changes about the screen size or number of sides, recalculate all our paths
        if (!paths || currentNumSides !== numSides || canvas.width !== w || canvas.height !== h) {
            const outerRad = Math.max(hw, hh) * (numSides <= 2 ? 2 : 1.5 );
            //const outerRad = 200;
            paths = createNGonPaths(0, outerRad, numSides, this.barArray.length);
            clearPath = createNGonPaths(0, outerRad * 3, numSides, 1)[0];
            this.paths = paths;
            this.clearPath = clearPath;
            this.currentNumSides = numSides;
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

        ctxt.globalCompositeOperation = this.secondaryMixMode;
        ctxt.fillStyle = sc.getRGBAColorString();
        ctxt.fillRect(0, 0, w, h);

        const fftData = SoundService2.getFFTData();
        
        if (fftData) {
            //Utils.fftDataToSmallerArrayLogarithmic(fftData, this.barArray, {freqStart: 0, freqEnd: 1});
            Utils.fftDataToSmallerArrayLogarithmic(fftData, this.barArray);

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
            ctxt.fill(clearPath!);

            //ctxt.globalCompositeOperation = "source-over";
            //ctxt.fillStyle = "#ffff";
            //ctxt.fill(clearPath);

            const segments = this.barArray.length;

            //Now loop through each bar segment and calculate the intensity of the primary color
            //and draw the corresponding path
            for (let i = 0; i < segments; i++) {
                const p = paths[i];

                const barInd = inv ? segments - i - 1 : i;
                const barIntensity = (Math.max(0, this.barArray[barInd] / 128) );
                const c = pc.scalarMultiplyNoAlpha(barIntensity);
                //const c = pc.scalarMultiplyAlphaOnly(barIntensity);

                ctxt.fillStyle = c.getRGBAColorString();
                ctxt.globalCompositeOperation = this.primaryMixMode;
                ctxt.fill(p);
            }
        }
    };

}

const NGonVisualizer = new NGonVisualizerCls();
export default NGonVisualizer;