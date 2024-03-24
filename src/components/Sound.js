

import { useCallback, useEffect, useRef, useState } from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";


const Sound = () => {
    const [audio, setAudio] = useState(null);

    const soundElementRef = useRef(null);
    const audioRef = useRef(audio);
    
    useEffect(() => {
        SoundService.setAudioChangeHandler((newAudio) => {
            //If we got here, it's because the audio HTML element definitely needs to change,
            //So we create a key for the element that will be used during rendering, so that
            //react knows to unmount the old element and remount the new one.
            audioRef.current = newAudio;
            setAudio(newAudio);
        });
    }, [])

    /**
     * Prepare a song to be played. Whether the song immediately plays or not
     * depends on the audio options.
     */
    const initSong = useCallback(() => {
        soundElementRef.current.oncanplaythrough = (evt) => {
            //console.log("Sound ready: "+soundElementRef.current);

            const aud = audioRef.current;

            if (aud && aud.options) {
                //console.log("Sound options: "+JSON.stringify(aud.options))

                if (aud.options.loop) {
                    evt.target.loop = true;
                }
                
                if (aud.options.play) {
                    evt.target.volume = 1;
                    evt.target.play().then(() => {
                        //console.log("Playing");
                        if (!State.isMuted()) {
                            SoundService.setVolume(State.getLastVolume());
                        }
                    }).catch(e => {
                        console.error("Error playing sound: ",e);
                    });
                }
            }

        };
    }, []);

    const setElmRef = useCallback((elm) => {
        console.log("Sound element mounted: " + elm);

        soundElementRef.current = elm;

        if (soundElementRef.current) {
            SoundService.loadFromAudioElement(soundElementRef.current);

            initSong();
        }
        else {
            console.log("Removing previous sound.");
        }
    }, [initSong]);

    let audioObj = null;
    if (audio && audio.src) {
        const sources = audio.src.map(s => {
            return <source key={s.src} src={s.src} type={s.type} />
        })

        audioObj = (
            <audio key={audio.key} ref={setElmRef}>
                {sources}
            </audio>
        );
    }

    return (
        <div style={{display: "none"}}>
            {audioObj}
        </div>
    )
};

export default Sound;