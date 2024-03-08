const convertToFloat = 1 / 256.0;

export default class TransientDetector {
  constructor(options) {
    this.songData = options.songData;
    this.lastTransientTime = -100;
    this.minTimeBetweenTransients = options.minTimeBetweenTransients
      ? options.minTimeBetweenTransients
      : 0.01;
    this.sampleRate = options.sampleRate ? options.sampleRate : 44100;
    this.freqRangeStart = options.freqRangeStart ? options.freqRangeStart : 0;
    this.freqRangeEnd = options.freqRangeEnd
      ? options.freqRangeEnd
      : this.sampleRate;
    this.binStartRatio = this.freqRangeStart / this.sampleRate;
    this.binEndRatio = this.freqRangeEnd / this.sampleRate;
    this.triggerEnergy = options.triggerEnergy ? options.triggerEnergy : 0.8;

    console.log("Bin start: "+(1024 * this.binStartRatio));
    console.log("Bin end: "+(1024 * this.binEndRatio));
  }

  resetTime = (time) => {
    this.lastTransientTime = -100;
  };

  detect = (currentTime, fftData) => {
    const timeSinceLastTransient = currentTime - this.lastTransientTime;
    if (timeSinceLastTransient < this.minTimeBetweenTransients) {
      return false;
    } else {
      const binCount = fftData.length;
      const binStartInd = Math.floor(binCount * this.binStartRatio);
      const binEndInd = Math.min(
        binCount,
        Math.floor(binCount * this.binEndRatio)
      );

      if (binStartInd >= binEndInd) {
        return false;
      }

      let totalEnergy = 0;
      let maxEnergy = 0;
      for (let b = binStartInd; b < binEndInd; b++) {
        const energy = fftData[b] * convertToFloat;
        totalEnergy += energy;
        if(energy > maxEnergy) {
          maxEnergy = energy;
        }
      }

      const avgEnergy = totalEnergy / (binEndInd - binStartInd);

      //console.log(maxEnergy + ' - ' + avgEnergy);

      if (avgEnergy > this.triggerEnergy) {
        this.lastTransientTime = currentTime;
        return true;
      }

      return false;
    }
  };
}
