
import {LocationContextProvider} from './contexts/location-context';
import './styles/App.css';
import './styles/Content.css';
import './styles/Animations.css';

import Navigator from './components/Navigator';
import NotFound from './pages/NotFound';

import Splash from './pages/Splash';
import Title from './pages/Title';
import Constants from './constants';
import MainMenu from './pages/MainMenu';
import { createTrackPage } from './components/TrackPage';
import SongData from './SongData';
import Utils from './utils/Utils';
import NasaTestPage from './pages/NasaTestPage';
//import Start from '../chapters/Chapter00/Chapter00View';

function createSongScreen(sd) {
  return {
    screen: createTrackPage(sd),
    title: Constants.title+" - "+sd.title,
    path: Utils.trackNameToPath(sd.title),
  }
}

const pages = [
  {screen: Splash, title:Constants.title, path: "/"},
  {screen: Title, title:Constants.title, path:"/title"},
  {screen: MainMenu, title:Constants.title+" - Menu", path:"/main"},
  createSongScreen(SongData.track01),
  createSongScreen(SongData.track02),
  createSongScreen(SongData.track03),
  createSongScreen(SongData.track04),
  createSongScreen(SongData.track05),
  createSongScreen(SongData.track06),
  createSongScreen(SongData.track07),
  createSongScreen(SongData.track08),
  createSongScreen(SongData.track09),
  createSongScreen(SongData.track10),
  createSongScreen(SongData.track11),
  {screen: NasaTestPage, title:"Nasa Test", path:"/nasa"},
]

console.log("App Pages:", JSON.stringify(pages));

function App() {
  return (
    <LocationContextProvider>
      <Navigator screens={pages} NotFoundPage={NotFound} />
    </LocationContextProvider>
  );
}

export default App;
