/// <reference path="Complex.ts"/>
/// <reference path="AffineTransform.ts"/>
/// <reference path="UIUtil/pointer.ts"/>
/// <reference path="UIUtil/line.ts"/>
/// <reference path="UIUtil/requestAnimationFrame.ts"/>
/// <reference path="touch.d.ts"/>
/// <reference path="../bower_components/rxjs/ts/rx.d.ts"/>

interface PointerHandler
{
    move?: (z: Complex) => void;
    end?: (z: Complex) => void;
}

interface NRange
{
    min: number;
    max: number;
}

interface PointerWatch
{
    init: Complex;
    source: Rx.Observable<Complex>;
}

class ComplexPlaneView
{
    enableScrolling: boolean = true;
    constructor(
        public canvas: HTMLCanvasElement,
        private _coord: ComplexAffineTransform = ComplexAffineTransform.fromScale(Complex.fromReal(0.35))
    )
    {
        this.onPointerEvent = this.onPointerEvent.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onWheel = this.onWheel.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.attach(canvas);
    }

    private _detachPointerEvent: () => void = null;
    attach(canvas: HTMLCanvasElement)
    {
        this._detachPointerEvent = UIUtil.handlePointerEvent(canvas, this.onPointerEvent, true);
        canvas.addEventListener("keypress", this.onKeyPress, false);
        canvas.addEventListener("wheel", this.onWheel, false);
        window.addEventListener("resize", this.onWindowResize, false);
        this.adjustSize();
    }
    detach()
    {
        if (this._detachPointerEvent) {
            this._detachPointerEvent();
            this._detachPointerEvent = null;
        }
        this.canvas.removeEventListener("keypress", this.onKeyPress, false);
        this.canvas.removeEventListener("wheel", this.onWheel, false);
        window.removeEventListener("resize", this.onWindowResize, false);
    }
    private onWindowResize()
    {
        this.shouldAdjustSize();
        this.refresh();
    }

    startScrolling(x: number, y: number, initialCoord: Complex): UIUtil.PointerHandler
    {
        let pointerLocationSource = new Rx.Subject<Complex>();
        this.addPointer(initialCoord, pointerLocationSource);
        return {
            move: (x, y) => {
                pointerLocationSource.onNext(this.physicalToView(x, y));
            },
            up: (x, y) => {
                pointerLocationSource.onCompleted();
            }
        };
    }

    doHandlePointerEvent(x: number, y: number, initialCoord: Complex)
    {
        return this.startScrolling(x, y, initialCoord);
    }

    private onPointerEvent(x: number, y: number): UIUtil.PointerHandler
    {
        let initialCoord = this.convertFromView(this.physicalToView(x, y));
        return this.doHandlePointerEvent(x, y, initialCoord);
    }

    private onKeyPress(event: KeyboardEvent)
    {
        switch (String.fromCharCode(event.charCode)) {
        case '+':
            this.coord = ComplexAffineTransform.fromScale(Complex.fromReal(1.1)).composite(this.coord);
            break;
        case '-':
            this.coord = ComplexAffineTransform.fromScale(Complex.fromReal(1/1.1)).composite(this.coord);
            break;
        case '0':
            this.coord = ComplexAffineTransform.fromScale(this.coord.scale);
            break;
        case 'n':
            this.coord = ComplexAffineTransform.fromScale(Complex.normalize(Complex.conjugate(this.coord.scale))).composite(this.coord);
            break;
        }
    }

    private onWheel(event: WheelEvent)
    {
        let deltaX = event.deltaX;
        let deltaY = event.deltaY;
        if (event.deltaMode !== 0x00 /* DOM_DELTA_PIXEL */) {
            deltaX *= 10;
            deltaY *= 10;
        }
        this.coord = new ComplexAffineTransform(Complex.ONE, Complex.from(-deltaX, deltaY)).composite(this.coord);
        event.preventDefault();
    }

    scaleFactor: number = 1;
    private _size: number = 1;
    adjustSize()
    {
        let size = this.getSize();
        this.scaleFactor = window.devicePixelRatio || 1;
        this.canvas.width = size.width * this.scaleFactor;
        this.canvas.height = size.height * this.scaleFactor;
        let newSize = Math.min(size.width, size.height);
        let ratio = newSize / this._size;
        this._coord = ComplexAffineTransform.fromScale(Complex.fromReal(ratio)).composite(this._coord);
        this._size = newSize;
    }
    getSize(): { width: number; height: number; }
    {
        let rect = this.canvas.getBoundingClientRect();
        return rect;
    }

    get coord(): ComplexAffineTransform
    {
        return this._coord;
    }
    set coord(value: ComplexAffineTransform)
    {
        if (!this._coord.equals(value)) {
            this._coord = value;
            this.refresh();
        }
    }

    getExternalCoord(): ComplexAffineTransform
    {
        let rect = this.canvas.getBoundingClientRect();
        let size = Math.min(rect.width, rect.height);
        return ComplexAffineTransform.fromScale(Complex.fromReal(size > 0 ? 1/size : 1)).composite(this._coord);
    }

