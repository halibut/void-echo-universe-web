import { useEffect, useState } from "react";
import State from "../service/State";
import BlendBgVisualizer from "./visualizers/BlendBgVisualizer";
import BarVisualizer from "./visualizers/BarVisualizer";
import ArcVisualizer from "./visualizers/ArcVisualizer copy";


const createVizComponent = (name, options) => {
    switch (name) {
        case "blend":
            return <BlendBgVisualizer options />;
        case "bars":
            return <BarVisualizer options />;
        case "arc":
            return <ArcVisualizer options />;
        default:
            return <ArcVisualizer options />;
    }
} 


const Visualizer = () => {
    const [enabled, setEnabled] = useState(State.getStateValue("show-visual"));
    const [visName, setVisName] = useState(State.getStateValue("visualizer"));

    useEffect(() => {
        const stateSub = State.subscribeToStateChanges(({state, value}) => {
            if (state === "show-visual") {
                setEnabled(value);
            } else if (state === "visualizer") {
                setVisName(value);
            }
        });

        return () => {
            stateSub.unsubscribe();
        }
    }, []);
    
    if (!enabled) {
        return null;
    } else {
        return (
            <div key="vis-container" style={{position: 'absolute', top:0, left:0, width:"100%", height:"100%"}}>
                {createVizComponent(visName)}
            </div>
        )
    }

};


export default Visualizer;