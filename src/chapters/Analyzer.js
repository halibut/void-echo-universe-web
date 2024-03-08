import { useState, useRef, useEffect } from "react";

import Constants from "../constants";

import AudioControls from "../components/AudioControls";
import Sounds from "../utils/Sounds";
import State from "../utils/State";
import TransientDetector from "../utils/TransientDetector";

import CSSAnimations from "../utils/CSSAnimations";

import PaperCanvas from "../components/paper-canvas";
import AnalyzerScript from "./Analyzer_script";

const songs = [
  {
    name: "Potential in the Void",
    ref: require("../sounds/01-potential-in-the-void.mp3"),
  },
];

const Analyzer = ({ nav }) => {
  const [songInd, setSongInd] = useState(-1);
  const [bgSound, setBgSound] = useState(null);
  const audioRef = useRef(null);
  const lastAudioTime = useRef(0);
  const analysisFuncRef = useRef(null);

  useEffect(() => {
    Sounds.setVolume(State.getLastVolume());

    return () => {
      if (analysisFuncRef.current) {
        cancelAnimationFrame(analysisFuncRef.current);
      }
    };
  }, []);

  const chooseSong = (e) => {
    const ind = +e.target.value;
    if (analysisFuncRef.current) {
      cancelAnimationFrame(analysisFuncRef.current);
    }

    setBgSound(null);
    setSongInd(ind);
    lastAudioTime.current = 0;
  };

  const playBgMusic = async (e) => {
    console.log("Can play through.");

    if (!bgSound) {
      audioRef.current.loop = false;

      await Sounds.tryResume();

      const sound = Sounds.loadFromAudioElement(audioRef.current);

      const td = new TransientDetector({
        freqRangeStart: 400,
        freqRangeEnd: 1000,
        triggerEnergy: 0.8,
        minTimeBetweenTransients: 0.25,
      });

      const updateFunc = () => {
        const time = audioRef.current.currentTime;

        const detected = td.detect(time, Sounds.getFFTData());

        if (detected) {
          console.log("boom - " + time);
        }

        analysisFuncRef.current = requestAnimationFrame(updateFunc);
      };

      updateFunc();

      setBgSound({ source: sound, audioElm: audioRef.current });

      audioRef.current.play();
    }
  };

  const onInitialized = (project) => {
    AnalyzerScript.initialize(project);
  };

  const onResize = (w, h) => {
    AnalyzerScript.resize(w, h);
  };

  const drawFrame = (frameEvent) => {
    const audioTime = audioRef.current.currentTime;
    const audioDt = audioTime - lastAudioTime.current;

    AnalyzerScript.drawFrame(audioTime, audioDt, frameEvent);

    lastAudioTime.current = audioTime;
  };

  let controlsSection = null;
  if (bgSound) {
    controlsSection = <div></div>;
  }

  return (
    <div
      className={"chapter-root fade-in anim-time-slow"}
      style={{ backgroundColor: "#000" }}
    >
      <div key="bg" className="bg-image">
        <img
          className="bg-image zoom-bg-slow anim-time-5-min"
          style={{ opacity: 0.3, zIndex: 1 }}
          src={require("../images/chapter_01_bg_1.jpg")}
        />
      </div>
      <div
        key="main"
        style={{
          flex: 1,
          width: "100%",
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1, width: "100%", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: "block",
            }}
          >
            {bgSound && (
              <PaperCanvas
                drawFrame={drawFrame}
                onInitialized={onInitialized}
                onResize={onResize}
              />
            )}
          </div>
        </div>

        <div
          style={{
            height: 200,
            width: "100%",
            borderTopWidth: 1,
            borderStyle: 1,
            borderColor: "#ccc",
            zIndex: 3,
            backgroundColor: "#333",
          }}
        >
          <div style={{ flex: 1 }}>
            <select value={"" + songInd} onChange={chooseSong}>
              <option key="-1" value="-1">
                None
              </option>
              {songs.map((s, ind) => {
                return (
                  <option key={ind} value={"" + ind}>
                    {s.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div
            className="row"
            style={{
              height: 50,
            }}
          >
            {songInd >= 0 && (
              <audio
                key={songInd}
                ref={audioRef}
                onCanPlayThrough={playBgMusic}
              >
                <source src={songs[songInd].ref} />
              </audio>
            )}
            {bgSound && <AudioControls sound={bgSound} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
