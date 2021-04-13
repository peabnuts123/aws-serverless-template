
import Logger, { LogLevel } from '@app/util/Logger';

export interface RouterOnChangeArgs {
  previousLocation: Location;
  location: Location;
}

export type OnRouteChangeFunction = (args: RouterOnChangeArgs) => void;

export default class RouteStore {
  private _onRouteChangeCallbacks: OnRouteChangeFunction[];

  public constructor() {
    this._onRouteChangeCallbacks = [];
  }

  public addRouteChangeListener(listenerFunction: OnRouteChangeFunction): void {
    this._onRouteChangeCallbacks.push(listenerFunction);
  }

  public removeRouteChangeListener(listenerFunction: OnRouteChangeFunction): void {
    if (!this._onRouteChangeCallbacks.includes(listenerFunction)) {
      throw new Error("Failed to unsubscribe route change listener - listener function is not currently subscribed. Did you pass the same instance?");
    }

    this._onRouteChangeCallbacks = this._onRouteChangeCallbacks.filter((callback) => callback !== listenerFunction);
  }

  public onRouteChange(args: RouterOnChangeArgs): void {
    Logger.log(LogLevel.debug, "Firing router store onRouteChange", args);
    this._onRouteChangeCallbacks.forEach((callback) => callback(args));
  }
}
