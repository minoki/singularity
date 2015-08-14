/// <reference path="Complex.ts"/>

/**
 * An instance of `ComplexAffineTransform` represents an affine transformation of the complex plane.
 * It has the form \\(z \mapsto sz+t\\) for \\(s\in\mathbf{C}^\times\\) and \\(t\in\mathbf{C}\\).
 * It can be represented as a complex matrix
 * \\[
 *   \begin{pmatrix}
 *     s & t \\\\
 *     0 & 1
 *   \end{pmatrix}
 * \\]
 * or as a real matrix
 * \\[
 *   \begin{pmatrix}
 *     s.x & -s.y & t.x \\\\
 *     s.y &  s.x & t.y \\\\
 *      0  &   0  &  1
 *   \end{pmatrix}
 * \\]
 */
class ComplexAffineTransform
{
    constructor(private s: Complex, private t: Complex)
    {
    }

    /**
     * Transforms a point \\(z\\) in the complex plane to \\(sz+t\\).
     */
    transform(z: Complex): Complex
    {
        return Complex.add(Complex.mul(this.s, z), this.t);
    }

    /**
     * The identity transformation.
     */
    static Identity = new ComplexAffineTransform(Complex.ONE, Complex.ZERO);

    /**
     * Constructs an affine transformation from two pairs of points.
     * The resulting transformation maps `p0` to `q0` and `p1` to `q1`.
     * That is, `c = ComplexAffineTransform.fromPoints(p0, q0, p1, q1)` satisfies
     * * `c.transform(p0) = q0` and
     * * `c.transform(p1) = q1`.
     */
    static fromPoints(p0: Complex, q0: Complex, p1: Complex, q1: Complex)
    {
        let pd = Complex.sub(p1, p0);
        let qd = Complex.sub(q1, q0);
        let s = Complex.div(qd, pd);
        let t = Complex.div(Complex.sub(Complex.mul(q0, p1), Complex.mul(p0, q1)), pd);
        return new ComplexAffineTransform(s, t);
    }

    /**
     * Constructs an affine transformation from a pair of points and a non-zero scale.
     * If we let `c = ComplexAffineTransform.fromPointAndScale(p0, q0, s)`, the following equations hold:
     * * `c.transform(p0) = q0`,
     * * `c.scale = s`.
     */
    static fromPointAndScale(p0: Complex, q0: Complex, scale: Complex)
    {
        let t = Complex.sub(q0, Complex.mul(p0, scale));
        return new ComplexAffineTransform(scale, t)
    }

    /**
     * Construct an affine transformation from a scale.
     * The resulting transformation contains no translation part (i.e. \\(t=0\\)).
     */
    static fromScale(scale: Complex)
    {
        return new ComplexAffineTransform(scale, Complex.ZERO);
    }

    /**
     * Do the inverse transformation.
     * This method satisfies
     * * `c.untransform(c.transform(z)) = z` and
     * * `c.transform(c.untransform(w)) = w`.
     */
    untransform(w: Complex): Complex
    {
        return Complex.div(Complex.sub(w, this.t), this.s);
    }

    /**
     * Composes two affine transformations.
     * This method satisfies
     *   `c1.composite(c2).transform(p) = c1.transform(c2.transform(p))`.
     */
    composite(other: ComplexAffineTransform): ComplexAffineTransform
    {
        return new ComplexAffineTransform(
            Complex.mul(this.s, other.s),
            this.transform(other.t)
        );
    }

    /**
     * Returns the inverse transformation.
     * This method satisfies
     * * `c.composite(c.inverse()) = Identity` and
     * * `c.inverse().composite(c) = Identity`.
     */
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
