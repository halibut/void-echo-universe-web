import { useCallback } from "react";
import { handleAnchorNav } from "../contexts/location-context";


const Link = ({path, navOptions, style, className, children}) => {

    const handleClick = useCallback((evt) => {
        evt.preventDefault();
        handleAnchorNav(path, navOptions);
    }, [path, navOptions]);

    const additionalProps = {};

    if (className && className.length > 0) {
        additionalProps.className = className;
    }
    if (style) {
        additionalProps.style = style;
    }

    return (
        <a href={path} {...additionalProps} onClick={handleClick}>{children}</a>
    );
};

export default Link;