/// <reference path="Complex.ts"/>

// Affine transformations of the complex plane
class ComplexAffineTransform
{
    /* As a complex matrix:
     *   /s t\
     *   \0 1/
     */
    /* As a real matrix:
     *   /s.x -s.y t.x\
     *   |s.y  s.x t.y|
     *   \ 0    0   1 /
     */
    constructor(private s: Complex, private t: Complex)
    {
    }

    // s*z+t
    transform(z: Complex): Complex
    {
        return Complex.add(Complex.mul(this.s, z), this.t);
    }

    static Identity = new ComplexAffineTransform(Complex.ONE, Complex.ZERO);

    // Let c = ComplexAffineTransform.fromPoints(p0, q0, p1, q1).
    // c.transform(p0) = q0
    // c.transform(p1) = q1
    static fromPoints(p0: Complex, q0: Complex, p1: Complex, q1: Complex)
    {
        let pd = Complex.sub(p1, p0);
        let qd = Complex.sub(q1, q0);
        let s = Complex.div(qd, pd);
        let t = Complex.div(Complex.sub(Complex.mul(q0, p1), Complex.mul(p0, q1)), pd);
        return new ComplexAffineTransform(s, t);
    }

    // Let c = ComplexAffineTransform.fromPointAndScale(p0, q0, s).
    // c.transform(p0) = q0
    // c.scale = s
    static fromPointAndScale(p0: Complex, q0: Complex, scale: Complex)
    {
        let t = Complex.sub(q0, Complex.mul(p0, scale));
        return new ComplexAffineTransform(scale, t)
    }

    static fromScale(scale: Complex)
    {
        return new ComplexAffineTransform(scale, Complex.ZERO);
    }

    // c.untransform(c.transform(z)) = z
    // c.transform(c.untransform(w)) = w
    untransform(w: Complex): Complex
    {
        return Complex.div(Complex.sub(w, this.t), this.s);
    }

    // c1.composite(c2).transform(p) = c1.transform(c2.transform(p))
    composite(other: ComplexAffineTransform): ComplexAffineTransform
    {
        // (z - origin) * scale = this.transform(other.transform(z))
        //                      = this.transform((z - other.origin) * other.scale)
        //                      = ((z - other.origin) * other.scale - this.origin) * this.scale
        //                      = (z - other.origin - this.origin / other.scale) * other.scale * this.scale
        //                      = (z - (other.origin + this.origin / other.scale)) * (other.scale * this.scale)
        // origin = this.origin / other.scale + other.origin
        // scale = this.scale * other.scale
        return new ComplexAffineTransform(
            Complex.mul(this.s, other.s),
            this.transform(other.t)
        );
    }

    // c.composite(c.inverse()) = Identity
    // c.inverse().composite(c) = Identity
    inverse(): ComplexAffineTransform
    {
        let invs = Complex.recip(this.s);
        return new ComplexAffineTransform(
            invs,
            Complex.negate(Complex.mul(invs, this.t))
        );
    }

    equals(other: ComplexAffineTransform): boolean
    {
        return Complex.equals(this.s, other.s)
            && Complex.equals(this.t, other.t);
    }

    get a() { return this.s.x; }
    get b() { return this.s.y; }
    get c() { return -this.s.y; }
    get d() { return this.s.x; }
    get e() { return this.t.x; }
    get f() { return this.t.y; }

    get scale() { return this.s; }
}
