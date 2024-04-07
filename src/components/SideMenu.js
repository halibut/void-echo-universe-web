
import { IoIosOptions } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import { FaBandcamp } from "react-icons/fa";
import { FaSpotify } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { MdEmail } from "react-icons/md";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoTiktok } from "react-icons/io5";
import { IoLogoInstagram } from "react-icons/io5";
import Link from "../components/Link";
import State from "../service/State";
import { useEffect, useRef, useState } from "react";
import Constants from "../constants";
import Utils from "../utils/Utils";

const ToggleMenuItem = ({
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

const MultiOptionMenuItem = ({optionKey, options, defaultValue, optionName}) => {
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
  
    const select = (e) => {
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

const SideMenu = ({
    songData,
}) => {
    const [open, setOpen] = useState(false);
    const [showCopyMessage, setShowCopyMessage] = useState(false);
    const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);

    const timeoutRef = useRef(null);
    
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
        
        navigator.clipboard.writeText(window.location);

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

    const toggleOpen = (e) => {
        e.stopPropagation();
        setOpen(!open);
    };
    
    const toggleFullScreen = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            setFullscreen(false);
        } else {
            await document.getElementById("root").requestFullscreen();
            setFullscreen(true);
        }
    }

    if (!open) {
        let additionalClass = "";
        if (State.getStateValue(State.KEYS.ZEN_MODE)) {
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
                    <Link className="menu-link" path="/main">
                        <span style={{paddingLeft:0}}>Main Menu</span>
                    </Link>
                </div>
                <div className="divider" />
                <div> 
                    <span className="menu-title">Options</span>
                </div>
                <div> 
                    <ToggleMenuItem optionKey={State.KEYS.ZEN_MODE} optionName={"Zen Mode"} defaultValue={false} />
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
                    <ToggleMenuItem optionKey={State.KEYS.SHOW_NOTES} optionName={"Show Story"} defaultValue={true} />
                </div>
                <div>
                    <ToggleMenuItem optionKey={State.KEYS.SHOW_VISUALIZER} optionName={"Visualizations"} defaultValue={true} />
                </div>
                <div>
                    <ToggleMenuItem optionKey={State.KEYS.SHOW_IMAGE_ATTRIBUTION} optionName={"Image Attribution"} defaultValue={false} />
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
                            <Link className="menu-link" path={Constants.BASE_URL+"/"+Utils.trackNameToPath(songData.title)} overrideOnClick={copyURL} >
                                <FiShare />
                                <span>Copy URL</span>
                                {showCopyMessage && (
                                    <span className="fade-in" style={{fontSize:"0.5em", animationDuration:"500ms"}}>Copied!</span>
                                )}
                            </Link>
                        </div>
                        <div>
                            <Link className="menu-link" foreign="true" path={songData.links.bandcamp} >
                                <FaBandcamp />
                                <span>bandcamp</span>
                            </Link>
                        </div>
                        <div >
                            <Link className="menu-link" foreign="true" path={songData.links.spotify} >
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
                            <Link className="menu-link" path={Constants.BASE_URL} overrideOnClick={copyURL}>
                                <FiShare />
                                <span>Copy URL</span>
                                {showCopyMessage && (
                                    <span className="fade-in" style={{fontSize:"0.5em", animationDuration:"500ms"}}>Copied!</span>
                                )}
                            </Link>
                        </div>
                        <div>
                            <Link className="menu-link" foreign="true" path={Constants.links.bandcampAlbumURL} >
                                <FaBandcamp />
                                <span>bandcamp</span>
                            </Link>
                        </div>
                        <div >
                            <Link className="menu-link" foreign="true" path={Constants.links.spotifyAlbumURL} >
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
                    <Link className="menu-link" foreign="true" path={Constants.links.twitter.url} >
                        <FaXTwitter />
                        <span style={{fontSize:".75em"}}>{Constants.links.twitter.text}</span>
                    </Link>
                </div>
                <div >
                    <Link className="menu-link" foreign="true" path={Constants.links.tiktok.url} >
                        <IoLogoTiktok />
                        <span style={{fontSize:".75em"}}>{Constants.links.instagram.text}</span>
                    </Link>
                </div>
                <div >
                    <Link className="menu-link" foreign="true" path={Constants.links.instagram.url} >
                        <IoLogoInstagram />
                        <span style={{fontSize:".75em"}}>{Constants.links.instagram.text}</span>
                    </Link>
                </div>
                <div className="divider" />
                <div >
                    <Link className="menu-link" path="/credits" >
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