import { useState, useEffect, useRef, useCallback, FC, ReactEventHandler, CSSProperties, MouseEventHandler, SyntheticEvent } from "react";

import {
  IoVolumeMute,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
} from "react-icons/io5";

import SoundService2 from "../service/SoundService2";
import Utils from "../utils/Utils";
import State from "../service/State";

type VolumeControlProps = {
  uiExpanded:boolean,
}

const VolumeControl:FC<VolumeControlProps> = ({uiExpanded}) => {
  const [muted, setMuted] = useState(SoundService2.isMuted());
  const [vol, setVol] = useState(SoundService2.getVolume());
  const [expanded, setExpanded] = useState(false);

  const onHover:ReactEventHandler = (e) => {
    setExpanded(true);
  };

  const onUnHover:ReactEventHandler = (e) => {
    setExpanded(false);
  };

  const onChangeVol = (e:React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value) * 0.01;

    SoundService2.setVolume(newVol);
    setVol(newVol);
    if (muted) {
      SoundService2.setMuted(false);
      setMuted(false);
    }
  };

  const onToggleMute:ReactEventHandler = (e) => {
    e.preventDefault();

    const newVal = !muted;
    SoundService2.setMuted(newVal);
    setMuted(newVal);
  };

  let elm = null;
  let volKnob = null;
  if ((uiExpanded || expanded)) {
    elm = <IoVolumeMute />;
    if (muted) {
      elm = <IoVolumeMute />;
    } else if (vol >= 0.6) {
      elm = <IoVolumeHigh />;
    } else if (vol >= 0.3) {
      elm = <IoVolumeMedium />;
    } else if (vol > 0) {
      elm = <IoVolumeLow />;
    }
    if (!muted) {
      volKnob = (
        <div className="volume-knob">
          <input
            type="range"
            className="vertical"
            min="0"
            max="100"
            value={"" + vol * 100}
            onChange={(e) => {
              onChangeVol(e);
            }}
          ></input>
        </div>
      );
    }
  }

  return (
    <div
      className="volume-control"
      onMouseEnter={onHover}
      onMouseLeave={onUnHover}
    >
      <div className="row" style={{ cursor: "pointer" }} onClick={onToggleMute}>
        {elm}
      </div>
      {volKnob}
    </div>
  );
};


type HoverTimeData = {
  time: string,
  x: number,
  w: number,
}

type PositionControlProps = {
  uiExpanded:boolean,
}

const PositionControl:FC<PositionControlProps> = ({uiExpanded}) => {
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(0);
  const [hoverTime, setHoverTime] = useState<HoverTimeData|null>(null);
  const updateRef = useRef<number|null>(null);

  useEffect(() => {
    const soundEventSub = SoundService2.subscribeEvents((e) => {
      switch(e.event) {
        case "playing":
          setPos(SoundService2.getCurrentTime());
          break;
        case "seeked":
          setPos(SoundService2.getCurrentTime());
          break;
        default:
          //nothing
      }
      
    });

    return () => {
      soundEventSub.unsubscribe();
    }
  }, []);

  useEffect(() => {
    updateRef.current = window.setInterval(() => {
      setPos(SoundService2.getCurrentTime());
    }, 100);

    return () => {
      if (updateRef.current) {
        window.clearInterval(updateRef.current);
      }
    };
  }, []);

  const onEnter:ReactEventHandler = useCallback((e) => {
    setExpanded(true);
  }, []);

  const onLeave:ReactEventHandler = useCallback((e) => {
    setExpanded(false);
    setHoverTime(null);
  }, []);

  const handleMouseMove:MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;
    const secs = Math.floor(SoundService2.getDuration() * ratio);

    setHoverTime({
      time: Utils.formatSeconds(secs),
      x: xPos,
      w: divWidth,
    });
  }, []);

  const handleSeekChange:MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;

    SoundService2.seekTo(SoundService2.getDuration() * ratio);
  }, []);

  if (pos < 0) {
    return null;
  } else {
    const duration = SoundService2.getDuration();

    let hoverTimeText = null;
    let posTimeText = null;
    if (expanded || uiExpanded) {
      if (pos !== null) {
        const songPercent = pos / duration;

        const left = songPercent < .2;

        const tStyle={
          backgroundColor: "transparent",
          fontSize: 20,
          position: "absolute",
          color: left ? "#000" : "#333",
          left: left ? "100%" : undefined, 
          paddingLeft: left ? 5 : undefined,
          right: left ? undefined : "0%",
          paddingRight: left ? undefined : 5,
        } as CSSProperties

        posTimeText = <span style={tStyle}>{Utils.formatSeconds(pos)}</span>;
      }
      if (hoverTime) {
        const toRightDist = hoverTime.w - hoverTime.x;
        const left = hoverTime.x < 100;

        const tStyle:CSSProperties = {
          position: "absolute",
          backgroundColor: "#0008",
          borderRadius: 3,
          padding:2,
          paddingLeft: 5,
          paddingRight: 5,
          color: "#fff",
          fontSize: 20,
          bottom: 0,
          left: left ? hoverTime.x + 5 : undefined,
          right: left ? undefined : toRightDist + 5,
        };

        hoverTimeText = <span style={tStyle}>{hoverTime.time}</span>;
      }
    }

    return (
      <div
        className="position-control"
        onMouseDown={handleSeekChange}
        onMouseMove={handleMouseMove}
        onMouseLeave={onLeave}
        onMouseEnter={onEnter}
      >
        <div className="position-background">
          <div
            className="position-indicator"
            style={{ width: `${100 * (pos / duration)}%` }}
          >
            {posTimeText}
          </div>
        </div>

        {hoverTimeText}
      </div>
    );
  }
};

const AudioControls = () => {
  const [expanded, setExpanded] = useState(State.getStateValue("audio-controls-expanded", false));

  useEffect(() => {
    const sub = State.subscribeToStateChanges((e) => {
      if (e.state === "audio-controls-expanded") {
        setExpanded(e.value);
      }
    });

    return () => {
      sub.unsubscribe();
    }
  }, []);

  const expandControls = useCallback((e:SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setExpanded(true);
  }, []);

  const shrinkControls = useCallback((e:SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setExpanded(false);
  }, []);

  return (
    <div className={"audio-controls " + (expanded ? "expanded" : "")} onMouseEnter={expandControls} onMouseLeave={shrinkControls}>
      <div className="row" style={{ flex: 1, height: "100%", alignItems:'flex-end' }}>
        {<PositionControl uiExpanded={expanded} />}
      </div>
      <VolumeControl uiExpanded={expanded} />
    </div>
  );
};

export default AudioControls;
