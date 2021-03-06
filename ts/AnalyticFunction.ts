/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="Complex.ts"/>
/// <reference path="Diff.ts"/>

interface AnalyticFunction
{
    value(z: Complex): Complex;
    diff(z: Diff<Complex>): Diff<Complex>;
    singularitiesIn(realRange: {min: number; max: number}, imagRange: {min: number; max: number}): Complex[];
}

var WellknownFunctions: {[name: string]: AnalyticFunction;} = {
    "z^2": {
        value: Complex.square,
        diff: DiffComplex.square,
        singularitiesIn: (realRange, imagRange) => []
    },
    "1/z": {
        value: Complex.recip,
        diff: DiffComplex.recip,
        singularitiesIn: (realRange, imagRange) => [Complex.ZERO]
    },
    "1/z^2": {
        value: z => Complex.recip(Complex.square(z)),
        diff: z => DiffComplex.recip(DiffComplex.square(z)),
        singularitiesIn: (realRange, imagRange) => [Complex.ZERO]
    },
    "1/(z^2-1)": {
        value: z => Complex.recip(Complex.sub(Complex.square(z), Complex.ONE)),
        diff: z => DiffComplex.recip(DiffComplex.sub(DiffComplex.square(z), DiffComplex.ONE)),
        singularitiesIn: (realRange, imagRange) => [Complex.ONE, Complex.MINUS_ONE]
    },
    "1/(z^3-1)": {
        value: z => Complex.recip(Complex.sub(Complex.powi(z, 3), Complex.ONE)),
        diff: z => DiffComplex.recip(DiffComplex.sub(DiffComplex.powi(z, 3), DiffComplex.ONE)),
        singularitiesIn: (realRange, imagRange) => [Complex.ONE, Complex.expi(2*Math.PI/3), Complex.expi(4*Math.PI/3)]
    },
    "exp(1/z)": {
        value: z => Complex.exp(Complex.recip(z)),
        diff: z => DiffComplex.exp(DiffComplex.recip(z)),
        singularitiesIn: (realRange, imagRange) => [Complex.ZERO]
    },
    "z/(e^z-1)": {
        value: z => {
            if (Complex.equals(z, Complex.ZERO)) {
                return Complex.ONE;
            } else {
                return Complex.div(z, Complex.sub(Complex.exp(z), Complex.ONE))
            }
        },
        diff: z => {
            if (Complex.equals(z.value, Complex.ZERO)) {
                return {value: Complex.ONE, diff: Complex.mulK(-1/2, z.diff)};
            } else {
                return DiffComplex.div(z, DiffComplex.sub(DiffComplex.exp(z), DiffComplex.ONE));
            }
        },
        singularitiesIn: (realRange, imagRange) => {
            // \{2k\pi i \mid k\in\mathbb{Z}, k\ne 0\}
            const DOUBLE_PI = 2*Math.PI;
            let i = Math.floor(imagRange.min/DOUBLE_PI);
            let j = Math.ceil(imagRange.max/DOUBLE_PI);
            let a: Complex[] = [];
            for (let k = i; k <= j; ++k) {
                if (k !== 0) {
                    a.push(Complex.fromImag(DOUBLE_PI*k));
                }
            }
            return a;
        }
    },
    "tan(z)": {
        value: Complex.tan,
        diff: DiffComplex.tan,
        singularitiesIn: (realRange, imagRange) => {
            // \{(2k+1)\pi/2 i \mid k\in\mathbb{Z}\}
            const HALF_PI = Math.PI/2;
            let i = Math.floor(realRange.min/HALF_PI);
            let j = Math.ceil(realRange.max/HALF_PI);
            let a: Complex[] = [];
            for (let k = i; k <= j; ++k) {
                if (k % 2 === 1 || k % 2 === -1) {
                    a.push(Complex.fromReal(k*HALF_PI));
                }
            }
            return a;
        }
    },
    "z/sin(z)": {
        value: z => {
            if (Complex.equals(z, Complex.ZERO)) {
                return Complex.ONE;
            } else {
                return Complex.div(z, Complex.sin(z));
            }
        },
        diff: z => {
            if (Complex.equals(z.value, Complex.ZERO)) {
                return {value: Complex.ONE, diff: Complex.ZERO};
            } else {
                return DiffComplex.div(z, DiffComplex.sin(z));
            }
        },
        singularitiesIn: (realRange, imagRange) => {
            // \{2k\pi i \mid k\in\mathbb{Z}, k\ne 0\}
            let i = Math.floor(realRange.min/Math.PI);
            let j = Math.ceil(realRange.max/Math.PI);
            let a: Complex[] = [];
            for (let k = i; k <= j; ++k) {
                if (k !== 0) {
                    a.push(Complex.fromReal(Math.PI*k));
                }
            }
            return a;
        }
    },
    "conj(z)": {
        value: Complex.conjugate,
        diff: DiffComplex.conjugate,
        singularitiesIn: (realRange, imagRange) => []
    },
    "(z+conj(z))/2": {
        value: z => Complex.fromReal(Complex.realPart(z)),
        diff: z => DiffComplex.fromReal(DiffComplex.realPart(z)),
        singularitiesIn: (realRange, imagRange) => []
    }
};
