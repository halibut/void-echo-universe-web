import Paper from "paper";
import TimeTrigger from "../../utils/TimeTrigger";
import songData from "./song-data";

import QuantumGravity from "../../effects/quantum-gravity";
import BackgroundGradient from "../../effects/background-gradient";
import InterpFuncs from "../../utils/InterpFuncs";
import SegmentTrigger from "../../utils/SegmentTrigger";
import Radiate from "../../effects/radiate";
import Dots from "../../effects/dots";
import PaperAnimations from "../../utils/PaperAnimations";
import FFTLine from "../../effects/fft-line";
import Sounds from "../../utils/Sounds";
import Utils from "../../utils/Utils";
import Particles from "../../effects/particles";

const QT_CIR_RAD = Math.PI * 2 / 4;
const RAD_TO_DEG = 180 / Math.PI;

const pt = (x,y) => {
  return new Paper.Point(x,y);
}

const createMask = (w,h) => {
  const x = w/2;
  const y = h/2;
  const m = new Paper.Path([
    pt(x,y), pt(x,y), pt(x,y), pt(x,y), pt(x,y), pt(x,y),
  ]);
  m.closed = true;
  m.applyMatrix = false;
  //m.position = pt(x,y);

  updateMask(m, w, h, 0, 0)

  //m.remove();

  m.style.strokeWidth = 4;
  m.style.strokeColor = 'white';
  m.style.fillColor = '#8888';

  return m;
}

const updateMask = (mask, w, h, openAngle) => {
  const r = Math.sqrt(w*w + h*h);
  const c = pt(w/2, h/2);
  const p1 = mask.segments[0].point;
  const p2 = mask.segments[1].point;
  const p3 = mask.segments[2].point;
  const p4 = mask.segments[3].point;
  const p5 = mask.segments[4].point;
  const p6 = mask.segments[5].point;

  const midAngle = (2*QT_CIR_RAD-openAngle)*.5 + openAngle;

  //negative open angle
  p1.x = c.x + r * Math.cos(-openAngle);
  p1.y = c.y + r * Math.sin(-openAngle);

  //center
  p2.x = c.x;
  p2.y = c.y;

  //positive open angle
  p3.x = c.x + r * Math.cos(+openAngle);
  p3.y = c.y + r * Math.sin(+openAngle);

  //positive mid angle
  p4.x = c.x + r * Math.cos(midAngle);
  p4.y = c.y + r * Math.sin(midAngle);

  //opposite angle
  p5.x = c.x + r * Math.cos(2*QT_CIR_RAD);
  p5.y = c.y + r * Math.sin(2*QT_CIR_RAD);

  //negative mid angle
  p6.x = c.x + r * Math.cos(-midAngle);
  p6.y = c.y + r * Math.sin(-midAngle);

  mask.data.center = c;
  //mask.position = c;
};

const rotateMask = (mask, rotateAngle) => {
  //mask.rotate(-mask.rotation, mask.data.center);
  mask.rotate(RAD_TO_DEG * rotateAngle - mask.rotation, mask.data.center); 
}

const radiateColors = [
  '#ffff',
  '#888f',
  '#444f',
  '#222f',
  '#000f',
  '#222f',
  '#444f',
  '#888f',
];

