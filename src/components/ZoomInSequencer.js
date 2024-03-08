import { useState, useEffect, useRef } from "react";

const ZoomSpeeds = {
  fast: 0.5,
  normal: 1,
  slow: 2,
  "extra-slow": 5,
};

const ZoomInSequencer = ({
  children,
  currentIndex,
  onFinishedTransition,
  zoomSpeed,
  className,
  style,
}) => {
  const [lastInd, setLastInd] = useState(-1);
  const [animating, setAnimating] = useState(false);
  const animRef = useRef(null);

  const components = Array.isArray(children) ? children : [children];

  console.log("Component Index = "+currentIndex+" --- Previous Index = "+lastInd);

  const zoomSecs = ZoomSpeeds[zoomSpeed];
  if (!zoomSecs) {
    throw (
      zoomSpeed +
      " is not a valid zoom speed. Values are = " +
      JSON.stringify(Object.keys(ZoomSpeeds))
    );
  }

  useEffect(() => {
    return () => {
      if (animRef.current) {
        window.clearInterval(animRef.current);
        animRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentIndex === lastInd) {
      return;
    }

    setAnimating(true);

    animRef.current = window.setTimeout(() => {
      animRef.current = null;
      setAnimating(false);
      
      setLastInd(currentIndex);
      
      if (onFinishedTransition) {
        onFinishedTransition();
      }
    }, zoomSecs * 1000);
  }, [currentIndex]);

  const currentCompClass = animating
    ? "zoom-seq-item zoom-in-in anim-time-" + zoomSpeed
    : "zoom-seq-item";

  let currentComp = null;
  if (currentIndex >= 0 && currentIndex < components.length) {
    currentComp = (
      <div key={currentIndex} className={currentCompClass}>
        {components[currentIndex]}
      </div>
    );
  }

  let prevComp = null;

  if (animating) {
    if (lastInd >= 0 && lastInd < components.length) {
      prevComp = (
        <div
          key={lastInd}
          className={"zoom-seq-item zoom-in-out anim-time-" + zoomSpeed}
        >
          {components[lastInd]}
        </div>
      );
    }
  }

  return (
    <div className={className} style={style}>
      {currentComp}
      {prevComp}
    </div>
  );
};

export default ZoomInSequencer;
