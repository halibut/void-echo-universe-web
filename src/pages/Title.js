import { useCallback, useEffect, useRef } from "react";
import Constants from "../constants";
import SoundService from "../service/SoundService";
import SongData from "../service/SongData";
import { setLocation } from "../contexts/location-context";
import { setDefaultBackground } from "../service/BackgroundService";

const Title = ({fullyLoaded}) => {
    const nextRequested = useRef(false);
    const autoTimeout = useRef(null);

    const next = useCallback(()=> {
        if (nextRequested.current) {
            return;
        }

        if (autoTimeout.current) {
            window.clearTimeout(autoTimeout.current);
            autoTimeout.current = null;
        }

        nextRequested.current = true;
        setLocation("/main", null, {time:5000});
    }, []);

    useEffect(() => {
        if (fullyLoaded) {
            autoTimeout.current = window.setTimeout(()=> {
                autoTimeout.current = null;
                next();
            }, 5000);
        }
    }, [next, fullyLoaded]);

    useEffect(() => {
        SoundService.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});
  
        setDefaultBackground(3000);
        
        return () => {
            if (autoTimeout.current) {
                window.clearTimeout(autoTimeout.current);
                autoTimeout.current = null;
            }
        }
    }, []);

    return (
        <div className='center' style={{flex:1, width:'100%', height:'100%', cursor:nextRequested.current ? "auto" : "pointer"}} onClick={next}>
            <div className='title' style={{position:'relative'}}>
                <h1 className='focused'>{Constants.title}</h1>
            </div>

            <div>
                <span style={{textAlign:'center'}}>by</span>
            </div>
                
            <h2 className='author'>{Constants.artist}</h2>

        </div>
    );
};

export default Title;