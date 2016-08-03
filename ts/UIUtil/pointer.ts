/*
 * Copyright (c) 2015 ARATA Mizuki
 * This software is released under the MIT license.
 * See LICENSE.txt.
 */

/// <reference path="../../typings/es6-shim/es6-shim.d.ts"/>

module UIUtil
{
    export interface PointerHandler
    {
        move?: (clientX: number, clientY: number) => void;
        up?: (clientX: number, clientY: number) => void;
    }
    export type DetachHandlers = () => void;
    interface MouseEventTarget
    {
        addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
        addEventListener(type: "mousedown", listener: (ev: MouseEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "mouseup", listener: (ev: MouseEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "mousemove", listener: (ev: MouseEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "pointerdown", listener: (ev: PointerEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "pointerup", listener: (ev: PointerEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "pointermove", listener: (ev: PointerEvent) => any, useCapture?: boolean): void;
        addEventListener(type: "lostpointercapture", listener: (ev: PointerEvent) => any, useCapture?: boolean): void;
        removeEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
    }
    function handleMouseEvent(elem: Element, downHandler: (x: number, y: number) => PointerHandler, global: boolean, useCapture: boolean): DetachHandlers
    {
        let eventTarget: MouseEventTarget = global ? window : elem;
        let onMouseDown = (event: MouseEvent) => {
            let rect = elem.getBoundingClientRect();
            let h = downHandler(event.clientX - rect.left, event.clientY - rect.top);
            if (h) {
                let moveHandler = h.move ? ((event: MouseEvent) => {
                    let rect = elem.getBoundingClientRect();
                    h.move(event.clientX - rect.left, event.clientY - rect.top);
                }) : null;
                let upHandler = (event: MouseEvent) => {
                    if (moveHandler) {
                        eventTarget.removeEventListener("mousemove", moveHandler, useCapture);
                    }
                    eventTarget.removeEventListener("mouseup", upHandler, useCapture);
                    if (h.up) {
                        let rect = elem.getBoundingClientRect();
                        h.up(event.clientX - rect.left, event.clientY - rect.top);
                    }
                };
                if (moveHandler) {
                    eventTarget.addEventListener("mousemove", moveHandler, useCapture);
                }
                eventTarget.addEventListener("mouseup", upHandler, useCapture);
            }
        };
        elem.addEventListener("mousedown", onMouseDown, useCapture);
        return () => {
            elem.removeEventListener("mousedown", onMouseDown, useCapture);
        };
    }
    function handleRawPointerEvent(elem: Element, downHandler: (x: number, y: number) => PointerHandler, global: boolean, useCapture: boolean): DetachHandlers
    {
        let eventTarget: MouseEventTarget = global ? window : elem;
        let onPointerDown = (event: PointerEvent) => {
            let id = event.pointerId;
            let rect = elem.getBoundingClientRect();
            let h = downHandler(event.clientX - rect.left, event.clientY - rect.top);
            if (h) {
                let moveHandler = h.move ? ((event: PointerEvent) => {
                    if (event.pointerId === id) {
                        let rect = elem.getBoundingClientRect();
                        h.move(event.clientX - rect.left, event.clientY - rect.top);
                    }
                }) : null;
                let upHandler = (event: PointerEvent) => {
                    if (event.pointerId === id) {
                        if (moveHandler) {
                            eventTarget.removeEventListener("pointermove", moveHandler, useCapture);
                        }
                        eventTarget.removeEventListener("pointerup", upHandler, useCapture);
                        eventTarget.removeEventListener("lostpointercapture", upHandler, useCapture);
                        if (h.up) {
                            let rect = elem.getBoundingClientRect();
                            h.up(event.clientX - rect.left, event.clientY - rect.top);
                        }
                    }
                };
                if (moveHandler) {
                    eventTarget.addEventListener("pointermove", moveHandler, useCapture);
                }
                eventTarget.addEventListener("pointerup", upHandler, useCapture);
                eventTarget.addEventListener("lostpointercapture", upHandler, useCapture);
            }
        };
        elem.addEventListener("pointerdown", onPointerDown, useCapture);
        return () => {
            elem.removeEventListener("pointerdown", onPointerDown, useCapture);
        };
    }
    function handleTouchEvent(elem: Element, downHandler: (x: number, y: number) => PointerHandler, global: boolean, useCapture: boolean)
    {
        let eventTarget = elem;//global ? window : elem;
        let handlerMap = new Map<number, PointerHandler>();
        let moveHandlerCount = 0, endHandlerCount = 0;
        let moveHandler = (event: TouchEvent) => {
            let rect = elem.getBoundingClientRect();
            Array.from(event.changedTouches).forEach(touch => {
                let id = touch.identifier;
                if (handlerMap.has(id)) {
                    let h = handlerMap.get(id);
                    if (h.move) {
                        h.move(touch.clientX - rect.left, touch.clientY - rect.top);
                    }
                }
            });
        };
        let endHandler = (event: TouchEvent) => {
            let rect = elem.getBoundingClientRect();
            Array.from(event.changedTouches).forEach(touch => {
                let id = touch.identifier;
                if (handlerMap.has(id)) {
                    let h = handlerMap.get(id);
                    if (h.up) {
                        h.up(touch.clientX - rect.left, touch.clientY - rect.top);
                    }
                    if (h.move) {
                        --moveHandlerCount;
                    }
                    --endHandlerCount;
                }
            });
            if (moveHandlerCount === 0) {
                elem.removeEventListener("touchmove", moveHandler, useCapture);
            }
            if (endHandlerCount === 0) {
                elem.removeEventListener("touchend", endHandler, useCapture);
                elem.removeEventListener("touchcancel", endHandler, useCapture);
            }
        };
        let onTouchStart = (event: TouchEvent) => {
            let rect = elem.getBoundingClientRect();
            let setMoveHandler = false, setEndHandler = false;
            Array.from(event.changedTouches).forEach(touch => {
                let id = touch.identifier;
                let h = downHandler(touch.clientX - rect.left, touch.clientY - rect.top);
                if (h) {
                    handlerMap.set(id, h);
                    if (h.move) {
                        if (moveHandlerCount === 0) {
                            setMoveHandler = true;
                        }
                        ++moveHandlerCount;
                    }
                    if (h.move || h.up) {
                        if (endHandlerCount === 0) {
                            setEndHandler = true;
                        }
                        ++endHandlerCount;
                    }
                }
            });
            if (setMoveHandler) {
                elem.addEventListener("touchmove", moveHandler, useCapture);
            }
            if (setEndHandler) {
                elem.addEventListener("touchend", endHandler, useCapture);
                elem.addEventListener("touchcancel", endHandler, useCapture);
            }
            event.preventDefault();
        };
        elem.addEventListener("touchstart", onTouchStart, useCapture);
        return () => {
            elem.removeEventListener("touchstart", onTouchStart, useCapture);
        };
    }
    export function handlePointerEvent(elem: Element, downHandler: (x: number, y: number) => PointerHandler, global: boolean = false, useCapture: boolean = false): DetachHandlers
    {
        if (navigator.pointerEnabled) {
            console.log("pointer mode");
            return handleRawPointerEvent(elem, downHandler, global, useCapture);
        } else {
            console.log("mouse mode");
            let detachMouseHandlers = handleMouseEvent(elem, downHandler, global, useCapture);
            if ("TouchEvent" in window) {
                console.log("touch enabled");
                let detachTouchHandlers = handleTouchEvent(elem, downHandler, global, useCapture);
                return () => {
                    detachMouseHandlers();
                    detachTouchHandlers();
                };
            } else {
                return detachMouseHandlers;
            }
        }
    }
}
