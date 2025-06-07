import Subscription from "../service/Subscription";

const printSub = new Subscription<string>("");

export default function debug(msg:string) {
  printSub.notifySubscribers(msg);
  console.log("DEBUG: "+msg);
}

export function subscribeDebugMessages(handler:(msg:string)=>void) {
    return printSub.subscribe(handler);
}
