import Paper from "paper";
import InterpFuncs from "../utils/InterpFuncs";
import Sounds from "../utils/Sounds";
import Utils from "../utils/Utils";

export default class Dots {
  constructor(options) {
    this.number = options.number ? options.number : 64;
    this.defaultRadius = options.defaultRadius ? options.defaultRadius : 20;
    this.defaultColor = options.defaultColor ? options.defaultColor : "#fff";
    this.blendMode = options.blendMode ? options.blendMode : "normal";
    this.fftArray = options.fftArray
      ? options.fftArray
      : new Array(this.number);
    this.useExternalFFTArray = !!options.fftArray;
  }

  createDot = (w,h) => {
    const r1 = Math.random();
    const r2 = r1;
    const angle = Math.random() * 2 * Math.PI;

    const x = 0.5 * w + Math.cos(angle) * r2 * 0.5 * w;
    const y = 0.5 * h + Math.sin(angle) * r2 * 0.5 * h;

    const pos = new Paper.Point(x, y);
    //const dot = new Paper.Path.Circle(pos, 1);
    const dot = new Paper.Path([
      new Paper.Point(-1,-1),
      new Paper.Point(1,-1),
      new Paper.Point(1,1),
      new Paper.Point(-1,1),
    ]);

    dot.position = pos;

    const rightCenter = dot.bounds.rightCenter;

    dot.style = {
      fillColor: {
        gradient: {
          stops: [
            [this.defaultColor, 0],
            ["#0000", 0],
          ],
          radial: true,
        },
        origin: pos,
        destination: rightCenter,
      },
    };

    dot.applyMatrix = false;

    dot.scale(this.defaultRadius);

    return dot;
  };

  initialize = (project) => {
    this.project = project;

    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    if (!this.layer) {
      this.layer = new Paper.Layer();
      this.project.addLayer(this.layer);
      this.layer.blendMode = this.blendMode;
    }
    this.layer.activate();

    if (!this.dots) {
      this.fftData = new Array(this.number);
      this.dots = [];

      for (let i = 0; i < this.number; i++) {
        const dot = this.createDot(w,h);

        this.dots.push(dot);

        //this.layer.addChild(dot);
      }

      //this.group = new Paper.Group(this.dots);
      //this.group.applyMatrix = false;
    }
  };

  setVisible = (vis) => {
    if (this.layer) {
      this.layer.visible = vis;
    }
  };

  setMask = (mask) => {
    
    const g = this.layer;
    if(this.mask === mask) {
      //do nothing, the mask is already the first child 
    } else {
      if(this.mask && g.children.length > 0) {
        g.firstChild.remove();
      }
      
      if (mask) {
        g.insertChild(0, mask);
        this.mask = mask;
      } else {
        this.mask = null;
      }
    }

    g.clipped = !!this.mask;
    return this.mask;
  };

  setRadii = (traverseFunc) => {
    this.dots.forEach((dot, index) => {
      dot.scale(1 / dot.scaling);
      dot.scale(traverseFunc(index, this.number));
    });
  };

  setPositions = (traverseFunc) => {
    this.dots.forEach((dot, index) => {
      const newPos = traverseFunc(index, this.number, this.width, this.height);
      dot.position = new Paper.Point(newPos.x, newPos.y);
    });
  };

  setColors = (traverseFunc) => {
    this.dots.forEach((dot, index) => {
      const newColor = traverseFunc(index, this.number);
      dot.style.fillColor.gradient.stops[0].color = newColor;
    });
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    if (this.layer.visible) {
      if (!this.useExternalFFTArray) {
        const fftData = Sounds.getFFTData();
  
        Utils.fftDataToSmallerArray(fftData, this.fftArray);
      }
      
      for (let i = 0; i < this.number; i++) {
        const fftVal = this.fftArray[i] / 255.0;
        const y = InterpFuncs.quadraticOut(fftVal);
        const fftOffset = Math.max(0, Math.min(y, 1));
        const dot = this.dots[i];
        dot.style.fillColor.gradient.stops[0].offset = fftOffset * 0.25;
        dot.style.fillColor.gradient.stops[1].offset = fftOffset;
      }
    }
  };
}
