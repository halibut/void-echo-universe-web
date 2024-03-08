import Paper from "paper";
import { Point } from "paper/dist/paper-core";
import InterpFuncs from "../utils/InterpFuncs";
import PaperAnimations from "../utils/PaperAnimations";

const CIRCLE_POINTS = 12;

export default class Radiate {
  constructor(options) {
    this.strokeWidth = options.strokeWidth ? options.strokeWidth: 2;
    this.effectTime = options.effectTime ? options.effectTime : 1;
    this.scaleFactor = options.scaleFactor ? options.scaleFactor : 1;
    this.radius = options.radius ? options.radius : 1;
    this.maxRotateAmount = options.maxRotateAmount ? options.maxRotateAmount : 0;
    this.blendMode = options.blendMode ? options.blendMode : 'normal';

    this.animations = new PaperAnimations();

    this.itemId = 0;
  }

  createCircle = () => {
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
      //fillColor: '#000f',
      strokeWidth: this.strokeWidth,
      strokeScaling: false,
    };

    path.data.id = this.itemId;
    this.itemId += 1;
  
    path.applyMatrix = false;

    return path;
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
      this.layer.blendMode = this.blendMode;
    }
    this.layer.activate();

    if (!this.inactiveItems) {
      this.inactiveItems = [];
      this.activeItems = [];
      for (let i = 0; i < 20; i++) {
        this.inactiveItems.push(this.createCircle());
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
  };

  _animateItem = (x, data) => {
    const item = data.item;
    const maxScale = data.maxRadius;

    if (x >= 1) {
      item.visible = false;
      this.activeItems = this.activeItems.filter((ai) => ai !== item);
      this.inactiveItems.push(item);
    } else {
      const y = InterpFuncs.quadraticOut(x);
      const invY = Math.max(0, 1 - y);

      const scale = 1 + y * maxScale;

      item.opacity = invY;
      if (item.scaling.x) {
        item.scale(1 / item.scaling.x);
      }
      item.scale(scale);
      item.rotate(invY * item.data.rotateFactor);
    }
  };

  triggerItem = (options) => {
    this.layer.activate();

    let item = null;
    if (this.inactiveItems.length === 0) {
      item = this.createCircle();
    } else {
      item = this.inactiveItems[0];
      this.inactiveItems = this.inactiveItems.slice(
        1,
        this.inactiveItems.length
      );
    }

    this.activeItems.push(item);
    //this.layer.addChild(item);

    item.style.strokeColor = options.strokeColor ? options.strokeColor : item.style.strokeColor;
    item.style.strokeWidth = options.strokeWidth ? options.strokeWidth : item.style.strokeWidth;

    item.visible = true;
    if(this.maxRotateAmount > 0) {
      item.data.rotateFactor = this.maxRotateAmount * (Math.random() * 2 - 1);
      item.rotate(Math.random() * 360);
    } else {
        item.data.rotateFactor = 0;
    }
    item.position = new Paper.Point(
      this.width / 2,
      this.height / 2,
    );
    if (item.scaling.x) {
      item.scale(1 / item.scaling.x);
    }

    this.animations.addAnimation(item.data.id, this._animateItem, {
      data: {
        item: item,
        maxRadius: Math.max(this.width, this.height) * 0.5 * this.scaleFactor,
      },
      duration: options.duration ? options.duration : this.duration
    });
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    this.animations.runAnimations(audioTime, audioDt);
  };
}
