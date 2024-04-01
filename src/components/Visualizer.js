import { useEffect, useState } from "react";
import State from "../service/State";
import BlendBgVisualizer from "./visualizers/BlendBgVisualizer";
import BarVisualizer from "./visualizers/BarVisualizer";
import ArcVisualizer from "./visualizers/ArcVisualizer";
import Subscription from "../service/Subscription";

class VisualizerServiceCls {
    VISUALIZERS = {
        BLEND_BG: {
            name: "blend-bg",
            component: BlendBgVisualizer,
        },
        BARS: {
            name: "bars",
            component: BarVisualizer,
        },
        ARCS: {
            name: "arcs",
            component: ArcVisualizer,
        },
    };

    constructor() {
        this.subscribers = new Subscription("viz");
        this.currentViz = null;
    }

    setVisualizer = (name, options) => {
        if (name) {
            this.currentViz = {name, options};
        } else {
            this.currentViz = null;
        }

        this.subscribers.notifySubscribers(this.currentViz);
    }

    getVisualizer = () => {
        return this.currentViz;
    }

    subscribeToVisualizerChanges = (handler) => {
        return this.subscribers.subscribe(handler);
    }
}

export const VisualizerService = new VisualizerServiceCls();


const createVizComponent = (name, options) => {
    let viz = Object.keys(VisualizerService.VISUALIZERS)
        .map(k => VisualizerService.VISUALIZERS[k])
        .find(v => v.name === name);
    

    if (!viz) {
        console.warn("No vizualizer named: "+name);
        viz = VisualizerService.VISUALIZERS.BLEND_BG;
    }

    const Comp = viz.component;

    return (
        <Comp key={name} options={options} />
    );
} 


const Visualizer = () => {
    const [enabled, setEnabled] = useState(State.getStateValue(State.KEYS.SHOW_VISUALIZER, true));
    const [vis, setVis] = useState(VisualizerService.getVisualizer());

    useEffect(() => {
        const stateSub = State.subscribeToStateChanges(({state, value}) => {
            if (state === State.KEYS.SHOW_VISUALIZER) {
                setEnabled(value);
            }
        });

        const visSub = VisualizerService.subscribeToVisualizerChanges(setVis);

        return () => {
            stateSub.unsubscribe();

            visSub.unsubscribe();
        }
    }, []);
    
    if (!enabled || !vis) {
        return null;
    } else {
        return (
            <div key="vis-container" style={{position: 'absolute', top:0, left:0, width:"100%", height:"100%"}}>
                {createVizComponent(vis.name, vis.options)}
            </div>
        )
    }

};


export default Visualizer;