import Paper from 'paper';
//import { Layer, Path, Point } from 'paper/dist/paper-core';

import Utils from '../utils/Utils';

class AnalyzerScriptClass {
    constructor () {

    }

    initialize = (project) => {
        this.project = project;
        this.project.activate();
        this.project.clear();

        const view = Paper.view;
       
        const w = view.viewSize.width;
        const h = view.viewSize.height;
        console.log(`(${w}, ${h})`);
        
        this.layer1 = new Paper.Layer();
        this.layer1.blendMode = 'normal';
        
        //this.multBg = new Paper.Path.Rectangle(new Paper.Point(0,0), new Paper.Point(w,h));
        this.multBg = new Paper.Path.Rectangle(new Paper.Point(0,0), new Paper.Point(w,h));
        this.multBg.strokeColor = '#000f';
        this.multBg.fillColor = '#000f';

        
        this.layer2 = new Paper.Layer();
        this.layer2.blendMode = 'xor';

        //this.multBg = new Paper.Path.Rectangle(new Paper.Point(0,0), new Paper.Point(w,h));
        this.obj = new Paper.Path.Rectangle(new Paper.Point(0,0), new Paper.Point(80,80));
        this.obj.strokeColor = '#aaaa';
        this.obj.fillColor = '#0008';

        view.draw();
    };

    resize = (w, h) => {
        this.initialize(this.project);
    };

    drawFrame = (audioTime, audioDt, frameEvent) => {
        this.project.activate();

    };
};

const AnalyzerScript = new AnalyzerScriptClass();
export default AnalyzerScript;