import { useCallback } from "react";
import { handleAnchorNav } from "../contexts/location-context";


const Link = ({path, foreign, navOptions, style, className, children, overrideOnClick}) => {

    const handleClick = useCallback((evt) => {
        evt.preventDefault();

        if (overrideOnClick) {
            overrideOnClick();
        } else {
            handleAnchorNav(path, navOptions);
        }
    }, [path, navOptions, overrideOnClick]);

    const additionalProps = {};

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