import Paper from "paper";
import { Point } from "paper/dist/paper-core";
import PaperUtils from "../utils/PaperUtils";
import Sounds from "../utils/Sounds";
import Utils from "../utils/Utils";
import MaskedLayer from "./masked-layer";

const CIRCLE_POINTS = 64;

export default class QuantumGravity {
  constructor(options) {
    this.strokeWidth = options.strokeWidth ? options.strokeWidth: 1;
    this.effectTime = options.effectTime ? options.effectTime : 5;
    this.scaleFactor = options.scaleFactor ? options.scaleFactor : 1;
    this.radius = options.radius ? options.radius : 20;
    this.fftOffsetLength = options.fftOffsetLength ? options.fftOffsetLength : 5;
    this.maxRotateAmount = options.maxRotateAmount ? options.maxRotateAmount : 0;
    this.animateAlias = options.animateAlias ? options.animateAlias : 1 / 8;
    this.animateFrames = this.effectTime / this.animateAlias;
    
    this.maskedLayer = new MaskedLayer();
  }

  initialize = (project) => {
    this.maskedLayer.initialize(project);

    const cg = this.maskedLayer.getContentGroup();
    
    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    if (!this.itemSymbol) {
      const points = [];
      let i = 0;
      while(i < CIRCLE_POINTS) {
        const angle = (i / CIRCLE_POINTS) * 2 * Math.PI;
        points.push(new Point(this.radius * Math.cos(angle), this.radius * Math.sin(angle)));
        i++;
      }

      const path = new Paper.Path(points);
      path.closed = true;
      path.style = {
        strokeColor: "#ffff",
        strokeWidth: this.strokeWidth,
        strokeScaling: true,
        blendMode: 'xor',
      };

      this.itemSymbol = new Paper.SymbolDefinition(path);

      this.fftData = new Array(CIRCLE_POINTS);
    }

    if (!this.inactiveItems) {
      this.inactiveItems = [];
      this.activeItems = [];
      for (let i = 0; i < 20; i++) {
        const symbItem = new Paper.SymbolItem(this.itemSymbol);
        cg.addChild(symbItem);
        this.inactiveItems.push(cg);
      }
    } else {
      this.inactiveItems = this.inactiveItems.concat(this.activeItems);
      this.activeItems = [];
    }
    this.inactiveItems.forEach((ai) => {
      ai.visible = false;
    });
  };

  setVisible = (vis) => {
    this.maskedLayer.setVisible(vis);
  };

  triggerItem = () => {
    let item = null;
    if (this.inactiveItems.length === 0) {
      item = new Paper.SymbolItem(this.itemSymbol);
      this.maskedLayer.getContentGroup().addChild(item);
      item.style.blendMode = 'xor';
    } else {
      item = this.inactiveItems[0];
      this.inactiveItems = this.inactiveItems.slice(
        1,
        this.inactiveItems.length
      );
    }

    this.activeItems.push(item);
    
    item.visible = true;
    item.data.age = 0;
    item.data.startTime = null;
    if(this.maxRotateAmount > 0) {
        item.data.rotateFactor = this.maxRotateAmount * (Math.random() * 2 - 1);
        item.rotate(Math.random() * 360);
    } else {
        item.data.rotateFactor = 0;
    }
    item.position = new Paper.Point(
      Math.random() * this.width,
      Math.random() * this.height
    );
    item.style.strokeColor = "#ffff";
    item.style.strokeWidth = 2;
    if (item.scaling.x) {
      item.scale(1 / item.scaling.x);
    }
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    const deactivate = [];

    const fftData = Sounds.getFFTData();

    Utils.fftDataToSmallerArray(fftData, this.fftData);

    let i = 0;
    const symbItem = this.itemSymbol.item;
    while (i < CIRCLE_POINTS) {
      const angle = (i / CIRCLE_POINTS) * 2 * Math.PI;
      const seg = symbItem.segments[i];
      let fftOffset = (fftData[i] / 255) * this.fftOffsetLength;
      if(i === 0) {
        fftOffset += ((fftData[1] + fftData[CIRCLE_POINTS-1]) / 510) * this.fftOffsetLength;
        fftOffset = fftOffset / 3;
      }
      const r = this.radius + fftOffset;
      seg.point.x = r * Math.cos(angle);
      seg.point.y = r * Math.sin(angle);
      i++;
    }
    

    this.activeItems.forEach((ai, i) => {
      if (ai.data.age === 0 && !ai.data.startTime) {
        ai.data.startTime = audioTime;
      }
      ai.data.age = audioTime - ai.data.startTime;

      const ageRatio = ai.data.age / this.effectTime;
      
      if (ageRatio > 1) {
        deactivate.push(ai);
      } else {
        //const aliasedAge = Math.floor(this.animateFrames * ageRatio) / this.animateFrames;
      
        const easeOutQuad = 1 - (1 - ageRatio) * (1 - ageRatio);
        const aliasedEaseOut = Math.floor(this.animateFrames * easeOutQuad) / this.animationFrames;
        const scale = 1 + easeOutQuad * this.scaleFactor;

        ai.opacity = Math.max(0, 1 - easeOutQuad);
        if (ai.scaling.x) {
          ai.scale(1 / ai.scaling.x);
        }
        ai.scale(scale);
        ai.rotate((1 - easeOutQuad) * ai.data.rotateFactor);
      }
    });

    //manage any items that would have deactivated
    deactivate.forEach((item) => {
      item.visible = false;
      this.activeItems = this.activeItems.filter((ai) => ai !== item);
      this.inactiveItems.push(item);
    });
  };
}
