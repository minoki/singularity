/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="Complex.ts"/>
/// <reference path="Diff.ts"/>

interface Curve
{
    value(t: number): Complex;
    diff(t: Diff<number>): Diff<Complex>;
    drawPartial(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex): void;
    draw(context: CanvasRenderingContext2D, transform: (z: Complex) => Complex): void;
}
class Segment implements Curve
{
    // (1-t) * start + t * end
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
class QuadraticBezierCurve implements Curve
{
    // (1-t)^2 * start + 2 * (1-t) * t * controlPoint + t^2 * end
    // (1-t)^2 * start + (1-t) * t * controlPoint + (1-t) * t * controlPoint + t^2 * end
    // (1-t) * ((1-t) * start + t * controlPoint) + t * ((1-t) * controlPoint + t * end)
    constructor(public start: Complex,
                public controlPoint: Complex,
                public end: Complex
               )
    {
    }
    value(t: number): Complex
    {
        let u = 1 - t;
        return Complex.linearCombination2(u, Complex.linearCombination2(u, this.start, t, this.controlPoint), t, Complex.linearCombination2(u, this.controlPoint, t, this.end));
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let u = DiffReal.sub(DiffReal.ONE, t);
        return DiffComplex.linearCombination2(u, DiffComplex.linearCombination2(u, DiffComplex.constant(this.start), t, DiffComplex.constant(this.controlPoint)), t, DiffComplex.linearCombination2(u, DiffComplex.constant(this.controlPoint), t, DiffComplex.constant(this.end)));
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
class CubicBezierCurve implements Curve
{
    // (1-t)^3 * start + 3 * (1-t)^2 * t * controlPoint1 + 3 * (1-t)^2 * t * controlPoint2 + t^3 * end
    // (1-t) * ((1-t)^2 * start + 2 * (1-t) * t * controlPoint1 + t^2 * controlPoint2) + t * ((1-t)^2 * controlPoint1 + 2 * (1-t) * t * controlPoint2 + t^2 * end)
    private part1: QuadraticBezierCurve;
    private part2: QuadraticBezierCurve;
    constructor(public start: Complex,
                public controlPoint1: Complex,
                public controlPoint2: Complex,
                public end: Complex
               )
    {
        this.part1 = new QuadraticBezierCurve(start, controlPoint1, controlPoint2);
        this.part2 = new QuadraticBezierCurve(controlPoint1, controlPoint2, end);
    }
    value(t: number): Complex
    {
        let u = 1 - t;
        return Complex.linearCombination2(u, this.part1.value(t), t, this.part2.value(t));
    }
    diff(t: Diff<number>): Diff<Complex>
    {
        let u = DiffReal.sub(DiffReal.ONE, t);
        return DiffComplex.linearCombination2(u, this.part1.diff(t), t, this.part2.diff(t));
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
class SplineCurve implements Curve
{
    /*
     * c(t) = c_k((t-k)
     */
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
/*
window.addEventListener("load", () => {
    let c = <HTMLCanvasElement>document.getElementById("c");
    let ratio = window.devicePixelRatio;
    {
        let rect = c.getBoundingClientRect();
        c.width = rect.width * ratio;
        c.height = rect.height * ratio;
    }
    let context = c.getContext("2d");
    let points: Point[] = [];
    let draw = () => {
        context.save();
        context.clearRect(0, 0, c.width, c.height);
        context.scale(ratio, ratio);
        if (points.length > 1) {
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; ++i) {
                context.lineTo(points[i].x, points[i].y);
            }
            context.lineWidth = 6;
            context.strokeStyle = "#ccf";
            context.stroke();
        }
        context.beginPath();
        drawSpline(context, points);
        context.lineWidth = 6;
        context.strokeStyle = "navy";
        context.stroke();
        points.forEach(p => {
            context.fillStyle = "white";
            context.beginPath();
            context.arc(p.x, p.y, 2, 0, 2*Math.PI);
            context.fill();
        });
        context.restore();
    };
    let drawing = false;
    c.addEventListener("mousedown", event => {
        let rect = c.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        points = [{x,y}];
        drawing = true;
        draw();
    }, false);
    c.addEventListener("mousemove", event => {
        if (drawing) {
            let rect = c.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            points.push({x,y});
            draw();
        }
    }, false);
    c.addEventListener("mouseup", event => {
        let rect = c.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        drawing = false;
    }, false);
}, false);
*/
