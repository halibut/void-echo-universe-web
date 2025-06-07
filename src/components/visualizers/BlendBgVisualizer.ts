import SoundService2 from "../../service/SoundService2";
import Utils from "../../utils/Utils";
import { Color } from "../../utils/Color";
import { VisualizerI, VisualizerOptionsType } from "../Visualizer";


const LOW_MULTIPLIER = 1 / 255;
const MID_MULTIPLIER = 1 / 255;
//const HIGH_MULTIPLIER = 1 / 255;

const LOW_FREQ = 300;
const HIGH_FREQ = 2000;

class BlendBgVisualizerCls implements VisualizerI {
    primaryMixMode: GlobalCompositeOperation;
    secondaryMixMode: GlobalCompositeOperation; 
    options: VisualizerOptionsType;

    constructor() {
        this.primaryMixMode = "source-over";
        this.secondaryMixMode = "source-over";

        this.options = {
            primary: Color(255, 255, 255, .5),
            secondary: Color(0, 0, 0, .5),
        };
    }

    setOptions = (opts:VisualizerOptionsType) => {
        this.options = opts;
    }

    doFrame = (canvas:HTMLCanvasElement, ctxt:CanvasRenderingContext2D, w:number, h:number) => {
        const {primary, secondary, gradientTimes} = this.options;
        
        const songPos = SoundService2.getCurrentTime();
        
        const tx = gradientTimes ? ( songPos - gradientTimes[0]) / ( gradientTimes[1] - gradientTimes[0]) : 0;

        const pc = primary.getGradientColor(tx);
        const sc = secondary.getGradientColor(tx);
        
        //Set the background to all black
        ctxt.clearRect(0, 0, w, h);
        
        const fftData = SoundService2.getFFTData();
        
        if (fftData) {
            const {low, mid, high} = Utils.getFreqRangeAmounts(fftData, SoundService2.getSampleRate(), LOW_FREQ, HIGH_FREQ);


            //const alpha = Math.min(1, Math.max(low * LOW_MULTIPLIER, 0));
            //const br = Math.min(255, Math.floor(mid * MID_MULTIPLIER * 255));
            //const br = 255;

            const nlow = low * LOW_MULTIPLIER;
            const nmid = mid * MID_MULTIPLIER; 

            const lowColor = pc.scalarMultiplyNoAlpha(nlow);
            const midColor = sc.scalarMultiplyNoAlpha(nmid);

            ctxt.globalCompositeOperation = this.primaryMixMode;
            ctxt.fillStyle = lowColor.getRGBAColorString();
            ctxt.fillRect(0, 0, w, h);

            ctxt.globalCompositeOperation = this.secondaryMixMode;
            ctxt.fillStyle = midColor.getRGBAColorString();
            ctxt.fillRect(0, 0, w, h);

        }
    };

}

const BlendBgVisualizer = new BlendBgVisualizerCls();
export default BlendBgVisualizer;