    convertToView(z: Complex): Complex
    {
        return this._coord.transform(z);
    }
    convertFromView(p: Complex): Complex
    {
        return this._coord.untransform(p);
    }
    physicalToView(x: number, y: number): Complex
    {
        let size = this.getSize();
        return Complex.from(x-size.width/2, -y+size.height/2);
    }
    clientToView(o: {clientX: number; clientY: number}): Complex
    {
        let rect = this.canvas.getBoundingClientRect();
        return this.physicalToView(o.clientX-rect.left, o.clientY-rect.top);
    }

    /*
    drawHanddrawn(context: CanvasRenderingContext2D)
    {
        context.save();
        context.lineWidth = 5;
        this._handdrawn.forEach(a => {
            context.strokeStyle = a.color;
            context.beginPath();
            a.components.forEach((p,i) => {
                p.buildPath(context, this._coord, i !== 0);
            });
            context.stroke();
        });
        context.restore();
    }
*/

    public draw()
    {
        let w = this.canvas.width;
        let h = this.canvas.height;
        let context: CanvasRenderingContext2D = this.canvas.getContext("2d");
        context.save();
        context.clearRect(0, 0, w, h);
        context.translate(w/2, h/2);
        context.scale(this.scaleFactor, -this.scaleFactor);
        this.doDraw(context, w/this.scaleFactor, h/this.scaleFactor);
        context.restore();
    }

    doDrawGrid(context: CanvasRenderingContext2D, rect: UIUtil.Rect, realRange: NRange, imagRange: NRange)
    {
        // Draw the grid
        context.save();
        context.strokeStyle = "rgba(128, 128, 128, 64)";
        context.lineWidth = 0.1;
        let a = Math.log10(30/Complex.abs(this._coord.scale));
        let b = a - Math.floor(a);
        let interval = Math.pow(10, Math.floor(a) +
                                (b < Math.log10(2)
                                 ? 0
                                 : b < Math.log10(5)
                                 ? Math.log10(2)
                                 : Math.log10(5)));
        let minReG = Math.ceil(realRange.min/interval);
        let maxReG = Math.floor(realRange.max/interval);
        for (let i = minReG; i <= maxReG; ++i) {
            if (i !== 0) {
                context.beginPath();
                let q = this._coord.transform(Complex.fromReal(i*interval));
                UIUtil.drawLine(context, q, this._coord.transform(Complex.from(i*interval, 1)), false, rect, true, true);
                context.stroke();
            }
        }
        let minImG = Math.ceil(imagRange.min/interval);
        let maxImG = Math.floor(imagRange.max/interval);
        for (let i = minImG; i <= maxImG; ++i) {
            if (i !== 0) {
                context.beginPath();
                let q = this._coord.transform(Complex.fromImag(i*interval));
                UIUtil.drawLine(context, q, this._coord.transform(Complex.from(1, i*interval)), false, rect, true, true);
                context.stroke();
            }
        }
        context.restore();
    }

    doDrawAxes(context: CanvasRenderingContext2D, rect: UIUtil.Rect)
    {
        // Draw the (real, imaginary) axes
        context.save();
        context.beginPath();
        let reLabelPos = UIUtil.drawLine(context, this._coord.transform(Complex.ZERO), this._coord.transform(Complex.ONE), true, rect, true, true);
        let imLabelPos = UIUtil.drawLine(context, this._coord.transform(Complex.ZERO), this._coord.transform(Complex.I), true, rect, true, true);
        context.strokeStyle = "black";
        context.stroke();
        context.scale(1, -1);
        context.font = "13px serif";
        if (reLabelPos) {
            context.fillText("Re", reLabelPos.x-30, 15-reLabelPos.y);
        }
        if (imLabelPos) {
            context.fillText("Im", imLabelPos.x-20, 15-imLabelPos.y);
        }
        context.restore();
    }

    doDrawLabels(context: CanvasRenderingContext2D, rect: UIUtil.Rect, realRange: NRange, imagRange: NRange)
    {
        // Draw the labels
        context.save();
        context.scale(1, -1);
        context.font = "italic 10px STIXGeneral, serif";
        let a = Math.log10(80/Complex.abs(this._coord.scale));
        let b = a - Math.floor(a);
        let interval = Math.pow(10, Math.floor(a) +
                                (b < Math.log10(2)
                                 ? 0
                                 : b < Math.log10(5)
                                 ? Math.log10(2)
                                 : Math.log10(5)));
        let prec = Math.max(0,-Math.floor(Math.log10(interval)));
        {
            let minReL = Math.ceil(realRange.min/interval);
            let maxReL = Math.floor(realRange.max/interval);
            for (let i = minReL; i <= maxReL; ++i) {
                let q = this._coord.transform(Complex.fromReal(i*interval));
                // U+2212: MINUS SIGN
                let s = (i*interval).toFixed(prec).replace("-","\u2212");
                context.fillText(s, q.x, -q.y);
            }
        }
        {
            let minImL = Math.ceil(imagRange.min/interval);
            let maxImL = Math.floor(imagRange.max/interval);
            for (let i = minImL; i <= maxImL; ++i) {
                if (i !== 0) {
                    let q = this._coord.transform(Complex.fromImag(i*interval));
                    let v = i*interval;
                    let t = v.toFixed(prec);
                    // U+2212: MINUS SIGN
                    let s = (v === 1 ? "i" : v === -1 ? "-i" : t+"i").replace("-","\u2212");
                    context.fillText(s, q.x, -q.y);
                }
            }
        }
        context.restore();
    }

