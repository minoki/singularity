// Polyfills for ES6 Math methods

interface Math
{
    sign(x: number): number;
    hypot(...value: number[]): number;
    expm1(x: number): number;
    //log1p(x: number): number;
    cosh(x: number): number;
    sinh(x: number): number;
    tanh(x: number): number;
    acosh(x: number): number;
    asinh(x: number): number;
    atanh(x: number): number;
    log10(x: number): number;
}

if (!Math.sign) {
    Math.sign = function(x: number): number
    {
        if (isNaN(x)) {
            return NaN;
        } else if (x === 0) {
            return x;
        } else {
            return x > 0 ? 1 : -1;
        }
    };
}

if (!Math.hypot) {
    Math.hypot = function(...values: number[]): number
    {
        let y = 0;
        let l = values.length;
        for (let i = 0; i < l; ++i) {
            if (values[i] === Infinity || values[i] === -Infinity) {
                return Infinity;
            }
            y += values[i] * values[i];
        }
        return Math.sqrt(y);
    };
}

if (!Math.expm1) {
    Math.expm1 = function(x: number): number
    {
        if (Math.abs(x) <= 1.28e-5) {
            return x*(1+x/2*(1+x/3));
        } else {
            return Math.exp(x)-1;
        }
    };
}


// Hyperbolic functions and their inverses

if (!Math.cosh) {
    Math.cosh = function(x: number): number
    {
        let e = Math.exp(x);
        return (e + 1/e) / 2;
    };
}

if (!Math.sinh) {
    Math.sinh = function(x: number): number
    {
        if (Math.abs(x) < 1.67e-3) {
            return x*(1+x*x/6);
        } else {
            let e = Math.exp(x);
            return (e - 1/e) / 2;
        }
    };
}

if (!Math.tanh) {
    Math.tanh = function(x: number): number
    {
        if (Math.abs(x) < 1.658e-4) {
            return x*(1-x*x/3);
        } else {
            let ee = Math.exp(2*x);
            if (ee === Infinity) {
                return 1;
            } else {
                // Note: this expression yields the correct value (-1) for x === -Infinity (ee === 0)
                return (ee - 1) / (ee + 1);
            }
        }
    };
}

if (!Math.acosh) {
    Math.acosh = function(x: number): number
    {
        return Math.log(x + Math.sqrt(x*x - 1));
    };
}

if (!Math.asinh) {
    Math.asinh = function(x: number): number
    {
        if (x === -Infinity) {
            return x; // -Infinity
        } else {
            return Math.log(x + Math.sqrt(x*x + 1));
        }
    };
}

if (!Math.atanh) {
    Math.atanh = function(x: number): number
    {
        return Math.log((1 + x)/(1 - x)) / 2;
    };
}

if (!Math.log10) {
    Math.log10 = function(x: number): number
    {
        return Math.log(x) / Math.LN10;
    };
}
