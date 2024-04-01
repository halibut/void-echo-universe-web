import imageCats from "../images/nasa-images-by-category";
import AlbumNotes from "./AlbumNotes";
import Constants from "../constants";
import { VisualizerService } from "../components/Visualizer";
import { Color, Gradient } from "../utils/Color";

function getSongURL(fileName) {
    if (Constants.USE_CDN === true) {
        return `${Constants.CDN_ROOT}${fileName}`;
    } else {
        return require(`../sounds/${fileName}`);
    }
}

const VIZ = VisualizerService.VISUALIZERS;

const SongData = {
    track00: {
        title: "",
        songSources: [
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
        songLength: "6:44",
        songSources: [
            {src: getSongURL("01-the-big-bang.mp3"), type:"audio/mpeg"},
            {src: getSongURL("01-the-big-bang.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.bigBang,
        nasaImages: [
            {time: 0, slideTime:40, images: imageCats.bigBang}
        ],
        visualizer: [
            {time: 0, viz: VIZ.BLEND_BG, options:{
                primary: Gradient(0,0,0,1, 255,255,255,1),
                secondary: Gradient(0,0,0,1, 255,255,255,1),
                gradientTimes: [0, 27.5],
            }},
            {time: 27.5, viz: VIZ.ARCS, options:{primary: Color(220, 220, 255, 0.95), secondary: Color(0, 0, 64, 0.95)}},
            {time: 109.75, viz: VIZ.ARCS, options:{primary: Color(255, 220, 220, 0.95), secondary: Color(64, 0, 0, 0.95)}},
            {time: 199.25, viz: VIZ.ARCS, options:{primary: Color(255, 220, 255, 0.95), secondary: Color(64, 0, 64, 0.95)}},
            {time: 280.7, viz: VIZ.ARCS, options:{primary: Color(220, 255, 255, 0.95), secondary: Color(0, 64, 64, 0.95)}},
            {time: 371, viz: VIZ.BLEND_BG, options:{
                primary: Color(255,255,255,1, 0,0,0,1),
                secondary: Color(255,255,255,1, 0,0,0,1),
                gradientTimes: [371, 400],
            }},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track02: {
        title: "Cosmic Microwave Background",
        trackNumber: 2,
        songLength: "5:17",
        songSources: [
            {src: getSongURL("02-cosmic-microwave-background.mp3"), type:"audio/mpeg"},
            {src: getSongURL("02-cosmic-microwave-background.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.cmb,
        nasaImages: [
            {time: 0, slideTime:30, images: imageCats.cmb.concat(imageCats.redshiftGalaxies)}
        ],
        visualizer: [
            {time: 0, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1), secondary: Color(0, 0, 0, 0.9)}},
            {time: 98.5, viz: VIZ.BARS, options:{primary: Color(220, 220, 255, 0.95), secondary: Color(0, 0, 64, 0.95)}},
            {time: 172.25, viz: VIZ.BARS, options:{primary: Color(0, 0, 0, 0.95), secondary: Color(255, 255, 255, 1)}},
            {time: 207, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1), secondary: Color(0, 0, 0, 0.95)}},
            {time: 272.9, viz: VIZ.BARS, options:{primary: Color(0, 0, 32, 0.95), secondary: Color(255, 200, 200, 0.95)}},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track03: {
        title: "Nebulae",
        trackNumber: 3,
        songLength: "3:42",
        songSources: [
            {src: getSongURL("03-nebulae.mp3"), type:"audio/mpeg"},
            {src: getSongURL("03-nebulae.ogg"), type:"audio/ogg"}
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
        songLength: "4:16",
        songSources: [
            {src: getSongURL("04-abiogenesis.mp3"), type:"audio/mpeg"},
            {src: getSongURL("04-abiogenesis.ogg"), type:"audio/ogg"}
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
        songLength: "0:55",
        songSources: [
            {src: getSongURL("05-canopies.mp3"), type:"audio/mpeg"},
            {src: getSongURL("05-canopies.ogg"), type:"audio/ogg"}
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
        songLength: "5:12",
        songSources: [
            {src: getSongURL("06-sapience.mp3"), type:"audio/mpeg"},
            {src: getSongURL("06-sapience.ogg"), type:"audio/ogg"}
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
        songLength: "5:43",
        songSources: [
            {src: getSongURL("07-relentless-march-of-time.mp3"), type:"audio/mpeg"},
            {src: getSongURL("07-relentless-march-of-time.ogg"), type:"audio/ogg"}
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
        songLength: "3:35",
        songSources: [
            {src: getSongURL("08-red-shift.mp3"), type:"audio/mpeg"},
            {src: getSongURL("08-red-shift.ogg"), type:"audio/ogg"}
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
        songLength: "4:32",
        songSources: [
            {src: getSongURL("09-collapsing-star.mp3"), type:"audio/mpeg"},
            {src: getSongURL("09-collapsing-star.ogg"), type:"audio/ogg"}
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
            {src: getSongURL("10-one-last-alarm-before-the-end.mp3"), type:"audio/mpeg"},
            {src: getSongURL("10-one-last-alarm-before-the-end.ogg"), type:"audio/ogg"}
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
        songLength: "6:13",
        songSources: [
            {src: getSongURL("11-spacetime-will-be-torn-apart.mp3"), type:"audio/mpeg"},
            {src: getSongURL("11-spacetime-will-be-torn-apart.ogg"), type:"audio/ogg"}
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
        songLength: "1:45",
        songSources: [
            {src: getSongURL("12-what-happens-now.mp3"), type:"audio/mpeg"},
            {src: getSongURL("12-what-happens-now.ogg"), type:"audio/ogg"}
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

