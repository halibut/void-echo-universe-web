
import { IoIosOptions } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import { FaBandcamp } from "react-icons/fa";
import { FaSpotify } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoTiktok } from "react-icons/io5";
import { IoLogoInstagram } from "react-icons/io5";
import Link from "./Link";
import State, { StateKey } from "../service/State";
import { ChangeEvent, FC, ReactEventHandler, useEffect, useRef, useState } from "react";
import Constants from "../constants";
import Utils from "../utils/Utils";
import SoundService2 from "../service/SoundService2";
import SongData, { TrackDataType } from "../service/SongData";

type ToggleMenuItemProps = {
    optionName:string,
    optionKey:StateKey,
    defaultValue:boolean,
}

const ToggleMenuItem:FC<ToggleMenuItemProps> = ({
    optionName,
    optionKey,
    defaultValue,
}) => {
    const [keyVal, setKeyVal] = useState(State.getStateValue(optionKey, defaultValue));
  
    useEffect(() => {
      const optSub = State.subscribeToStateChanges((stateEvent) => {
        if(stateEvent.state === optionKey) {
          setKeyVal(stateEvent.value);
        }
      })
  
      return () => {
        optSub.unsubscribe();
      }
    });

    return (
        <div className='' style={{position:'relative', width:'100%'}}>
            <div className='option-item' onClick={() => State.setStateValue(optionKey, !State.getStateValue(optionKey, defaultValue))} style={{color: "#ddd"}}>
                <div className='option-title'>{optionName}</div>
                    <div className='option-value'>
                    { keyVal ===true && ( 
                        <div className='' style={{width:10, height:10, backgroundColor:"#ddd", borderRadius:5}} />
                    )}
                </div>
            </div>
        </div>
    );
}

type OptionData = {
    value:string,
    label:string,
}

type MultiOptionMenuItemProps = {
    optionName:string,
    options:OptionData[],
    optionKey:StateKey,
    defaultValue:string,
}

const MultiOptionMenuItem:FC<MultiOptionMenuItemProps> = ({optionKey, options, defaultValue, optionName}) => {
    const [keyVal, setKeyVal] = useState(State.getStateValue(optionKey, defaultValue));
  
    useEffect(() => {
      const optSub = State.subscribeToStateChanges((stateEvent) => {
        if(stateEvent.state === optionKey) {
          setKeyVal(stateEvent.value);
        }
      })
  
      return () => {
        optSub.unsubscribe();
      }
    });
  
    const select = (e:ChangeEvent<HTMLSelectElement>) => {
      State.setStateValue(optionKey, e.target.value);
    }
    
    return (
      <div className='' style={{position:'relative', width:'100%'}}>
        <div className='option-item' style={{color: "#ddd"}}>
            <div className='option-title'>{optionName}</div>
            <div>
            <select value={keyVal} onChange={select}>
                {options.map(opt => {
                return <option key={opt.value} value={opt.value}>{opt.label}</option>
                })}
            </select>
            </div>
        </div>
      </div>
    )
  };

type SideMenuProps = {
    songData?:TrackDataType
}

