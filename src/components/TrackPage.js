import { useEffect } from "react";
import SoundService from "../service/SoundService";
import State from "../service/State";

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

    useEffect(() => {
        if (isLoadingOut) {
            SoundService.setSound(null);
        }
        else if (fullyLoaded) {
            State.setCurrentTrack(songData.trackNumber);
            console.log("Setting sound: " + JSON.stringify(songData));
            SoundService.setSound(songData.songSources, {play:true});
        }
        
    }, [songData, fullyLoaded, isLoadingOut]);


    return (
        null
    );
}

export default TrackPage;