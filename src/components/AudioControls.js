import { useState, useEffect, useRef, useCallback } from "react";

import {
  IoVolumeMute,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
} from "react-icons/io5";

import SoundService from "../service/SoundService";
import Utils from "../utils/Utils";
import State from "../service/State";

const VolumeControl = ({uiExpanded}) => {
  const [muted, setMuted] = useState(SoundService.isMuted());
  const [vol, setVol] = useState(SoundService.getVolume());
  const [expanded, setExpanded] = useState(false);

  const onHover = (e) => {
    setExpanded(true);
  };

  const onUnHover = (e) => {
    setExpanded(false);
  };

  const onChangeVol = (e) => {
    const newVol = e.target.value * 0.01;

    SoundService.setVolume(newVol);
    setVol(newVol);
    if (muted) {
      SoundService.setMuted(false);
      setMuted(false);
    }
  };

  const onToggleMute = (e) => {
    e.preventDefault();

    const newVal = !muted;
    SoundService.setMuted(newVal);
    setMuted(newVal);
  };

  let elm = <IoVolumeMute />;
  if (muted) {
    elm = <IoVolumeMute />;
  } else if (vol >= 0.6) {
    elm = <IoVolumeHigh />;
  } else if (vol >= 0.3) {
    elm = <IoVolumeMedium />;
  } else if (vol > 0) {
    elm = <IoVolumeLow />;
  }

  let volKnob = null;
  if ((uiExpanded || expanded) && !muted) {
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

const PositionControl = ({uiExpanded}) => {
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(0);
  const [hoverTime, setHoverTime] = useState(null);
  const updateRef = useRef(null);

  useEffect(() => {
    const soundEventSub = SoundService.subscribeEvents((e) => {
      switch(e.event) {
        case SoundService.EVENTS.PLAYING:
          setPos(SoundService.getCurrentTime());
          break;
        case SoundService.EVENTS.SEEKED:
          setPos(SoundService.getCurrentTime());
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
      setPos(SoundService.getCurrentTime());
    }, 100);

    return () => {
      if (updateRef.current) {
        window.clearInterval(updateRef.current);
      }
    };
  }, []);

  const onEnter = useCallback((e) => {
    setExpanded(true);
  }, []);

  const onLeave = useCallback((e) => {
    setExpanded(false);
    setHoverTime(null);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;
    const secs = Math.floor(SoundService.getDuration() * ratio);

    setHoverTime({
      time: Utils.formatSeconds(secs),
      x: xPos,
      w: divWidth,
    });
  }, []);

  const handleSeekChange = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;

    SoundService.seekTo(SoundService.getDuration() * ratio);
  }, []);

  if (pos < 0) {
    return null;
  } else {
    const duration = SoundService.getDuration();

    let hoverTimeText = null;
    let posTimeText = null;
    if (expanded || uiExpanded) {
      if (pos !== null) {
        const songPercent = pos / duration;

        const tStyle={
          backgroundColor: "transparent",
          fontSize: 20,
          position: "absolute",
        }

        if (songPercent < .2) {
          tStyle.color = "#000";
          tStyle.left = "100%";
          tStyle.paddingLeft = 5;
        } else {
          tStyle.color = "#333";
          tStyle.right = "0%";
          tStyle.paddingRight = 5;
        }
        posTimeText = <span style={tStyle}>{Utils.formatSeconds(pos)}</span>;
      }
      if (hoverTime) {
        const tStyle = {
          position: "absolute",
          backgroundColor: "#0008",
          borderRadius: 3,
          padding:2,
          paddingLeft: 5,
          paddingRight: 5,
          color: "#fff",
          fontSize: 20,
          bottom: 0,
        };

        const toRightDist = hoverTime.w - hoverTime.x;
        if (hoverTime.x < 100) {
          tStyle.left = hoverTime.x + 5;
        } else {
          tStyle.right = toRightDist + 5;
        }

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

  const expandControls = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setExpanded(true);
  }, []);

  const shrinkControls = useCallback((e) => {
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
