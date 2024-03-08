import { useState, useRef, useEffect } from "react";

import AudioControls from "../../components/AudioControls";
import Sounds from "../../utils/Sounds";
import State from "../../utils/State";

import PaperCanvas from "../../components/paper-canvas";
import VizScript from "./Chapter01Script";
import Images from "../../images/Images";

const Chapter_01_PITV = ({ nav }) => {
  const [bgSound, setBgSound] = useState(null);
  const audioRef = useRef(null);
  const lastAudioTime = useRef(0);

  const imgQuality = State.getImageQuality();

  useEffect(() => {
    Sounds.setVolume(State.getLastVolume());

    return () => {
      //clean up paper resources
      VizScript.deInitialize();
    };
  }, []);

  const playBgMusic = async (e) => {
    console.log("Can play through.");

    if (!bgSound) {
      audioRef.current.loop = false;

      await Sounds.tryResume();

      const sound = Sounds.loadFromAudioElement(audioRef.current);

      setBgSound({ source: sound, audioElm: audioRef.current });

      audioRef.current.play();
    }
  };

  const onInitialized = (project) => {
    VizScript.initialize(project);
  };

  const onResize = (w, h) => {
    VizScript.resize(w, h);
  };

  const onPositionChange = (time) => {
    VizScript.resetTime(time);
  };

  const drawFrame = (frameEvent) => {
    const audioTime = audioRef.current.currentTime;
    const audioDt = audioTime - lastAudioTime.current;

    VizScript.drawFrame(audioTime, audioDt, frameEvent);

    lastAudioTime.current = audioTime;
  };

  return (
    <div
      className={"chapter-root fade-in anim-time-slow"}
      style={{ backgroundColor: "#fff" }}
    >
      <div key="bg" className="bg-image">
        <img
          className="bg-image zoom-bg-slow anim-time-5-min"
          style={{ opacity: 1, zIndex: 1 }}
          src={Images.ch_01_bg[imgQuality]}
        />
      </div>
      <div
        key="main"
        className="center"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      >
        {bgSound && (
          <div style={{ width: "100%", height: "100%" }}>
            <PaperCanvas
              drawFrame={drawFrame}
              onInitialized={onInitialized}
              onResize={onResize}
            />
          </div>
        )}
      </div>

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
        <audio ref={audioRef} onCanPlayThrough={playBgMusic}>
          <source src={require("../../sounds/01-potential-in-the-void.mp3")} />
        </audio>
        {bgSound && <AudioControls sound={bgSound} onPositionChange={onPositionChange}/>}
      </div>
    </div>
  );
};

export default Chapter_01_PITV;
