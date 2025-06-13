const InterpFuncs = {
    linear: (x:number) => x,
    quadraticOut: (x:number) => 1 - (1-x)*(1-x),
    cubicOut: (x:number) => 1 - Math.pow(1-x, 3),
    quadradicIn: (x:number) => x*x,
    cubicIn: (x:number) => Math.pow(x, 3),     
    quadraticInOut: (x:number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
    cubicInOut: (x:number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
};

export default InterpFuncs;