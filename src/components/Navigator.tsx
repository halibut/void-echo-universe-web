import {
  useRef,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
  PropsWithChildren,
  FC,
  ReactNode,
} from "react";

import LocationContext from "../contexts/location-context";
import { setDefaultBackground } from "../service/BackgroundService";
import Background from "./Background";
import Sound2 from "./Sound2";
import AudioControls from "./AudioControls";
import Visualizer from "./Visualizer";
import debug, { subscribeDebugMessages } from "./Debug";
import Utils from "../utils/Utils";
import State from "../service/State";
import Constants from "../constants";
import { TrackDataType } from "../service/SongData";

const DEFAULT_OPTS:NavigationAnimOptions = {
  time: 1000,
  direction: "in",
};

export interface CommonScreenProps {
  isLoadingIn:boolean,
  isLoadingOut:boolean,
  animOptions?:NavigationAnimOptions|null,
  fullyLoaded?:boolean,
}

export type NavigationScreen = {
  screen: React.ComponentType<CommonScreenProps>,
  title: string,
  path: string,
  sound?: TrackDataType,
}

type NavigationAnimOptions = {
  transitionInClass?:string,
  time?:number
  transitionOutClass?:string,
  direction?: "in" | "out",
}

interface NavScreenContainerProps extends CommonScreenProps, PropsWithChildren {
}

const NavScreenContainer:FC<NavScreenContainerProps> = ({
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
      animationDuration: `${animOptions? animOptions.time : 0}ms`,
    };
  }
  if (isLoadingOut) {
    if (animOptions?.transitionOutClass) {
      additionalClass = animOptions.transitionOutClass;
    } else {
      additionalClass = "zoom-in-out";
    }
    additionalStyle = {
      animationDuration: `${animOptions? animOptions.time : 0}ms`,
    };
  }

  return (
    <div className={"nav-page " + additionalClass} style={additionalStyle}>
      {children}
    </div>
  );
};

type NavReducerState = {
  screenInd:number|null,
  loadingScreenInd:number|null,
  animOptions:NavigationAnimOptions|null,
}

type NavReducerAction = {
  type: "start-transition" | "end-transition",
  screens?: NavigationScreen[],
  options?: NavigationAnimOptions,
  path?: string,
}

function navReducer(state:NavReducerState, action:NavReducerAction):NavReducerState {
  const {
    screenInd,
    loadingScreenInd,
  } = state;

  if (action.type === "start-transition" && action.screens) {
    const screens = action.screens;
    const options = action.options;
    const path = action.path;
    const newInd = screens.findIndex((s) => s.path === path);

    if (newInd === screenInd) {
      if (newInd >= 0) {
        debug(`Navigating to same screen: ${screens[newInd].path}`);
      }
      return state;
    }

    const opts = { ...DEFAULT_OPTS, ...options };

    if (newInd >= 0) {
      document.title = screens[newInd].title;
    } else {
      document.title = Constants.title + " - Not Found";
    }

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
  else {
    return state;
  }
}

type NavigatorProps = {
  screens: NavigationScreen[],
  NotFoundPage: React.ComponentType<CommonScreenProps>,
}

const Navigator:FC<NavigatorProps> = ({ screens, NotFoundPage }) => {
  const [state, dispatch] = useReducer(navReducer, {screenInd: null, loadingScreenInd: null, animOptions: null});

  const [showDebug, setShowDebug] = useState(State.getStateValue("debug-mode", false));
  const [d, setD] = useState(["debug"]);

  const navAnimTimeout = useRef<number|null>(null);
  
  const location = useContext(LocationContext);

  const killTransition = useCallback(() => {
    if (navAnimTimeout.current) {
      window.clearTimeout(navAnimTimeout.current);
      navAnimTimeout.current = null;
      dispatch({type:"end-transition"});
    }
  },[]);

  const startTransition = useCallback((p:string, options:NavigationAnimOptions|null) => {
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
      debug("Got Navigation change: "+JSON.stringify(location));
      const {path, navOptions} = location;
      killTransition();
      startTransition(path, navOptions);
    }
  }, [location, killTransition, startTransition]);

  useEffect(() => {
    setDefaultBackground(1000);

    const stateSubscription = State.subscribeToStateChanges(evt => {
      if (evt.state === "debug-mode") {
        setShowDebug(evt.value);
      }
    })

    const printSubscription = subscribeDebugMessages(msg => {
      setD(oldD => {
        const newD = oldD.slice();
        newD.unshift(msg);
        newD.splice(20, 20);
        return newD;
      });
    })

    debug("IOS? "+Utils.isIOS());

    return () => {
      stateSubscription.unsubscribe();
      printSubscription.unsubscribe();
    }
  }, []);

  const {
    screenInd,
    loadingScreenInd,
    animOptions
  } = state;

  let CurrentComp:React.ComponentType<CommonScreenProps>|null = null;
  if (screenInd !== null) {
    if (screenInd < 0 || screenInd > screens.length - 1) {
      CurrentComp = NotFoundPage;
    } else {
      CurrentComp = screens[screenInd].screen;
    }
  }

  let LoadingComp:React.ComponentType<CommonScreenProps>|null = null;
  if (loadingScreenInd != null) {
    if (loadingScreenInd < 0 || loadingScreenInd > screens.length - 1) {
      LoadingComp = NotFoundPage;
    }
    else {
      LoadingComp = screens[loadingScreenInd].screen;
    }
  }

  //If a component is loading in then put it first in the stack so it's "underneath" the current component
  const comps:ReactNode[] = [];
  if (LoadingComp && animOptions?.direction === "in") {
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

  if (LoadingComp && animOptions?.direction === "out") {
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
      <Sound2 key="sound" />

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

      { showDebug && (
        <div style={{position:'absolute', top:40, left:0, width:'100%', minHeight:50, minWidth:200, maxWidth:"100%", maxHeight:"35%", backdropFilter:"blur(5px)", backgroundColor:"#0003", color:"#fff", overflowY:"auto"}}>
          <button onClick={() => {State.setStateValue("debug-mode", false)}}>Close Debug Window</button>
          {d.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      )}
      

      {/*<SoundCheck />*/}
    </div>
  );
};

export default Navigator;
