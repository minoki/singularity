/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="Complex.ts"/>
/// <reference path="Diff.ts"/>

/**
 * A \\(C^1\\)-curve in the complex plane.
 */
interface Curve
{
    /**
     * The point for the parameter `t`.
     * @param t  a real number between 0 and 1
     */
    value(t: number): Complex;

    /**
     * The point and differential for the parameter `t`.
     */
    diff(t: Diff<number>): Diff<Complex>;

    /**
     * Draws a curve on the given context, assuming the pen is at the starting point of this curve.
     * @param context    The rendering context on which to draw the curve
     * @param transform  an affine transformation
     */
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex): void;

    /**
     * Draws a curve on the given context.
     * @param context    The rendering context on which to draw the curve
     * @param transform  an affine transformation
     */
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex): void;
}

/**
 * A segment.
 *
 * This curve can be expressed as
 * \\[
 *   c(t) = (1-t) \langle\mathtt{start}\rangle
 *          \+  t \langle\mathtt{end}\rangle.
 * \\]
 */
class Segment implements Curve
{
    constructor(public start: Complex,
                public end: Complex
               )
    {
    }
    value(t: number): Complex
    {
        return Complex.linearCombination2(1 - t, this.start, t, this.end);
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let u = DiffReal.sub(DiffReal.ONE, t);
        return DiffComplex.linearCombination2(u, DiffComplex.constant(this.start), t, DiffComplex.constant(this.end));
    }
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let end = transform(this.end);
        context.lineTo(end.x, end.y);
    }
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let start = transform(this.start);
        let end = transform(this.end);
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
    }
}

/**
 * A quadratic bezier curve.
 *
 * This curve can be expressed as
 * \begin{align\*}
 *   c(t) &=      (1-t)^2 \langle\mathtt{start}\rangle
 *           \+ 2 (1-t) t \langle\mathtt{controlPoint}\rangle
 *           \+       t^2 \langle\mathtt{end}\rangle \\\\
 *        &= (1-t) (
 *             (1-t) \langle\mathtt{start}\rangle
 *             \+  t \langle\mathtt{controlPoint}\rangle
 *           )
 *           \+ t (
 *             (1-t) \langle\mathtt{controlPoint}\rangle
 *             \+  t \langle\mathtt{end}\rangle
 *           ).
 * \end{align\*}
 */
class QuadraticBezierCurve implements Curve
{
    constructor(public start: Complex,
                public controlPoint: Complex,
                public end: Complex
               )
    {
    }
    value(t: number): Complex
    {
        let u = 1 - t;
        let p1 = Complex.linearCombination2(u, this.start, t, this.controlPoint);
        let p2 = Complex.linearCombination2(u, this.controlPoint, t, this.end);
        return Complex.linearCombination2(u, p1, t, p2);
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let u = DiffReal.sub(DiffReal.ONE, t);
        let start = DiffComplex.constant(this.start);
        let controlPoint = DiffComplex.constant(this.controlPoint);
        let end = DiffComplex.constant(this.end);
        let p1 = DiffComplex.linearCombination2(u, start, t, controlPoint);
        let p2 = DiffComplex.linearCombination2(u, controlPoint, t, end);
        return DiffComplex.linearCombination2(u, p1, t, p2);
    }
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let controlPoint = transform(this.controlPoint);
        let end = transform(this.end);
        context.quadraticCurveTo(controlPoint.x, controlPoint.y, end.x, end.y);
    }
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let start = transform(this.start);
        let controlPoint = transform(this.controlPoint);
        let end = transform(this.end);
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(controlPoint.x, controlPoint.y, end.x, end.y);
    }
}

/**
 * A quadratic bezier curve.
 *
 * This curve can be expressed as
 * \begin{align\*}
 *   c(t) &=        (1-t)^3 \langle\mathtt{start}\rangle
 *           \+ 3 (1-t)^2 t \langle\mathtt{controlPoint1}\rangle
 *           \+ 3 (1-t) t^2 \langle\mathtt{controlPoint2}\rangle
 *           \+         t^3 \langle\mathtt{end}\rangle \\\\
 *        &= (1-t) (
 *                  (1-t)^2 \langle\mathtt{start}\rangle
 *             \+ 2 (1-t) t \langle\mathtt{controlPoint1}\rangle
 *             \+       t^2 \langle\mathtt{controlPoint2}\rangle
 *           ) \\\\
 *    &\quad \+ t (
 *                   (1-t)^2 \langle\mathtt{controlPoint1}\rangle
 *              \+ 2 (1-t) t \langle\mathtt{controlPoint2}\rangle
 *              \+       t^2 \langle\mathtt{end}\rangle
 *           ).
 * \end{align\*}
 */
