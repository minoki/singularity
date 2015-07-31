// Polyfills for ES6 Array methods

interface Array<T>
{
    find(callback: (element: T, index: number, array: T[]) => boolean, thisArg?: any): T;
    findIndex(callback: (element: T, index: number, array: T[]) => boolean, thisArg?: any): number;
}

interface ArrayLike<T>
{
    [n: number]: T;
    length: number;
}

interface ArrayConstructor
{
    from<T>(arrayLike: ArrayLike<T>): T[];
    from<T, U>(arrayLike: ArrayLike<T>, mapFn: (value: T, index: number) => U, thisArg?: any): U[];
}

if (!Array.prototype.find) {
    Array.prototype.find = function(callback: (element: any, index: number, array: any[]) => boolean, thisArg?: any): any
    {
        let length = this.length >>> 0;
        for (let i = 0; i < length; ++i) {
            if (i in this) {
                let value = this[i];
                if (callback.call(thisArg, value, i, this)) {
                    return value;
                }
            }
        }
        return undefined;
    };
}

if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(callback: (element: any, index: number, array: any[]) => boolean, thisArg?: any): number
    {
        let length = this.length >>> 0;
        for (let i = 0; i < length; ++i) {
            if (i in this) {
                let value = this[i];
                if (callback.call(thisArg, value, i, this)) {
                    return i;
                }
            }
        }
        return -1;
    };
}

if (!Array.from) {
    Array.from = function() {
        let toStr = Object.prototype.toString;
        let isCallable = (fn: any) => (typeof fn === "function" || toStr.call(fn) === "[object Function]");
        return function(arrayLike: ArrayLike<any>, mapFn?: (value: any, index: number) => any, thisArg?: any)
        {
            let C = this; // constructor (Array or Typed Arrays)
            let items = Object(arrayLike);
            if (arrayLike === null) {
                throw new TypeError("Array.from requires an array-like object");
            }
            let length = arrayLike.length >>> 0;
            let a = isCallable(C) ? Object(new C(length)) : new Array(length);
            for (let i = 0; i < length; ++i) {
                let value = items[i];
                if (mapFn) {
                    a[i] = typeof thisArg === "undefined" ? mapFn(value, i) : mapFn.call(thisArg, value, i);
                } else {
                    a[i] = value;
                }
            }
            a.length = length;
            return a;
        };
    }();
}
