import { useEffect } from "react";
import SoundService2 from "../service/SoundService2";
import SongData from "../service/SongData";
import Link from "../components/Link";
import { setDefaultBackground } from "../service/BackgroundService";
import SideMenu from "../components/SideMenu";
import Constants from "../constants";
import { VisualizerService } from "../components/Visualizer";
import State from "../service/State";


const Credits = ({isLoadingOut, isLoadingIn, fullyLoaded}) => {

  useEffect(() => {
    setDefaultBackground(3000);

    SoundService2.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});

    VisualizerService.setVisualizer(VisualizerService.VISUALIZERS.BLEND_BG.name);

    return () => {

    }
  }, []);
  
  return (
    <div className='center' style={{width:"100%", height:'100%', paddingBottom:50}}>
      <div className="song-info" style={{top:30, left:0, right:0, alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
        <h1 className=''>{Constants.title} - Credits</h1>
        <div className='album-notes' >
          <p>The music, story, and website were created by {Constants.artist}.</p>
          <p>The album art was created by Lizzie Baxter.</p>
          <p>
            All images are publicly available from NASA's&nbsp; 
            <Link style={{borderBottomWidth: 1, borderBottomColor:"#ddd", borderBottomStyle:'solid'}} foreign={true} path="https://images.nasa.gov/</p>" >Image and Video Library</Link>.
            Image attribution can be enabled in the options menu.
          </p>
          <p>Thanks for listening!</p>
          <p style={{paddingTop:100, paddingBottom: 100}}>
            <span style={{fontSize:".75em", fontWeight:"normal"}}>© {Constants.year} {Constants.artist}. All rights reserved.</span>
          </p>
        </div>
      </div>

      {fullyLoaded && (
        <SideMenu />
      )}

      <button style={{position:'absolute', right:0, top:100, width:50, height:50, backgroundColor:"#0004", border:"none" }} onClick={() => State.setStateValue(State.KEYS.DEBUG, true)}></button>
      
    </div>
  );
};


export default Credits;