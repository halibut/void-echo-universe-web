import React, { FC, PropsWithChildren, useCallback } from "react";
import { handleAnchorNav, NavigationOptions } from "../contexts/location-context";

interface LinkProps extends PropsWithChildren {
    path:string,
    foreign?:boolean,
    navOptions?:NavigationOptions,
    style?:React.CSSProperties,
    className?:string,
    overrideOnClick?:()=>any,
    beforeNavigation?:()=>any,
}

const Link:FC<LinkProps> = ({
    path,
    foreign,
    navOptions,
    style,
    className,
    children,
    overrideOnClick,
    beforeNavigation,
}) => {

    const handleClick = useCallback((evt:Event) => {
        evt.preventDefault();

        //This is basically a hack for IOS to allow us to interact with an audio element during the user's
        //onclick event, which enables the sound to be automated later by other parts of the app
        if (beforeNavigation) {
            beforeNavigation();
        }

        if (overrideOnClick) {
            overrideOnClick();
        } else {
            handleAnchorNav(path, navOptions);
        }
    }, [path, navOptions, overrideOnClick, beforeNavigation]);

    const additionalProps:{[key:string]:any} = {};

    if (className && className.length > 0) {
        additionalProps.className = className;
    }
    if (style) {
        additionalProps.style = style;
    }
    if (!foreign) {
        //For internal links, override how the link is handled
        additionalProps.onClick = handleClick;
    }
    else {
        //For external links, open them in a new tab
        additionalProps.target = "_blank";
    }


    return (
        <a href={path} {...additionalProps} >{children}</a>
    );

};

export default Link;