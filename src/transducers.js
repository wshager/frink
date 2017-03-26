// very basic stuff, not really transducers but less code


export function isIterable(obj) {
    return !!obj && typeof obj[Symbol.iterator] === 'function';
}

export function compose(...funcs) {
    const l = funcs.length;
    var f = (v, i, iterable, z) => {
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
            } else {
                reset = true;
                z = ret;
            }
        }
        // append at the end
        return !reset ? c(z, v) : z;
    };
    for (var j = 0; j < l; j++) {
        if(funcs[j]["@@get"]){
            f["@@get"] = true;
            f.$1 = funcs[j].$1;
        }
    }
    return f;
}

// TODO pass control function to the point where a value would be yielded
// use that to control a custom iterator
function _iterate(iterable, f, z) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
        next: function () {
            return { value: iterable, done: true };
        }
    };
    let next;
    while (next = iter.next(), !next.done) {
        let v = next.value;
        let ret = f(v, i, iterable, z);
        if(ret !== undefined){
            if (ret["@@step"]) {
                z = ret.f(ret.z, ret.v);
            } else {
                z = ret;
            }
        }
        i++;
    }
    return z;
}

function _new(iterable) {
    return iterable.hasOwnProperty("@@empty") ? iterable["@@empty"]() : new iterable.constructor();
}

// memoized
function _append(iterable, appendee) {
    try {
        return iterable["@@append"](appendee);
    } catch (e) {
        try {
            let appended = iterable.push(appendee);
            // stateful stuff
            if (appended !== iterable) {
                iterable["@@append"] = appendee => {
                    this.push(appendee);
                    return this;
                };
                return iterable;
            }
            iterable["@@append"] = appendee => {
                return this.push(appendee);
            };
            return appended;
        } catch (e) {
            let appended = iterable.set(appendee[0], appendee[1]);
            // stateful stuff
            if (appended === iterable) {
                iterable["@@append"] = appendee => {
                    this.set(appendee[0], appendee[1]);
                    return this;
                };
                return iterable;
            }
            iterable["@@append"] = appendee => {
                return this.set(appendee[0], appendee[1]);
            };
            return appended;
            // badeet badeet bathatsallfolks!
            // if you want more generics, use a library
        }
    }
}

// introduce a step so we can reuse _iterate for foldLeft
function step(z, v, f) {
    // we're going to process this further
    return {
        z: z,
        v: v,
        f: f,
        "@@step": true
    };
}

export function cat(v, i, iterable, z) {
    return step(z, v, function(z,v){
        return foldLeft(v,_append,z);
    });
}

function forEach$1(f) {
    return function (v, i, iterable, z) {
        return step(z, f(v, i, iterable), _append);
    };
}

function filter$1(f) {
    return function (v, i, iterable, z) {
        if (f(v, i, iterable)) {
            return step(z, v, _append);
        }
        return z;
    };
}

function get$1(idx) {
    // FIXME dirty hack, move somewhere else
    var f = function (v, i, iterable, z) {
        if (idx === v[0]) return step(z, v, _append);
    };
    f["@@get"] = true;
    f.$1 = idx;
    return f;
}

function foldLeft$1(f, z) {
    return function (v, i, iterable, z) {
        return f(z, v, i, iterable);
    };
}

export function forEach(iterable, f) {
    if (arguments.length == 1) return forEach$1(iterable);
    return _iterate(iterable, forEach$1(f), _new(iterable));
}

export function filter(iterable, f) {
    if (arguments.length == 1) return filter$1(iterable);
    return _iterate(iterable, filter$1(f), _new(iterable));
}

// non-composables!
export function foldLeft(iterable, f, z) {
    return _iterate(iterable, foldLeft$1(f), z);
}

export function get(iterable, idx) {
    if (arguments.length == 1) return get$1(iterable);
    return _iterate(iterable, get$1(idx));
}

// FIXME always return a collection, iterate by overriding _append to just return the value
export function transform(iterable, f) {
    if(f["@@get"] && typeof iterable.get === "function") return iterable.get(f.$1);
    return _iterate(iterable, f);
}

export function into(iterable, f, z) {
    if (f["@@get"] && typeof iterable.get === "function") {
        var ret = iterable.get(f.$1);
        if(ret === undefined) return z;
        iterable = ret.constructor === Array ? ret : [[f.$1,ret]];
    }
    return _iterate(iterable, f, z);
}

export function range(n,s=0) {
    var arr = new Array(n - s);
    for(var i=s; i<n; i++) {
        arr[i] = i;
    }
    return arr;
}

export function first(iterable){
    return get(iterable,0);
}
// TODO:
// add Take/dropWhile
// rewindable/fastforwardable iterators
