import SoundService2 from "../../service/SoundService2";
import Utils from "../../utils/Utils";
import { Color } from "../../utils/Color";

class BarVisualizerCls {
    constructor() {
        this.barArray = new Array(50);
        this.primaryMixMode = "source-over";
        this.secondaryMixMode = "source-over";

        this.options = {
            primary: Color(255, 255, 255, .5),
            secondary: Color(0, 0, 0, .8),
        };
    }

    setOptions = (opts) => {
        this.options = opts;
    }

    doFrame = (canvas, ctxt, w, h) => {
        const {primary, secondary, gradientTimes, heightScale} = this.options;
        
        //Set the background to all black
        ctxt.globalCompositeOperation = "source-over";
        ctxt.clearRect(0, 0, w, h);

        //Calculate gradient colors if we have any 
        const songPos = SoundService2.getCurrentTime();
        const tx = gradientTimes ? ( songPos - gradientTimes[0]) / ( gradientTimes[1] - gradientTimes[0]) : 0;

        const pc = primary.getGradientColor(tx);
        const sc = secondary.getGradientColor(tx);

        ctxt.fillStyle = sc.getRGBAColorString();
        ctxt.fillRect(0, 0, w, h);
        
        const fftData = SoundService2.getFFTData();
        
        if (fftData) {
            Utils.fftDataToSmallerArrayLogarithmic(fftData, this.barArray);

            const hw = Math.floor(w / 2);
            const hh = Math.floor(h / 2);

            const segments = this.barArray.length;
            const segWidth = Math.floor(1.25 * hw / segments);

            const s = heightScale ? heightScale : 1;

            let xOffset = 0;
            for (let i = 1; i < segments; i++) {
                const value = s * Math.max(0, Math.min(this.barArray[i], 255)) / 255 * hh;
                //ctxt.clearRect(hw - ((i + 1) * segWidth), -value, segWidth, value * 2);
                const y = hh - value;
                ctxt.fillStyle = "rgba(0, 0, 0, 1.0)";
                ctxt.globalCompositeOperation = "xor";
                ctxt.fillRect(hw - (xOffset + segWidth), y, segWidth, value * 2);
                ctxt.fillRect(hw + xOffset, y, segWidth, value * 2);

                //Now draw everything again with our primary color
                ctxt.fillStyle = pc.getRGBAColorString();
                ctxt.globalCompositeOperation = this.primaryMixMode;
                ctxt.fillRect(hw - (xOffset + segWidth), y, segWidth, value * 2);
                ctxt.fillRect(hw + xOffset, y, segWidth, value * 2);

                xOffset += segWidth;
            }
        }
    };
}

const BarVisualizer = new BarVisualizerCls();
export default BarVisualizer;