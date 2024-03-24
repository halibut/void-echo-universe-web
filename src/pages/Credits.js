import { useEffect } from "react";
import SoundService from "../service/SoundService";
import SongData from "../service/SongData";
import Link from "../components/Link";
import { setDefaultBackground } from "../service/BackgroundService";
import SideMenu from "../components/SideMenu";
import Constants from "../constants";
import { VisualizerService } from "../components/Visualizer";


const Credits = ({isLoadingOut, isLoadingIn, fullyLoaded}) => {

  useEffect(() => {
    setDefaultBackground(3000);

    SoundService.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});

    VisualizerService.setVisualizer("blend");

    return () => {

    }
  }, []);
  
  return (
    <div className='center' style={{flex:1, width:'100%', paddingBottom:50, overflowY: 'auto'}}>
      <div className='' style={{position:'relative', width:'100%', maxWidth: 600}}>
        <h1 className='title'>Credits</h1>
        <p>This website and the music of {Constants.title} were created by {Constants.artist}.</p>
        <p>
          All images are publicly available from NASA's &nbsp;
          <Link foreign={true} path="https://images.nasa.gov/</p>" >Image and Video Library</Link>.
          Image attribution can be enabled in the options menu.
        </p>
        <p>Thanks for listening!</p>
        <p style={{paddingTop:100}}>
          <span style={{fontSize:".75em", fontWeight:"normal"}}>© {Constants.year} {Constants.artist}. All rights reserved.</span>
        </p>
      </div>

      {fullyLoaded && (
        <SideMenu />
      )}
      
      
    </div>
  );
};


export default Credits;