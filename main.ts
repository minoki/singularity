/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="ts/ComplexIntegralView.ts"/>

var theView: ComplexIntegralView | undefined;
window.addEventListener("DOMContentLoaded", () => {
    let canvas = <HTMLCanvasElement>document.getElementById("plane");
    let view = new ComplexIntegralView(canvas);
    window.addEventListener("load", () => {
        view.adjustSize();
        view.refresh();
    }, false);
    theView = view;
    let functionRadioButtons: HTMLInputElement[] = Array.prototype.filter.call(document.getElementsByName("function"), (e: HTMLElement) => e.tagName === "input" && e.getAttribute("type") === "radio");
    functionRadioButtons.forEach(b => {
        let functionName = b.value;
        let func = WellknownFunctions[functionName];
        if (!func) {
            console.error("function " + functionName + " not found");
        } else {
            if (b.checked) {
                view.function = func;
            }
            b.addEventListener("change", () => {
                if (b.checked) {
                    view.function = func;
                }
            }, false);
        }
    });
    let keyCommandButtons: HTMLAnchorElement[] = Array.prototype.filter.call(document.getElementsByClassName("key-command"), (a: HTMLElement) => (a.tagName === "a" && a.accessKey));
    keyCommandButtons.forEach(a => {
        a.addEventListener("click", event => {
            view.keyCommand(a.accessKey);
        }, false);
    });
}, false);
