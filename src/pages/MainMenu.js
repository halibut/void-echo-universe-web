import { useEffect, useState } from "react";
import State from "../service/State";
import SoundService from "../service/SoundService";
import SongData from "../service/SongData";
import Link from "../components/Link";
import Utils from "../utils/Utils";
import { setBackgroundImage } from "../service/BackgroundService";
import SideMenu from "../components/SideMenu";
import AudioControls from "../components/AudioControls";


const TrackItem = ({songData, selected}) => {
  const color = selected ? '#bfd1ff' : "#ddd"; 

  return (
    <Link className='track-item' path={Utils.trackNameToPath(songData.title)} navOptions={{time:3000}}>
      <div className='suggested-track-ind'>
        {selected && ( 
            <div className='glowing-bg' style={{position:'relative', width:10, height:10, backgroundColor:color, borderRadius:5}} />
        )}
      </div>
      <div className='track-title'>{songData.trackNumber} - {songData.title}</div>
      <div className='track-length'>{songData.songLength}</div>
    </Link>
  )
}

const MainMenu = ({isLoadingOut, isLoadingIn, fullyLoaded}) => {
  const [currentTrack, setCurrentTrack] = useState(State.getCurrentTrack());

  useEffect(() => {
    setBackgroundImage(require("../images/chapter_00_bg.jpg"), {
      staticStyle: {opacity: 0.3, transform:`scale(3)`},
      imageClass: "spin-bg-slow",
      transitionTime: 3000,
    });

    const trackSub = State.subscribeToStateChanges((stateEvent) => {
      if(stateEvent.state === "currentTrack") {
        setCurrentTrack(stateEvent.value);
      }
    });

    SoundService.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});

    return () => {
      trackSub.unsubscribe();
    }
  }, []);

  
  return (
    <div className='center' style={{flex:1, width:'100%', paddingBottom:50, overflowY: 'auto', position:'relative'}}>
      <div className='' style={{position:'relative', width:'100%', maxWidth: 600}}>
        <h1 className='title'>Tracks</h1>
        <TrackItem songData={SongData.track01} selected={1===currentTrack}/>
        <TrackItem songData={SongData.track02} selected={2===currentTrack}/>
        <TrackItem songData={SongData.track03} selected={3===currentTrack}/>
        <TrackItem songData={SongData.track04} selected={4===currentTrack}/>
        <TrackItem songData={SongData.track05} selected={5===currentTrack}/>
        <TrackItem songData={SongData.track06} selected={6===currentTrack}/>
        <TrackItem songData={SongData.track07} selected={7===currentTrack}/>
        <TrackItem songData={SongData.track08} selected={8===currentTrack}/>
        <TrackItem songData={SongData.track09} selected={9===currentTrack}/>
        <TrackItem songData={SongData.track10} selected={10===currentTrack}/>
        <TrackItem songData={SongData.track11} selected={11===currentTrack}/>
        <TrackItem songData={SongData.track12} selected={12===currentTrack}/>
      </div>

      {fullyLoaded && (
        <SideMenu />
      )}
      
    </div>
  );
};


export default MainMenu;