import { useRef, useEffect, useCallback, CSSProperties } from "react";

type CanvasProps = {
  key?:string
  className?:string,
  style?:React.CSSProperties,
  drawFrame: (canvas:any, context:CanvasRenderingContext2D)=>void,
  onResize?: (w:number, h:number)=>void,
}

const Canvas: React.FC<CanvasProps> =  ({
  className,
  style,
  drawFrame,
  onResize
}) => {
  const canvasRef = useRef<{canvas:HTMLCanvasElement|null, context:CanvasRenderingContext2D|null}>({
    canvas: null,
    context: null,
  });
  const resizeTimeoutRef = useRef<number|null>(null);

  const animRef = useRef<number|null>(null);

  useEffect(() => {
    const draw = () => {
      const {canvas, context} = canvasRef.current;
      if (canvas && context) {
        drawFrame(canvas, context);
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

  const setCanvasRef = useCallback((canvasElm:HTMLCanvasElement) => {
    if (canvasElm) {
      canvasRef.current = {
        canvas: canvasElm,
        context: canvasElm.getContext("2d"),
      };
    } else {
      canvasRef.current = {
        canvas: null,
        context: null,
      };
    }
  }, []);

  useEffect(() => {
    const callback = (entries:ResizeObserverEntry[]) => {
      if(!canvasRef.current.canvas) {
        return;
      }

      if(resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = window.setTimeout(() => {
        resizeTimeoutRef.current = null;

        let boxSizeEntry = entries.find(e => e.contentBoxSize);

        if (boxSizeEntry) {
          let h = 0;
          let w = 0;

          if(boxSizeEntry.contentBoxSize[0]) {
            h = boxSizeEntry.contentBoxSize[0].blockSize;
            w = boxSizeEntry.contentBoxSize[0].inlineSize;
          } else {
            const cbs = boxSizeEntry.contentBoxSize as unknown as ResizeObserverSize
            h = cbs.blockSize;
            w = cbs.inlineSize;
          }

          if(onResize) {
            onResize(w,h);
          }
        }
      }, 100);
    }

    const resizeObserver = new ResizeObserver(callback);

    if (canvasRef.current.canvas) {
      resizeObserver.observe(canvasRef.current.canvas);
    }

    return () => {
      resizeObserver.disconnect();

      if(resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [onResize]);

  const canvasStyle = style ? style : {} as CSSProperties;

  if (canvasStyle.width === undefined) {
    canvasStyle.width = "100%";
    canvasStyle.height = "100%";
  }

  return (
    <div style={{width: '100%', height: '100%', flex:1}}>
      <canvas
        ref={setCanvasRef}
        //resize='true'
        style={canvasStyle}
        className={className ? className : ""}
      />
    </div>
  );
};

export default Canvas;
