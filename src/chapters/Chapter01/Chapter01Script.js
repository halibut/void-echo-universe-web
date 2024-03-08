import Paper from "paper";
import TimeTrigger from "../../utils/TimeTrigger";
import songData from "./song-data";

import QuantumGravity from "../../effects/quantum-gravity";
import BackgroundGradient from "../../effects/background-gradient";
import InterpFuncs from "../../utils/InterpFuncs";
import SegmentTrigger from "../../utils/SegmentTrigger";

class CH01Script {
  constructor() {
    this.segTrigger = new SegmentTrigger({ segmentTimes: songData.segEvents });
    this.plinkTrigger = new TimeTrigger({ triggerTimes: songData.plinks });
    this.kickTrigger = new TimeTrigger({ triggerTimes: songData.kicks });
    this.buzzTrigger = new TimeTrigger({ triggerTimes: songData.buzz });

    this.bg = new BackgroundGradient({
       gradientStops: [['#ffff', 0.0], ['#f88f', 0.0], ['#000f', 0.0], ['#000f', 1]],
       blendMode: 'normal',
       radial: true,
    });

    this.bgIntensity = 0;

    this.qg = new QuantumGravity({
      effectTime: 4,
      strokeWidth: 1,
      scaleFactor: 5,
      maxRotateAmount: 1,
      fftOffsetLength: 10,
      animateAlias: 1 / ((songData.bpm * 2) / 60),
    });

    this.bgColorInd = 0;
    this.bgColors = [
      "#ffff",
      "#fbbf",
      "#f88f",
      "#f44f",
      "#bb8f",
      "#884f",
      "#440f",
      "#000f",
    ];
  }

  initialize = (project) => {
    this.project = project;
    this.project.activate();

    this.bg.initialize(project);
    this.qg.initialize(project);

    Paper.view.draw();
  };

  deInitialize = () => {
    if (this.project) {
      this.project.clear();
      this.project.remove();
    }
  };

  resetTime = (audioTime) => {
    this.segTrigger.reset(audioTime);
    this.plinkTrigger.reset(audioTime);
    this.kickTrigger.reset(audioTime);
    this.initialize(this.project);
  };

  resize = (w, h) => {
    this.initialize(this.project);
  };

  animSegments = ({segment, segmentInd, segmentChanged, currentTime}) => {
    if(segmentChanged) {
      const duration = segment.end - currentTime;

      switch(segment.name) {
        case 'start':
          this.bg.setStopOffset(0, 0.0, 1, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.0, 1, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.0, 1, InterpFuncs.linear);
          break;
        case 'ramp1':
          this.bg.setStopOffset(0, 0.01, duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.01, duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.1,  duration, InterpFuncs.linear);
          break;
        case 'arp1':
          this.bg.setStopOffset(0, 0.01, duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.05, duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.1,  duration, InterpFuncs.linear);

          this.bg.setStopColor(1, '#f000', duration, InterpFuncs.linear);
          break;
        case 'kick1':
          this.bg.setStopOffset(0, 0.01, .25, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.05, .25, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.5,  .25, InterpFuncs.cubicOut);
  
          this.bg.setStopColor(1, '#ff00', .25, InterpFuncs.cubicOut);
          break;
        case 'kicks1':
          this.bg.setStopOffset(0, 0.01, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.05, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.95, duration, InterpFuncs.cubicOut);
          break;
        case 'quiet1':
          this.bg.setStopOffset(0, 0.01, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.01, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.1,  duration, InterpFuncs.cubicOut);
          break;
        case 'break':
          this.bg.setStopOffset(0, 0.01, .25, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.05, .25, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.95, .25, InterpFuncs.cubicOut);
          break;
        case 'quiet2':
          this.bg.setStopOffset(0, 0.0,  5, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.01, 5, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.02, 5, InterpFuncs.cubicOut);
          break;
        case 'ramp2':
          this.bg.setStopOffset(0, 0.01, duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.05, duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.5,  duration, InterpFuncs.linear);
          break;
        case 'final-build':
          this.bg.setStopOffset(0, 0.1,  duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.5,  duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.95, duration, InterpFuncs.linear);
          break;
        case 'fade':
          this.bg.setStopOffset(0, 0.0, duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.0, duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.0, duration, InterpFuncs.linear);
          break;
        default: 
          break;
      }
    } 
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    this.project.activate();

    const newPlinks = this.plinkTrigger.detect(audioTime);
    const newKicks = this.kickTrigger.detect(audioTime);
    const newBuzz = this.buzzTrigger.detect(audioTime);

    newPlinks.forEach((p) => this.qg.triggerItem());

    newBuzz.forEach((b) => this.bgIntensity += 0.125);

    this.bgIntensity = Math.max(0, Math.min(this.bgIntensity - 0.125 * audioDt, 1));

    const i = this.bgIntensity;
    if (i < 0.25) {
      const r = Math.floor(9 * 4 * i);
      this.bg.setStopColor(3, `#${r}00f`);  
    } else if (i < .5) {
      const g = Math.floor(9 * 4 * (i - 0.25));
      this.bg.setStopColor(3, `#9${g}0f`);  
    } else {
      const b = Math.floor(9 * 2 * (i - 0.5));
      this.bg.setStopColor(3, `#99${b}f`);  
    }
    
    if (newKicks.length > 0) {
      this.bgColorInd = (this.bgColorInd + 1) % this.bgColors.length;
      this.bg.setStopColor(1, this.bgColors[this.bgColorInd], 0.125, InterpFuncs.cubicOut);
    }

    this.segTrigger.forCurrentSegment(audioTime, this.animSegments);

    this.bg.drawFrame(audioTime, audioDt, frameEvent);
    this.qg.drawFrame(audioTime, audioDt, frameEvent);
  };
}

const Chapter_01_viz_script = new CH01Script();
export default Chapter_01_viz_script;
