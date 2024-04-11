import { SongList } from "../service/SongData";

class UtilsApi {
  #fftLogBuckets = {

  }

  toSeconds = (string) => {
    const parts = string.split(":");
    const mins = +parts[0];
    const seconds = +parts[1];

    return mins * 60 + seconds;
  };

  /**
   * Gets the average magnitude within low, mid, and high frequency ranges
   * @param {*} fftData Array containing magnitude data
   * @param {*} sampleRate Sample rate of the AudioContext 
   * @param {*} lowFreq The low end of the frequency range
   * @param {*} highFreq The high end of the frequency range
   * @returns a structure containing {low, mid, high} magnitude values
   */
  getFreqRangeAmounts = (fftData, sampleRate, lowFreqCutoff, highFreqCutoff) => {
    const bins = fftData.length;
    const freqsPerBin = sampleRate * .5 / bins;
    const lowBinCutoff = Math.max(1, Math.floor(lowFreqCutoff / freqsPerBin));
    const highBinCutoff = Math.max(lowBinCutoff+1, Math.min(Math.floor(highFreqCutoff / freqsPerBin), bins-1));

    let low = 0;
    for (let i = 0; i < lowBinCutoff; i++) {
      low += fftData[i];
    }
    low = low / lowBinCutoff;

    let mid = 0
    for (let i = lowBinCutoff; i < highBinCutoff; i++) {
      mid += fftData[i];
    }
    mid = mid / (highBinCutoff - lowBinCutoff);

    let high = 0
    for (let i = highBinCutoff; i < bins; i++) {
      high += fftData[i];
    }
    high = high / (bins - highBinCutoff);

    return {
      low,
      mid,
      high,
    };
  }

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

  /**
   * Memoize fft to array logarithmic bucket conversion so that costly
   * calculations can be skipped most frames of animation
   * @param {int} fftDataLength 
   * @param {int} arrayLength 
   */
  #getFftLogBuckets = (fftDataLength, arrayLength) => {
    let fftLengthMemo = this.#fftLogBuckets[fftDataLength];
    if (!fftLengthMemo) {
      fftLengthMemo = {};
      this.#fftLogBuckets[fftDataLength] = fftLengthMemo;
    }

    let bucketsMemo = fftLengthMemo[arrayLength];
    if (!bucketsMemo) {
      bucketsMemo = new Array(arrayLength);

      //calculate the buckets here
      let i = 0;
      let j = 0;
      const l1 = fftDataLength;
      const l2 = arrayLength;
      while(j < l2) {
        const bucketCutoff = (l2) * (Math.exp(((j+1) / l2)/ 0.6932) - 1) 

        while(i <= bucketCutoff && i < l1) {
          i++;
        }
        bucketsMemo[j] = i;

        j++;
      }

      //Finally memoize it for next time it's needed
      fftLengthMemo[arrayLength] = bucketsMemo;
    }

    return bucketsMemo;
  }

  fftDataToSmallerArrayLogarithmic = (fftData, array) => {
    let i = 0;
    let j = 0;
    const l1 = fftData.length;
    const l2 = array.length;

    const fftBuckets = this.#getFftLogBuckets(l1, l2);

    while(j < l2) {
      array[j] = 0.0;

      const bucketCutoff = fftBuckets[j];

      let num = 0.0;
      while(i <= bucketCutoff && i < l1) {
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

    return array;
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
  findPreviousSongData = (songData, repeat) => {
    const curSongIndex = SongList.findIndex(song => {
      return song.title === songData.title;
    });
  
    if (curSongIndex === 0) {
      if (repeat) {
        return SongList[SongList.length - 1];
      } else {
        return null;
      }
    } else {
      return SongList[curSongIndex-1];
    }
  }
  findNextSongData = (songData, repeat) => {
    const curSongIndex = SongList.findIndex(song => {
      return song.title === songData.title;
    });
  
    if (curSongIndex === SongList.length - 1) {
      if (repeat) {
        return SongList[0];
      } else {
        return null;
      }
    } else {
      return SongList[curSongIndex+1];
    }
  }

  /**
   * Calculates a specific color between c1 and c2, based on the place in time
   * @param {*} c1 start color - array of 4 elements
   * @param {*} c2 end color - array of 4 elements
   * @param {*} t1 start time
   * @param {*} t2 end time
   * @param {*} currentTime the time (determins the percent of c1 or c2 returned)
   * @param {*} outputArray optional array to keep the results, if not specified, a new array will be created
   * @returns the output array
   */
  calculateGradientColor = (c1, c2, t1, t2, currentTime, outputArray) => {
    if (currentTime <= t1) {
      return c1;
    } else if (currentTime >= t2) {
      return c2;
    } else {
      const w = t2 - t1;
      const x = currentTime - t1;

      const a = x / w;

      const array = outputArray ? outputArray : new Array(4);
      for (let i = 0; i < 4; i++) {
        array[i] = c1[i] + ( a * (c2[i] - c1[i]) );
        if (i < 3) {
          array[i] = Math.floor(array[i]);
        }
      }

      return array;
    }
  }

  isIOS() {
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  }

}



const Utils = new UtilsApi();
export default Utils;