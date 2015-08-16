/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="Complex.ts"/>

function integrate(f: (t: number) => Complex, from: number, to: number, N: number = 100): Complex
{
    let d = (to - from) / N;
    let h = d;
    let x = 0, y = 0;
    let v0 = f(from);
    for (let i = 1; i <= N; ++i)
    {
        let v1 = f(from + (i - 0.5) * d);
        let v2 = f(from + i * d);
        x += h * (v0.x + 4 * v1.x + v2.x) / 6;
        y += h * (v0.y + 4 * v1.y + v2.y) / 6;
        v0 = v2;
    }
    return Complex.from(x, y);
}
