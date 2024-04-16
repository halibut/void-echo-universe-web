import { useCallback, useEffect, useRef, useState } from "react";
import SoundService2 from "../service/SoundService2";
import SongData from "../service/SongData";
import { setLocation } from "../contexts/location-context";
import { setDefaultBackground } from "../service/BackgroundService";

const Title2 = ({fullyLoaded}) => {
    const [transitioning, setTransitioning] = useState(false);
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
        setLocation("/main", null, {time:1000, transitionOutClass:"fade-out", transitionInClass:"fade-in"});
    }, []);

    useEffect(() => {
        if (fullyLoaded) {
            autoTimeout.current = window.setTimeout(() => {
                autoTimeout.current = null;

                setTransitioning(true);

                autoTimeout.current = window.setTimeout(()=> {
                    autoTimeout.current = null;
                    next();
                }, 6000);
            }, 5000);
        }
    }, [next, fullyLoaded]);

    useEffect(() => {
        SoundService2.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});
  
        setDefaultBackground(3000);
        
        return () => {
            if (autoTimeout.current) {
                window.clearTimeout(autoTimeout.current);
                autoTimeout.current = null;
            }
        }
    }, []);


    let classes = "title-screen";
    if (transitioning) {
        classes += " animate-out";
    }

    return (
        <div className='center' style={{position:"relative", flex:1, width:'100%', height:'100%', alignItems:'center', justifyContent:'center', cursor:nextRequested.current ? "auto" : "pointer"}} onClick={next}>

            <div className={classes} >
                <div className="title-cover">
                    <img className="title-timeline" src={require("../images/timeline.png")} alt="" />
                    
                    <img className="title-text" src={require("../images/everything-text.png")} alt="" />

                    <img className="title-logo" src={require("../images/ve-logo-transparent-inverted-500.png")} alt="" />
                </div>
            </div>
        </div>
    );
};

export default Title2;