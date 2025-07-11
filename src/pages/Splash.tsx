import { FC } from 'react';
import Link from '../components/Link';
import SongData from '../service/SongData';
import SoundService2 from '../service/SoundService2';
import { CommonScreenProps } from '../components/Navigator';

interface SplashProps extends CommonScreenProps {
}

const Splash:FC<SplashProps> = ({isLoadingOut, animOptions}) => {

  let additionalClass = '';
  let style:{[key:string]:any} = {flex:1, width:'100%', backgroundColor:"#000", animationDuration:"3000ms"};
  if (isLoadingOut) {
    additionalClass = "disolve-solid-black-bg";
    style.backgroundColor = undefined;
    style.animationDuration = (animOptions?.time ? animOptions.time : 5000) + "ms";
  }

  const touchAmbientSong = () => {
    SoundService2.touchSound(SongData.track00.songSources);
  }

  return (
    <div className={'center '+additionalClass} style={style} >
      <Link className={'fade-in'} path="/title" navOptions={{time:5000, transitionInClass: "nothing"}} beforeNavigation={touchAmbientSong} style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', animationDuration:"3000ms"}}>
        <div className='column center color-wheel' style={{maxHeight:"50%", maxWidth:"90%", height:500, width:500, position:'relative'}}>
            <img src={require("../images/ve-logo-ring-1.png")} className="logo-spin-r1" style={{width:"100%", height:"100%", objectFit:"contain", position:'absolute'}} alt=""/>
            <img src={require("../images/ve-logo-ring-2.png")} className="logo-spin-r2" style={{width:"100%", height:"100%", objectFit:"contain", position:'absolute'}} alt=""/>
            <img src={require("../images/ve-logo-ring-3.png")} className="logo-spin-r3" style={{width:"100%", height:"100%", objectFit:"contain", position:'absolute'}} alt=""/>
            <img src={require("../images/ve-logo-ring-4.png")} className="logo-spin-r4" style={{width:"100%", height:"100%", objectFit:"contain", position:'absolute'}} alt=""/>
            <img src={require("../images/ve-logo-ring-5.png")} className="logo-spin-r5" style={{width:"100%", height:"100%", objectFit:"contain", position:'absolute'}} alt=""/>
        </div>
        <div className='column center' style={{position:'absolute'}}>
            <h3 className='glowing' >START</h3>
        </div>
        
      </Link>
    </div>
  );
};

export default Splash;