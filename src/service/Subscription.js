export default class Subscription {
  constructor(name) {
    this.name = name;
    this.listeners = [];
    this.keyInd = 0;
  }

  notifySubscribers = (event) => {
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

  subscribe = (subscriberFunction) => {
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

  unsubscribe = (subscriberKey) => {
    this.listeners = this.listeners.filter(
      (sub) => sub.subscriberKey !== subscriberKey
    );
  };

  unsubscribeAll = () => {
    this.listeneres = [];
  };
}
