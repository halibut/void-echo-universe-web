import Paper from "paper";
import Sounds from "../utils/Sounds";
import Utils from "../utils/Utils";

const LINE_POINTS = 64;

export default class FFTLine {
  constructor(options) {
    this.symmetrical = options.symmetrical === true;
    this.closed = options.closed === true;
    this.strokeWidth = options.strokeWidth ? options.strokeWidth : 1;
    this.strokeColor = options.strokeColor ? options.strokeColor : "#fff";
    this.fillColor = options.fillColor ? options.fillColor : null;
    this.blendMode = options.blendMode ? options.blendMode : "normal";
    this.fftOffsetLength = options.fftOffsetLength
      ? options.fftOffsetLength
      : 20;
    this.fftArray = options.fftArray
      ? options.fftArray
      : new Array(LINE_POINTS);
    this.useExternalFFTArray = !!options.fftArray;
  }

  initialize = (project, layer) => {
    this.project = project;

    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    if (!this.layer) {
      if (layer) {
        this.externalLayer = true;
        this.layer = layer;
      } else {
        this.externalLayer = false;
        this.layer = new Paper.Layer();
        this.layer.blendMode = this.blendMode;
      }
    }
    this.layer.activate();

    if (!this.line) {
      this.from = [0, h / 2];
      this.to = [w, h / 2];
      this.dist = w;
      this.dir = [1, 0];

      this.tangentVector = [0, 1];
      const points = [];
      for (let i = 0; i < this.fftArray.length; i++) {
        points.push(new Paper.Point(i * this.segmentLength, 0));
      }

      if(this.symmetrical) {
        for (let i = 0; i < this.fftArray.length; i++) {
          points.push(new Paper.Point((this.fftArray.length-i-1) * this.segmentLength, 0))
        }
      }

      this.line = new Paper.Path(points);
      this.line.style.strokeWidth = this.strokeWidth;
      this.line.style.strokeColor = this.strokeColor;
      if(this.fillColor) {
        this.line.style.fillColor = this.fillColor;
      }

      this.line.closed = this.closed;

      this.setLine(0, h / 2, w, h / 2);
    }
  };

  setVisible = (vis) => {
    this.line.visible = vis;
  };

  setLine(x1, y1, x2, y2) {
    this.from[0] = x1;
    this.from[1] = y1;
    this.to[0] = x2;
    this.to[1] = y2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    this.dist = Math.sqrt(dx * dx + dy * dy);
    if(this.dist === 0) {
      this.dist = 1;
    }
    this.dir[0] = dx / this.dist;
    this.dir[1] = dy / this.dist;
  }

  drawFrame = (audioTime, audioDt, frameEvent) => {
    if (!this.useExternalFFTArray) {
      const fftData = Sounds.getFFTData();

      Utils.fftDataToSmallerArray(fftData, this.fftArray);
    }

    const segments = this.fftArray.length;

    const segLength = this.dist / segments;

    const dx = this.dir[0];
    const dy = this.dir[1];
    const vx = -dy;
    const vy = dx;

    const segs = this.line.segments;

    let lPointX = this.from[0];
    let lPointY = this.from[1];
    let i = 0;
    while (i < segments) {
      const binVal = (this.fftArray[i] / 255) * this.fftOffsetLength;
      const tanX = vx * binVal;
      const tanY = vy * binVal;

      const p = segs[i].point;

      p.x = lPointX + tanX;
      p.y = lPointY + tanY;

      if(this.symmetrical) {
        const j = segments * 2 - i - 1;
        const sp = segs[j].point;
        sp.x = lPointX - tanX;
        sp.y = lPointY - tanY;
      }

      lPointX = lPointX + segLength * dx;
      lPointY = lPointY + segLength * dy;

      i++;
    }
  };
}