const SideMenu:FC<SideMenuProps> = ({
    songData,
}) => {
    const [open, setOpen] = useState(false);
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

    const timeoutRef = useRef<number|null>(null);
    
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, []);

    const copyURL = () => {
        setShowCopyMessage(false);
        
        navigator.clipboard.writeText(window.location.href);

        //Make sure we reset the state on the next frame
        window.setTimeout(() => {
            setShowCopyMessage(true);
        }, 0);

        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            setShowCopyMessage(false);
            timeoutRef.current = null;
        }, 5000);
    }

    const toggleOpen:ReactEventHandler = (e) => {
        e.stopPropagation();
        setOpen(!open);
    };

    const toggleFullScreen = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            setFullscreen(false);
        } else {
            await document.getElementById("root")!.requestFullscreen();
            setFullscreen(true);
        }
    }

    const prepareAmbientSound = () => {
        SoundService2.touchSound(SongData.track00.songSources);
    }

    if (!open) {
        let additionalClass = "";
        if (State.getStateValue("zen-mode", false)) {
            additionalClass = "zen-mode";
        }
        return (
            <button className={"fade-in popup-menu-button "+additionalClass} 
                style={{animationDuration:"250ms"}}
                type="button" onClick={toggleOpen} 
            >
                <IoIosOptions />
            </button>
        )
    }
    else {
        return (
            <div className="popup-menu fade-in" style={{animationDuration:"125ms"}}>
                <div >
                    <div className="row" style={{flex:1}} />
                    <button className="close-menu-button" type="button" onClick={toggleOpen} >
                        <IoIosClose />
                    </button>
                </div>
                <div>
                    <Link className="menu-link" path="/main" beforeNavigation={prepareAmbientSound}>
                        <span style={{paddingLeft:0}}>Main Menu</span>
                    </Link>
                </div>
                <div className="divider" />
                <div> 
                    <span className="menu-title">Options</span>
                </div>
                <div> 
                    <ToggleMenuItem optionKey={"zen-mode"} optionName={"Zen Mode"} defaultValue={false} />
                </div>
                {(document.fullscreenEnabled) && (
                    <div> 
                        <div className='' style={{position:'relative', width:'100%'}}>
                            <div className='option-item' onClick={toggleFullScreen}>
                                <div className='option-title'>Full Screen</div>
                                    <div className='option-value'>
                                    { (document.fullscreenElement) && ( 
                                        <div className='' style={{width:10, height:10, backgroundColor:"#ddd", borderRadius:5}} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <MultiOptionMenuItem 
                        optionKey={"visualizer-type"}
                        optionName={"Visualizer"}
                        defaultValue={"default"}
                        options={[
                            {value:'default', label:'Default'},
                            {value:'blend-bg', label:'Brightness'},
                            {value:'bars', label:'Bars'},
                            {value:'arcs', label:'Arcs'},
                            {value:'ngon-2', label:'2-Gon'},
                            {value:'ngon-3', label:'3-Gon'},
                            {value:'ngon-4', label:'4-Gon'},
                            {value:'none', label:'None'},
                        ]}
                    />
                </div>
                
                <div>
                    <ToggleMenuItem optionKey={"image-attribution"} optionName={"Image Attribution"} defaultValue={false} />
                </div>
                <div>
                    <MultiOptionMenuItem 
                        optionKey={"img-quality"}
                        optionName={"Image Quality"}
                        defaultValue={"large"}
                        options={[
                            {value:'orig', label:'Highest'},
                            {value:'large', label:'High'},
                            {value:'medium', label:'Medium'},
                            {value:'small', label:'Low'},
                            {value:'none', label:'None'}
                        ]}
                    />
                </div>
                { songData ? (
                    <>
                        <div className="divider" />
                        <div> 
                            <span className="menu-title">Share Song</span>
                        </div>
                        <div >
                            <Link className="menu-link" path={Constants.BASE_URL+Utils.trackNameToPath(songData.title)} overrideOnClick={copyURL} >
                                <FiShare />
                                <span>Copy URL</span>
                                {showCopyMessage && (
                                    <span className="fade-in" style={{fontSize:"0.5em", animationDuration:"500ms"}}>Copied!</span>
                                )}
                            </Link>
                        </div>
                        <div>
                            <Link className="menu-link" foreign={true} path={songData.links.bandcamp} >
                                <FaBandcamp />
                                <span>bandcamp</span>
                            </Link>
                        </div>
                        <div >
                            <Link className="menu-link" foreign={true} path={songData.links.spotify} >
                                <FaSpotify />
                                <span>Spotify</span>
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="divider" />
                        <div> 
                            <span className="menu-title">Share Album</span>
                        </div>
                        <div >
                            <Link className="menu-link" path={Constants.BASE_URL!} overrideOnClick={copyURL}>
                                <FiShare />
                                <span>Copy URL</span>
                                {showCopyMessage && (
                                    <span className="fade-in" style={{fontSize:"0.5em", animationDuration:"500ms"}}>Copied!</span>
                                )}
                            </Link>
                        </div>
                        <div>
                            <Link className="menu-link" foreign={true} path={Constants.links.bandcampAlbumURL} >
                                <FaBandcamp />
                                <span>bandcamp</span>
                            </Link>
                        </div>
                        <div >
                            <Link className="menu-link" foreign={true} path={Constants.links.spotifyAlbumURL} >
                                <FaSpotify />
                                <span>Spotify</span>
                            </Link>
                        </div>
                    </>
                )}
                <div className="divider" />
                <div> 
                    <span className="menu-title">Contact</span>
                </div>
                <div >
                    <Link className="menu-link" path={Constants.links.email.url} overrideOnClick={() => {}}>
                        <MdEmail />
                        <span style={{fontSize:".75em"}}>{Constants.links.email.text}</span>
                    </Link>
                </div>
                <div>
                    <Link className="menu-link" foreign={true} path={Constants.links.twitter.url} >
                        <FaXTwitter />
                        <span style={{fontSize:".75em"}}>{Constants.links.twitter.text}</span>
                    </Link>
                </div>
                <div >
                    <Link className="menu-link" foreign={true} path={Constants.links.tiktok.url} >
                        <IoLogoTiktok />
                        <span style={{fontSize:".75em"}}>{Constants.links.instagram.text}</span>
                    </Link>
                </div>
                <div >
                    <Link className="menu-link" foreign={true} path={Constants.links.instagram.url} >
                        <IoLogoInstagram />
                        <span style={{fontSize:".75em"}}>{Constants.links.instagram.text}</span>
                    </Link>
                </div>
                <div className="divider" />
                <div >
                    <Link className="menu-link" path="/credits" beforeNavigation={prepareAmbientSound} >
                        <span style={{paddingLeft:0}}>Credits</span>
                    </Link>
                </div>
                <div style={{justifyContent:"flex-end"}}> 
                    <span style={{fontSize:".75em", fontWeight:"normal"}}>© {Constants.year} {Constants.artist}</span>
                </div>
            </div>
        )
    }

};

export default SideMenu;