
type SubscriptionListenerData<T> = {
  subscriberKey: number,
  onEvent: (e:T)=>void,
  unsubscribe: ()=>void,
}

export default class Subscription<T> {
  name:string;
  listeners:SubscriptionListenerData<T>[] = [];
  keyInd:number = 0;

  constructor(name:string) {
    this.name = name;
  }

  notifySubscribers = (event:T) => {
    this.listeners.forEach((sub) => {
      try {
        sub.onEvent(event);
      } catch (e) {
        console.log(
          `Error - Subscription[${this.name}](${sub.subscriberKey}) threw an error in its event handler.`,
          e
        );
      }
    });
  };

  subscribe = (subscriberFunction:(e:T)=>void) => {
    this.keyInd += 1;
    const subscriberKey = this.keyInd;

    const sub = {
      subscriberKey: subscriberKey,
      onEvent: subscriberFunction,
      unsubscribe: () => {
        this.unsubscribe(subscriberKey);
      },
    };

    this.listeners.push(sub);

    return sub;
  };

  unsubscribe = (subscriberKey:number) => {
    this.listeners = this.listeners.filter(
      (sub) => sub.subscriberKey !== subscriberKey
    );
  };

  unsubscribeAll = () => {
    this.listeners = [];
  };
}
