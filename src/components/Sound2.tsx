

import { FC, ReactEventHandler, useCallback, useEffect, useRef} from "react";
import debug from "./Debug";
import SongData, { TrackDataType } from "../service/SongData";
import SoundService2 from "../service/SoundService2";

type SoundElementProps = {
    index: number,
    songData: TrackDataType,
}

const SoundElement:FC<SoundElementProps> = ({index, songData}) => {
    const elementRef = useRef<HTMLAudioElement|null>(null);

    const handleRef = useCallback((r:HTMLAudioElement) => {
        elementRef.current = r;
        //debug(`Sound element [${index}] mounted: ${r}`);

        SoundService2.registerElement(r, index);
    }, [index]);

    const sources = songData.songSources.map(s => {
        return <source key={s.src} src={s.src} type={s.type} />
    });

    const handleError:ReactEventHandler = (e) => {
        console.error(e);
        debug(`Error with sound[${index}]: ` +e);
    }
    
    return (
        <audio id={`audio-element-${index}`} key={index} ref={handleRef} crossOrigin="anonymous" preload="metadata" onError={handleError}>
            {sources}
        </audio>
    );
}

const Sound2 = () => {

    useEffect(() => {
        //debug("mounted Sound2");

        return () => {
            //debug("Unmounted Sound2")
        }
    }, []);

    const soundElms = Object.keys(SongData).map((k, index) => {
        const sd = SongData[k];

        return <SoundElement key={index} index={index} songData={sd} />;
    });

    return (
        <div key="sound" style={{display: "none"}} >
            {soundElms}
        </div>
    );
};

export default Sound2;