    doDrawItems(context: CanvasRenderingContext2D, rect: UIUtil.Rect, realRange: NRange, imagRange: NRange)
    {
        this.doDrawGrid(context, rect, realRange, imagRange);
        this.doDrawAxes(context, rect);
        //this.drawHanddrawn(context);
        this.doDrawLabels(context, rect, realRange, imagRange);
    }

    doDraw(context: CanvasRenderingContext2D, w: number, h: number)
    {
        let rect = {left: -w/2, right: w/2, top: h/2, bottom: -h/2};
        let p0 = this._coord.untransform(Complex.from(-w/2, -h/2));
        let p1 = this._coord.untransform(Complex.from(-w/2, h/2));
        let p2 = this._coord.untransform(Complex.from(w/2, -h/2));
        let p3 = this._coord.untransform(Complex.from(w/2, h/2));
        let realRange = {
            min: Math.min(p0.x, p1.x, p2.x, p3.x),
            max: Math.max(p0.x, p1.x, p2.x, p3.x)
        };
        let imagRange = {
            min: Math.min(p0.y, p1.y, p2.y, p3.y),
            max: Math.max(p0.y, p1.y, p2.y, p3.y)
        };

        this.doDrawItems(context, rect, realRange, imagRange);
    }

    private _willUpdate: boolean = false;
    private _willAdjustSize: boolean = false;
    shouldAdjustSize()
    {
        this._willAdjustSize = true;
    }
    public refresh()
    {
        if (!this._willUpdate) {
            let callback = () => {
                if (this._willAdjustSize) {
                    this.adjustSize();
                    this._willAdjustSize = false;
                }
                this.draw();
                this._willUpdate = false;
            };
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(callback);
            } else {
                setTimeout(callback, 1000/60);
            }
            this._willUpdate = true;
        }
    }

    // Pointer handling
    _pointerHandler: (z: Complex) => PointerHandler;
    private _pointerCurrentAction: Rx.IDisposable = null;
    private _pointers: Array<{init: Complex; source: Rx.Observable<Complex>; disposable: Rx.IDisposable}> = [];
    private addPointer(init: Complex, s: Rx.Observable<Complex>) {
        let o = {init: init, source: s, disposable: <Rx.IDisposable>null};
        this._pointers.push(o);
        s.subscribeOnCompleted(() => {
            let i = this._pointers.indexOf(o);
            this._pointers.splice(i, 1);
            if (i < 2) {
                if (this._pointers.length >= 2) {
                    if (this._pointers[1].disposable) {
                        this._pointers[1].disposable.dispose();
                        this._pointers[1].disposable = null;
                    }
                    this.pointerAction2(this._pointers[0], this._pointers[1]);
                } else if (this._pointers.length === 1) {
                    this._pointerCurrentAction = this.pointerAction1(this._pointers[0]);
                }
            }
        });
        if (this._pointers.length === 1) {
            this._pointerCurrentAction = this.pointerAction1(this._pointers[0]);
        } else if (this._pointers.length === 2) {
            if (this._pointerCurrentAction) {
                this._pointerCurrentAction.dispose();
                this._pointerCurrentAction = null;
            }
            this.pointerAction2(this._pointers[0], this._pointers[1]);
        } else {
            o.disposable = s.subscribe(v => {
                o.init = this.convertFromView(v);
            });
        }
    }
    private pointerAction1(o: PointerWatch): Rx.IDisposable
    {
        return o.source.subscribe(p => {
            this.coord = ComplexAffineTransform.fromPointAndScale(o.init, p, this._coord.scale);
        });
    }
    private pointerAction2(o1: PointerWatch, o2: PointerWatch): Rx.IDisposable
    {
        return o1.source.zip(o2.source, (p1, p2) => [p1, p2]).subscribe(p => {
            let p1 = p[0];
            let p2 = p[1];
            this.coord = ComplexAffineTransform.fromPoints(o1.init, p1, o2.init, p2);
        });
    }
}

/*
window.addEventListener("load", () => {
    var viewArea = document.getElementById("view-area");
    var adjustSize = () => {
        var rect = viewArea.getBoundingClientRect();
        var top = rect.top + window.pageYOffset;
        var clientHeight = document.body.clientHeight;
        viewArea.style.height = (clientHeight - top).toString() + "px";
    };
    adjustSize();
    window.addEventListener("resize", adjustSize, false);
}, false);
*/
