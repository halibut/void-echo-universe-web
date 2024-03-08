import {useState, useRef, useEffect} from 'react';

import Constants from '../../constants';
import Sounds from '../../utils/Sounds';

import ZoomInSequencer from '../../components/ZoomInSequencer';

import CSSAnimations from '../../utils/CSSAnimations';
import State from '../../utils/State';
import AudioControls from '../../components/AudioControls';

const EnableSoundPanel = ({onEnable}) => {
  return (
    <div className='center' style={{flex:1, width:'100%'}}>
      <div style={{maxWidth:400}}>
        <p>
          <span style={{fontWeight:'bold'}}>{Constants.title} </span>
           is a music experience. Before proceding, you must enable sounds.
        </p>
        <a href='' className='start-button' onClick={onEnable}>
          <span>Enable</span>
        </a>
      </div>
    </div>
  );
};

const TitlePanel = ({}) => {
  return (
    <div className='center' style={{flex:1, width:'100%'}}>
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

const TrackItem = ({title, length, trackNumber, selected, onSelect}) => {
  const selectTrack = () => {
    onSelect(trackNumber);
  }

  const color = selected ? '#bfd1ff' : "#ddd"; 

  return (
    <div className='track-item' onClick={selectTrack} style={{color: color}}>
      <div className='suggested-track-ind'>
        {selected && ( 
            <div className='glowing-bg' style={{position:'relative', width:10, height:10, backgroundColor:color, borderRadius:5}} />
        )}
      </div>
      <div className='track-title'>{title}</div>
      <div className='track-length'>{length}</div>
    </div>
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
    const optSub = State.subscribeToStateChanges(optKey, (stateEvent) => {
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

const IndexPanel = ({}) => {
  const [currentTrack, setCurrentTrack] = useState(State.getCurrentTrack());

  useEffect(() => {
    const trackSub = State.subscribeToStateChanges("home-index", (stateEvent) => {
      if(stateEvent.state === "currentTrack") {
        setCurrentTrack(stateEvent.value);
      }
    })

    return () => {
      trackSub.unsubscribe();
    }
  });

  const selectTrack = (trackNumber) => {
    State.setCurrentTrack(trackNumber);
  }

  return (
    <div className='center' style={{flex:1, width:'100%', paddingBottom:50}}>
      <div className='' style={{position:'relative', width:'100%', maxWidth: 600}}>
        <h1 className='title'>Tracks</h1>
        <TrackItem title='01 - Potential in the Void' length='3:45' trackNumber={1} selected={1===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='02 - The Big Bang' length='3:45' trackNumber={2} selected={2===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='03 - Cosmic Microwave Background' length='3:45' trackNumber={3} selected={3===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='04 - Nebulae' length='3:45' trackNumber={4} selected={4===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='05 - Abiogenesis' length='3:45' trackNumber={5} selected={5===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='06 - Consciousness' length='3:45' trackNumber={6} selected={6===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='07 - The Relentless March of Time' length='3:45' trackNumber={7} selected={7===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='08 - Red Shift' length='3:45' trackNumber={8} selected={8===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='09 - Collapsing Star' length='3:45' trackNumber={9} selected={9===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='10 - One Last Alarm Before the End' length='3:45' trackNumber={10} selected={10===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='11 - Spacetime Will Be Torn Apart' length='3:45' trackNumber={11} selected={11===currentTrack} onSelect={selectTrack}/>
        <TrackItem title='12 - What Happens Now?' length='3:45' trackNumber={12} selected={12===currentTrack} onSelect={selectTrack}/>
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

const Chapter_00_Start = ({nav}) => {
  
  const [panelIndex, setPanelIndex] = useState(-1);
  const [rootAnimClass, setRootAnimClass] = useState('');
  const [bgSound, setBgSound] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if(Sounds.isSuspended()) {
      setPanelIndex(0);
    }
    else {
      setPanelIndex(1);
    }
    
  }, [])

  useEffect(() => {
    const stateSub = State.subscribeToStateChanges('title-screen-select', (e) => {
      if(e.state === "currentTrack") {
        start(e.value);
      }
    });

    return () => {
      stateSub.unsubscribe();
    }
  }, []);

  const enableSounds = async (e) => {
    if(!e || !e.preventDefault) {
      //We can only enable sounds as a part of a user interaction, so we need an event
      return;
    }
    
    e.preventDefault();
    await Sounds.tryResume();
    setPanelIndex(1);
  }
  
  const start = (e) => {
    const chapter = e.value;

    if(!rootAnimClass) {
      Sounds.fadeOut(8);

      //for now hard code to go to the first chapter
      const animClass = CSSAnimations.addZoomInTransitionSlow(() => {
        nav.navToChatper(1);
      });

      setRootAnimClass(animClass);
    }
  }

  const playBgMusic = async (e) => {
    console.log("Can play through.");

    if(!bgSound) {
      audioRef.current.loop = true;

      const sound = Sounds.loadFromAudioElement(audioRef.current);

      setBgSound({source: sound, audioElm: audioRef.current});
      
      audioRef.current.play();
    }
  };

  const onPanelChange = () => {
    if(panelIndex === 1) {
      setInterval(() => {
        setPanelIndex(2);
      }, 3000);
    }
  }

  return (
     <div className={'chapter-root chapter00bg '+rootAnimClass} style={{paddingBottom:50}}>
        <div key='bg' className='bg-image' style={{transform:`scale(3)`}}>
          <img className='bg-image spin-bg-slow' style={{opacity:0.3}} src={require("../../images/chapter_00_bg.jpg")} />
        </div>
       
        <div key='main' className={'center '+rootAnimClass} style={{flex:1, width: '100%'}}>
          <ZoomInSequencer 
              className='center' 
              style={{flex:1, width: '100%'}} 
              zoomSpeed={panelIndex === 0 ? "fast" : "extra-slow"}
              currentIndex={panelIndex}
              onFinishedTransition={onPanelChange} 
          >
            <EnableSoundPanel onEnable={enableSounds}/>
            <TitlePanel />
            <IndexPanel />
          </ZoomInSequencer>
        </div>

        {panelIndex > 0 && 
          (
            <div className='row' style={{height: 50, position:'absolute', left:0, bottom:0, width:'100%'}} >
              <audio ref={audioRef} onCanPlayThrough={playBgMusic}>
                <source src={require("../../sounds/ambient.mp3")} />
              </audio>
              <AudioControls sound={bgSound} />
            </div>
          )
        } 
     </div> 
  )

};

export default Chapter_00_Start;