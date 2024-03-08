import Paper from "paper";
import { Group } from "paper/dist/paper-core";
import PaperUtils from "../utils/PaperUtils";

export default class MaskedLayer {
  constructor(options) {
    
  }

  initialize = (project) => {
    this.project = project;

    const view = Paper.view;

    const w = view.viewSize.width;
    const h = view.viewSize.height;
    this.width = w;
    this.height = h;

    //Set up the black background layer
    if (!this.layer) {
      this.layer = new Paper.Layer();
      this.layer.activate();

      this.contentGroup = new Paper.Group({children:[], blendMode: 'source-in'});
      
      this.mask = new Paper.Path(
        new Paper.Point(0, 0),
        new Paper.Point(w, 0),
        new Paper.Point(w, h),
        new Paper.Point(0, h),
      );
      this.mask.style = {
        fillColor: '#000f',
      }

      this.maskedGroup = new Paper.Group({children: [this.mask, this.contentGroup], blendMode: 'source-over'});
    } 
  };

  setVisible = (vis) => {
    if (this.layer && this.layer) {
      this.layer.visible = vis;
    }
  };

  setMask = (shape) => {
    this.layer.activate();
    this.mask.remove();
    this.mask = shape;
    this.mask.style.fillColor = '#000f';
    this.maskedGroup.insertChild(0, this.mask);
  };

  getMask = () => {
    return this.mask;
  };

  getContentGroup = () => {
    return this.contentGroup;
  }
  
}