class CH01Script {
  constructor() {
    this.segTrigger = new SegmentTrigger({ segmentTimes: songData.segEvents });
    this.kickTrigger = new TimeTrigger({ triggerTimes: songData.kicks });
    this.plinkTrigger = new TimeTrigger({ triggerTimes: songData.plinks });
    
    this.fftArray = new Array(64);

    this.bg = new BackgroundGradient({
       gradientStops: [['#ffff', 0.0], ['#ffff', 0.0], ['#000f', 0.0]],
       blendMode: 'normal',
       radial: true,
    });

    this.qg = new QuantumGravity({
      effectTime: 2 * 60 / songData.bpm,
      strokeWidth: 8,
      scaleFactor: 2.5,
      maxRotateAmount: 1,
      fftOffsetLength: 20,
      animateAlias: 1 / ((songData.bpm * 2) / 60),
    });

    this.radiate = new Radiate({
      effectTime: 8 * 60 / songData.bpm,
      strokeWidth: 1,
      scaleFactor: 1,
      maxRotateAmount: 1,
      blendMode: 'xor',
    });

    this.dots = new Dots({
      number: 64,
      defaultRadius : 80,
      defaultColor: '#ffff',
      fftArray: this.fftArray,
    });

    const fftLineOpts = {
      strokeWidth: 1,
      strokeColor: "#fff",
      fillColor: "#000",
      fftOffsetLength: 10,
      fftArray: this.fftArray,
      symmetrical: true,
      closed: false,
    };
    this.fftLine1 = new FFTLine(fftLineOpts);
    this.fftLine2 = new FFTLine(fftLineOpts);
    this.fftLine3 = new FFTLine(fftLineOpts);
    this.fftLine4 = new FFTLine(fftLineOpts);

    this.fftLine1Length = 5;
    this.fftLine2Length = 5;
    this.fftLine3Length = 5;
    this.fftLine4Length = 5;

    this.particles = new Particles({});
    this.particlesEmitDirection = new Paper.Point(0,1);

    //One of the effects is that each bang will reveal a new effect
    //the effects are masked and need to be animated and aligned into position
    this.gravMaskOffsetAngle = 0;
    this.gravMaskOpenAngle = 0;

    this.gutMaskOffsetAngle = 2*QT_CIR_RAD;
    this.gutMaskOpenAngle = 2*QT_CIR_RAD;
    
    this.nextRadiateColorInd = 0;

    this.beatTime = 60 / songData.bpm;

    this.animations = new PaperAnimations();
  }

