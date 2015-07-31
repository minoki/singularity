/// <reference path="../Complex.ts"/>

module UIUtil
{
    export interface Rect
    {
        left: number;
        right: number;
        top: number;
        bottom: number;
    }

    export function drawLine(context: CanvasRenderingContext2D, z0: Complex, z1: Complex, arrow: boolean, rect: Rect, extendS: boolean, extendE: boolean): Complex
    {
        let d = Complex.sub(z1, z0); // z1 - z0
        let det = z1.x*z0.y-z1.y*z0.x; // = det(z1 z0) = Im(~z1*z0)
        /*
         * A point on the line can be written as
         *   t*(z1 - z0) + z0,
         * where t is a real number.
         */
        let points: Complex[] = [];
        /* If the line is not vertical */
        if (d.x !== 0) {
            /*
             * Let t_L be the parameter for the intersection with the left side of the rectangle.
             * Then, t_L satisfies
             *   Re(t_L*d + z0) = left.
             * Solving this equation gives
             *   t_L = (left - Re z0) / Re d.
             * The y coordinate for the intersection is then
             *   Im(t_L*d + z0)
             *     = t_L * Im d + Im z0
             *     = (left - Re z0) * Im d / Re d + Im z0
             *     = ((left - Re z0) * Im d + Im z0 * Re d) / Re d
             *     = (left * Im d - Re z0 * Im d + Im z0 * Re d) / Re d
             *     = (left * Im d + det(d z0)) / Re d
             *     = (left * Im d + det(z1 z0)) / Re d.
             * The intersection with the right side is given by replacing `left' by `right' in the above expression.
             */
            let t1 = (det+rect.left*d.y)/d.x;
            if (rect.bottom <= t1 && t1 <= rect.top) {
                points.push(Complex.from(rect.left, t1));
            }
            let t2 = (det+rect.right*d.y)/d.x;
            if (rect.bottom <= t2 && t2 <= rect.top) {
                points.push(Complex.from(rect.right, t2));
            }
        }
        /* If the line is not horizontal */
        if (d.y !== 0) {
            /*
             * Let t_T be the parameter for the intersection with the top side of the rectangle.
             * Then, t_T satisfies
             *   Im(t_T*d + z0) = top.
             * Solving this equation gives
             *   t_T = (top - Im z0) / Im d.
             * The x coordinate for the intersection is then
             *   Re(t_T*d + z0)
             *     = t_T * Re d + Re z0
             *     = (top - Im z0) * Re d / Im d + Re z0
             *     = ((top - Im z0) * Re d + Re z0 * Im d) / Im d
             *     = (top * Re d - Im z0 * Re d + Re z0 * Im d) / Im d
             *     = (top * Re d + det(z0 d)) / Im d
             *     = (top * Re d - det(z1 z0)) / Im d.
             * The intersection with the bottom side is given by replacing `top' by `bottom' in the above expression.
             */
            let t1 = (rect.top*d.x-det)/d.y;
            if (rect.left <= t1 && t1 <= rect.right) {
                points.push(Complex.from(t1, rect.top));
            }
            let t2 = (rect.bottom*d.x-det)/d.y;
            if (rect.left <= t2 && t2 <= rect.right) {
                points.push(Complex.from(t2, rect.bottom));
            }
        }
        let v0 = Infinity;
        let p0: Complex = z0;
        let v1 = -Infinity;
        let p1: Complex = z1;
        points.forEach((p: Complex) => {
            let vi = Complex.innerProduct(d, p);

            // v0: minimize
            if (v0 > vi && extendS) {
                p0 = p;
                v0 = vi;
            }

            // v1: maximize
            if (v1 < vi && extendE) {
                p1 = p;
                v1 = vi;
            }
        });
        if (p0 && p1) {
            context.moveTo(p0.x, p0.y);
            context.lineTo(p1.x, p1.y);
            if (arrow) {
                // d*(-1,0.5), d*(-1, -0.5)
                let p2 = Complex.add(p1, Complex.mul(Complex.normalize(d), Complex.from(-8, 4)));
                let p3 = Complex.add(p1, Complex.mul(Complex.normalize(d), Complex.from(-8, -4)));
                context.lineTo(p2.x, p2.y);
                context.moveTo(p1.x, p1.y);
                context.lineTo(p3.x, p3.y);
            }
        }
        return p1;
    }
}
