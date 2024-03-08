

import { useCallback, useEffect, useRef, useState } from "react";
import SoundService from "../service/SoundService";


const Sound = () => {
    const [audio, setAudio] = useState(null);

    const soundElementRef = useRef(null);

    useEffect(() => {
        SoundService.setAudioChangeHandler(setAudio);
    }, [])

    const onSoundReady = useCallback(async (evt) => {
        const elm = evt.target;
        console.log("Sound ready: "+elm);

        if (soundElementRef.current !== elm) {
            soundElementRef.current = elm;

            await SoundService.tryResume();

            SoundService.loadFromAudioElement(elm);
            
            if (audio && audio.options) {
                console.log("Sound options: "+JSON.stringify(audio.options))
                if (audio.options.loop) {
                    elm.loop = true;
                }
                if (audio.options.play) {
                    elm.play();
                }
            }
        }
        
    }, [audio]);

    let audioObj = null;
    if (audio && audio.src) {
        const sources = audio.src.map(s => {
            return <source key={s.src} src={s.src} type={s.type} />
        })

        audioObj = (
            <audio onCanPlayThrough={onSoundReady}>
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