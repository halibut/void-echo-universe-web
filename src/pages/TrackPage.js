import { useCallback, useEffect, useRef, useState} from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";
import Utils from "../utils/Utils";
import SlideShow from "../components/SlideShow";

import SideMenu from "../components/SideMenu";

import { IoIosPlay, IoIosSkipForward, IoIosSkipBackward, IoIosPause } from "react-icons/io";

import { setLocation } from "../contexts/location-context";
import { VisualizerService } from "../components/Visualizer";

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
    const [zenMode, setZenMode] = useState(State.getStateValue(State.KEYS.ZEN_MODE, false));
    const [showNotes, setShowNotes] = useState(State.getStateValue(State.KEYS.SHOW_NOTES, true));
    const [showControls, setShowControls] = useState(false);
    const [showImageAttribution, setShowImageAttribution] = useState(State.getStateValue(State.KEYS.SHOW_IMAGE_ATTRIBUTION, false));
    const [paused, setPaused] = useState(SoundService.isPaused() || SoundService.isSuspended());
    const [fadingControls, setFadingControls] = useState(false);

    const [imageMetadata, setImageMetadata] = useState(null);

    const controlsTimeoutRef = useRef(null);
    const fadeoutControlsRef = useRef(null);
    const nextTrackTimeoutRef = useRef(null);

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

    useEffect(() => {
        //Play the song for this track
        State.setStateValue(State.KEYS.CURRENT_TRACK, songData.trackNumber);
        //console.log("Setting sound: " + JSON.stringify(songData.title));
        SoundService.setSound(songData.songSources, {
            play:true,
            fadeOutBeforePlay: 2,
            loop: State.getStateValue(State.KEYS.REPEAT_MODE, "none") === "track",
        });

        VisualizerService.setVisualizer("bars", {});

        const soundEventSub = SoundService.subscribeEvents((e) => {
            switch (e.event) {
                case SoundService.EVENTS.WARN_30_SECONDS_REMAINING: {
                        //Start loading the next track if we get near the end of this one
                        const repeatMode = State.getStateValue(State.KEYS.REPEAT_MODE, "none");
                        if (repeatMode !== "track") {
                            const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                            if (nextSong) {
                                SoundService.queueSound(nextSong.songSources, {play: true});
                            }
                        }
                    }
                    break;
                case SoundService.EVENTS.WARN_1_SECOND_REMAINING: {
                        //Set short timeout to play the next track if we get to the end of this one
                        const repeatMode = State.getStateValue(State.KEYS.REPEAT_MODE, "none");
                        if (repeatMode !== "track") {
                            const time = Math.floor(Math.min(1, Math.max(e.timeRemaining, 0)) * 1000);
                            nextTrackTimeoutRef.current = window.setTimeout(() => {
                                const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                                if (nextSong) {
                                    SoundService.setSound(nextSong.songSources, {play: true});
                                    nextTrackTimeoutRef.current = null;
                                }
                                goToNext();
                            }, time);
                        }
                    }
                    break;
                case SoundService.EVENTS.PLAYING: 
                    setPaused(false);
                    break;
                case SoundService.EVENTS.PAUSED:
                    setPaused(true);
                    if (controlsTimeoutRef.current) {
                        window.clearTimeout(controlsTimeoutRef.current);
                        controlsTimeoutRef.current = null;
                    }
                    setShowControls(true);
                    break;
                default:
            }
        });

        return () => {
            soundEventSub.unsubscribe();

            if (nextTrackTimeoutRef.current) {
                window.clearTimeout(nextTrackTimeoutRef.current);
                nextTrackTimeoutRef.current = null;
            }
        }
    }, [songData, goToNext]);

    useEffect(() => {
        const stateSub = State.subscribeToStateChanges((stateEvent) => {
            switch (stateEvent.state) {
                case State.KEYS.SHOW_NOTES:
                    setShowNotes(stateEvent.value);
                    break;
                case State.KEYS.ZEN_MODE:
                    setZenMode(stateEvent.value);
                    break; 
                case State.KEYS.SHOW_IMAGE_ATTRIBUTION:
                    setShowImageAttribution(stateEvent.value);
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
                State.setStateValue(State.KEYS.AUDIO_CONTROLS_EXPANDED, false);
            }, 250);
        };

        if (time > 0) {
            controlsTimeoutRef.current = window.setTimeout(hideControlsFunc, time);
        } else {
            hideControlsFunc();
        }

    }, []);

    const togglePause = useCallback((e) => {
        if (e) {
            e.stopPropagation();
        }

        if (SoundService.isSuspended()) {
            SoundService.tryResume();
            SoundService.play();
            startHidingControls(0);
            return;
        }

        if (SoundService.isPaused()) {
            SoundService.play();
        } else {
            SoundService.pause();
        }
    }, [startHidingControls]);

    const toggleControls = useCallback((e) => {
        e.stopPropagation();
        if (!showControls) {
            State.setStateValue(State.KEYS.AUDIO_CONTROLS_EXPANDED, true)
            setShowControls(true);
            startHidingControls(10000);
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

    let imageAttribution = null;
    if (showImageAttribution && imageMetadata && !zenMode) {
        imageAttribution = (
            <div className="image-attribution">
                <p>{imageMetadata["AVAIL:Description"]}</p>
            </div>
        )
    }

    return (
        <div className='center' style={{flex:1, width:'100%', paddingBottom:50, position:'relative'}}>
            { !isLoadingOut && (
                <SlideShow key={songData.title} songData={songData} onLoadImageMetadata={showImageAttribution ? setImageMetadata : undefined} />
            )}

            <div className="col" style={{position:"absolute", left:0, top:0, width:"100%", height:"100%", cursor:"pointer"}} onClick={toggleControls} ></div>

            {songText}

            {imageAttribution}

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