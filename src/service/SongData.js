import imageCats from "../images/nasa-images-by-category";
import AlbumNotes from "./AlbumNotes";
import Constants from "../constants";
import { VisualizerService } from "../components/Visualizer";
import { Color, Gradient } from "../utils/Color";

function getSongURL(fileName) {
    if (Constants.USE_CDN === true) {
        return `${Constants.CDN_ROOT}${fileName}`;
    } else {
        return `${process.env.PUBLIC_URL}/sounds/${fileName}`;
    }
}

const VIZ = VisualizerService.VISUALIZERS;

const SongData = {
    track00: {
        title: "ambient",
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
                primary: Gradient(128,128,128,1, 0,0,0,2),
                secondary: Color(0,0,0,1),
                gradientTimes: [0, 27.65],
            }},
            {time: 27.65, viz: VIZ.BARS, options:{
                primary: Gradient(255,255,255,1, 32,32,128,1), 
                secondary: Color(0, 0, 64, 0.95), 
                gradientTimes: [27.65, 109.85],
                heightScale: 0.8,
            }},
            {time: 109.85, viz: VIZ.NGON, options:{
                primary: Gradient(255,128,128,2, 128,32,32,2),
                secondary: Color(64, 0, 0, 0.95),
                gradientTimes: [109.85, 199.35],
                numSides: 2
            }},
            {time: 199.35, viz: VIZ.NGON, options:{
                primary: Gradient(128,128,255,2, 32,32,128,2), 
                secondary: Color(64, 0, 64, 0.95),
                gradientTimes: [199.35, 280.6],
                numSides: 3
            }},
            {time: 280.6, viz: VIZ.NGON, options:{
                primary: Gradient(128,255,255,2, 32,128,128,2),
                secondary: Color(0, 64, 64, 0.95),
                gradientTimes: [280.6, 371.1],
                numSides: 4
            }},
            {time: 371.1, viz: VIZ.BLEND_BG, options:{
                primary: Gradient(255,255,255,1, 0,0,0,1),
                secondary: Gradient(255,255,255,1, 0,0,0,1),
                gradientTimes: [371.1, 395],
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
            {time: 0, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1.25), secondary: Color(0, 0, 0, 0.95), heightScale: 0.8,}},
            {time: 98.86, viz: VIZ.BARS, options:{primary: Color(220, 220, 255, 0.95), secondary: Color(0, 0, 64, 0.95), heightScale: 0.8,}},
            {time: 172.31, viz: VIZ.BARS, options:{primary: Color(0, 0, 0, 0.95), secondary: Color(255, 255, 255, 1), heightScale: 0.8,}},
            {time: 207.12, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1), secondary: Color(0, 0, 0, 0.95), heightScale: 0.8,}},
            {time: 272.92, viz: VIZ.BARS, options:{primary: Color(0, 0, 32, 0.95), secondary: Color(255, 200, 200, 0.95), heightScale: 0.8,}},
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
        visualizer: [
            {time: 0, viz: VIZ.BLEND_BG, options:{primary: Color(255,255,255,0.5), secondary: Color(0,0,0,0.5)}},
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
            {time: 70.64, slideTime:20, images: imageCats.forest},
            {time: 240, slideTime:20, images: imageCats.nature.concat(imageCats.planktonBloom)}
        ],
        visualizer: [
            {time: 0, viz: VIZ.ARCS, options:{primary: Color(255, 255, 255, 1.25), secondary: Color(0, 0, 0, 0.95), heightScale: 0.8,}},
            {time: 26.32, viz: VIZ.ARCS, options:{primary: Color(220, 220, 255, 0.95), secondary: Color(0, 0, 64, 0.95), heightScale: 0.8,}},
            {time: 70.64, viz: VIZ.ARCS, options:{primary: Color(0, 0, 0, 0.95), secondary: Color(255, 255, 255, 1), heightScale: 0.8,}},
            {time: 92.79, viz: VIZ.ARCS, options:{primary: Color(255, 255, 255, 1), secondary: Color(0, 0, 0, 0.95), heightScale: 0.8,}},
            {time: 159.24, viz: VIZ.ARCS, options:{primary: Color(0, 0, 32, 0.95), secondary: Color(255, 200, 200, 0.95), heightScale: 0.8,}},
            {time: 181.4 , viz: VIZ.ARCS , options:{primary: Color(220, 220, 255, 0.95), secondary: Color(0, 0, 64, 0.95), heightScale: 0.8,}}, 
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
        notes: AlbumNotes.canopies,
        nasaImages: [
            {time: 0, slideTime:15, images: imageCats.rocketLaunch},
        ],
        visualizer: [
            {time: 0, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1.25), secondary: Color(0, 0, 0, 0.95), heightScale: 1,}},
        ],
        links: {
            bandcamp: "https://google.com",
            spotify: "https://google.com",
        },
    },
    track06: {
        title: "Sapience",
        trackNumber: 6,
        songLength: "5:12",
        songSources: [
            {src: getSongURL("06-sapience.mp3"), type:"audio/mpeg"},
            {src: getSongURL("06-sapience.ogg"), type:"audio/ogg"}
        ],
        notes: AlbumNotes.sapience,
        nasaImages: [
            {time: 0, slideTime:20, images: imageCats.earthFromSpace.concat(imageCats.hurricane)},
            {time: 96.52, slideTime:20, images: imageCats.fire.concat(imageCats.meltingIcecaps, imageCats.naturalDisaster, imageCats.fire, imageCats.flood)},
            {time: 208.5, slideTime:20, images: imageCats.emptySky}
        ],
        visualizer: [
            {time: 0, viz: VIZ.ARCS, options:{primary: Color(220, 220, 255, 1.25), secondary: Color(0, 0, 64, 0.95), heightScale: 0.8,}},
            {time: 16.53, viz: VIZ.ARCS, options:{primary: Color(0, 0, 64, 0.95), secondary: Color(220, 220, 255, 0.95), heightScale: 0.6,}},
            {time: 48.51, viz: VIZ.ARCS, options:{primary: Color(255, 220, 255, 1.25), secondary: Color(0, 64, 64, 0.95), heightScale: 0.8,}},
            {time: 64.52, viz: VIZ.ARCS, options:{primary: Color(0, 64, 64, 0.95), secondary: Color(255, 220, 255, 1.25), heightScale: 0.6,}},
            {time: 96.52, viz: VIZ.ARCS, options:{
                primary: Gradient(255,128,255,1.25, 64,32,32,1.25),
                secondary: Color(0, 0, 0, 0.95),
                gradientTimes: [96.52, 129.47],
                heightScale: 0.8,
            }},
            {time: 129.47, viz: VIZ.ARCS, options:{
                primary: Gradient(64,32,32,0.95, 0, 0, 0, 0.95),
                secondary: Gradient(255,128,255,1.25, 64,32,32,32,1.25),
                gradientTimes: [129.47, 164.51],
                heightScale: 0.6,
            }},
            {time: 164.51, viz: VIZ.ARCS , options:{primary: Color(255, 255, 255, 0.95), secondary: Color(0, 0, 0, 0.95), heightScale: 0.8,}}, 
            {time: 208.5, viz: VIZ.ARCS, options:{
                primary: Gradient(8,8,16,1.25, 16,16,64,1.25),
                secondary: Gradient(128,128,255,0.95, 16,16,128,0.95),
                gradientTimes: [208.5, 240.52],
                heightScale: 0.6,
            }},
            {time: 240.52, viz: VIZ.ARCS, options:{
                primary: Gradient(16,8,16,1.25, 64,16,64,1.25),
                secondary: Gradient(128,255,255,0.95, 16,128,128,0.95),
                gradientTimes: [240.52, 272.52],
                heightScale: 0.6,
            }},
            {time: 272.52, viz: VIZ.ARCS, options:{
                primary: Gradient(16,8,8,1.25, 64,16,16,1.25),
                secondary: Gradient(255,128,128,0.95, 128,0,0,0.95),
                gradientTimes: [272.52, 304],
                heightScale: 0.6,
            }},
            {time: 304, viz: VIZ.BLEND_BG, options:{primary:Color(255,255,255,1), secondary:Color(255,255,255,1), blendMode:'darken'}}
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
        visualizer: [
            {time: 0, viz: VIZ.BLEND_BG, options:{primary: Color(255,255,255,0.5), secondary: Color(0,0,0,0.5)}},
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
            {time: 0, slideTime:30, images: imageCats.redshiftGalaxies.concat(imageCats.eventHorizon)},
        ],
        visualizer: [
            {time: 0, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1.25), secondary: Color(32,32,32, 0.95), heightScale: 0.8,}},
            {time: 18.78, viz: VIZ.BARS, options:{primary: Color(220, 220, 255, 1), secondary: Color(16, 16, 32,0.95), heightScale: 0.8,}},
            {time: 54.78, viz: VIZ.BARS, options:{primary: Color(64, 16, 64, 1), secondary: Color(255, 220, 255, .95), heightScale: 0.8,}},
            {time: 126.79, viz: VIZ.BARS, options:{
                primary: Gradient(255,220,255,1, 255,128,128,1),
                secondary: Gradient(64,16,64,0.95, 64,8,8,0.95),
                gradientTimes: [126.79, 153.18],
                heightScale: 0.8,
            }},
            {time: 153.18, viz: VIZ.BARS, options:{
                primary: Gradient(255,128,128,1, 64,8,8,1),
                secondary: Gradient(64,8,8,0.95, 128,8,128,0.95),
                gradientTimes: [153.18, 201.18],
                heightScale: 0.8,
            }},
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
        visualizer: [
            {time: 0, viz: VIZ.BLEND_BG, options:{primary: Color(255,255,255,0.5), secondary: Color(0,0,0,0.5)}},
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
            {time: 75.24, slideTime:20, images: imageCats.earthFromSpace},
            {time: 139.87, slideTime:20, images: imageCats.eventHorizon},
        ]
        ,visualizer: [
            {time: 0, viz: VIZ.BARS, options:{primary: Color(32,32,32, 0.95), secondary:Color(255, 255, 255, 1.25), heightScale: 1,}},
            {time: 75.24, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1), secondary: Color(32, 8, 8,0.95), heightScale: 1,}},
            {time: 139.87, viz: VIZ.BARS, options:{
                primary: Color(32, 32, 32, 1),
                secondary: Gradient(128,128,255,1, 255,128,128,1),
                gradientTimes: [139.87, 220],
                heightScale: 1,
            }},
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
            {time: 144.08, slideTime:30, images: imageCats.galaxy},
            {time: 298.58, slideTime:20, images: imageCats.emptySky},
        ],
        visualizer: [
            {time: 0, viz: VIZ.ARCS, options:{primary: Color(255,255,255, 1), secondary:Color(0, 0, 0, .95), heightScale: .6,}},
            {time: 72.02, viz: VIZ.BARS, options:{primary: Color(255, 255, 255, 1), secondary: Color(32, 8, 8,0.95), heightScale: .8,}},
            {time: 144.08, viz: VIZ.BLEND_BG, options:{primary: Color(255, 255, 255, .5), secondary: Color(0, 0, 0, 0.5)}},
            {time: 198.87, viz: VIZ.ARCS, options:{primary: Color(0, 0, 0, .95), secondary: Color(255,64,64, 1),  heightScale: .6,}},
            {time: 226.39, viz: VIZ.ARCS, options:{primary: Color(255,64,64, 1), secondary: Color(0, 0, 0, .95),  heightScale: .6,}},
            {time: 247.07, viz: VIZ.BLEND_BG, options:{primary: Color(255, 255, 255, .5), secondary: Color(0, 0, 0, 0.5)}},
            {time: 298.58, viz: VIZ.BARS, options:{primary: Color(128, 128, 255, 1), secondary: Color(8, 8, 64, 0.95), heightScale: 1,}},
            {time: 305.22, viz: VIZ.BARS, options:{primary: Color(8, 8, 64, 0.95), secondary: Color(128, 128, 255, 1), heightScale: 1,}},
            {time: 308.61, viz: VIZ.BARS, options:{primary: Color(128, 255, 255, 1), secondary: Color(8, 64, 64, 0.95), heightScale: 1,}},
            {time: 315.48, viz: VIZ.BARS, options:{primary: Color(8, 64, 64, 0.95), secondary: Color(128, 255, 255, 1), heightScale: 1,}},
            {time: 318.88, viz: VIZ.BARS, options:{primary: Color(255, 128, 128, 1), secondary: Color(64, 8, 8, 0.95), heightScale: 1,}},
            {time: 325.75, viz: VIZ.BARS, options:{primary: Color(64, 8, 8, 0.95), secondary: Color(255, 128, 128, 1), heightScale: 1,}},
            {time: 329.15, viz: VIZ.BARS, options:{primary: Color(128, 128, 128, 1), secondary: Color(0, 0, 0, 0.95), heightScale: 1,}},
            {time: 336.75, viz: VIZ.BARS, options:{primary: Color(0, 0, 0, 0.95), secondary: Color(128, 128, 128, 1), heightScale: 1,}},
            {time: 339.54, viz: VIZ.BLEND_BG, options:{
                primary: Gradient(128,128,128,1, 0,0,0,1),
                secondary: Color(0, 0, 0, 0.0),
                gradientTimes: [339.54, 370],
                blendMode: 'multiply',
            }},
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
        visualizer: [
            {time: 0, viz: VIZ.BLEND_BG, options:{primary: Color(255,255,255,0.5), secondary: Color(0,0,0,0.5)}},
            {time: 92.0, viz: VIZ.BLEND_BG, options:{
                primary: Gradient(255,255,255,0, 0,0,0,1),
                secondary: Gradient(255,255,255,0, 0,0,0,1),
                gradientTimes: [92, 96],
                blendMode: 'multiply',
            }},
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

