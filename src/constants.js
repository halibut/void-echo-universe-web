
const Constants = {
  title: "EVERYTHING",
  artist: "VOID·ECHO",
  year: 2024,

  NASA_API: "https://images-api.nasa.gov/",

  USE_CDN: process.env.REACT_APP_USE_CDN === "true",
  CDN_ROOT: process.env.REACT_APP_CDN_ROOT,

  BASE_URL: process.env.REACT_APP_BASE_URL,

  links: {
    bandcampAlbumURL: "https://voidecho.bandcamp.com/album/everything",
    spotifyAlbumURL: "",
    email: {url:"mailto:voidechomusic@gmail.com", text:"voidechomusic@gmail.com"},
    twitter: {url:"https://twitter.com/V0ID_ECH0", text:"@V0ID_ECH0"},
    tiktok: {url:"https://www.tiktok.com/@v0id_ech0", text:"@v0id_ech0"},
    instagram: {url:"https://www.instagram.com/v0id_ech0/", text:"@v0id_ech0"},
  }
};

console.log(`ENV:`);
Object.keys(process.env).forEach((key) => {
  console.log(`${key}=${process.env[key]}`);
});

export default Constants;