// Polyfills for ES6 Number methods

interface NumberConstructor
{
    isNaN(value: number): boolean;
    isFinite(value: number): boolean;
}

if (!Number.isNaN) {
    Number.isNaN = function(value: number) {
        return typeof value === "number" && isNaN(value);
    };
}

if (!Number.isFinite) {
    Number.isFinite = function(value: number) {
        return typeof value === "number" && isFinite(value);
    };
}
