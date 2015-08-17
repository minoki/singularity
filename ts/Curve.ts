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
    constructor(public components: Curve[])
    {
    }
    value(t: number): Complex
    {
        let N = this.components.length;
        let k = Math.floor(t * N);
        if (k === N) {
            k = N - 1;
        }
        return this.components[k].value(t * N - k);
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let N = this.components.length;
        let k = Math.floor(t.value * N);
        if (k === N) {
            k = N - 1;
        }
        return this.components[k].diff({value: t.value * N - k, diff: t.diff * N});
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

class CatmullRomSplineCurve extends SplineCurve
{
    constructor(p: Complex[])
    {
        let n = p.length;
        if (n < 2) {
            super([]);
        } else if (n === 2) {
            super([new Segment(p[0], p[1])]);
        } else {
            let a: Curve[] = [];
            {
                // cp = p[1] + (p[2]-p[0])/4
                let cp = Complex.add(p[1], Complex.mulK(1/4, Complex.sub(p[2], p[0])));
                a.push(new QuadraticBezierCurve(p[0], cp, p[1]));
            }
            for (let i = 1; i < n - 2; ++i) {
                // cp1 = p[i] + (p[i+1]-p[i-1])/6
                // cp2 = p[i+1] - (p[i+2]-p[i])/6
                let cp1 = Complex.add(p[i], Complex.mulK(1/6, Complex.sub(p[i+1], p[i-1])));
                let cp2 = Complex.sub(p[i+1], Complex.mulK(1/6, Complex.sub(p[i+2], p[i])));
                a.push(new CubicBezierCurve(p[i], cp1, cp2, p[i+1]));
            }
            {
                // cp = p[n-2] + (p[n-1]-p[n-3])/4
                let cp = Complex.add(p[n-2], Complex.mulK(1/4, Complex.sub(p[n-1], p[n-3])));
                a.push(new QuadraticBezierCurve(p[n-2], cp, p[n-1]));
            }
            super(a);
        }
    }
}

class ClosedCatmullRomSplineCurve extends SplineCurve
{
    constructor(p: Complex[])
    {
        let n = p.length;
        if (n < 2) {
            super([]);
        } else if (n === 2) {
            super([new Segment(p[0], p[1]), new Segment(p[1], p[0])]);
        } else {
            let a: Curve[] = [];
            for (let i = 0; i < n; ++i) {
                // cp1 = p[i] + (p[i+1]-p[i-1])/6
                // cp2 = p[i+1] - (p[i+2]-p[i])/6
                let cp1 = Complex.add(p[i % n], Complex.mulK(1/6, Complex.sub(p[(i+1) % n], p[(i-1+n) % n])));
                let cp2 = Complex.sub(p[(i+1) % n], Complex.mulK(1/6, Complex.sub(p[(i+2) % n], p[i % n])));
                a.push(new CubicBezierCurve(p[i % n], cp1, cp2, p[(i+1) % n]));
            }
            super(a);
        }
    }
}
