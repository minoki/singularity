/*
 * Copyright (c) 2016 ARATA Mizuki
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
    const Complex_ZERO = Complex.ZERO;
    const Complex_fromReal = Complex.fromReal;
    const Complex_fromImag = Complex.fromImag;
    const Complex_realPart = Complex.realPart;
    const Complex_imagPart = Complex.imagPart;
    const Complex_conjugate = Complex.conjugate;
    const Complex_add = Complex.add;
    const Complex_negate = Complex.negate;
    const Complex_sub = Complex.sub;
    const Complex_mul = Complex.mul;
    const Complex_recip = Complex.recip;
    const Complex_div = Complex.div;
    const Complex_square = Complex.square;
    const Complex_mulK = Complex.mulK;
    const Complex_mulPI = Complex.mulPI;
    const Complex_exp = Complex.exp;
    const Complex_log = Complex.log;
    const Complex_sqrt = Complex.sqrt;
    const Complex_cos = Complex.cos;
    const Complex_sin = Complex.sin;
    const Complex_tan = Complex.tan;

    export function constant(x: Complex): Diff<Complex>
    {
        return {value: x, diff: Complex_ZERO};
    }
    export const ZERO = constant(Complex_ZERO);
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
        return {value: Complex_fromReal(x.value), diff: Complex_fromReal(x.diff)};
    }
    export function fromImag(x: Diff<number>): Diff<Complex>
    {
        return {value: Complex_fromImag(x.value), diff: Complex_fromImag(x.diff)};
    }
    export function realPart(z: Diff<Complex>): Diff<number>
    {
        return {value: Complex_realPart(z.value), diff: Complex_realPart(z.diff)};
    }
    export function imagPart(z: Diff<Complex>): Diff<number>
    {
        return {value: Complex_imagPart(z.value), diff: Complex_imagPart(z.diff)};
    }
    export function conjugate(z: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_conjugate(z.value), diff: Complex_conjugate(z.diff)};
    }
    export function add(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_add(x.value, y.value), diff: Complex_add(x.diff, y.diff)};
    }
    export function negate(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_negate(x.value), diff: Complex_negate(x.diff)};
    }
    export function sub(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_sub(x.value, y.value), diff: Complex_sub(x.diff, y.diff)};
    }
    export function mul(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_mul(x.value, y.value), diff: Complex_add(Complex_mul(x.value, y.diff), Complex_mul(y.value, x.diff))};
    }
    export function div(x: Diff<Complex>, y: Diff<Complex>): Diff<Complex>
    {
        if (Complex.equals(x.value, Complex.ZERO) && Complex.equals(y.value, Complex.ZERO)) {
            // Use l'Hospital's rule
            return {value: Complex_div(x.diff, y.diff), diff: Complex.NAN};
        } else {
            return {value: Complex_div(x.value, y.value), diff: Complex_div(Complex_sub(Complex_mul(x.diff, y.value), Complex_mul(y.diff, x.value)), Complex_square(y.value))};
        }
    }
    export function recip(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_recip(x.value), diff: Complex_div(Complex_negate(x.diff), Complex_square(x.value))};
    }
    export function square(z: Diff<Complex>): Diff<Complex>
    {
        return mul(z, z);
    }
    export function mulK(x: Diff<number>, y: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_mulK(x.value, y.value), diff: Complex_add(Complex_mulK(x.value, y.diff), Complex_mulK(x.diff, y.value))};
    }
    export function mulPIk(a: number, x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_mulPI(a, x.value), diff: Complex_mulPI(a, x.diff)};
    }
    export function linearCombination2(a: Diff<number>, z: Diff<Complex>, b: Diff<number>, w: Diff<Complex>): Diff<Complex>
    {
        return add(mulK(a, z), mulK(b, w));
    }
    export function exp(x: Diff<Complex>): Diff<Complex>
    {
        let y = Complex_exp(x.value);
        return {value: y, diff: Complex_mul(y, x.diff)};
    }
    export function log(x: Diff<Complex>): Diff<Complex>
    {
        let y = Complex_log(x.value);
        return {value: y, diff: Complex_div(x.diff, x.value)};
    }
    export function sqrt(x: Diff<Complex>): Diff<Complex>
    {
        let y = Complex_sqrt(x.value);
        return {value: y, diff: Complex_mulK(1/2, Complex_div(x.diff, y))};
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
        return {value: Complex_cos(x.value), diff: Complex_mul(Complex_negate(Complex_sin(x.value)), x.diff)};
    }
    export function sin(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_sin(x.value), diff: Complex_mul(Complex_cos(x.value), x.diff)};
    }
    export function tan(x: Diff<Complex>): Diff<Complex>
    {
        return {value: Complex_tan(x.value), diff: Complex_div(x.diff, Complex_square(Complex_cos(x.value)))};
    }
}
