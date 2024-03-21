import imageCats from "../images/nasa-images-by-category";
import AlbumNotes from "./AlbumNotes";
import Constants from "../constants";

function getSongURL(fileName) {
    if (Constants.USE_CDN === true) {
        return `${Constants.CDN_ROOT}${fileName}`;
    } else {
        return require(`../sounds/${fileName}`);
    }
}

const SongData = {
    track00: {
        title: "",
        songSources: [
            //{src: getSongURL("ambient.mp4"), type:"audio/mp4"},
            {src: getSongURL("ambient.mp3"), type:"audio/mpeg"},
            {src: getSongURL("ambient.ogg"), type:"audio/ogg"}
        ],
        notes: "This is a test!",
        nasaImages: [],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track01: {
        title: "The Big Bang",
        trackNumber: 1,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.bigBang,
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.bigBang}
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track02: {
        title: "Cosmic Microwave Background",
        trackNumber: 2,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.cmb,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.cmb.concat(imageCats.redshiftGalaxies)}
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track03: {
        title: "Nebulae",
        trackNumber: 3,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.nebulae,
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.nebula}
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track04: {
        title: "Abiogenesis",
        trackNumber: 4,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.abiogenesis,
        nasaImages: [
            {time: 0, slideTime:20, images: imageCats.earthFromSpace},
            {time: 120, slideTime:20, images: imageCats.forest},
            {time: 240, slideTime:20, images: imageCats.nature.concat(imageCats.planktonBloom)}
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track05: {
        title: "Canopies",
        trackNumber: 5,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: "",
        nasaImages: [
            {time: 0, slideTime:15, images: imageCats.rocketLaunch},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track06: {
        title: "Sapience (Void Echo)",
        trackNumber: 6,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.sapience,
        nasaImages: [
            {time: 0, slideTime:20, images: imageCats.earthFromSpace.concat(imageCats.hurricane)},
            {time: 120, slideTime:20, images: imageCats.fire.concat(imageCats.meltingIcecaps, imageCats.naturalDisaster, imageCats.fire, imageCats.flood)},
            {time: 240, slideTime:20, images: imageCats.emptySky}
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track07: {
        title: "The Relentless March of Time",
        trackNumber: 7,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.relentlessMarch,
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.galaxy},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track08: {
        title: "Red Shift",
        trackNumber: 8,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.redShift,
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.redshiftGalaxies.concat(imageCats.eventHorizon)},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track09: {
        title: "Collapsing Star",
        trackNumber: 9,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.collapsingStar,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.sun},
            {time: 120, slideTime:20, images: imageCats.supernova.concat(imageCats.supermassive)},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track10: {
        title: "One Last Alarm Before the End",
        trackNumber: 10,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.oneLastAlarm,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.exoplanet},
            {time: 90, slideTime:30, images: imageCats.earthFromSpace},
            {time: 180, slideTime:20, images: imageCats.eventHorizon},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track11: {
        title: "Spacetime Will Be Torn Apart",
        trackNumber: 11,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.spacetime,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.supernova},
            {time: 90, slideTime:30, images: imageCats.galaxy},
            {time: 180, slideTime:20, images: imageCats.emptySky},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track12: {
        title: "What Happens Now?",
        trackNumber: 12,
        songLength: "3:45",
        songSources: [
            //{src: getSongURL("01-the-big-bang.mp4"), type:"audio/mp4"},
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.whatHappensNow,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.nebula},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
};

export const SongList = [
    SongData.track01,
    SongData.track02,
    SongData.track03,
    SongData.track04,
    SongData.track05,
    SongData.track06,
    SongData.track07,
    SongData.track08,
    SongData.track09,
    SongData.track10,
    SongData.track11,
    SongData.track12,
];

export default SongData;

