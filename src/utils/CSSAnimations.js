const CSSAnimations = {
  addZoomInTransitionSlow: (onComplete) => {
    window.setTimeout(() => {
      if(onComplete) {
        onComplete();
      }
    }, 10000);

    return "zoom-in-transition-slow";
  }
}

export default CSSAnimations;