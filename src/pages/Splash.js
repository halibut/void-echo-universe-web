import Link from '../components/Link';

const Splash = ({isLoadingOut, animOptions}) => {

  let additionalClass = '';
  let style = {flex:1, width:'100%', backgroundColor:"#000"};
  if (isLoadingOut) {
    additionalClass = "disolve-solid-black-bg";
    style.backgroundColor = undefined;
    style.animationDuration = (animOptions?.time ? animOptions.time : 5000) + "ms";
  }

  return (
    <div className={'center '+additionalClass} style={style} >
      <Link path="/title" navOptions={{time:5000}} style={{width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div className='column center color-wheel' style={{maxHeight:"50%", maxWidth:"90%", height:500, width:500}}>
            <img src={require("../images/ve-logo-transparent-1000.png")} style={{width:"100%", height:"100%", objectFit:"contain"}} alt=""/>
        </div>
        <div className='column center' style={{position:'absolute'}}>
            <h3 className='glowing' >START</h3>
        </div>
        
      </Link>
    </div>
  );
};

export default Splash;