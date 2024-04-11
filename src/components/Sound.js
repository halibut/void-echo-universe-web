

import { useCallback, useEffect, useRef, useState } from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";
import debug from "./Debug";


const Sound = () => {
    const [audio, setAudio] = useState(null);
    const [queuedAudio, setQueuedAudio] = useState(null);

    const soundElementRef = useRef(null);
    const audioRef = useRef(audio);

    const queuedSoundElementRef = useRef(null);
    const queuedAudioRef = useRef(null);
    
    useEffect(() => {
        SoundService.setAudioChangeHandler((newAudio) => {
            //If we got here, it's because the audio HTML element definitely needs to change,
            //So we create a key for the element that will be used during rendering, so that
            //react knows to unmount the old element and remount the new one.
            audioRef.current = newAudio;
            setAudio(newAudio);
            queuedAudioRef.current = null;
            setQueuedAudio(null);
        });

        SoundService.setQueuedAudioChangeHandler((newAudio) => {
            queuedAudioRef.current = newAudio;
            setQueuedAudio(newAudio);
        });
    }, [])

    const setElmRef = useCallback((elm) => {
        debug("Sound element mounted: " + elm);

        soundElementRef.current = elm;

        if (soundElementRef.current) {
            SoundService.loadFromAudioElement(soundElementRef.current);
        }
    }, []);

    const setQueuedElmRef = useCallback((elm) => {
        debug("Queued sound element mounted: " + elm);

        queuedSoundElementRef.current = elm;
        if (queuedSoundElementRef.current) {
            SoundService.queuedElementMounted(queuedSoundElementRef.current);
        }
    }, []);

    const soundElms = [];

    if (audio && audio.source) {
        const sources = audio.source.map(s => {
            return <source key={s.src} src={s.src} type={s.type} />
        })

        soundElms.push(
            <audio key={audio.key} ref={setElmRef} preload="auto">
                {sources}
            </audio>
        );
    }

    if (queuedAudio && queuedAudio.source && queuedAudio.key !== audio?.key) {
        const sources = queuedAudio.source.map(s => {
            return <source key={s.src} src={s.src} type={s.type} />
        })

        soundElms.push(
            <audio key={queuedAudio.key} ref={setQueuedElmRef} preload="auto">
                {sources}
            </audio>
        );
    }

    return (
        <div style={{display: "none"}}>
            {[soundElms]}
        </div>
    )
};

export default Sound;