import Paper from "paper";
import InterpFuncs from "../utils/InterpFuncs";
import PaperAnimations from "../utils/PaperAnimations";
import PaperUtils from "../utils/PaperUtils";

export default class BackgroundGradient {
  constructor(options) {
    this.gradientStops = options.gradientStops ? options.gradientStops : [['#ffff', 0.5],['#000f', 1]];
    this.blendMode = options.blendMode ? options.blendMode : 'normal';
    this.radial = options.radial !== false;

    this.animations = new PaperAnimations();
  }

  initialize = (project) => {
    this.project = project;

    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    //Set up the black background layer
    if (!this.bgLayer) {
      this.bgLayer = new Paper.Layer();
      this.bgLayer.activate();
      this.bgLayer.blendMode = this.blendMode;
      this.gradBg = new Paper.Path(
        new Paper.Point(0, 0),
        new Paper.Point(w, 0),
        new Paper.Point(w, h),
        new Paper.Point(0, h),
      );

      const rightCenter = this.gradBg.bounds.rightCenter;
      const bottomCenter = this.gradBg.bounds.bottomCenter;
      
      this.gradBg.style = {
        fillColor: {
          gradient: {
            stops: this.gradientStops,
            radial: this.radial,
          },
          origin: this.gradBg.position,
          destination: rightCenter.x < bottomCenter.y ? rightCenter : bottomCenter,
        }
      };
    } else {
      this.gradBg.segments[1].point.x = w;
      this.gradBg.segments[2].point.x = w;
      this.gradBg.segments[2].point.y = h;
      this.gradBg.segments[3].point.y = h;

      this.gradBg.style.fillColor.origin = this.gradBg.position;

      const rightCenter = this.gradBg.bounds.rightCenter;
      const bottomCenter = this.gradBg.bounds.bottomCenter;
      this.gradBg.style.fillColor.destination = rightCenter.x < bottomCenter.y ? rightCenter : bottomCenter;
    }
    
  };

  setVisible = (vis) => {
    if (this.bgLayer && this.itemLayer) {
      this.bgLayer.visible = vis;
    }
  };

  setStopColor = (stopIndex, stopColor, time, interpFunc) => {
    if(time && time > 0) {
      const data = {
        startColor: this.gradBg.style.fillColor.gradient.stops[stopIndex].color,
        endColor: new Paper.Color(stopColor),
      };

      const iFunc = interpFunc ? interpFunc : InterpFuncs.linear;

      const animFunc = (x, data) => {
        const y = Math.min(iFunc(x), 1);
        const newC = PaperUtils.interpColors(data.startColor, data.endColor, y);
        this.gradBg.style.fillColor.gradient.stops[stopIndex].color = newC;
      };

      this.animations.addAnimation(
        `color-${stopIndex}`,
        animFunc, {
          duration: time,
          data: data,
        }
      );
    } else {
      this.gradBg.style.fillColor.gradient.stops[stopIndex].color = stopColor;
    }
  };

  setStopOffset = (stopIndex, offset, time, interpFunc) => {
    if(time && time > 0) {
      const data = {
        startOffset: this.gradBg.style.fillColor.gradient.stops[stopIndex].offset,
        endOffset: offset,
      };

      const iFunc = interpFunc ? interpFunc : InterpFuncs.linear;

      const animFunc = (x, data) => {
        const y = Math.min(iFunc(x), 1);
        const o = data.startOffset + (data.endOffset - data.startOffset) * y;
        this.gradBg.style.fillColor.gradient.stops[stopIndex].offset = o;
      };

      this.animations.addAnimation(
        `offset-${stopIndex}`,
        animFunc, {
          duration: time,
          data: data,
        }
      )
    } else {
      this.gradBg.style.fillColor.gradient.stops[stopIndex].offset = offset;
    }
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    //this.bgLayer.activate();

    this.animations.runAnimations(audioTime, audioDt);
  };
}
