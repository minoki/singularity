interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
}

interface TouchList {
    length: number;
    item(index: number): Touch;
    [index: number]: Touch;
}

interface TouchEvent extends UIEvent {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
}

interface GestureEvent extends UIEvent {
    rotation: number;
    scale: number;
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    //initGestureEvent(...): void;
}


interface HTMLElement {
    addEventListener(type: "touchstart", listener: (event: TouchEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "touchend", listener: (event: TouchEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "touchmove", listener: (event: TouchEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "touchcancel", listener: (event: TouchEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "gesturestart", listener: (event: GestureEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "gesturechange", listener: (event: GestureEvent) => any, useCapture?: boolean): void;
    addEventListener(type: "gestureend", listener: (event: GestureEvent) => any, useCapture?: boolean): void;
}


