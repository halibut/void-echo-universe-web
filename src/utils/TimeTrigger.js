
export default class TimeTrigger {
  constructor(options) {
    this.triggerTimes = options.triggerTimes;
    this.lastTriggerTime = -100;
    this.nextTriggerIndex = 0;
  }

  reset = (time) => {
    this.lastTriggerTime = -100;
    this.nextTriggerIndex = 0;

    let nextTime = this.triggerTimes[0];
    while(nextTime < time && this.nextTriggerIndex < this.triggerTimes.length -1) {
      this.lastTriggerTime = nextTime;
      this.nextTriggerIndex += 1;
      nextTime = this.triggerTimes[this.nextTriggerIndex];
    };
  };

  detect = (currentTime) => {
    if(!this.triggerTimes || this.triggerTimes.length === 0) {
      return [];
    }
    
    const retTimes = [];

    let nextTime = this.triggerTimes[this.nextTriggerIndex];
    while(nextTime < currentTime && this.nextTriggerIndex < this.triggerTimes.length -1) {
      this.lastTriggerTime = nextTime;
      this.nextTriggerIndex += 1;
      retTimes.push(nextTime);

      nextTime = this.triggerTimes[this.nextTriggerIndex];
    };

    return retTimes;
  };
}
