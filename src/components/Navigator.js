import {
  useRef,
  useContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";

import LocationContext from "../contexts/location-context";
import { setDefaultBackground } from "../service/BackgroundService";
import Background from "../components/Background";
import Sound from "./Sound";
import AudioControls from "./AudioControls";
import Visualizer from "./Visualizer";

const DEFAULT_OPTS = {
  time: 1000,
  direction: "in",
};

const NavScreenContainer = ({
  isLoadingIn,
  isLoadingOut,
  animOptions,
  children,
}) => {
  let additionalClass = "";
  let additionalStyle = {};

  if (isLoadingIn) {
    if (animOptions?.transitionInClass) {
      additionalClass = animOptions.transitionInClass;
    } else {
      additionalClass = "zoom-in-in";
    }
    additionalStyle = {
      animationDuration: `${animOptions.time}ms`,
    };
  }
  if (isLoadingOut) {
    if (animOptions?.transitionOutClass) {
      additionalClass = animOptions.transitionOutClass;
    } else {
      additionalClass = "zoom-in-out";
    }
    additionalStyle = {
      animationDuration: `${animOptions.time}ms`,
    };
  }

  return (
    <div className={"nav-page " + additionalClass} style={additionalStyle}>
      {children}
    </div>
  );
};

function navReducer(state, action) {
  const {
    screenInd,
    loadingScreenInd,
    animOptions,
  } = state;

  if (action.type === "start-transition") {
    const screens = action.screens;
    const options = action.options;
    const path = action.path;
    const newInd = screens.findIndex((s) => s.path === path);

    if (newInd === screenInd) {
      if (newInd >= 0) {
        console.log(`Navigating to same screen: ${screens[newInd].path}`);
      }
      return state;
    }

    const opts = { ...DEFAULT_OPTS, ...options };

    //If there's no transition time, then just update the indices
    if (!opts || !opts.time || opts.time <= 0 || newInd < 0) {
      return {
        screenInd: newInd,
        loadingScreenInd: null,
        animOptions: null,
      }
    } else {
      return {
        screenInd: screenInd,
        loadingScreenInd: newInd,
        animOptions: opts,
      }
    }
  }
  else if (action.type === "end-transition") {
    if (screenInd !== null && loadingScreenInd !== null) {
      return {
        screenInd: loadingScreenInd,
        loadingScreenInd: null,
        animOptions: null
      }
    }
    else {
      return state;
    }
  }
}

const Navigator = ({ screens, NotFoundPage }) => {
  const [state, dispatch] = useReducer(navReducer, {screenInd: null, loadingScreenInd: null, animOptions: null});

  const navAnimTimeout = useRef(null);
  
  const location = useContext(LocationContext);

  const killTransition = useCallback((p) => {
    if (navAnimTimeout.current) {
      window.clearTimeout(navAnimTimeout.current);
      navAnimTimeout.current = null;
      dispatch({type:"end-transition"});
    }
  },[]);

  const startTransition = useCallback((p, options) => {
    const opts = { ...DEFAULT_OPTS, ...options };

    dispatch({
      type: "start-transition", 
      screens: screens,
      path: p,
      options: opts,
    });

    const transitionTime = opts?.time ? opts.time : 0;

    if (transitionTime <= 0) {
      dispatch({type: "end-transition"});
    } else {
      navAnimTimeout.current = window.setTimeout(() => {
        navAnimTimeout.current = null;
        dispatch({type: "end-transition"});
      }, transitionTime);
    }
  }, [screens]);

  useEffect(() => {
    if (location && location.path !== null) {
      console.log("Got Navigation change: "+JSON.stringify(location));
      const {path, navOptions} = location;
      killTransition(path);
      startTransition(path, navOptions);
    }
  }, [location, killTransition, startTransition]);

  useEffect(() => {
    setDefaultBackground(1000);
  }, []);

  const {
    screenInd,
    loadingScreenInd,
    animOptions
  } = state;

  let CurrentComp = null;
  if (screenInd !== null) {
    if (screenInd < 0 || screenInd > screens.length - 1) {
      CurrentComp = NotFoundPage;
    } else {
      CurrentComp = screens[screenInd].screen;
    }
  }

  let LoadingComp = null;
  if (loadingScreenInd != null) {
    if (loadingScreenInd < 0 || loadingScreenInd > screens.length - 1) {
      LoadingComp = NotFoundPage;
    }
    else {
      LoadingComp = screens[loadingScreenInd].screen;
    }
  }

  //If a component is loading in then put it first in the stack so it's "underneath" the current component
  const comps = [];
  if (LoadingComp && animOptions.direction === "in") {
    comps.push(
      <NavScreenContainer key={loadingScreenInd}
        isLoadingIn={true} 
        isLoadingOut={false}
        fullyLoaded={false}
        animOptions={animOptions}
      >
        <LoadingComp key={loadingScreenInd}
          isLoadingIn={true} 
          isLoadingOut={false}
          fullyLoaded={false}
          animOptions={animOptions}
        />
      </NavScreenContainer>
    );
  }

  //Render the current component 
  if (CurrentComp) {
    comps.push(
      <NavScreenContainer  key={screenInd}
        isLoadingOut={!!LoadingComp}
        isLoadingIn={!!LoadingComp}
        fullyLoaded={!LoadingComp}
        animOptions={animOptions}
      >
        <CurrentComp key={screenInd}
          fullyLoaded={!LoadingComp}
          isLoadingIn={false}
          isLoadingOut={!!LoadingComp}
          animOptions={animOptions} />
      </NavScreenContainer>
    );
  }

  if (LoadingComp && animOptions.direction === "out") {
    comps.push(
      <NavScreenContainer key={loadingScreenInd}
        isLoadingIn={true}
        isLoadingOut={false}
        fullyLoaded={true}
        animOptions={animOptions}
      >
        <LoadingComp key={loadingScreenInd}
          isLoadingIn={true}
          isLoadingOut={false}
          fullyLoaded={true}
          animOptions={animOptions}
        />
      </NavScreenContainer>
    );
  }

  return (
    <div className="main-nav">
      <Background key="bg" />
      <Visualizer key="viz" />
      <Sound key="sound" />

      {comps}

      <div
        className="row"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          zIndex: 3,
        }}
      >
        <AudioControls />
      </div>

      {/*<SoundCheck />*/}
    </div>
  );
};

export default Navigator;