class CubicBezierCurve implements Curve
{
    constructor(public start: Complex,
                public controlPoint1: Complex,
                public controlPoint2: Complex,
                public end: Complex
               )
    {
    }
    value(t: number): Complex
    {
        let u = 1 - t;
        let p1 = Complex.linearCombination2(u, this.start, t, this.controlPoint1);
        let p2 = Complex.linearCombination2(u, this.controlPoint1, t, this.controlPoint2);
        let p3 = Complex.linearCombination2(u, this.controlPoint2, t, this.end);
        let q1 = Complex.linearCombination2(u, p1, t, p2);
        let q2 = Complex.linearCombination2(u, p2, t, p3);
        return Complex.linearCombination2(u, q1, t, q2);
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let u = DiffReal.sub(DiffReal.ONE, t);
        let start = DiffComplex.constant(this.start);
        let controlPoint1 = DiffComplex.constant(this.controlPoint1);
        let controlPoint2 = DiffComplex.constant(this.controlPoint2);
        let end = DiffComplex.constant(this.end);
        let p1 = DiffComplex.linearCombination2(u, start, t, controlPoint1);
        let p2 = DiffComplex.linearCombination2(u, controlPoint1, t, controlPoint2);
        let p3 = DiffComplex.linearCombination2(u, controlPoint2, t, end);
        let q1 = DiffComplex.linearCombination2(u, p1, t, p2);
        let q2 = DiffComplex.linearCombination2(u, p2, t, p3);
        return DiffComplex.linearCombination2(u, q1, t, q2);
    }
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let controlPoint1 = transform(this.controlPoint1);
        let controlPoint2 = transform(this.controlPoint2);
        let end = transform(this.end);
        context.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, end.x, end.y);
    }
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        let start = transform(this.start);
        let controlPoint1 = transform(this.controlPoint1);
        let controlPoint2 = transform(this.controlPoint2);
        let end = transform(this.end);
        context.moveTo(start.x, start.y);
        context.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, end.x, end.y);
    }
}

/**
 * A spline curve consists of \\(N\\) components \\(c\_0,\dots,c\_{N-1}\\).
 * These components must satisfy \\(c\_k(1)=c_{k+1}(0)\\) and \\(c\_k'(1)=c\_{k+1}'(0)\\).
 *
 * This curve can be expressed as
 * \\[
 *   c(t) = c\_k(Nt-k) \quad \left(\frac{k}{N} \le t \le \frac{k+1}{N}\right).
 * \\]
 */
class SplineCurve implements Curve
{
    parameters: number[];
    constructor(public components: Curve[], parameters: number[])
    {
        let n = components.length;
        if (parameters.length !== n + 1) {
            throw "SplineCurve: length mismatch";
        }
        let o = parameters[0];
        let w = parameters[n] - o;
        this.parameters = parameters.map(t => (t - o) / w);
    }
    value(t: number): Complex
    {
        let k = 0, kmax = this.components.length; // [k, kmax)
        while (k < kmax - 1) {
            let kt = Math.floor((k + kmax) / 2);
            let tk = this.parameters[kt];
            if (t < tk) {
                kmax = kt;
            } else {
                k = kt;
            }
        }
        let tk = this.parameters[k];
        let tk1 = this.parameters[k + 1];
        return this.components[k].value((t - tk) / (tk1 - tk));
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let k = 0, kmax = this.components.length; // [k, kmax)
        while (k < kmax - 1) {
            let kt = Math.floor((k + kmax) / 2);
            let tk = this.parameters[kt];
            if (t.value < tk) {
                kmax = kt;
            } else {
                k = kt;
            }
        }
        let tk = this.parameters[k];
        let tk1 = this.parameters[k + 1];
        let td = tk1 - tk;
        return this.components[k].diff({value: (t.value - tk) / td, diff: t.diff / td});
    }
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        this.components.forEach(c => {
            c.drawPartial(context, transform);
        });
    }
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex)
    {
        this.components.forEach((c,i) => {
            if (i === 0) {
                c.draw(context, transform);
            } else {
                c.drawPartial(context, transform);
            }
        });
    }
}

