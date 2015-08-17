/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="Complex.ts"/>

/**
 * A 1-jet of a curve.
 */
interface Diff<T>
{
    value: T;
    diff: T;
}

/**
 * Functions for 1-jets that are induced by the real functions.
 */
module DiffReal
{
    export function constant(x: number): Diff<number>
    {
        return {value: x, diff: 0};
    }
    export const ZERO = constant(0);
    export const ONE = constant(1);
    export const MINUS_ONE = constant(-1);
    if (Object.freeze) {
        Object.freeze(ZERO);
        Object.freeze(ONE);
        Object.freeze(MINUS_ONE);
    }
    export function add(x: Diff<number>, y: Diff<number>): Diff<number>
    {
        return {value: x.value + y.value, diff: x.diff + y.diff};
    }
    export function negate(x: Diff<number>): Diff<number>
    {
        return {value: -x.value, diff: -x.diff};
    }
    export function sub(x: Diff<number>, y: Diff<number>): Diff<number>
    {
        return {value: x.value - y.value, diff: x.diff - y.diff};
    }
    export function mul(x: Diff<number>, y: Diff<number>): Diff<number>
    {
        return {value: x.value * y.value, diff: x.value * y.diff + y.value * x.diff};
    }
    export function div(x: Diff<number>, y: Diff<number>): Diff<number>
    {
        if (x.value === 0 && y.value === 0) {
            // Use l'Hospital's rule
            return {value: x.diff / y.diff, diff: NaN};
        } else {
            return {value: x.value / y.value, diff: (x.diff * y.value - y.diff * x.value) / (y.value * y.value)};
        }
    }
    export function recip(x: Diff<number>): Diff<number>
    {
        return {value: 1 / x.value, diff: - x.diff / (x.value * x.value)};
    }
}

/**
 * Functions for 1-jets that are induced by the complex functions.
 */
module DiffComplex
{
    export function constant(x: Complex): Diff<Complex>
    {
        return {value: x, diff: Complex.ZERO};
    }
    export const ZERO = constant(Complex.ZERO);
    export const ONE = constant(Complex.ONE);
    export const MINUS_ONE = constant(Complex.MINUS_ONE);
    export const I = constant(Complex.I);
    if (Object.freeze) {
        Object.freeze(ZERO);
        Object.freeze(ONE);
        Object.freeze(MINUS_ONE);
        Object.freeze(I);
    }
    export function fromReal(x: Diff<number>): Diff<Complex>
    {
        return {value: Complex.fromReal(x.value), diff: Complex.fromReal(x.diff)};
    }
    export function realPart(z: Diff<Complex>): Diff<number>
    {
        return {value: Complex.realPart(z.value), diff: Complex.realPart(z.diff)};
    }
    export function imagPart(z: Diff<Complex>): Diff<number>
    {
        return {value: Complex.imagPart(z.value), diff: Complex.imagPart(z.diff)};
    }
    export function conjugate(z: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.conjugate(z.value), diff: Complex.conjugate(z.diff)};
    }
    export function add(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.add(x.value, y.value), diff: Complex.add(x.diff, y.diff)};
    }
    export function negate(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.negate(x.value), diff: Complex.negate(x.diff)};
    }
    export function sub(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.sub(x.value, y.value), diff: Complex.sub(x.diff, y.diff)};
    }
    export function mul(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.mul(x.value, y.value), diff: Complex.add(Complex.mul(x.value, y.diff), Complex.mul(y.value, x.diff))};
    }
    export function div(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        if (Complex.equals(x.value, Complex.ZERO) && Complex.equals(y.value, Complex.ZERO)) {
            // Use l'Hospital's rule
            return {value: Complex.div(x.diff, y.diff), diff: Complex.NAN};
        } else {
            return {value: Complex.div(x.value, y.value), diff: Complex.div(Complex.sub(Complex.mul(x.diff, y.value), Complex.mul(y.diff, x.value)), Complex.mul(y.value, y.value))};
        }
    }
    export function recip(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.recip(x.value), diff: Complex.div(Complex.negate(x.diff), Complex.mul(x.value, x.value))};
    }
    export function square(z: Diff<Complex>): Diff<Complex>
    {
        return mul(z, z);
    }
    export function mulK(x: Diff<number>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.mulK(x.value, y.value), diff: Complex.add(Complex.mulK(x.value, y.diff), Complex.mulK(x.diff, y.value))};
    }
    export function linearCombination2(a: Diff<number>, z: Diff<Complex>, b: Diff<number>, w: Diff<Complex>): Diff<Complex>
    {
        return add(mulK(a, z), mulK(b, w));
    }
    export function exp(x: Diff<Complex>): Diff<Complex>
    {
        let y = Complex.exp(x.value);
        return {value: y, diff: Complex.mul(y, x.diff)};
    }
    export function powi(z: Diff<Complex>, n: number): Diff<Complex>
    {
        if (n < 0) {
            return recip(powi(z, -n));
        }
        let w = DiffComplex.ONE;
        while (n !== 0) {
            if ((n & 1) === 1) {
                w = mul(w, z);
            }
            z = square(z);
            n >>>= 1;
        }
        return w;
    }
    export function cos(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.cos(x.value), diff: Complex.mul(Complex.negate(Complex.sin(x.value)), x.diff)};
    }
    export function sin(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex.sin(x.value), diff: Complex.mul(Complex.cos(x.value), x.diff)};
    }
    export function tan(x: Diff<Complex>): Diff<Complex>
    {
        let c = Complex.cos(x.value);
        return {value: Complex.tan(x.value), diff: Complex.div(x.diff, Complex.mul(c, c))};
    }
}
