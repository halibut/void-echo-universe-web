const InterpFuncs = {
    linear: (x) => x,
    quadraticOut: (x) => 1 - (1-x)*(1-x),
    cubicOut: (x) => 1 - Math.pow(1-x, 3),
    quadradicIn: (x) => x*x,
    cubicIn: (x) => Math.pow(x, 3),     
    quadraticInOut: (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    cubicInOut: (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
};

export default InterpFuncs;