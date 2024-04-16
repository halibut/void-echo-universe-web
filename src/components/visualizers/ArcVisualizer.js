import SoundService2 from "../../service/SoundService2";
import Utils from "../../utils/Utils";
import { Color } from "../../utils/Color";


class ArcVisualizerCls {
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

            const s = heightScale ? heightScale : 1;

            const segments = this.barArray.length;
            const segWidth = Math.floor(Math.max(hw, hh) / segments);

            let widthOffset = 0;
            for (let i = 1; i < segments; i++) {
                const value = Math.max(0, Math.min(this.barArray[i], 255)) / 255;

                const ratio = i / segments;

                const awidth = Math.floor(((1 - ratio) * (1 - ratio)) * segWidth * 3.5);
                
                const arcLength = s * (3.14159 * value / 2);

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
                ctxt.globalCompositeOperation = this.primaryMixMode;
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
    }
}

const ArcVisualizer = new ArcVisualizerCls();
export default ArcVisualizer;
