import { useEffect, useState } from "react";
import State from "../service/State";
import SoundService from "../service/SoundService";
import SongData from "../SongData";
import Link from "../components/Link";
import Utils from "../utils/Utils";


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
  
  const OptionItem = ({optKey, defaultVal, title}) => {
    const [keyVal, setKeyVal] = useState(State.getStateValue(optKey, defaultVal));
  
    useEffect(() => {
      const optSub = State.subscribeToStateChanges((stateEvent) => {
        if(stateEvent.state === optKey) {
          setKeyVal(stateEvent.value);
        }
      })
  
      return () => {
        optSub.unsubscribe();
      }
    });
  
    const toggle = () => {
      State.setStateValue(optKey, !keyVal);
    }
    
    return (
      <div className='option-item' onClick={toggle} style={{color: "#ddd"}}>
        <div className='option-title'>{title}</div>
        <div className='option-value'>
          {keyVal===true && ( 
            <div className='' style={{width:10, height:10, backgroundColor:"#ddd", borderRadius:5}} />
          )}
        </div>
      </div>
    )
  };
  
  const MultiOptionItem = ({optKey, options, defaultVal, title}) => {
    const [keyVal, setKeyVal] = useState(State.getStateValue(optKey, defaultVal));
  
    useEffect(() => {
      const optSub = State.subscribeToStateChanges((stateEvent) => {
        if(stateEvent.state === optKey) {
          setKeyVal(stateEvent.value);
        }
      })
  
      return () => {
        optSub.unsubscribe();
      }
    });
  
    const select = (e) => {
      State.setStateValue(optKey, e.target.value);
    }
    
    return (
      <div className='option-item' style={{color: "#ddd"}}>
        <div className='option-title'>{title}</div>
        <div>
          <select value={keyVal} onChange={select}>
            {options.map(opt => {
              return <option key={opt.value} value={opt.value}>{opt.label}</option>
            })}
          </select>
        </div>
      </div>
    )
  };
  
  const MainMenu = ({isLoadingOut, isLoadingIn}) => {
    const [currentTrack, setCurrentTrack] = useState(State.getCurrentTrack());
  
    useEffect(() => {
      const trackSub = State.subscribeToStateChanges((stateEvent) => {
        if(stateEvent.state === "currentTrack") {
          setCurrentTrack(stateEvent.value);
        }
      })
  
      return () => {
        trackSub.unsubscribe();
      }
    }, []);

    useEffect(() => {
      if (isLoadingIn) {
        SoundService.setSound(SongData.track00.songSources, {play:true, loop:true});
      }
      if (isLoadingOut) {
        SoundService.setSound(null);
      }
    }, [isLoadingIn, isLoadingOut]);
  
    return (
      <div className='center' style={{flex:1, width:'100%', paddingBottom:50, overflowY: 'auto'}}>
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
        </div>
  
        <div className='' style={{position:'relative', width:'100%', maxWidth: 400}}>
          <h2 className='title'>Options</h2>
          <OptionItem optKey='show-notes' title='Album Notes' defaultVal={true}/>
          <OptionItem optKey='show-visuals' title='Vizualizations' defaultVal={true}/>
          <MultiOptionItem optKey='img-quality' title='Image Quality' options={[{value:'lg', label:'High'}, {value:'md', label:'Medium'}, {value:'sm', label:'Small'},]} defaultVal={'md'}/>
        </div>
        
      </div>
    );
  };


export default MainMenu;