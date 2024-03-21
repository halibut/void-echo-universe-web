import { useEffect, useState } from "react";
import SoundService from "../service/SoundService";
import SongData from "../service/SongData";
import Link from "../components/Link";
import Utils from "../utils/Utils";
import { setBackgroundImage } from "../service/BackgroundService";
import SideMenu from "../components/SideMenu";


const Credits = ({isLoadingOut, isLoadingIn, fullyLoaded}) => {

  useEffect(() => {
    setBackgroundImage(require("../images/chapter_00_bg.jpg"), {
      staticStyle: {opacity: 0.3, transform:`scale(3)`},
      imageClass: "spin-bg-slow",
      transitionTime: 3000,
    });

    SoundService.setSound(SongData.track00.songSources, {play:true, loop:true, fadeOutBeforePlay: 2});

    return () => {

    }
  }, []);
  
  return (
    <div className='center' style={{flex:1, width:'100%', paddingBottom:50, overflowY: 'auto'}}>
      <div className='' style={{position:'relative', width:'100%', maxWidth: 600}}>
        <h1 className='title'>Credits</h1>
        

      </div>

      {fullyLoaded && (
        <SideMenu />
      )}
      
      
    </div>
  );
};


export default Credits;