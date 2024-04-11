import { useEffect, useState } from "react";
import Constants from "../constants";
import SoundService2 from "../service/SoundService2";

const SoundCheck = ({onEnabled}) => {
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    if (SoundService2.isSuspended()) {
      setSuspended(true);
    }
  }, []);

  if (!suspended) {
    return null;
  } else {
    return (
      <div style={{position:'absolute', backdropFilter:"blur(5px)", backgroundColor:"#0003",}}>
        <div style={{maxWidth:400}}>
          <p>
            <span style={{fontWeight:'bold'}}>{Constants.title} </span>
             is a music experience. Before proceding, you must enable sounds.
          </p>
          <button className='start-button' onClick={onEnabled}>
            <span>Enable</span>
          </button>
        </div>
      </div>
    );
  }
}
  
export default SoundCheck;
