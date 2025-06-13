import { FC, ReactNode, SyntheticEvent, useCallback, useEffect, useRef, useState} from "react";
import SoundService2 from "../service/SoundService2";
import State from "../service/State";
import Utils from "../utils/Utils";

import SideMenu from "../components/SideMenu";

import { IoIosPlay, IoIosSkipForward, IoIosSkipBackward, IoIosPause } from "react-icons/io";
import { 
    MdOutlineRepeat,
    MdOutlineRepeatOn,
    MdOutlineRepeatOneOn,
    MdOutlineExpandMore,
    MdOutlineExpandLess,
} from "react-icons/md";

import { setLocation } from "../contexts/location-context";
import SlideShow from "../service/Slideshow";
import { TrackDataType } from "../service/SongData";
import { NasaApiImageMetadata } from "../service/NasaImagesApi";
import { CommonScreenProps } from "../components/Navigator";

interface TrackPageProps extends CommonScreenProps {
    songData:TrackDataType,
}

/**
 * Returns a component that is basically a wrapper around TrackPage, but with the specified songDat.
 * @param {*} songData 
 * @returns 
 */
export function createTrackPage(songData:TrackDataType) {
    return ({isLoadingOut, isLoadingIn, fullyLoaded, animOptions}:CommonScreenProps) => {
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

const TrackPage:FC<TrackPageProps> = ({
    songData,
    isLoadingOut,
    animOptions,
    fullyLoaded,
    isLoadingIn,
}) => {
    const [zenMode, setZenMode] = useState(State.getStateValue("zen-mode", false));
    const [showNotes, setShowNotes] = useState(State.getStateValue("show-notes", true));
    const [showControls, setShowControls] = useState(false);
    const [showImageAttribution, setShowImageAttribution] = useState(State.getStateValue("image-attribution", false));
    const [paused, setPaused] = useState(SoundService2.isPaused() || SoundService2.isSuspended());
    const [fadingControls, setFadingControls] = useState(false);
    const [repeatMode, setRepeatMode] = useState(State.getStateValue("repeat", "none"));

    const [imageMetadata, setImageMetadata] = useState<NasaApiImageMetadata|null>(null);

    const controlsTimeoutRef = useRef<number|null>(null);
    const fadeoutControlsRef = useRef<number|null>(null);
    const nextTrackTimeoutRef = useRef<number|null>(null);
    
    const goToPrevious = useCallback((e?:SyntheticEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const repeatAlbum = State.getStateValue("repeat", "none") === "album";
        const sd = Utils.findPreviousSongData(songData, repeatAlbum);
        if (sd) {
            SoundService2.touchSound(sd.songSources);
        }
        const prevURL = Utils.calculatePreviousSongPage(songData, repeatAlbum);
        setLocation(prevURL, null, null);
    }, [songData]);

    const goToNext = useCallback((e?:SyntheticEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const repeatAlbum = State.getStateValue("repeat", "none") === "album";
        const sd = Utils.findNextSongData(songData, repeatAlbum);
        if (sd) {
            SoundService2.touchSound(sd.songSources);
        }
        const nextURL = Utils.calculateNextSongPage(songData, repeatAlbum);
        setLocation(nextURL, null, null);
    }, [songData]);

    useEffect(() => {
        //Play the song for this track
        State.setStateValue("current-track", songData.trackNumber);
        //console.log("Setting sound: " + JSON.stringify(songData.title));
        SoundService2.setSound(songData.songSources, {
            play:true,
            fadeOutBeforePlay: 2,
            loop: State.getStateValue("repeat", "none") === "track",
        });

        const soundEventSub = SoundService2.subscribeEvents((e) => {
            switch (e.event) {
                case "30secondwarning": {
                        //Start loading the next track if we get near the end of this one
                        const repeatMode = State.getStateValue("repeat", "none");
                        if (repeatMode !== "track") {
                            const nextSong = Utils.findNextSongData(songData, repeatMode === "album");
                            if (nextSong) {
                                SoundService2.touchSound(nextSong.songSources);
                            }
                        }
                    }
                    break;
                case "1secondwarning": 
                    //On desktop platforms, attempt to queue up the next song so it plays more seamlessly
                    if (!Utils.isIOS()) {
                        const tRemaining = e.timeRemaining ? e.timeRemaining : 0;
                        const time = Math.floor(Math.min(1000, Math.max(tRemaining, 0) * 1000 - 50));
                        //Set short timeout to play the next track if we get to the end of this one
                        const repeatMode = State.getStateValue("repeat", "none");
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
                case "ended": 
                    //On IOS, we can only start playback of the next song from a user interaction or 
                    //from the "ended" event. This code block is essentially fired within the context
                    //of the "ended" event which allows the next song to play on IOS.
                    if (Utils.isIOS()) {
                        const repeatMode = State.getStateValue("repeat", "none");
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
                case "playing": 
                    setPaused(false);
                    break;
                case "paused":
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
                case "show-notes":
                    setShowNotes(stateEvent.value);
                    break;
                case "zen-mode":
                    setZenMode(stateEvent.value);
                    break; 
                case "image-attribution":
                    setShowImageAttribution(stateEvent.value);
                    break;
                case "repeat":
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
        const ssSub = SlideShow.subscribeToImageMetadata(setImageMetadata);

        return () => {
            ssSub.unsubscribe();
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

    const startHidingControls = useCallback((time:number) => {
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

    const togglePause = useCallback((e:SyntheticEvent) => {
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

    const cycleRepeat = useCallback((e:SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (repeatMode === "album") {
            State.setStateValue("repeat", "track");
        } else if ( repeatMode === "track" ) {
            State.setStateValue("repeat", "none");
        } else {
            State.setStateValue("repeat", "album");
        }
    }, [repeatMode]);

    const toggleControls = useCallback((e:SyntheticEvent) => {
        e.stopPropagation();
        if (!showControls) {
            State.setStateValue("audio-controls-expanded", true)
            setShowControls(true);
            startHidingControls(10000);
        } else {
            startHidingControls(0);
        }
    }, [showControls, startHidingControls]);

    let songText:ReactNode = null;
    if (!zenMode) {
        let albumNotes:ReactNode = null;
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
                <button
                    type="button"
                    className="album-notes-expand-button"
                    onClick={() => State.setStateValue("show-notes", !showNotes)}
                >
                    {showNotes ? (
                        <MdOutlineExpandLess />
                    ) : (
                        <MdOutlineExpandMore />
                    )}
                </button>
                {albumNotes}
            </div>
        );
    }

    let imageAttribution:ReactNode = null;
    if (showImageAttribution && imageMetadata && !zenMode) {
        imageAttribution = (
            <div className="image-attribution">
                <p>{imageMetadata["AVAIL:Description"]}</p>
            </div>
        )
    }

    return (
        <div className='center' style={{flex:1, width:'100%', paddingBottom:50, position:'relative'}}>
            <div className="col" style={{position:"absolute", left:0, top:0, width:"100%", height:"100%", cursor:"pointer"}} onClick={toggleControls} ></div>

            {fullyLoaded && (songText) }

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