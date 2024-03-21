import { useCallback, useEffect, useRef, useState} from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";
import Utils from "../utils/Utils";
import SlideShow from "../components/SlideShow";

import SideMenu from "../components/SideMenu";

import { IoIosPlay, IoIosSkipForward, IoIosSkipBackward, IoIosPause } from "react-icons/io";

import { setLocation } from "../contexts/location-context";

/**
 * Returns a component that is basically a wrapper around TrackPage, but with the specified songDat.
 * @param {*} songData 
 * @returns 
 */
export function createTrackPage(songData) {
    return ({isLoadingOut, isLoadingIn, fullyLoaded, animOptions}) => {
        return (
            <TrackPage 
                songData={songData}
                isLoadingOut={isLoadingOut}
                animOptions={animOptions}
                fullyLoaded={fullyLoaded}
                isLoadingIn={isLoadingIn}
            />
        );
    }
}

const TrackPage = ({
    songData,
    isLoadingOut,
    animOptions,
    fullyLoaded,
    isLoadingIn,
}) => {
    const [zenMode, setZenMode] = useState(State.getStateValue("zen-mode", false));
    const [showNotes, setShowNotes] = useState(State.getStateValue("show-notes", true));
    const [showControls, setShowControls] = useState(false);
    const [paused, setPaused] = useState(false);
    const [fadingControls, setFadingControls] = useState(false);

    const [sound, setSound] = useState(null);
    const soundRef = useRef(sound);

    const controlsTimeoutRef = useRef(null);
    const fadeoutControlsRef = useRef(null);

    useEffect(() => {
        const audioElm = SoundService.getAudioElement()
        setSound(audioElm);

        const soundSub = SoundService.addSoundSubscriber((s) => {
            setSound(s);
        });

        return () => {
            soundSub.unsubscribe();
            setSound(null);
        }
    }, []);

    useEffect(() => {
        const stateSub = State.subscribeToStateChanges((stateEvent) => {
            switch (stateEvent.state) {
                case "show-notes":
                    setShowNotes(stateEvent.value);
                    break;
                case "zen-mode":
                    setZenMode(stateEvent.value);
                    break; 
                default:
                    break;
            }
        });

        return () => {
            stateSub.unsubscribe();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                window.clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = null;
            }
            if (fadeoutControlsRef.current) {
                window.clearTimeout(fadeoutControlsRef.current);
                fadeoutControlsRef.current = null;
            }
        };
    }, []);

    const startHidingControls = useCallback((time) => {
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = null;
        }

        setFadingControls(false);

        const hideControlsFunc = () => {
            controlsTimeoutRef.current = null;
            setFadingControls(true);
            fadeoutControlsRef.current = window.setTimeout(() => {
                fadeoutControlsRef.current = null;
                setShowControls(false);
                State.setStateValue("audio-controls-expanded", false);
            }, 250);
        };

        if (time > 0) {
            controlsTimeoutRef.current = window.setTimeout(hideControlsFunc, time);
        } else {
            hideControlsFunc();
        }

    }, []);

    const goToPrevious = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const prevURL = Utils.calculatePreviousSongPage(songData, false);
        setLocation(prevURL);
    }, [songData]);

    const goToNext = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const nextURL = Utils.calculateNextSongPage(songData, false);
        setLocation(nextURL);
    }, [songData]);

    const handlePaused = useCallback(() => {
        setPaused(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = null;
        }
        setShowControls(true);
    }, []);

    const handlePlayed = useCallback(() => {
        setPaused(false);
    }, []);

    const handleEnded = useCallback(() => {
        if (State.getStateValue("repeat", "none") === "track") {
            if (soundRef.current) {
                soundRef.current.currentTime = 0;
                soundRef.current.play();
            }
        } else {
            goToNext();
        }
    }, [goToNext]);

    useEffect(() => {
        const oldSound = soundRef.current;
        soundRef.current = sound;

        if (sound !== oldSound) {
            if (oldSound) {
                oldSound.removeEventListener("pause", handlePaused);
                oldSound.removeEventListener("play", handlePlayed);
                oldSound.removeEventListener("ended", handleEnded);
            }

            if (sound) {
                sound.addEventListener("pause", handlePaused);
                sound.addEventListener("play", handlePlayed);
                sound.addEventListener("ended", handleEnded);

                if (sound.paused || SoundService.isSuspended()) {
                    setPaused(true);
                }
            }
        }
    }, [sound, handlePaused, handlePlayed]);
    
    const togglePause = useCallback((e) => {
        e.stopPropagation();
        if (SoundService.isSuspended()) {
            SoundService.tryResume();
            if (sound) {
                sound.play();
                startHidingControls(0);
            }
            return;
        }

        if (sound) {
            if (sound.paused) {
                sound.play();
                startHidingControls(0);
            } else {
                sound.pause();
            }
        }
    }, [sound, startHidingControls]);

    const toggleControls = useCallback((e) => {
        e.stopPropagation();
        if (!showControls) {
            State.setStateValue("audio-controls-expanded", true)
            setShowControls(true);
            startHidingControls(1000000);
        } else {
            startHidingControls(0);
        }
    }, [showControls, startHidingControls]);

    let songText = null;
    if (!zenMode) {
        let albumNotes = null;
        if (showNotes) {
            const paragraphs = songData.notes.split("\n").map((paragraph, ind) => {
                return (
                    <p key={ind}>{paragraph}</p>
                )  
            });

            albumNotes = (
                <div className="album-notes">
                    {paragraphs}
                </div>
            )
        }

        songText = (
            <div className="song-info" style={{}}>
                <h1>{songData.title}</h1>
                {albumNotes}
            </div>
        );
    }

    return (
        <div className='center' style={{flex:1, width:'100%', paddingBottom:50, position:'relative'}}>
            { !isLoadingOut && (
                <SlideShow key={songData.title} songData={songData} />
            )}

            <div className="col" style={{position:"absolute", left:0, top:0, width:"100%", height:"100%", cursor:"pointer"}} onClick={toggleControls} ></div>

            {songText}

            { (showControls) && (
                <div key="controls" className={"track-controls "+ (fadingControls ? "fade-out" : "fade-in")} style={{animationDuration:"250ms"}} onClick={toggleControls}>
                    <div className="row" style={{width: "100%", maxWidth: 800, justifyContent:"space-around"}}>
                        <button type="button" onClick={goToPrevious}>
                            <IoIosSkipBackward style={{width:"1em", height:"1em"}} />
                        </button>
                        <button type="button" onClick={togglePause}>
                            {paused ? (
                                <IoIosPlay style={{width:"2em", height:"2em"}} />
                            ) : (
                                <IoIosPause style={{width:"2em", height:"2em"}} />
                            )}
                        </button>
                        <button type="button" onClick={goToNext}>
                            <IoIosSkipForward style={{width:"1em", height:"1em"}} />
                        </button>
                    </div>
                </div>
            )}

            {fullyLoaded && (
                <SideMenu songData={songData} />
            )}

        </div>
    );
}

export default TrackPage;