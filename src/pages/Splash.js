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
        <div className='glowing-blur' style={{height:50, width:50, backgroundColor:"#fff", borderRadius:25}}>
        </div>
        <h2 className='glowing'>START</h2>
      </Link>
    </div>
  );
};

export default Splash;