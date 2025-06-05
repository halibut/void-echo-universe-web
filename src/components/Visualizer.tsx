import { useCallback, useEffect, useRef, useState } from "react";
import State from "../service/State";
import BlendBgVisualizer from "./visualizers/BlendBgVisualizer";
import BarVisualizer from "./visualizers/BarVisualizer";
import ArcVisualizer from "./visualizers/ArcVisualizer";
import NGonVisualizer from "./visualizers/NGonVisualizer";
import { Color, ColorObj } from "../utils/Color";
import SoundService2 from "../service/SoundService2";
import Canvas from "./Canvas";

export interface VisualizerI {
    setOptions(opts:object):void
    doFrame(canvas:any, ctxt:CanvasRenderingContext2D, w:number, h:number):void
}

export type VisualizerType = {
    name: String,
    viz: VisualizerI
}

export type VisualizerOptionsType = {
    numSides?: number,
    primary:ColorObj,
    secondary:ColorObj,
    gradientTimes?:number[],
    heightScale?:number,
    blendMode?: "darken" | "multiply",
}

export const VISUALIZERS = {
    BLEND_BG: {
        name: "blend-bg",
        viz: BlendBgVisualizer,
    },
    BARS: {
        name: "bars",
        viz: BarVisualizer,
    },
    ARCS: {
        name: "arcs",
        viz: ArcVisualizer,
    },
    NGON: {
        name: "ngon",
        viz: NGonVisualizer,
    },
};

const createDefaultOptions = ():VisualizerOptionsType => {
    return {
        primary: Color(255,255,255,0.5),
        secondary: Color(0,0,0,0.5),
    };
};

const getVizInstance = (visType:string, options:VisualizerOptionsType|null) => {
    let opts = options;
    if (!opts) {
        opts = createDefaultOptions();
    }

    let visName = visType;
    if (visType !== "default") {
        if (visType.startsWith("ngon")) {
            visName = "ngon";
            if (visType.length > 5) {
                opts.numSides = +(visType.substring("ngon-".length));
            } else {
                opts.numSides = opts.numSides ? opts.numSides : 2;
            }
        } 
    }

    let viz = Object.keys(VISUALIZERS)
        .map(k => VISUALIZERS[k])
        .find(v => v.name === visName);
    
    if (!viz) {
        console.warn("No vizualizer named: "+visName+" for type: "+visType);
        viz = VISUALIZERS.BLEND_BG;
    }

    viz.viz.setOptions(options);
    return viz.viz;
} 


const Visualizer = () => {
    const [blendMode, setBlendMode] = useState('overlay');
    const [visType, setVisType] = useState(State.getStateValue(State.KEYS.VISUALIZER_TYPE, "default"));

    const soundDataRef = useRef(null);

    const dimensionsRef = useRef({w: 10, h:10});

    const visInstanceRef = useRef(null);
    const optsRef = useRef(createDefaultOptions());
    const visTypeRef = useRef(visType);
    const visDataRef = useRef(null);

    useEffect(() => {
        const stateSub = State.subscribeToStateChanges(({state, value}) => {
            if (state === State.KEYS.VISUALIZER_TYPE) {
                setVisType(value);
                visTypeRef.current = value;

                if (value === "none") {
                    visInstanceRef.current = null;
                } else {
                    visTypeRef.current = value;
                    setVisType(value);

                    if (value === "default" && visDataRef.current) {
                        visInstanceRef.current = getVizInstance(visDataRef.current.viz.name, optsRef.current);
                    } else {
                        visInstanceRef.current = getVizInstance(value, optsRef.current);
                    }
                }
                
            }
        });
    
        return () => {
            stateSub.unsubscribe();
        }
    }, []);

    useEffect(() => {
        //Whenever the sound starts playing, check to see if it's new, and then
        //set up time-based visualizer events.
        const soundEventSub = SoundService2.subscribeEvents((evt) => {
            switch(evt.event) {
                case SoundService2.EVENTS.PLAYING: 
                    const soundData = SoundService2.getSoundData();
                    if (soundDataRef.current !== soundData) {
                        soundDataRef.current = soundData;

                        if (soundData) {
                            if (soundData.visualizer) {
                                //If the sound has visualizer data associated, then register it
                                soundData.visualizer.forEach(v => {
                                    SoundService2.registerTimeEvent(v.time, () => setVisualizer(v), true, true);
                                });
                            } else {
                                //Otherwise, set up a default visualizer
                                SoundService2.registerTimeEvent(0, () => setVisualizer({
                                    viz: VISUALIZERS.BLEND_BG,
                                    options: createDefaultOptions(),
                                }), true, true);
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        });

        return () => {
            soundEventSub.unsubscribe();
        }
    }, []);

    const setVisualizer = (visData) => {
        visDataRef.current = visData;

        if (visData.options?.blendMode) {
            setBlendMode(visData.options.blendMode);
        } else {
            setBlendMode("overlay");
        }

        optsRef.current = visData.options;
        
        if (visTypeRef.current === "none") {
            //do nothing
        } else {
            if (visTypeRef.current === "default") {
                visInstanceRef.current = getVizInstance(visData.viz.name, visData.options);
            }
            else {
                visInstanceRef.current = getVizInstance(visTypeRef.current, visData.options);
            }
        }
    }

    const doFrame = (canvas, context) => {
        const {w, h} = dimensionsRef.current;
        if (canvas.width !== w) {
            canvas.width = w;
        }
        if (canvas.height !== h) {
            canvas.height = h;
        }

        context.resetTransform();

        if (visInstanceRef.current) {
            visInstanceRef.current.doFrame(canvas, context, w, h);
        } 
    }

    const resizeCanvas = useCallback((w,h) => {
        dimensionsRef.current.w = Math.floor(w);
        dimensionsRef.current.h = Math.floor(h);
    }, []);
    
    if (visType === "none") {
        return null;
    } else {
        return (
            <div key="vis-container" style={{position: 'absolute', top:0, left:0, width:"100%", height:"100%"}}>
                <Canvas key={"c"} drawFrame={doFrame} onResize={resizeCanvas} style={{mixBlendMode: blendMode}}/>
            </div>
        )
    }

};


export default Visualizer;