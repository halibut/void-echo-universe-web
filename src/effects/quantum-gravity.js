import Paper from "paper";
import { Point } from "paper/dist/paper-core";
import PaperUtils from "../utils/PaperUtils";
import Sounds from "../utils/Sounds";
import Utils from "../utils/Utils";

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
    
  }

  initialize = (project) => {
    this.project = project;

    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    if (!this.layer) {
      this.layer = new Paper.Layer();
      this.layer.blendMode = "xor";
    }
    this.layer.activate();

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
      };

      this.itemSymbol = new Paper.SymbolDefinition(path);

      this.fftData = new Array(CIRCLE_POINTS);

      //console.log("Symbol segments: ");
      //console.log(JSON.stringify(this.itemSymbol.item.segments));
    }

    if (!this.inactiveItems) {
      this.inactiveItems = [];
      this.activeItems = [];
      for (let i = 0; i < 20; i++) {
        this.inactiveItems.push(new Paper.SymbolItem(this.itemSymbol));
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
    if (this.layer) {
      this.layer.visible = vis;
    }
  };

  setMask = (mask) => {
    const g = this.layer;
    //console.log("MASK:");
    //console.log(JSON.stringify(mask));
    //console.log("FIRST CHILD:");
    //console.log(JSON.stringify(g.firstChild));
    //console.log("THIS.MASK:");
    //console.log(JSON.stringify(this.mask));
    if(this.layer.firstChild === mask) {
      //do nothing, the mask is already the first child 
    } else {
      if(this.mask && this.layer.children.length > 0) {
        this.layer.firstChild.remove();
      }
      
      if (mask) {
        if (this.layer.children.length === 0) {
          this.layer.addChild(mask);
        }
        else {
          this.layer.insertChild(0, mask);
        }
      } 
    }

    this.mask = mask;
    this.layer.clipped = !!this.mask;
    return this.mask;
  }

  triggerItem = () => {
    this.layer.activate();

    let item = null;
    if (this.inactiveItems.length === 0) {
      item = new Paper.SymbolItem(this.itemSymbol);
    } else {
      item = this.inactiveItems[0];
      this.inactiveItems = this.inactiveItems.slice(
        1,
        this.inactiveItems.length
      );
    }

    this.activeItems.push(item);
    this.layer.addChild(item);

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
      let fftOffset = (this.fftData[i] / 255) * this.fftOffsetLength;
      if(i === 0) {
        fftOffset += ((this.fftData[1] + this.fftData[CIRCLE_POINTS-1]) / 510) * this.fftOffsetLength;
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
