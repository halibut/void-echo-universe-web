import {
  useState,
  useRef,
  useContext,
  useCallback,
  useEffect,
  createContext,
} from "react";

import { setLocation } from "../contexts/location-context";
import LocationContext from "../contexts/location-context";
import { setBackgroundImage } from "../service/BackgroundService";
import Background from "../components/Background";
import SoundService from "../service/SoundService";
import Sound from "./Sound";
import AudioControls from "./AudioControls";


export const NavigationContext = createContext(null);


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
    additionalClass = "zoom-in-in";
    additionalStyle = {
      animationDuration: `${animOptions.time}ms`,
    };
  }
  if (isLoadingOut) {
    additionalClass = "zoom-in-out";
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

const Navigator = ({ screens, NotFoundPage }) => {
  const [stateInd, setStateInd] = useState(0);

  const screenIndRef = useRef(0);
  const loadingScreenIndRef = useRef(null);
  const navAnimTimeout = useRef(null);
  const animOptions = useRef(null);

  const location = useContext(LocationContext);

  const endTransition = useCallback(
    (newPath) => {
      screenIndRef.current = loadingScreenIndRef.current;
      loadingScreenIndRef.current = null;
      animOptions.current = null;

      if (screenIndRef.current >= 0 && screenIndRef.current < screens.length) {
        const newScreen = screens[screenIndRef.current];
        const newPath = newScreen.path;
        setLocation(newPath, newScreen.title);
      } else {
        setLocation(newPath);
      }

      setStateInd((s) => s + 1);
    },
    [screens]
  );

  const killTransition = useCallback(
    (p) => {
      //Handle the scenario where the page is already transitioning
      //In that case kill the transition
      if (loadingScreenIndRef.current !== null) {
        if (navAnimTimeout.current) {
          window.clearTimeout(navAnimTimeout.current);
          navAnimTimeout.current = null;
        }
        endTransition(p);
      }
    },
    [endTransition]
  );

  const startTransition = useCallback(
    (p, options) => {
      const ind = screens.findIndex((s) => s.path === p);

      if (ind === screenIndRef.current) {
        if (ind >= 0) {
          console.log(`Navigating to same screen: ${screens[ind].path}`);
        }
        return;
      }

      const opts = { ...DEFAULT_OPTS, ...options };

      //Set the index of the next screen
      loadingScreenIndRef.current = ind;
      //If there's no transition time, then just update the indices
      if (!opts || !opts.time || opts.time <= 0 || ind < 0) {
        endTransition(p);
      } else {
        animOptions.current = opts;

        navAnimTimeout.current = window.setTimeout(() => {
          navAnimTimeout.current = null;
          endTransition(p);
        }, opts.time);
      }

      //Update some state so the component rerenders
      setStateInd((s) => s + 1);
    },
    [screens, endTransition]
  );

  const navTo = useCallback(
    (p, options) => {
      killTransition(p);
      startTransition(p, options);
    },
    [killTransition, startTransition]
  );

  useEffect(() => {
    console.log("Got Navigation change: "+JSON.stringify(location));
    const {path, navOptions} = location;
    navTo(path, navOptions ? navOptions : { time: 0 });
  }, [location, navTo]);

  useEffect(() => {
    setBackgroundImage(require("../images/chapter_00_bg.jpg"), {});
  }, []);

  let CurrentComp = null;
  if (screenIndRef.current < 0 || screenIndRef.current > screens.length - 1) {
    CurrentComp = NotFoundPage;
  } else {
    CurrentComp = screens[screenIndRef.current].screen;
  }

  let LoadingComp = null;
  if (
    loadingScreenIndRef.current &&
    loadingScreenIndRef.current > 0 &&
    loadingScreenIndRef.current < screens.length
  ) {
    LoadingComp = screens[loadingScreenIndRef.current].screen;
  }

  const nav = {
    navTo: navTo,
    //next: next,
    //back: back,
    //navToChatper: navToChapter,
    //chapters: chapters.map((c) => c.name)
  };

  return (
    <NavigationContext.Provider value={nav}>
      <div className="main-nav">
        <Background />
        <Sound />

        {LoadingComp && animOptions.current.direction === "in" && (
          <NavScreenContainer
            key={loadingScreenIndRef.current}
            isLoadingIn={true}
            animOptions={animOptions.current}
          >
            <LoadingComp nav={nav} />
          </NavScreenContainer>
        )}
        <NavScreenContainer
          key={screenIndRef.current}
          isLoadingOut={!!LoadingComp}
          animOptions={animOptions.current}
        >
          <CurrentComp nav={nav} fullyLoaded={!LoadingComp} isLoadingOut={!!LoadingComp} animOptions={animOptions.current} />
        </NavScreenContainer>
        {LoadingComp && animOptions.current.direction === "out" && (
          <NavScreenContainer
            key={loadingScreenIndRef.current}
            isLoadingIn={true}
            animOptions={animOptions.current}
          >
            <LoadingComp nav={nav} />
          </NavScreenContainer>
        )}

        <div
          className="row"
          style={{
            height: 50,
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
    </NavigationContext.Provider>
  );
};

export default Navigator;
