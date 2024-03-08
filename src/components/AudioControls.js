import { useState, useEffect, useRef, useCallback } from "react";

import {
  IoVolumeMute,
  IoVolumeHigh,
  IoVolumeMedium,
  IoVolumeLow,
} from "react-icons/io5";

import SoundService from "../service/SoundService";

const VolumeControl = ({}) => {
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
  if (expanded && !muted) {
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

const PositionControl = ({ sound, onPositionChange}) => {
  const [expanded, setExpanded] = useState(false);
  const [pos, setPos] = useState(0);
  const [time, setTime] = useState(null);
  const updateRef = useRef(null);

  const updatePos = useCallback(() => {
    setPos(sound.currentTime);
  }, [sound]);

  useEffect(() => {
    if (sound) {
      updateRef.current = window.setInterval(updatePos, 100);

      return () => {
        if (updateRef.current) {
          window.clearInterval(updateRef.current);
        }
      };
    }
  }, [sound, updatePos]);

  const onEnter = useCallback((e) => {
    setExpanded(true);
  }, []);

  const onLeave = useCallback((e) => {
    setExpanded(false);
    setTime(null);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;
    const secs = Math.floor(sound.duration * ratio);

    const mins = Math.floor(secs / 60);
    let remainderSecs = secs % 60;

    if (remainderSecs < 10) {
      remainderSecs = "0" + remainderSecs;
    }

    setTime({
      time: "" + mins + ":" + remainderSecs,
      x: xPos,
      w: divWidth,
    });
  }, [sound]);

  const handleSeekChange = useCallback((e) => {
    const divElm = e.currentTarget;
    const divWidth = divElm.offsetWidth;
    const xPos = e.clientX;

    const ratio = xPos / divWidth;

    sound.currentTime = sound.duration * ratio;

    if (onPositionChange) {
      onPositionChange(sound.currentTime);
    }
  }, [sound, onPositionChange]);

  if (!sound) {
    return null;
  } else {
    let timeText = null;
    if (expanded && time) {
      const tStyle = {
        position: "absolute",
        backgroundColor: "#0008",
        borderRadius: 10,
        padding:5,
        color: "#fff",
        fontSize: 20,
      };

      const toRightDist = time.w - time.x;
      if (time.x < 100) {
        tStyle.left = time.x + 5;
      } else {
        tStyle.right = toRightDist + 5;
      }

      timeText = <span style={tStyle}>{time.time}</span>;
    }

    return (
      <div
        className="position-control"
        onClick={handleSeekChange}
        onMouseMove={handleMouseMove}
        onMouseLeave={onLeave}
        onMouseEnter={onEnter}
      >
        <div className="position-background">
          <div
            className="position-indicator"
            style={{ width: `${100 * (pos / sound.duration)}%` }}
          />
        </div>

        {timeText}
      </div>
    );
  }
};

const AudioControls = ({
  onPause,
  onPlay,
  onNext,
  onPrev,
  onPositionChange,
}) => {

  const [sound, setSound] = useState(null);

  useEffect(() => {
    const sub = SoundService.addSoundSubscriber(setSound);

    return () => {
      sub.unsubscribe();
    }
  }, []);

  return (
    <div className="audio-controls">
      <div className="row" style={{ flex: 1, height: "100%", alignItems:'flex-end' }}>
        {sound && <PositionControl sound={sound} onPositionChange={onPositionChange} />}
      </div>
      <VolumeControl />
    </div>
  );
};

export default AudioControls;