  initialize = (project) => {
    this.project = project;
    this.project.activate();

    const view = this.project.view;
    this.width = view.viewSize.width;
    this.height = view.viewSize.height;
    const w = this.width;
    const h = this.height;

    this.bg.initialize(project);
    
    this.qg.initialize(project);
    this.qgMask = this.qg.setMask(createMask(w, h));
    
    this.radiate.initialize(project);
    this.radMask = this.radiate.setMask(createMask(w, h));
    
    this.dots.initialize(project);
    this.dotsMask = this.dots.setMask(createMask(w, h));

    this.fftLine1.initialize(project);
    this.fftLine1.setLine(0, h/2, w, h/2);
    this.fftLine1.setVisible(false);
    this.fftLine2.initialize(project, this.fftLine1.layer);
    this.fftLine2.setVisible(false);
    this.fftLine3.initialize(project, this.fftLine1.layer);
    this.fftLine3.setVisible(false);
    this.fftLine4.initialize(project, this.fftLine1.layer);
    this.fftLine4.setVisible(false);

    this.particles.initialize(project, this.fftLine1.layer);
    this.particles.setEmitting(false);
    this.particles.setEmitPoint(new Paper.Point(w/2, h/2));
    
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
      const w = this.project.view.viewSize.width;
      const h = this.project.view.viewSize.height;

      this.currentSegment = segment;

      const duration = segment.end - currentTime;
    
      /*
      this.bgMask.setMask(new Paper.Shape.Rectangle(new Paper.Point(100,0), new Paper.Size(1000,1000)));
      this.gravMask.setMask(new Paper.Shape.Ellipse(new Paper.Rectangle(new Paper.Point(0,0), new Paper.Size(1000,1000))));
      */

      console.log(segment.name);

      switch(segment.name) {
        case 'start':
          this.bg.setStopOffset(0, 0.0, 1, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.0, 1, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.0, 1, InterpFuncs.linear);
          this.bg.setStopColor(0, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(1, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(2, '#000f', 0, InterpFuncs.linear);
          this.dots.setVisible(false);
          this.particles.setEmitting(false);
          break;
        case 'build1':
          this.bg.setStopOffset(0, 0.1, duration, InterpFuncs.linear);
          this.bg.setStopOffset(1, 0.1, duration, InterpFuncs.linear);
          this.bg.setStopOffset(2, 0.2,  duration, InterpFuncs.linear);
          this.bg.setStopColor(0, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(1, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(2, '#000f', 0, InterpFuncs.linear);
          this.dots.setVisible(false);
          this.particles.setEmitting(false);
          break;
        case 'suck':
          this.bg.setStopOffset(0, 0.0, duration-1, InterpFuncs.cubicIn);
          this.bg.setStopOffset(1, 0.0, duration-1, InterpFuncs.cubicIn);
          this.bg.setStopOffset(2, 0.0,  duration-1, InterpFuncs.cubicIn);
          this.bg.setStopColor(0, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(1, '#ffff', 0, InterpFuncs.linear);
          this.bg.setStopColor(2, '#000f', 0, InterpFuncs.linear);
          this.dots.setVisible(false);
          break;
        case 'bang1':
          this.bg.setStopOffset(0, 0.25, .25, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.5,  5.0, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 1.0,    1, InterpFuncs.cubicOut);
          this.bg.setStopColor(0, '#888f', duration, InterpFuncs.linear);
          this.bg.setStopColor(1, '#888f', duration, InterpFuncs.linear);
          this.bg.setStopColor(2, '#888f', duration, InterpFuncs.linear);
          this.dots.setVisible(false);
          break;
        case 'verse1':
          this.bg.setStopOffset(0, 0.0, 0, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.0, 0, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.0, 0, InterpFuncs.cubicOut);
          this.bg.setStopColor(0, '#444f', duration, InterpFuncs.linear);
          this.bg.setStopColor(1, '#444f', duration, InterpFuncs.linear);
          this.bg.setStopColor(2, '#444f', duration, InterpFuncs.linear);
          this.dots.setVisible(false);
          break;
        case 'build2': 
          this.bg.setStopOffset(0, 0.05, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.1, duration, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 0.2,  duration, InterpFuncs.cubicOut);
          this.bg.setStopColor(0, '#000f', duration, InterpFuncs.linear);
          this.bg.setStopColor(1, '#ffff', duration, InterpFuncs.linear);
          this.bg.setStopColor(2, '#000f', duration, InterpFuncs.linear);

          this.fftLine1.setVisible(true);
          this.fftLine2.setVisible(true);
          this.animations.addAnimation('line-build', (x) => {
            const y = Math.min(1, InterpFuncs.cubicIn(x));
            this.fftLine1Length = 0.25 * y * w;
            this.fftLine2Length = this.fftLine1Length;
          }, {
            duration: duration,
          });

          this.particles.setEmitting(true);
          this.animations.addAnimation('particles', (x) => {
            const y = Math.min(1, InterpFuncs.quadradicIn(x));
            this.particles.setVelocity(100 + 500 * y);
            this.particles.setParticleLength(5 + 80 * y);
          }, {
            duration: duration,
          });
          break;
        case 'bang2':
          this.bg.setStopOffset(0, 0.1, 1, InterpFuncs.cubicOut);
          this.bg.setStopOffset(1, 0.5, 1, InterpFuncs.cubicOut);
          this.bg.setStopOffset(2, 1.0,  1, InterpFuncs.cubicOut);
          this.bg.setStopColor(0, '#ffff', 1, InterpFuncs.linear);
          this.bg.setStopColor(1, '#444', 1, InterpFuncs.linear);
          this.bg.setStopColor(2, '#000f', 1, InterpFuncs.linear);

          this.dots.setVisible(true);
          this.fftLine1.setVisible(true);
          this.fftLine2.setVisible(true);
          this.animations.addAnimation('masks', (x) => {
            const y = Math.min(1, InterpFuncs.cubicOut(x));
            this.gravMaskOpenAngle = y * QT_CIR_RAD;
            this.gutMaskOpenAngle = (2 - y) * QT_CIR_RAD;
            updateMask(this.radMask, w, h, this.gravMaskOpenAngle);
            updateMask(this.qgMask, w, h, this.gravMaskOpenAngle);
            updateMask(this.dotsMask, w, h, this.gutMaskOpenAngle);
          }, {
            duration: 5,
          });
          this.animations.addAnimation('line-build', (x) => {
            const y = Math.min(1, InterpFuncs.cubicOut(x));
            this.fftLine1Length = (0.25 + y * .75) * w;
            this.fftLine2Length = this.fftLine1Length;
          }, {
            duration: 1,
          });
          this.particles.setEmitting(false);
          break;
        case 'verse2':
          this.dots.setVisible(true);
          this.gravMaskOpenAngle = QT_CIR_RAD;
          this.gutMaskOpenAngle = QT_CIR_RAD;
          this.fftLine1Length = 1.5 * w;
          this.fftLine2Length = this.fftLine1Length;
          updateMask(this.radMask, w, h, this.gravMaskOpenAngle);
          updateMask(this.qgMask, w, h, this.gravMaskOpenAngle);
          updateMask(this.dotsMask, w, h, this.gutMaskOpenAngle);
          break;
        default: 
          break;
      }
    } else {
      
    }
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    this.project.activate();

    const w = this.width;
    const h = this.height;

    if(this.fftArray) {
      const fftData = Sounds.getFFTData();
      Utils.fftDataToSmallerArray(fftData, this.fftArray, {freqStart:0, freqEnd: 0.8});
    }

    const globalRotate = QT_CIR_RAD * audioTime * 0.1;

    const newPlinks = this.plinkTrigger.detect(audioTime);
    const newKicks = this.kickTrigger.detect(audioTime);

    newKicks.forEach((p) => this.qg.triggerItem());
    newPlinks.forEach((p) => this.qg.triggerItem());

    this.segTrigger.forCurrentSegment(audioTime, this.animSegments);

    //if(this.currentSegment.name === 'verse1') {
      newKicks.forEach((p) => {
        const color = radiateColors[this.nextRadiateColorInd % radiateColors.length];
        this.nextRadiateColorInd++;

        const sWidth = this.nextRadiateColorInd % 8 === 0 ? 16 : 4;

        this.radiate.triggerItem({
          duration: 8 * this.beatTime, 
          strokeColor: color,
          strokeWidth: sWidth,
        })
      });
    //}

    rotateMask(this.qgMask, globalRotate + this.gravMaskOffsetAngle);
    rotateMask(this.radMask, globalRotate + this.gravMaskOffsetAngle);
    rotateMask(this.dotsMask, globalRotate + this.gutMaskOffsetAngle);
    //rotateMask(this.dotsMask, globalRotate + QT_CIR_RAD);

    const cx = w/2;
    const cy = h/2;
    const l1Angle = globalRotate + this.gravMaskOffsetAngle + this.gravMaskOpenAngle;
    const l1x = this.fftLine1Length * Math.cos(l1Angle);
    const l1y = this.fftLine1Length * Math.sin(l1Angle);
    this.fftLine1.setLine(cx, cy, cx + l1x, cy + l1y);

    const l2Angle = globalRotate + this.gravMaskOffsetAngle - this.gravMaskOpenAngle;
    const l2x = this.fftLine2Length * Math.cos(l2Angle);
    const l2y = this.fftLine2Length * Math.sin(l2Angle);
    this.fftLine2.setLine(cx, cy, cx + l2x, cy + l2y);

    this.particlesEmitDirection.x = Math.cos(l1Angle);
    this.particlesEmitDirection.y = Math.sin(l1Angle);
    this.particles.setEmitDirection(this.particlesEmitDirection);

    this.animations.runAnimations(audioTime, audioDt);

    this.bg.drawFrame(audioTime, audioDt, frameEvent);
    this.qg.drawFrame(audioTime, audioDt, frameEvent);
    this.radiate.drawFrame(audioTime, audioDt, frameEvent);
    this.dots.drawFrame(audioTime, audioDt, frameEvent);
    this.fftLine1.drawFrame(audioTime, audioDt, frameEvent);
    this.fftLine2.drawFrame(audioTime, audioDt, frameEvent);
    this.fftLine3.drawFrame(audioTime, audioDt, frameEvent);
    this.fftLine4.drawFrame(audioTime, audioDt, frameEvent);
    this.particles.drawFrame(audioTime, audioDt, frameEvent);
  };
}

const Chapter_01_viz_script = new CH01Script();
export default Chapter_01_viz_script;
