import imageCats from "../images/nasa-images-by-category";

const SongData = {
    track00: {
        title: "",
        songSources: [
            //{src: require("../sounds/ambient.mp4"), type:"audio/mp4"},
            {src: require("../sounds/ambient.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/ambient.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [],
    },
    track01: {
        title: "The Big Bang",
        trackNumber: 1,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.bigBang}
        ],
    },
    track02: {
        title: "Cosmic Microwave Background",
        trackNumber: 2,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.cmb.concat(imageCats.redshiftGalaxies)}
        ],
    },
    track03: {
        title: "Nebulae",
        trackNumber: 3,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.nebula}
        ],
    },
    track04: {
        title: "Abiogenesis",
        trackNumber: 4,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:20, images: imageCats.earthFromSpace},
            {time: 120, slideTime:20, images: imageCats.forest},
            {time: 240, slideTime:20, images: imageCats.nature.concat(imageCats.planktonBloom)}
        ],
    },
    track05: {
        title: "Canopies",
        trackNumber: 5,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:15, images: imageCats.rocketLaunch},
        ],
    },
    track06: {
        title: "Sapience (Void Echo)",
        trackNumber: 6,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:20, images: imageCats.earthFromSpace.concat(imageCats.hurricane)},
            {time: 120, slideTime:20, images: imageCats.fire.concat(imageCats.meltingIcecaps, imageCats.naturalDisaster, imageCats.fire, imageCats.flood)},
            {time: 240, slideTime:20, images: imageCats.emptySky}
        ],
    },
    track07: {
        title: "The Relentless March of Time",
        trackNumber: 7,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.galaxy},
        ],
    },
    track08: {
        title: "Red Shift",
        trackNumber: 8,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.redshiftGalaxies.concat(imageCats.eventHorizon)},
        ],
    },
    track09: {
        title: "Collapsing Star",
        trackNumber: 9,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.sun},
            {time: 120, slideTime:20, images: imageCats.supernova.concat(imageCats.supermassive)},
        ],
    },
    track10: {
        title: "One Last Alarm Before the End",
        trackNumber: 10,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.exoplanet},
            {time: 90, slideTime:30, images: imageCats.earthFromSpace},
            {time: 180, slideTime:20, images: imageCats.eventHorizon},
        ],
    },
    track11: {
        title: "Spacetime Will Be Torn Apart",
        trackNumber: 11,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.supernova},
            {time: 90, slideTime:30, images: imageCats.galaxy},
            {time: 180, slideTime:20, images: imageCats.emptySky},
        ],
    },
    track12: {
        title: "What Happens Now?",
        trackNumber: 12,
        songLength: "3:45",
        songSources: [
            //{src: require("../sounds/01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: require("../sounds/01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: require("../sounds/01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.nebula},
        ],
    },
};

export default SongData;