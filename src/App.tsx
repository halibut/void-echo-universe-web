
import {LocationContextProvider} from './contexts/location-context';
import './styles/App.css';
import './styles/Content.css';
import './styles/Animations.css';
import './styles/Visualizers.css';

import Navigator, { NavigationScreen } from './components/Navigator';
import NotFound from './pages/NotFound';

import Splash from './pages/Splash';
import Constants from './constants';
import MainMenu from './pages/MainMenu';
import { createTrackPage } from './pages/TrackPage';
import SongData, { TrackDataType } from './service/SongData';
import Utils from './utils/Utils';
import Credits from './pages/Credits';
import Title2 from './pages/Title2';

function createSongScreen(sd:TrackDataType):NavigationScreen {
  return {
    screen: createTrackPage(sd),
    title: Constants.title+" - "+sd.title,
    path: Utils.trackNameToPath(sd.title),
    sound: sd,
  }
}

const pages:NavigationScreen[] = [
  {screen: Splash, title:Constants.title+" - "+Constants.artist, path: "/"},
  {screen: Title2, title:Constants.title, path:"/title", sound:SongData.track00},
  {screen: MainMenu, title:Constants.title+" - Menu", path:"/main", sound:SongData.track00},
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
  createSongScreen(SongData.track12),
  {screen: Credits, title:Constants.title+" - Credits", path:"/credits", sound:SongData.track00},
  //{screen: NasaTestPage, title:"Nasa Test", path:"/nasa"},
  //{screen: HelperPage, title:"helper", path:"/helper"}
]

function App() {
  return (
    <LocationContextProvider>
      <Navigator screens={pages} NotFoundPage={NotFound} />
    </LocationContextProvider>
  );
}

export default App;
