"use strict";
declare var USE_MATHJAX_FOR_DYNAMIC_MATH: boolean;
declare var MathJax: any;
window.addEventListener("load", event => {
    function stripIDAttribute(e: Element)
    {
        if (e.nodeType === Node.ELEMENT_NODE) {
            e.removeAttribute("id");
            Array.prototype.forEach.call(e.childNodes, stripIDAttribute);
        }
    }
    function deepCloneWithoutID(original: Element): Element
    {
        let clone = <Element>original.cloneNode(true);
        stripIDAttribute(clone);
        return clone;
    }
    function getOuterXML(element: Element): string
    {
        if ("outerHTML" in element) {
            return (<HTMLElement>element).outerHTML;
        } else {
            let serializer = new XMLSerializer();
            return serializer.serializeToString(element);
        }
    }
    let id_counter = 0;
    function setupDynamicMath(mathElement: Element)
    {
        let id = "mathml-polyfill-math-" + (id_counter++).toString();
        let clone = deepCloneWithoutID(mathElement);
        clone.id = id;

        let wrapper = document.createElement("div");
        wrapper.classList.add("dynamic-math-wrapper");
        wrapper.appendChild(clone);
        mathElement.parentNode.insertBefore(wrapper, mathElement);

        let jax: any = null;
        let typesetCallback = () => {
            jax = MathJax.Hub.getJaxFor(id);
            wrapper.classList.add("ready");
        };
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, wrapper, typesetCallback]);

        let timer: number = null;
        let observer = new MutationObserver(() => {
            wrapper.classList.remove("ready");
            if (jax) {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(() => {
                    let outerXML = getOuterXML(deepCloneWithoutID(mathElement));
                    let textCallback = () => {
                        wrapper.classList.add("ready");
                    };
                    MathJax.Hub.Queue(["Text", jax, outerXML, textCallback]);
                    timer = null;
                }, 50);
            }
        });
        observer.observe(mathElement, {childList: true, attributes: true, characterData: true, subtree: true});
    }
    if (USE_MATHJAX_FOR_DYNAMIC_MATH) {
        let elements = Array.prototype.slice.call(document.getElementsByClassName("dynamic-math"));
        elements.forEach((e: HTMLElement, i: number) => {
            if (e.tagName !== "math") {
                return;
            }
            setupDynamicMath(e);
        });
    }
}, false);
