import { useEffect, useState } from "react";

import BackgroundService from "../service/BackgroundService";


const Background = () => {

    const [bgImage, setBgImage] = useState(null);

    useEffect(() => {
        BackgroundService.setBgChangeHandler(setBgImage);
    }, [])

    let imgObj = null;
    if (bgImage) {
        imgObj = (<img className='bg-image spin-bg-slow' style={{opacity:0.3}} src={bgImage.src} alt="" />);
    }

    return (
        <div key='bg' className='bg-image' style={{transform:`scale(3)`}}>
            {imgObj}
        </div>
    )
};

export default Background;

