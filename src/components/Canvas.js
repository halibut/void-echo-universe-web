import { useRef, useEffect } from "react";

const Canvas = ({className, style, drawFrame, onResize}) => {
  const canvasRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  const animRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        drawFrame(canvas);
      }
      animRef.current = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [drawFrame]);

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

      if(resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [onResize]);

  const canvasStyle = style ? style : {};

  if (canvasStyle.width === undefined) {
    canvasStyle.width = "100%";
    canvasStyle.height = "100%";
  }

  return (
    <div style={{width: '100%', height: '100%', flex:1}}>
      <canvas
        ref={canvasRef}
        resize='true'
        style={canvasStyle}
        className={className ? className : ""}
      />
    </div>
  );
};

export default Canvas;
