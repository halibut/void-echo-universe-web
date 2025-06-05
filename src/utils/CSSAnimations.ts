const CSSAnimations = {
  addZoomInTransitionSlow: (onComplete:()=>void):string => {
    window.setTimeout(() => {
      if(onComplete) {
        onComplete();
      }
    }, 10000);

    return "zoom-in-transition-slow";
  }
}

export default CSSAnimations;