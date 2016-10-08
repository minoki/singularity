/*
 * Copyright (c) 2015,2016 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

// Complex number

/// <reference path="../typings/es6-shim/es6-shim.d.ts"/>

type Complex = {x: number; y: number;};

module Complex
{
    const Number_isNaN = Number.isNaN;
    const Number_isFinite = Number.isFinite;
    const Math_sign = Math.sign;
    const Math_abs = Math.abs;
    const Math_exp = Math.exp;
    const Math_expm1 = Math.expm1;
    const Math_log = Math.log;
    const Math_cos = Math.cos;
    const Math_sin = Math.sin;
    const Math_hypot = Math.hypot;
    const Math_atan2 = Math.atan2;
    const Math_sqrt = Math.sqrt;

    export function fromReal(x: number)
    {
        return {x, y: 0};
    }
    export function fromImag(y: number)
    {
        return {x: 0, y};
    }
    export function from(x: number, y: number)
    {
        return {x, y};
    }
    export function fromC(z: Complex, w: Complex)
    {
        // z + i*w
        // Re(z+i*w) = Re(z) - Im(w)
        // Im(z+i*w) = Im(z) + Re(w)
        return {x: z.x - w.y, y: z.y + w.x};
    }

    export const ZERO = from(0, 0);
    export const ONE = from(1, 0);
    export const MINUS_ONE = from(-1, 0);
    export const I = from(0, 1);
    export const MINUS_I = from(0, -1);
    export const NAN = from(NaN, NaN);
    if (Object.freeze) {
        Object.freeze(ZERO);
        Object.freeze(ONE);
        Object.freeze(MINUS_ONE);
        Object.freeze(I);
        Object.freeze(MINUS_I);
        Object.freeze(NAN);
    }

    export function isNaN(z: Complex): boolean
    {
        return !z || Number_isNaN(z.x) || Number_isNaN(z.y);
    }

    export function isFinite(z: Complex): boolean
    {
        return z && Number_isFinite(z.x) && Number_isFinite(z.y);
    }

    export function equals(z: Complex, w: Complex): boolean
    {
        return z.x === w.x && z.y === w.y;
    }

    export function realPart(z: Complex): number
    {
        return z.x;
    }
    export function imagPart(z: Complex): number
    {
        return z.y;
    }
    export function abs(z: Complex): number
    {
        return Math_hypot(z.x, z.y);
    }
    export function distance(z: Complex, w: Complex): number
    {
        return Math_hypot(z.x - w.x, z.y - w.y);
    }
    export function arg(z: Complex): number
    {
        return Math_atan2(z.y, z.x);
    }

    export function conjugate(z: Complex): Complex
    {
        return {x: z.x, y: -z.y};
    }
    export function negate(z: Complex): Complex
    {
        return {x: -z.x, y: -z.y};
    }
    export function recip(z: Complex): Complex
    {
        let x = z.x;
        let y = z.y;
        let m = 1/(x*x+y*y);
        return {x: x*m, y: -y*m};
    }
    export function negateRecip(z: Complex): Complex
    {
        let x = z.x;
        let y = z.y;
        let m = 1/(x*x+y*y);
        return {x: -x*m, y: y*m};
    }

    export function add(z: Complex, w: Complex): Complex
    {
        return {x: z.x + w.x, y: z.y + w.y};
    }
    export function sub(z: Complex, w: Complex): Complex
    {
        return {x: z.x - w.x, y: z.y - w.y};
    }
    export function mul(z: Complex, w: Complex): Complex
    {
        return {x: z.x*w.x-z.y*w.y, y: z.x*w.y+z.y*w.x};
    }
    export function square(z: Complex): Complex
    {
        let x = z.x;
        let y = z.y;
        return {x: x*x-y*y, y: 2*x*y};
    }
    export function mulK(a: number, z: Complex): Complex
    {
        return {x: a * z.x, y: a*z.y};
    }
    export function mulPI(b: number, z: Complex): Complex
    {
        // Re(bi * z) = -b * Im(z)
        // Im(bi * z) = b * Re(z)
        return {x: -b*z.y, y: b*z.x};
    }
    export function linearCombination2(a: number, z: Complex, b: number, w: Complex): Complex
    {
        return {x: a*z.x+b*w.x, y: a*z.y+b*w.y};
    }
    export function linearCombination3(a0: number, z0: Complex, a1: number, z1: Complex, a2: number, z2: Complex): Complex
    {
        return {x: a0*z0.x+a1*z1.x+a2*z2.x, y: a0*z0.y+a1*z1.y+a2*z2.y};
    }
    export function div(z: Complex, w: Complex): Complex
    {
        let x = z.x;
        let y = z.y;
        let o_x = w.x;
        let o_y = w.y;
        let o_m = 1/(o_x*o_x+o_y*o_y);
        if (o_m === Infinity && (x !== 0 || y !== 0)) {
            return {x: Infinity, y: Infinity};
        } else {
            return {x: (x*o_x+y*o_y)*o_m, y: (-x*o_y+y*o_x)*o_m};
        }
    }

    // Complex functions
    export function exp(z: Complex): Complex
    {
        let m = Math_exp(z.x);
        let c = Math_cos(z.y);
        let s = Math_sin(z.y);
        return {x: m*c, y: m*s};
    }
    export function expi(t: number): Complex
    {
        let c = Math_cos(t);
        let s = Math_sin(t);
        return {x: c, y: s};
    }
    export function log(z: Complex): Complex
    {
        return {x: Math_log(Math_hypot(z.x, z.y)), y: Math_atan2(z.y, z.x)};
    }
    /* Branch cut: the negative real axis */
    export function sqrt(z: Complex): Complex
    {
        let a = Math_hypot(z.x, z.y);
        if (a === 0) {
            return ZERO;
        } else {
            if (z.x >= 0) {
                let t = Math_sqrt((z.x + a) * 2);
                return {x: t / 2, y: z.y / t};
            } else { /* z.x < 0 */
                let u = Math_sqrt((a - z.x) * 2);
                let sign = Math_sign(z.y) | Math_sign(1 / z.y);
                return {x: Math_abs(z.y) / u, y: sign * u * 0.5};
            }
        }
    }
    export function cos(z: Complex): Complex
    {
        let t0 = Math_expm1(z.y);
        let t1 = Math_expm1(-z.y);
        let t2 = (t1+t0+2)*Math_cos(z.x);
        let t3 = (t1-t0)*Math_sin(z.x);
        return {x: t2*0.5, y: t3*0.5};
    }
    export function sin(z: Complex): Complex
    {
        let t0 = Math_expm1(z.y);
        let t1 = Math_expm1(-z.y);
        let t2 = (t0-t1)*Math_cos(z.x);
        let t3 = (t0+t1+2)*Math_sin(z.x);
        return {x: t3*0.5, y: t2*0.5};
    }
    export function tan(z: Complex): Complex
    {
        let c = Math_cos(z.x);
        let s = Math_sin(z.x);
        let t3 = Math_expm1(z.y);
        let t0 = Math_expm1(-z.y);
        let t6 = (t0-t3)*c;
        let t7 = (t0+t3+2)*s;
        let t8 = (t0+t3+2)*c;
        let t9 = (t0-t3)*s;
        let t10 = 1/(t8*t8+t9*t9);
        return {x: (t7*t8-t6*t9)*t10, y: -(t6*t8+t7*t9)*t10};
    }
    export function acos(z: Complex): Complex
    {
        /* -i * log(z + i * sqrt(1 - z * z)) */
        let x = z.x;
        let y = z.y;
        let bx = x, by = y;
        {
            // bx + i * by = z + i * sqrt(1 - z * z)
            let mx = 1 - x * x + y * y;
            let my = - 2 * x * y;
            let a = Math_hypot(mx, my);
            if (a !== 0) {
                if (mx >= 0) {
                    let t = Math_sqrt((mx + a) * 2);
                    by += t / 2;
                    bx -= my / t;
                } else { /* mx < 0 */
                    let u = Math_sqrt((a - mx) * 2);
                    let sign = Math_sign(my) | Math_sign(1 / my);
                    by += Math_abs(my) / u;
                    bx -= sign * u * 0.5;
                }
            }
        }
        return {x: Math.atan2(by, bx), y: -Math.log(Math.hypot(bx, by))};
    }
    export function asin(z: Complex): Complex
    {
        let t0 = 1-z.x*z.x+z.y*z.y;
        let t1 = -2*z.x*z.y;
        let t2 = Math_sqrt(2*(t0+Math_hypot(t0,t1)));
        let t3 = -z.y+t2*0.5;
        let t4 = z.x+t1/t2;
        let t5 = Math_log(Math_hypot(t3,t4));
        let t6 = Math_atan2(t4,t3);
        return {x: t6, y: -t5};
    }
    export function atan(z: Complex): Complex
    {
        let t0 = 1-z.y;
        let t1 = 1+z.y;
        let t2 = t1*t1+z.x*z.x;
        let t3 = (t0*t1-z.x*z.x)/t2;
        let t4 = 2*z.x/t2;
        let t5 = Math_log(Math_hypot(t3,t4));
        let t6 = Math_atan2(t4,t3);
        return {x: 0.5*t6, y: -0.5*t5};
    }
    export function cosh(z: Complex): Complex
    {
        let t0 = Math_expm1(z.x);
        let t1 = Math_expm1(-z.x);
        let t2 = (t0+t1+2)*Math_cos(z.y);
        let t3 = (t0-t1)*Math_sin(z.y);
        return {x: t2*0.5, y: t3*0.5};
    }
    export function sinh(z: Complex): Complex
    {
        let t0 = Math_expm1(z.x);
        let t1 = Math_expm1(-z.x);
        let t2 = (t0-t1)*Math_cos(z.y);
        let t3 = (t0+t1+2)*Math_sin(z.y);
        return {x: t2*0.5, y: t3*0.5};
    }
    export function tanh(z: Complex): Complex
    {
        let t0 = Math_expm1(z.x);
        let t1 = Math_expm1(-z.x);
        let cy = Math_cos(z.y);
        let sy = Math_sin(z.y);
        let t6 = (t0-t1)*cy;
        let t7 = (t0+t1+2)*sy;
        let t8 = (t0+t1+2)*cy;
        let t9 = (t0-t1)*sy;
        let t10 = 1/(t8*t8+t9*t9);
        return {x: (t6*t8+t7*t9)*t10, y: (t7*t8-t6*t9)*t10};
    }
    export function acosh(z: Complex): Complex
    {
        let x = z.x;
        let y = z.y;
        let bx = x, by = y;
        {
            // bx + i * by = z + i * sqrt(1 - z * z)
            let mx = 1 - x * x + y * y;
            let my = - 2 * x * y;
            let a = Math_hypot(mx, my);
            let sy = Math_sign(y) | Math_sign(1 / y);
            if (a !== 0) {
                if (mx >= 0) {
                    let t = Math_sqrt((mx + a) * 2);
                    by += sy * t / 2;
                    bx -= sy * my / t;
                } else { /* mx < 0 */
                    let u = Math_sqrt((a - mx) * 2);
                    let sign = Math_sign(my) | Math_sign(1 / my);
                    by += sy * Math_abs(my) / u;
                    bx -= sy * sign * u * 0.5;
                }
            }
        }
        return {x: Math_log(Math_hypot(bx, by)), y: Math_atan2(by, bx)};
    }
    export function asinh(z: Complex): Complex
    {
        let t0 = z.x*z.x-z.y*z.y+1;
        let t1 = 2*z.x*z.y;
        let t2 = Math_sqrt((t0+Math_hypot(t0,t1))*2);
        let t3 = z.x+t2*0.5;
        let t4 = z.y+t1/t2;
        return {x: Math_log(Math_hypot(t3,t4)), y: Math_atan2(t4,t3)};
    }
    export function atanh(z: Complex): Complex
    {
        let t0 = 1+z.x;
        let t1 = 1-z.x;
        let t2 = t1*t1+z.y*z.y;
        let t3 = (t0*t1-z.y*z.y)/t2;
        let t4 = 2*z.y/t2;
        return {x: Math_log(Math_hypot(t3,t4))*0.5, y: Math_atan2(t4,t3)*0.5};
    }
    export function pow(z: Complex, w: Complex): Complex
    {
        return exp(mul(log(z), w));
    }
    export function powi(z: Complex, n: number): Complex
    {
        return powzi(z.x, z.y, n);
    }
    export function powzi(x: number, y: number, n: number): Complex
    {
        if (n < 0) {
            return recip(powzi(x, y, -n));
        }
        let x1 = 1, y1 = 0; // z1 = 1+0i
        while (n !== 0) {
            if ((n & 1) === 1) {
                // z1 = z1*z
                let y1_ = x1*y+y1*x;
                x1 = x1*x-y1*y;
                y1 = y1_;
            }
            // z = z*z
            let y_ = 2*x*y;
            x = x*x-y*y;
            y = y_;
            n >>>= 1;
        }
        return {x: x1, y: y1};
    }

    export function sum(f: (k: number) => Complex, start: number, end: number): Complex
    {
        let x = 0, y = 0;
        // TODO: Use a better algorithm
        for (let k = start; k <= end; ++k) {
            let v = f(k);
            x += v.x;
            y += v.y;
        }
        return {x, y};
    }

    // Vector operation
    export function innerProduct(z: Complex, w: Complex): number
    {
        return z.x*w.x+z.y*w.y;
    }
    export function normalize(z: Complex): Complex
    {
        return mulK(1/abs(z), z);
    }

    export function toString(z: Complex): string
    {
        return "Complex("+z.x.toString()+","+z.y.toString()+")";
    }
}
