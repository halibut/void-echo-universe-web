import { FC, useEffect, useState } from "react";
import State from "../service/State";
import SoundService2 from "../service/SoundService2";
import SongData, { TrackDataType } from "../service/SongData";
import Link from "../components/Link";
import Utils from "../utils/Utils";
import { setDefaultBackground } from "../service/BackgroundService";
import SideMenu from "../components/SideMenu";
import Constants from "../constants";
import { CommonScreenProps } from "../components/Navigator";

type TrackItemProps = {
  songData:TrackDataType,
  selected:boolean,
}

const TrackItem:FC<TrackItemProps> = ({songData, selected}) => {
  const color = selected ? '#bfd1ff' : "#ddd"; 

  const touchSong = () => {
    SoundService2.touchSound(songData.songSources);
  }

  return (
    <Link className='track-item' path={Utils.trackNameToPath(songData.title)} navOptions={{time:3000}} beforeNavigation={touchSong}>
      <div className='suggested-track-ind'>
        {selected && ( 
            <div className='glowing-bg' style={{position:'relative', width:10, height:10, backgroundColor:color, borderRadius:5}} />
        )}
      </div>
      <div className='track-number'>{songData.trackNumber}</div>
      <div className='track-title'>{songData.title}</div>
      <div className='track-length'>{songData.songLength}</div>
    </Link>
  )
}

interface MainMenuProps extends CommonScreenProps {
}

const MainMenu:FC<MainMenuProps> = ({isLoadingOut, isLoadingIn, fullyLoaded}) => {
  const [currentTrack, setCurrentTrack] = useState(State.getStateValue("current-track", 1));

  useEffect(() => {
    setDefaultBackground(3000);

    const trackSub = State.subscribeToStateChanges((stateEvent) => {
      if(stateEvent.state === "current-track") {
        setCurrentTrack(stateEvent.value);
      }
    });

    SoundService2.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});

    return () => {
      trackSub.unsubscribe();
    }
  }, []);

  
  return (
    <div className='center' style={{flex:1, width:'100%', paddingBottom:50, position:'relative'}}>

      <div className="title-screen final" >
        <div className="title-cover" >
          <img className="title-timeline" src={require("../images/timeline.png")} alt="" />
          <div className='' style={{position:'absolute', maxWidth: 600, maxHeight:"100%", overflowY:"auto"}}>
            <h1 className='title'>{Constants.title}</h1>
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
        </div>
      </div>

      {fullyLoaded && (
        <SideMenu />
      )}
      
    </div>
  );
};


export default MainMenu;