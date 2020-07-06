export const isUndef = s => s === undefined;
export const isNull = s => s === null;
export const isUndefOrNull = s => isUndef(s) || isNull(s);
export const set = (obj, value, key) => ({ ...obj, [key]: value });
//const append = (arr, value) => [...arr, value];
export const insert = (arr, value, index) => [...arr.slice(0, index), value, ...arr.slice(index + 1)];
export const identity = x => x;
export const hasOwnProp = (prop, o) =>  Object.prototype.hasOwnProperty.call(o, prop);

export const isList = Array.isArray;
export const isCall = o => hasOwnProp("$name", o) && hasOwnProp("$args", o);
export const isElem = o => hasOwnProp("$name", o) && hasOwnProp("$children", o);
export const isAttr = o => hasOwnProp("$name", o) && hasOwnProp("$value", o);

// TODO l3, because SO
export const traverse = (obj, callback) => {
    if (isList(obj)) {
        callback("l", obj);
        obj.forEach(x => traverse(x, callback));
    } else if(isCall(obj)) {
        callback("c", obj);
        obj.$args.forEach(x => traverse(x, callback));
    } else if(isElem(obj)) {
        callback("e", obj);
        obj.$children.forEach(x => traverse(x, callback));
    } else if(typeof obj === "object") {
        callback("m", obj);
        Object.entries(obj).forEach(([$key, $value]) => traverse({ $key, $value }, callback));
    } else {
        callback("x", obj);
    }
};