export class ColorObj {
    components = new Array(4);
    secondColor = null;

    constructor(r,g,b,a) {
        this.components[0] = Math.max(0, Math.min(r, 255));
        this.components[1] = Math.max(0, Math.min(g, 255));
        this.components[2] = Math.max(0, Math.min(b, 255));
        this.components[3] = a === undefined ? 1 : Math.max(0, Math.min(a, 1));
    }

    /**
     * Create a new color that has a gradient from this color to the new color
     * @param {*} secondColor 
     * @returns a new Color instance
     */
    to = (secondColor) => {
        const newCol = new ColorObj(
            this.components[0],
            this.components[1],
            this.components[2],
            this.components[3],
        )

        newCol.secondColor = secondColor;

        return newCol;
    }

    /**
     * Calculate the linear interpolation between colors in a gradient (if this Color has a gradient, otherwise just returns the color)
     * @param {*} x value from 0 to 1 that represents the position along the linear gradient to calculate 0 being the base color, 1 being the gradient color
     * @returns the interpolated result Color
     */
    getGradientColor = (x) => {
        if (!this.secondColor) {
            return this;
        } else {
            if (x <= 0) {
                return this;
            } else if (x >= 1) {
                return this.secondColor;
            } else {
                const c1 = this.components;
                const c2 = this.secondColor.components;
      
                return new ColorObj(
                    Math.floor(c1[0] + ( x * ( c2[0] - c1[0] ) )),
                    Math.floor(c1[1] + ( x * ( c2[1] - c1[1] ) )),
                    Math.floor(c1[2] + ( x * ( c2[2] - c1[2] ) )),
                    c1[3] + ( x * ( c2[3] - c1[3] ) ),
                );
            }
        } 
    }

    /**
     * 
     * @returns {ColorObj}
     */
    getRGBAColorString = () => {
        return `rgba(${this.components[0]},${this.components[1]},${this.components[2]},${this.components[3]})`;
    }

    /**
     * Multiply the r, g, and b components with the scalar value
     * @param {*} scalar 
     * @returns {ColorObj} returns a new ColorObj
     */
    scalarMultiplyNoAlpha = (scalar) => {
        return new Color(
            this.components[0] * scalar,
            this.components[1] * scalar,
            this.components[2] * scalar,
            this.components[3],
        );
    }

    scalarMultiplyAlphaOnly = (scalar) =>{
        return new Color(
            this.components[0],
            this.components[1],
            this.components[2],
            this.components[3] * scalar,
        )
    }

}

export function Color(r,g,b,a) {
    return new ColorObj(r,g,b,a);
}

export function Gradient(r1,g1,b1,a1, r2,g2,b2,a2) {
    return new ColorObj(r1,g1,b1,a1).to(new ColorObj(r2,g2,b2,a2));
}