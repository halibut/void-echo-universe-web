

import { useCallback, useEffect, useRef, useState } from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";


const Sound = () => {
    const [audio, setAudio] = useState(null);

    const soundElementRef = useRef(null);
    const audioRef = useRef(audio);

    //Whenever audio changes, update a ref so that we can use it in an event later
    //without depending on the state
    useEffect(() => {
        audioRef.current = audio;
    }, [audio])

    useEffect(() => {
        SoundService.setAudioChangeHandler((newAudio) => {
            //console.log("Changing audio to: "+JSON.stringify(newAudio));
            //If we got here, it's because the audio HTML element definitely needs to change,
            //So we create a key for the element that will be used during rendering, so that
            //react knows to unmount the old element and remount the new one.
            setAudio({
                ...newAudio,
                key: Date.now(),
            });
        });
    }, [])

    const setElmRef = useCallback((elm) => {
        soundElementRef.current = elm;

        if (soundElementRef.current) {
            //console.log("Sound element mounted.");
            SoundService.loadFromAudioElement(soundElementRef.current);

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
        }
        else {
            //console.log("Removing previous sound.");
        }
    }, []);

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