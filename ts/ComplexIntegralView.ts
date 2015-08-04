/// <reference path="ComplexPlaneView.ts"/>
/// <reference path="Curve.ts"/>
/// <reference path="Integrate.ts"/>
/// <reference path="AnalyticFunction.ts"/>

class ComplexIntegralView extends ComplexPlaneView
{
    constructor(canvas: HTMLCanvasElement, coord?: ComplexAffineTransform)
    {
        super(canvas, coord);
        this.annotation1Text = this.annotation1.textContent;
        this.annotation2Text = this.annotation2.textContent;
    }
    currentCurve: Curve = null;
    private _precHint: number = 0;
    doDrawItems(context: CanvasRenderingContext2D, rect: UIUtil.Rect, realRange: NRange, imagRange: NRange)
    {
        this.doDrawGrid(context, rect, realRange, imagRange);
        this.doDrawAxes(context, rect);
        if (this._function) {
            let singularities = this._function.singularitiesIn(realRange, imagRange);
            context.save();
            singularities.forEach(s => {
                let t = this.convertToView(s);
                context.fillStyle = "white";
                context.beginPath();
                context.arc(t.x, t.y, 5, 0, 2*Math.PI);
                context.fill();
                context.fillStyle = "red";
                context.beginPath();
                context.arc(t.x, t.y, 3, 0, 2*Math.PI);
                context.fill();
            });
            context.restore();
        }
        if (this.currentCurve) {
            context.save();
            context.lineWidth = 3;
            context.strokeStyle = "navy";
            context.beginPath();
            this.currentCurve.draw(context, this.convertToView.bind(this));
            context.stroke();
            context.restore();
        }
        this.doDrawLabels(context, rect, realRange, imagRange);
    }
    doHandlePointerEvent(x: number, y: number): UIUtil.PointerHandler
    {
        let modeDraw = <HTMLInputElement>document.getElementById("mode-draw");
        let modeDrawClosed = <HTMLInputElement>document.getElementById("mode-draw-closed");
        let modeScroll = <HTMLInputElement>document.getElementById("mode-scroll");
        if (modeScroll.checked) {
            return this.startScrolling(x, y);
        } else {
            let initialLocation = this.convertFromView(this.physicalToView(x, y));
            let a: Complex[] = [initialLocation];
            return {
                move: (x, y) => {
                    let z = this.convertFromView(this.physicalToView(x, y));
                    a.push(z);
                    if (modeDrawClosed.checked) {
                        this.currentCurve = new ClosedCatmullRomSplineCurve(a);
                    } else {
                        this.currentCurve = new CatmullRomSplineCurve(a);
                    }
                    this.refresh();
                    this.recalculate(false);
                },
                up: (x, y) => {
                    this._precHint = a.length;
                    this.refresh();
                    this.recalculate(true);
                }
            };
        }
    }

    private _function: AnalyticFunction = null;
    set func(f: AnalyticFunction)
    {
        if (this._function !== f) {
            this._function = f;
            this.refresh();
            this.recalculate(true);
        }
    }

    static complexToMathML(z: Complex)
    {
        const nsMathML = "http://www.w3.org/1998/Math/MathML";
        let mrow = document.createElementNS(nsMathML, "mrow");
        if (z.x !== 0 || z.y === 0)
        {
            // the real part
            if (z.x < 0) {
                let mo = document.createElementNS(nsMathML, "mo");
                mo.appendChild(document.createTextNode("\u2212"));
                mrow.appendChild(mo);
            }
            let mn = document.createElementNS(nsMathML, "mn");
            mn.appendChild(document.createTextNode(Math.abs(z.x).toFixed(5)));
            mrow.appendChild(mn);
        }
        if (z.y !== 0) {
            let mo = document.createElementNS(nsMathML, "mo");
            mo.appendChild(document.createTextNode(z.y >= 0 ? "+" : "\u2212"));
            mrow.appendChild(mo);
            if (Math.abs(z.y) !== 1) {
                let mn = document.createElementNS(nsMathML, "mn");
                mn.appendChild(document.createTextNode(Math.abs(z.y).toFixed(5)));
                mrow.appendChild(mn);
            }
            let mi = document.createElementNS(nsMathML, "mi");
            mi.appendChild(document.createTextNode("i"));
            mrow.appendChild(mi);
        }
        return mrow;
    }

    static complexToString(z: Complex)
    {
        let a: string[] = [];
        if (z.x !== 0 || z.y === 0)
        {
            // the real part
            a.push(z.x.toFixed(5));
        }
        if (z.y !== 0) {
            a.push(z.y >= 0 ? "+" : "-");
            if (Math.abs(z.y) !== 1) {
                a.push(Math.abs(z.y).toFixed(5));
            }
            a.push("i");
        }
        return a.join("");
    }

    private annotation1 = document.getElementById("annotation1");
    private annotation1Text: string;
    private annotation2 = document.getElementById("annotation2");
    private annotation2Text: string;
    recalculate(highPrec: boolean)
    {
        if (this._function && this.currentCurve) {
            let f = this._function.value;
            let c = this.currentCurve;
            let g = (t: number) => {
                let ct = c.diff({value: t, diff: 1});
                return Complex.mul(f(ct.value), ct.diff);
            };
            let v = integrate(g, 0, 1, highPrec ? 100*Math.max(this._precHint, 10) : 100);
            {
                let m1 = ComplexIntegralView.complexToMathML(v);
                let s1 = ComplexIntegralView.complexToString(v);
                let v1 = document.getElementById("value1");
                if (v1) {
                    while (v1.hasChildNodes()) {
                        v1.removeChild(v1.firstChild);
                    }
                    v1.appendChild(m1);
                }
                if (this.annotation1) {
                    while (this.annotation1.hasChildNodes()) {
                        this.annotation1.removeChild(this.annotation1.firstChild);
                    }
                    this.annotation1.appendChild(document.createTextNode(this.annotation1Text.replace("###", s1)));
                }
            }
            let v_2pii = Complex.div(v, Complex.fromImag(2*Math.PI));
            {
                let m2 = ComplexIntegralView.complexToMathML(v_2pii);
                let s2 = ComplexIntegralView.complexToString(v_2pii);
                let v2 = document.getElementById("value2");
                if (v2) {
                    while (v2.hasChildNodes()) {
                        v2.removeChild(v2.firstChild);
                    }
                    v2.appendChild(m2);
                }
                if (this.annotation2) {
                    while (this.annotation2.hasChildNodes()) {
                        this.annotation2.removeChild(this.annotation2.firstChild);
                    }
                    this.annotation2.appendChild(document.createTextNode(this.annotation2Text.replace("###", s2)));
                }
            }
        }
    }
}
