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
}, false);
