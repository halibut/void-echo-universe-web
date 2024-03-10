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
    return "/" + name.replace(/[^a-zA-Z0-9]+/ig, "-").toLowerCase()
  };
}

const Utils = new UtilsApi();
export default Utils;