function createCatmullRomSplineCurve(p: Complex[], t: number[]): Curve
{
    let n = p.length;
    if (t.length !== n) {
        throw "createCatmullRomSplineCurve: invalid number of parameters";
    }
    if (n === 1) {
        return new Segment(p[0], p[0]);
    } else if (n === 2) {
        return new Segment(p[0], p[1]);
    } else if (n > 2) {
        let a: Curve[] = [];
        {
            let d10 = t[1] - t[0];
            let d20 = t[2] - t[0];
            let d21 = t[2] - t[1];
            let k = d10 / d20 * 0.5;
            let c = d21 / d10;
            let cp = Complex.linearCombination3(d20 / d21 * 0.5, p[1], k*c, p[0], -k/c, p[2]);
            a.push(new QuadraticBezierCurve(p[0], cp, p[1]));
        }
        for (let i = 1; i < n - 2; ++i) {
            let d10 = t[i] - t[i-1];
            let d20 = t[i+1] - t[i-1];
            let d21 = t[i+1] - t[i];
            let d31 = t[i+2] - t[i];
            let d32 = t[i+2] - t[i+1];
            let k1 = d21 / 3 / d20;
            let l1 = d10 / d21;
            let k2 = d21 / 3 / d31;
            let l2 = d32 / d21;
            let cp1 = Complex.linearCombination3((1+d20/d10)/3, p[i], k1*l1, p[i+1], -k1/l1, p[i-1]);
            let cp2 = Complex.linearCombination3((1+d31/d32)/3, p[i+1], k2*l2, p[i], -k2/l2, p[i+2]);
            a.push(new CubicBezierCurve(p[i], cp1, cp2, p[i+1]));
        }
        {
            let d10 = t[n-2] - t[n-3];
            let d20 = t[n-1] - t[n-3];
            let d21 = t[n-1] - t[n-2];
            let k = d21 / d20 * 0.5;
            let c = d10 / d21;
            let cp = Complex.linearCombination3(d20/2/d10, p[n-2], k*c, p[n-1], -k/c, p[n-3]);
            a.push(new QuadraticBezierCurve(p[n-2], cp, p[n-1]));
        }
        return new SplineCurve(a, t);
    } else {
        throw "createCatmullRomSplineCurve: invalid number of points";
    }
}

function createUniformCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [];
    let N = p.length;
    for (let i = 0; i < N; ++i) {
        ts.push(i);
    }
    return createCatmullRomSplineCurve(p, ts);
}

function createChordalCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [0];
    let N = p.length;
    let t = 0;
    for (let i = 0; i < N - 1; ++i) {
        t += Complex.distance(p[i], p[i+1]);
        ts.push(t);
    }
    return createCatmullRomSplineCurve(p, ts);
}

function createCentripetalCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [0];
    let N = p.length;
    let t = 0;
    for (let i = 0; i < N - 1; ++i) {
        t += Math.sqrt(Complex.distance(p[i], p[i+1]));
        ts.push(t);
    }
    return createCatmullRomSplineCurve(p, ts);
}

function createClosedCatmullRomSplineCurve(p: Complex[], t: number[]): Curve
{
    let n = p.length;
    if (t.length !== n + 1) {
        throw "createClosedCatmullRomSplineCurve: invalid number of parameters";
    }
    if (n === 1) {
        return new Segment(p[0], p[0]);
    } else if (n === 2) {
        return new SplineCurve([new Segment(p[0], p[1]), new Segment(p[1], p[0])], [0, 0.5, 1]);
    } else if (n > 2) {
        let a: Curve[] = [];
        let u = [...t, t[n] + t[1] - t[0], t[n] + t[2] - t[0], t[n] + t[3] - t[0]];
        for (let i = 1; i <= n; ++i) {
            let im1 = (i+n-1)%n;
            let ip1 = (i+1)%n;
            let ip2 = (i+2)%n;
            let d10 = u[i] - u[i-1];
            let d20 = u[i+1] - u[i-1];
            let d21 = u[i+1] - u[i];
            let d31 = u[i+2] - u[i];
            let d32 = u[i+2] - u[i+1];
            let k1 = d21 / 3 / d20;
            let l1 = d10 / d21;
            let k2 = d21 / 3 / d31;
            let l2 = d32 / d21;
            let cp1 = Complex.linearCombination3((1+d20/d10)/3, p[i%n], k1*l1, p[ip1], -k1/l1, p[im1]);
            let cp2 = Complex.linearCombination3((1+d31/d32)/3, p[ip1], k2*l2, p[i%n], -k2/l2, p[ip2]);
            a.push(new CubicBezierCurve(p[i%n], cp1, cp2, p[ip1]));
        }
        return new SplineCurve(a, t);
    } else {
        throw "createCatmullRomSplineCurve: invalid number of points";
    }
}

function createClosedUniformCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [0];
    let N = p.length;
    for (let i = 1; i <= N; ++i) {
        ts.push(i);
    }
    return createClosedCatmullRomSplineCurve(p, ts);
}

function createClosedChordalCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [0];
    let N = p.length;
    let t = 0;
    for (let i = 0; i < N; ++i) {
        t += Complex.distance(p[i], p[(i+1) % N]);
        ts.push(t);
    }
    return createClosedCatmullRomSplineCurve(p, ts);
}

function createClosedCentripetalCatmullRomSplineCurve(p: Complex[]): Curve
{
    let ts: number[] = [0];
    let N = p.length;
    let t = 0;
    for (let i = 0; i < N; ++i) {
        t += Math.sqrt(Complex.distance(p[i], p[(i+1) % N]));
        ts.push(t);
    }
    return createClosedCatmullRomSplineCurve(p, ts);
}
