
export default class SegmentTrigger {
  constructor(options) {
    const optSegs = options.segmentTimes ? options.segmentTimes : [];

    this.segmentTimes = optSegs.map((st, ind) => {
      const endTime = ind < optSegs.length - 1 ? optSegs[ind+1].start : 1000;
      return {
        name: st.name,
        start: st.start,
        end: endTime,
        duration: endTime - st.start,
      }
    });

    //console.log("Segments: "+JSON.stringify(this.segmentTimes));

    this.curSegmentInd = -1;
  }

  reset = (currentTime) => {
    this.curSegmentInd = -1;
  };

  forCurrentSegment = (currentTime, doFunc) => {
    if(!this.segmentTimes || this.segmentTimes.length === 0) {
      return [];
    }
    
    let curSeg = this.curSegmentInd >= 0 ? this.segmentTimes[this.curSegmentInd] : null;
    let newSeg = false;
    if(!curSeg || curSeg.end <= currentTime) {
      this.curSegmentInd = this.segmentTimes.findIndex(st => st.start <= currentTime && st.end > currentTime);

      if(this.curSegmentInd >= 0) {
        curSeg = this.segmentTimes[this.curSegmentInd];  
      } 
      newSeg = true;
    }
    
    if(curSeg) {
      doFunc({segment: curSeg, segmentInd:this.curSegmentInd, segmentChanged: newSeg, currentTime: currentTime});
    }
  };
}
