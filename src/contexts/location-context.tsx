import { createContext, useState, useEffect, FC } from "react"

type LocationDataType = {
    path:string|null,
    navOptions:NavigationOptions|null,
}

const LocationContext = createContext<LocationDataType>({path: "/", navOptions:{}});

export default LocationContext;

export type NavigationOptions = {

}

type PathChangedHandler = (path:string, navigationOptions:NavigationOptions|null)=>any

class LocationServiceCls {
    path:string|null = null;
    onPathChanged:PathChangedHandler | null= null;

    constructor() {
        this.path = null;
        this.onPathChanged = null;
    }

    handleLocation = (navigationOptions:NavigationOptions|null) => {
        let p = window.location.pathname;
        if (p.length === 0) {
          p = "/";
        }

        if (p !== this.path) {
            this.path = p;
            if (this.onPathChanged) {
                this.onPathChanged(this.path, navigationOptions);
            }
        }
    }

    handleAnchorNav = (path:string, navigationOptions:NavigationOptions|null) => {
        console.log("Anchor clicked: " + path);

        this.setLocation(path, null, navigationOptions);
    }

    /*
    handleHistoryNav = (evt) => {
        evt = evt || window.event;
        evt.preventDefault();

        const path = evt.LocationContext

        console.log("History nav: " + path);
        this.setLocation(path, null, null);
    }
    */

    setLocation = (path:string, windowTitle:string|null, navigationOptions:NavigationOptions|null) => {
        console.log("Changing location: "+path);
        window.history.pushState({}, "", path);

        if (windowTitle) {
            if (document.title !== windowTitle) {
                document.title = windowTitle;
            }
            //$('meta[name="description"]').attr("content", windowTitle);
        }
        
        this.handleLocation(navigationOptions);
    }

    init = (pathChangeHandler:PathChangedHandler) => {
        this.onPathChanged = pathChangeHandler;
        window.onpopstate = this.handleLocation;

        this.handleLocation({time:0});
    };
}

const LocationService = new LocationServiceCls();

export function handleAnchorNav(path:string, navigationOptions:NavigationOptions|null|undefined) {
    LocationService.handleAnchorNav(path, navigationOptions? navigationOptions : null);
};

export function setLocation(path:string, windowTitle:string|null, navigationOptions:NavigationOptions|null) {
    LocationService.setLocation(path, windowTitle, navigationOptions);
};

export const LocationContextProvider:FC<React.PropsWithChildren> = ({children}) => {
    const [location, setLocation] = useState<LocationDataType>({path:null, navOptions:{}});

    /** Set-up our location context function when this component loads */
    useEffect(() => {
        const updateState = (path:string, navOptions:NavigationOptions|null) => {
            setLocation({path, navOptions});
        };

        LocationService.init(updateState);
    }, []);

    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    );
}