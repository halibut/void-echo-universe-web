import { useCallback, useEffect, useRef, useState} from "react";
import SoundService2 from "../service/SoundService2";
import State from "../service/State";
import Utils from "../utils/Utils";
import SlideShow from "../components/SlideShow";

import SideMenu from "../components/SideMenu";

import { IoIosPlay, IoIosSkipForward, IoIosSkipBackward, IoIosPause } from "react-icons/io";
import { MdOutlineRepeat, MdOutlineRepeatOn, MdOutlineRepeatOneOn } from "react-icons/md";


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
    const [paused, setPaused] = useState(SoundService2.isPaused() || SoundService2.isSuspended());
    const [fadingControls, setFadingControls] = useState(false);
    const [repeatMode, setRepeatMode] = useState(State.getStateValue(State.KEYS.REPEAT_MODE));

    const [imageMetadata, setImageMetadata] = useState(null);

    const controlsTimeoutRef = useRef(null);
    const fadeoutControlsRef = useRef(null);
    const nextTrackTimeoutRef = useRef(null);
    const alreadyRegisteredTimeEventsRef = useRef(false);

    const goToPrevious = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const repeatAlbum = State.getStateValue(State.KEYS.REPEAT_MODE, "none") === "album";
        const sd = Utils.findPreviousSongData(songData, repeatAlbum);
        if (sd) {
            SoundService2.touchSound(sd.songSources);
        }
        const prevURL = Utils.calculatePreviousSongPage(songData, repeatAlbum);
        setLocation(prevURL);
    }, [songData]);

    const goToNext = useCallback((e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const repeatAlbum = State.getStateValue(State.KEYS.REPEAT_MODE, "none") === "album";
        const sd = Utils.findNextSongData(songData, repeatAlbum);
        if (sd) {
            SoundService2.touchSound(sd.songSources);
        }
        const nextURL = Utils.calculateNextSongPage(songData, repeatAlbum);
        setLocation(nextURL);
    }, [songData]);

    /**
     * This function is called when the song is ready to be played and sets up time-based events
     * configured for each song.
     */
    const registerTimeEvents = useCallback(() => {
        if (!alreadyRegisteredTimeEventsRef.current) {
            alreadyRegisteredTimeEventsRef.current = true;

            //Register visualizer events if there are any
            if (songData.visualizer) {
                songData.visualizer.forEach(v => {
                    const setVisualizer = () => {
                        VisualizerService.setVisualizer(v.viz.name, v.options);
                    }
                    SoundService2.registerTimeEvent(v.time, setVisualizer, true, true);
                });
            }

            //Slideshow image events are handled within the SlideShow component
            //so we don't need to do anything with the nasaImages here
        }
    }, [songData?.visualizer]);

    useEffect(() => {
        //Play the song for this track
        State.setStateValue(State.KEYS.CURRENT_TRACK, songData.trackNumber);
        //console.log("Setting sound: " + JSON.stringify(songData.title));
        SoundService2.setSound(songData.songSources, {
            play:true,
            fadeOutBeforePlay: 2,
            loop: State.getStateValue(State.KEYS.REPEAT_MODE, "none") === "track",
        });

        //VisualizerService.setVisualizer(VisualizerService.VISUALIZERS.BLEND_BG.name);

        const soundEventSub = SoundService2.subscribeEvents((e) => {
            switch (e.event) {
                case SoundService2.EVENTS.WARN_30_SECONDS_REMAINING: {
                        //Start loading the next track if we get near the end of this one
                        const repeatMode = State.getStateValue(State.KEYS.REPEAT_MODE, "none");
                        if (repeatMode !== "track") {
                            const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                            if (nextSong) {
                                SoundService2.touchSound(nextSong.songSources);
                            }
                        }
                    }
                    break;
                case SoundService2.EVENTS.WARN_1_SECOND_REMAINING: 
                    //On desktop platforms, attempt to queue up the next song so it plays more seamlessly
                    if (!Utils.isIOS()) {
                        const time = Math.floor(Math.min(1000, Math.max(e.timeRemaining, 0) * 1000 - 50));
                        //Set short timeout to play the next track if we get to the end of this one
                        const repeatMode = State.getStateValue(State.KEYS.REPEAT_MODE, "none");
                        if (repeatMode !== "track") {
                            
                            nextTrackTimeoutRef.current = window.setTimeout(() => {
                                const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                                if (nextSong) {
                                    SoundService2.setSound(nextSong.songSources, {play: true});
                                    nextTrackTimeoutRef.current = null;
                                }
                                goToNext();
                            }, time);
                        } else {
                            window.setTimeout(() => {
                                SoundService2.seekTo(0);
                                SoundService2.play();
                                SoundService2.resetTimeEventsToStart();
                            }, time);
                        }
                    }
                    break;
                case SoundService2.EVENTS.ENDED: 
                    //On IOS, we can only start playback of the next song from a user interaction or 
                    //from the "ended" event. This code block is essentially fired within the context
                    //of the "ended" event which allows the next song to play on IOS.
                    if (Utils.isIOS()) {
                        const repeatMode = State.getStateValue(State.KEYS.REPEAT_MODE, "none");
                        if (repeatMode !== "track") {
                            const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                            if (nextSong) {
                                SoundService2.setSound(nextSong.songSources, {play: true});
                                nextTrackTimeoutRef.current = null;
                            }
                            goToNext();
                        } else {
                            SoundService2.seekTo(0);
                            SoundService2.play();
                            SoundService2.resetTimeEventsToStart();
                        }
                    }
                    break;
                case SoundService2.EVENTS.PLAYING: 
                    setPaused(false);
                    break;
                case SoundService2.EVENTS.PAUSED:
                    setPaused(true);
                    if (controlsTimeoutRef.current) {
                        window.clearTimeout(controlsTimeoutRef.current);
                        controlsTimeoutRef.current = null;
                    }
                    setShowControls(true);
                    break;
                case SoundService2.EVENTS.CAN_PLAY_THROUGH:
                    registerTimeEvents();
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
                case State.KEYS.REPEAT_MODE:
                    setRepeatMode(stateEvent.value);
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

        if (SoundService2.isSuspended()) {
            SoundService2.play();
            startHidingControls(0);
            return;
        }

        if (SoundService2.isPaused()) {
            SoundService2.play();
        } else {
            SoundService2.pause();
        }
    }, [startHidingControls]);

    const cycleRepeat = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (repeatMode === "album") {
            State.setStateValue(State.KEYS.REPEAT_MODE, "track");
        } else if ( repeatMode === "track" ) {
            State.setStateValue(State.KEYS.REPEAT_MODE, "none");
        } else {
            State.setStateValue(State.KEYS.REPEAT_MODE, "album");
        }
    }, [repeatMode]);

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

            { (SoundService2.isSuspended() || showControls) && (
                <div key="controls" className={"track-controls "+ (fadingControls ? "fade-out" : "fade-in")} style={{animationDuration:"250ms"}} onClick={toggleControls}>
                    <div className="row" style={{width: "100%", maxWidth: 800, justifyContent:"space-around", margin:20}}>
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
                    <div className="row" style={{width: "100%", maxWidth: 800, justifyContent:"space-around", margin:20}}>
                        <button type="button" onClick={cycleRepeat}>
                            {repeatMode === "album" ? (
                                <MdOutlineRepeatOn style={{width:"1em", height:"1em"}}/>
                            ) : (repeatMode === "track") ? (
                                <MdOutlineRepeatOneOn style={{width:"1em", height:"1em"}}/>
                            ) : (
                                <MdOutlineRepeat style={{width:"1em", height:"1em"}}/>
                            )}
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