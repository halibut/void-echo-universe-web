import { SongList } from "../service/SongData";

class UtilsApi {
  toSeconds = (string) => {
    const parts = string.split(":");
    const mins = +parts[0];
    const seconds = +parts[1];

    return mins * 60 + seconds;
  };

  fftDataToSmallerArray = (fftData, array, options) => {
    const o = options ? options : {};
    const freqStart = o.freqStart ? o.freqStart : 0;
    const freqEnd = o.freqEnd ? o.freqEnd : 1;

    let i = Math.max(0, Math.min(Math.floor(fftData.length * freqStart), fftData.length-1));
    let j = 0;
    const l1 = Math.max(i, Math.min(Math.floor(fftData.length * freqEnd), fftData.length));
    const l2 = array.length;
    const ratio = l1 / l2;
    while(j < l2) {
      array[j] = 0.0;

      let num = 0.0;
      while(i <= j * ratio && i < l1) {
        const bData = fftData[i];
        if(bData > array[j]) {
          array[j] = bData;
        }
        //array[j] += fftData[i];
        i++;
        //num++;
      }

      if(num) {
        array[j] = array[j] / num;
      }

      j++;
    }
  };

  shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  trackNameToPath = (name) => {
    return "/" + name
      .toLowerCase()
      .replace(/\s+/ig, "-")
      .replace(/[^-a-z0-9]/ig, "")
  };

  formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60);
    let remainderSecs = Math.floor(seconds % 60);

    if (remainderSecs < 10) {
      remainderSecs = "0" + remainderSecs;
    }

    return `${mins}:${remainderSecs}`;
  };

  calculateNextSongPage = (songData, repeat) => {
    const curPageIndex = SongList.findIndex(song => {
      return song.title === songData.title;
    });

    if (curPageIndex === SongList.length - 1) {
      if (repeat) {
        return this.trackNameToPath(SongList[0].title);
      } else {
        return "/main"
      }
    } else {
      return this.trackNameToPath(SongList[curPageIndex+1].title)
    }
  }
  calculatePreviousSongPage = (songData, repeat) => {
    const curPageIndex = SongList.findIndex(song => {
      return song.title === songData.title;
    });

    if (curPageIndex === 0) {
      if (repeat) {
        return this.trackNameToPath(SongList[SongList.length - 1].title);
      } else {
        return "/main"
      }
    } else {
      return this.trackNameToPath(SongList[curPageIndex-1].title)
    }
  }
}

const Utils = new UtilsApi();
export default Utils;