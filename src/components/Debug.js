import Subscription from "../service/Subscription";

const printSub = new Subscription("");

export default function debug(msg) {
  printSub.notifySubscribers(msg);
  console.log("DEBUG: "+msg);
}

export function subscribeDebugMessages(handler) {
    return printSub.subscribe(handler);
}
