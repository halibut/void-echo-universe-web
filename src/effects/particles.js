import Paper from "paper";
import InterpFuncs from "../utils/InterpFuncs";
import PaperAnimations from "../utils/PaperAnimations";
import Sounds from "../utils/Sounds";
import Utils from "../utils/Utils";

const LINE_POINTS = 64;

export default class Particles {
  constructor(options) {
    this.strokeWidth = options.strokeWidth ? options.strokeWidth : 4;
    this.strokeColor = options.strokeColor ? options.strokeColor : "#ffff";
    this.blendMode = options.blendMode ? options.blendMode : "normal";
    this.fftArray = options.fftArray
      ? options.fftArray
      : new Array(LINE_POINTS);
    this.useExternalFFTArray = !!options.fftArray;
    this.velocity = options.velocity ? options.velocity : 400;
    this.particleAge = options.particleAge ? options.particleAge : 1;
    this.particleLength = options.particleLength ? options.particleLength : 40;
    this.drag = options.drag ? options.drag : 100;
    this.emitRate = options.emitRate ? options.emitRate : 30;
    this.emitDt = 1 / this.emitRate;
    this.emitPoint = options.emitPoint ? options.emitPoint : new Paper.Point(0,0);
    this.emitDirection = options.emitDirection ? options.emitDirection : new Paper.Point(0,1);
    this.emitRandomness = options.emitRandomness ? options.emitRandomness : 0.25;

    const xdir = this.emitDirection.x;
    const ydir = this.emitDirection.y;
    const dirLength = Math.sqrt(xdir * xdir + ydir * ydir);
    this.direction = new Paper.Point(xdir / dirLength, ydir / dirLength);
    
    this.animations = new PaperAnimations();
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

    if (!this.activeParticles) {
      this.activeParticles = [];
      this.inactiveParticles = [];

      for(let i = 0; i < 64; i++) {
        const p = new Paper.Path([new Paper.Point(0,0), new Paper.Point(0,1)]);
        p.style.strokeWidth = this.strokeWidth;
        p.style.strokeColor = this.strokeColor;
        p.visible = false;
        p.data.id = i;
        this.inactiveParticles.push(p);
      }

      this.emitting = false;
    }    
  };

  setEmitting = (emit) => {
    this.emitting = emit === true;
    this.lastEmitted = -1;
  };

  setEmitPoint = (p) => {
    this.emitPoint = p;
  };

  setEmitDirection = (dir) => {
    this.emitDirection = dir;
    const xdir = this.emitDirection.x;
    const ydir = this.emitDirection.y;
    const dirLength = Math.sqrt(xdir * xdir + ydir * ydir);
    this.direction = new Paper.Point(xdir / dirLength, ydir / dirLength);
  };

  setEmitRandomness = (rnd) => {
    this.emitRandomness = rnd;
  };

  setVelocity = v => {
    this.velocity = v;
  };

  setParticleLength = l => {
    this.particleLength = l;
  };

  emitParticle = (audiotime) => {
    let p = null;
    //let src = '';
    if (this.inactiveParticles.length > 0) {
      p = this.inactiveParticles.shift();
      //src = 'inactive';
    } else {
      p = this.activeParticles.shift();
      //src = 'active';
    };

    this.activeParticles.push(p);

    const vRatio = 1 - this.emitRandomness;
    p.data.dirX = this.direction.x * vRatio + this.emitRandomness * (-1 + 2 * Math.random());
    p.data.dirY = this.direction.y * vRatio + this.emitRandomness * (-1 + 2 * Math.random());

    p.segments[0].point.x = this.emitPoint.x;
    p.segments[0].point.y = this.emitPoint.y;
    p.segments[1].point.x = this.emitPoint.x + p.data.dirX * this.particleLength;
    p.segments[1].point.y = this.emitPoint.y + p.data.dirY * this.particleLength;

    p.data.lastTime = 0;

    p.data.velocity = this.velocity;

    p.visible = true;

    //console.log("Particle["+src+":"+p.data.id+"] emitted at "+audiotime+" "+p.segments[0].point);

    this.animations.addAnimation(
      p.data.id, 
      this.animateParticle, 
      {
        duration: this.particleAge,
        data: p,
      },
    );

  };

  animateParticle = (age, p) => {
    if(age >= 1) {
      const op = this.activeParticles.shift();
      this.inactiveParticles.push(op);

      op.visible = false;

      //console.log("Particle["+p.data.id+"] deactivated");
    } else {

      const p1 = p.segments[0].point;
      const p2 = p.segments[1].point;
      
      const dt = (age - p.data.lastTime) * this.particleAge;

      p.data.lastTime = age;

      const y = age < .5 ? 0 : InterpFuncs.cubicOut((age-.5)*2);

      p.opacity = 1-y;

      const dx = p.data.dirX * dt * p.data.velocity;
      const dy = p.data.dirY * dt * p.data.velocity;

      p1.x = p1.x + dx;
      p1.y = p1.y + dy;
      p2.x = p2.x + dx;
      p2.y = p2.y + dy;

      p.data.velocity = Math.max(0, p.data.velocity - dt * this.drag);
    }
    
    
  };

  drawFrame = (audioTime, audioDt, frameEvent) => {
    if(this.emitting) {
      if(this.lastEmitted < 0) {
        this.lastEmitted = audioTime - this.emitDt;
        //console.log("Resetting emitting time to: "+this.lastEmitted);
      }

      while(this.lastEmitted < audioTime) {
        this.emitParticle(audioTime);
        this.lastEmitted = this.lastEmitted + this.emitDt;
      }

    }

    this.animations.runAnimations(audioTime, audioDt);
  };
}
