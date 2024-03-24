import Subscription from "./Subscription";

class VisualizerServiceCls {
    constructor() {
        this.currentVisualizer = null;
        this.visualizerSubscribers = new Subscription("visualizer-data");
    }

    setVisualizer = (name, options) => {
        this.visualizerSubscribers.notifySubscribers({
            name, options
        });
    };

    subscribeToVisualizerChanges = (handler) => {
        return this.visualizerSubscribers.subscribe(handler);
    }
}

const VisualizerService = new VisualizerServiceCls();

export default VisualizerService;

export function setVisualizer(name, options) {
    VisualizerService.setVisualizer(name, options);
}
