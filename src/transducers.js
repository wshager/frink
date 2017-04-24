// very basic stuff, not really transducers but less code
import { seq } from "./seq";

export function isIterable(obj) {
    // FIXME is this acceptable?
    return !!obj && typeof obj != "string" && typeof obj[Symbol.iterator] === 'function';
}

function Singleton(val) {
    this.val = val;
}

Singleton.prototype.next = function(){
    if(this.val !== undefined) {
        var val = this.val;
        this.val = undefined;
        return { value:val };
    }
    return { done: true };
};

function _getIter(iterable) {
    return iterable === undefined ? new Singleton() : isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : new Singleton(iterable);
}

export function compose(...funcs) {
    const l = funcs.length;
    return (v, i, iterable, z) => {
        let reset = false, c = _append;
        for (var j = 0; j < l; j++) {
            let ret = funcs[j].call(null, v, i, iterable, z);
            if (ret === undefined) {
                reset = true;
                continue;
            }
            // if it's a step, continue processing
            if (ret["@@step"]) {
                v = ret.v;
                z = ret.z;
                c = ret.f;
                if(ret.t == i) return !reset ? step(z, v, c) : z;
            } else {
                // stop processing current iteration
                reset = true;
                z = ret;
            }
        }
        // append at the end
        //return !reset ? step(z, v, c) : z;
        return !reset ? step(z, v, c) : z;
    };
}

// TODO pass control function to the point where a value would be yielded
// use that to control a custom iterator
function _iterate(iterable, f, z) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = _getIter(iterable);
    let next;
    while (next = iter.next(), !next.done) {
        let v = next.value;
        let ret = f(v, i, iterable, z);
        if(ret !== undefined){
            if (ret["@@step"]) {
                z = ret.f(ret.z, ret.v);
                if(ret.t == i) return z;
            } else {
                z = ret;
            }
        }
        i++;
    }
    return z;
}

function _new(iterable) {
    return iterable["@@empty"] ? iterable["@@empty"]() : new iterable.constructor();
}

// checkiecheckie
function _append(iterable, appendee) {
    if(iterable["@@append"]) {
        return iterable["@@append"](appendee);
    } else if(iterable.push){
        let appended = iterable.push(appendee);
        // stateful stuff
        if (appended !== iterable) {
            return iterable;
        }
        return appended;
    } else if(iterable.set) {
        let appended = iterable.set(appendee[0], appendee[1]);
        // stateful stuff
        if (appended !== iterable) {
            return iterable;
        }
        return appended;
    } else {
        return seq(appendee);
    }
    // badeet badeet bathatsallfolks!
}

// introduce a step so we can reuse _iterate for foldLeft
function step(z, v, f, t, d) {
    // we're going to process this further
    return {
        z: z,
        v: v,
        f: f,
        t:t,
        "@@step": true
    };
}

function _contains(iterable, value, comp){
    // FIXME how to prevent iteration?
    let iter = _getIter(iterable);
    let next;
    while (next = iter.next(), !next.done) {
        if(next.value === value) return true;
    }
    return false;
}

export function distinctCat$1(f) {
    // FIXME how to optimize?
    return function transDistinctCat(v, i, iterable, z) {
        return step(z, v, function (z, v) {
            return foldLeft(v, z, function(z,v){
                if (f(z, v)) return _append(z,v);
                return z;
            });
        });
    };
}

export function cat(v, i, iterable, z) {
    return step(z, v, function(z,v){
        return foldLeft(v,z,_append);
    });
}

function forEach$1(f) {
    return function transForEach(v, i, iterable, z) {
        return step(z, f(v, i, iterable), _append);
    };
}

function filter$1(f) {
    return function transFilter(v, i, iterable, z) {
        if (f(v, i, iterable)) {
            return step(z, v, _append);
        }
        return z;
    };
}

function foldLeft$1(f, z) {
    return function transFoldLeft(v, i, iterable, z) {
        return f(z, v, i, iterable);
    };
}

function take$1(idx){
    return function transTake(v, i, iterable, z) {
        if (i < idx) {
            return step(z, v, _append, idx);
        }
        return z;
    };
}

function drop$1(idx){
    return function transDrop(v, i, iterable, z) {
        if (i >= idx) {
            return step(z, v, _append, -1);
        }
        return z;
    };
}

export function drop(iterable, i){
    if (arguments.length == 1) return drop$1(iterable);
    return _iterate(iterable, drop$1(i), _new(iterable));
}

export function take(iterable, i){
    if (arguments.length == 1) return take$1(iterable);
    return _iterate(iterable, take$1(i), _new(iterable));
}

export function forEach(iterable, f) {
    if (arguments.length == 1) return forEach$1(iterable);
    return _iterate(iterable, forEach$1(f), _new(iterable));
}

export function filter(iterable, f) {
    if (arguments.length == 1) return filter$1(iterable);
    return _iterate(iterable, filter$1(f), _new(iterable));
}

export function distinctCat(iterable, f) {
    if (arguments.length < 2) return distinctCat$1(iterable || _contains);
    return _iterate(iterable, distinctCat$1(f), _new(iterable));
}

// non-composables!
export function foldLeft(iterable, z, f) {
    return _iterate(iterable, foldLeft$1(f), z);
}


// FIXME always return a collection, iterate by overriding _append to just return the value
export function transform(iterable, f) {
    return _iterate(iterable, f);
}

export function into(iterable, f, z) {
    return _iterate(iterable, f, z);
}

export function range(n,s=0) {
    var arr = [];
    for(var i=s; i<n; i++) {
        arr.push(i);
    }
    return seq(arr);
}

// TODO:
// rewindable/fastforwardable iterators
