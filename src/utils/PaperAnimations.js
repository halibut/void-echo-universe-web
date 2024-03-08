import Paper from "paper";

import InterpFuncs from "./InterpFuncs";

export default class PaperAnimations {
  constructor() {
    this.animations = [];
  }

  addAnimation = (key, animFunc, options) => {
    this.cancelAnimation(key);
    this.animations.push({
      key,
      animFunc,
      duration: options.duration ? options.duration : 1,
      startedAt: null,
      data: options.data,
    });
  };

  cancelAnimation = (key) => {
    this.animations = this.animations.filter((a) => a.key !== key);
  };

  runAnimations = (globalTime, dt) => {
    const remove = [];
    
    this.animations.forEach((anim) => {
      if (!anim.startedAt) {
        anim.startedAt = globalTime;
      }
      const age = globalTime - anim.startedAt;
      const x = age / anim.duration;

      anim.animFunc(x, anim.data);

      if (x >= 1) {
        remove.push(anim.key);
      }
    });

    remove.forEach((remKey) => this.cancelAnimation(remKey));
  };
}
