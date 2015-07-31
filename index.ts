/// <reference path="ts/ComplexIntegralView.ts"/>

window.addEventListener("DOMContentLoaded", () => {
    let canvas = <HTMLCanvasElement>document.getElementById("plane");
    let view = new ComplexIntegralView(canvas);
    window.addEventListener("load", () => {
        view.adjustSize();
        view.refresh();
    }, false);
    let functionRadioButtons: HTMLInputElement[] = Array.prototype.filter.call(document.getElementsByName("function"), (e: HTMLElement) => e.tagName === "input" && e.getAttribute("type") === "radio");
    functionRadioButtons.forEach(b => {
        let functionName = b.getAttribute("data-function-name");
        let func = WellknownFunctions[functionName];
        if (!func) {
            console.error("function " + functionName + " not found");
        } else {
            if (b.checked) {
                view.func = func;
            }
            b.addEventListener("click", () => {
                view.func = func;
            }, false);
        }
    });
}, false);
