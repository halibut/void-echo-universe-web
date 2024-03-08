import { useState, useRef, useEffect } from "react";
import Paper from "paper";

const PaperCanvas = ({ drawFrame, onInitialized, onResize}) => {
  const canvasRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    Paper.setup(canvas);

    const project = Paper.project;

    if(onInitialized) {
        onInitialized(project);
    }
    
    Paper.view.onFrame = drawFrame;
  }, []);

  useEffect(() => {
    const callback = (entries) => {
      if(!canvasRef.current) {
        return;
      }

      if(resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTimeoutRef.current = null;

        let boxSizeEntry = entries.find(e => e.contentBoxSize);

        if(boxSizeEntry.contentBoxSize[0]) {
          boxSizeEntry = boxSizeEntry.contentBoxSize[0];
        }

        const h = boxSizeEntry.blockSize;
        const w = boxSizeEntry.inlineSize;

        console.log(`resize(${w},${h})`);

        if(onResize) {
          onResize(w,h);
        }
      }, 100);
    }

    const resizeObserver = new ResizeObserver(callback);

    resizeObserver.observe(canvasRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div style={{width: '100%', height: '100%', flex:1}}>
      <canvas
        ref={canvasRef}
        resize='true'
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PaperCanvas;
