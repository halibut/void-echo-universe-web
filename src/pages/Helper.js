import blackHole from "../images/artist-black-hole-images";
import planets from "../images/artist-planet-images";
import bigBang from "../images/big-bang-images";
import cmb from "../images/cmb-images";
import earthFromSpace from "../images/earth-from-space-images";
import emptySky from "../images/empty-sky-images";
import eventHorizon from "../images/event-horizon-images";
import exoplanet from "../images/exoplanet-images";
import fire from "../images/fire-images";
import flood from "../images/flood-images";
import forest from "../images/forest-images";
import galaxy from "../images/galaxy-images";
import globalWarming from "../images/global-warming-images";
import hurricane from "../images/hurricane-images";
import meltingIcecaps from "../images/melting-icecaps-images";
import naturalDisaster from "../images/natural-disaster-images";
import nature from "../images/nature-images";
import nebula from "../images/nebula-images";
import planktonBloom from "../images/plankton-bloom-images";
import pollution from "../images/pollution-images";
import redshiftGalaxies from "../images/redshift-galaxies";
import rocketLaunch from "../images/rocket-launch-images";
import sun from "../images/sun-images";
import supermassive from "../images/supermassive-images";
import supernova from "../images/supernova-images";

import { useEffect, useState } from "react";

const HelperPage = ({nav, fullyLoaded}) => {

    useEffect(() => {
        const imgsByCat = {
            blackHole,
            bigBang,
            cmb,
            earthFromSpace,
            emptySky,
            eventHorizon,
            exoplanet,
            fire,
            flood,
            forest,
            galaxy,
            globalWarming,
            hurricane,
            meltingIcecaps,
            naturalDisaster,
            nature,
            nebula,
            planets,
            planktonBloom,
            pollution,
            redshiftGalaxies,
            rocketLaunch,
            sun,
            supermassive,
            supernova
        };

        const imgIdsByCat = {};
        Object.keys(imgsByCat).forEach( (category) => {
            const rawData = imgsByCat[category];
            const ids = rawData.map(d => d.nasaId);

            imgIdsByCat[category] = ids;
        });

        console.log(JSON.stringify(imgIdsByCat));
    }, []);

    return (
        <div className='column' style={{flex:1, width:'100%', height:'100%'}}>
           
            
        </div>
    );
};

export default HelperPage;
