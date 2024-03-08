import Constants from "../constants";

const Splash = ({nav}) => {

    const next = () => {
      nav.navTo("/title", {time:10000});
    }
  
    return (
      <div className='center' style={{flex:1, width:'100%'}}>
        <div style={{maxWidth:400}}>
          <p>
            <span style={{fontWeight:'bold'}}>{Constants.title} </span>
             is a music experience. Before proceding, you must enable sounds.
          </p>
          <button className='start-button' onClick={next}>
            <span>Enable</span>
          </button>
        </div>
      </div>
    );
  };
  
  export default Splash;