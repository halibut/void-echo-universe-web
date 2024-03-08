import { createContext, useState, useEffect } from "react"

const LocationContext = createContext({path: "/"});

export default LocationContext;

class LocationServiceCls {
    constructor() {
        this.path = "/";

        this.onPathChanged = null;
    }

    handleLocation = (navigationOptions) => {
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

    handleAnchorNav = (path, navigationOptions) => {
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

    setLocation = (path, windowTitle, navigationOptions) => {
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

    init = (pathChangeHandler) => {
        this.onPathChanged = pathChangeHandler;
        window.onpopstate = this.handleLocation;

        this.handleLocation();
    };
}

const LocationService = new LocationServiceCls();

export function handleAnchorNav(path, navigationOptions) {
    LocationService.handleAnchorNav(path, navigationOptions);
};

export function setLocation(path, windowTitle) {
    LocationService.setLocation(path, windowTitle);
};

export function LocationContextProvider({children}) {
    const [location, setLocation] = useState({path:"/", navOptions:{}});

    /** Set-up our location context function when this component loads */
    useEffect(() => {
        const updateState = (path, navOptions) => {
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