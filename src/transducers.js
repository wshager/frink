// very basic stuff, not really transducers but less code

export function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === 'function';
}

export function compose(...funcs) {
  const l = funcs.length;
  return (v,i,iterable,z) => {
    for (var j = l; --j >= 0;) {
      let ret = funcs[j].call(null,v,i,iterable,z);
      // if it's a step, continue processing
      if(ret["@@step"]) {
          v = ret.v;
          z = ret.z;
      } else {
          z = ret;
      }
    }
    // append at the end
    return _append(z,v);
  };
}

/*
function _iterate(wrapped, z) {
  return function (iterable) {
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
      let ret = wrapped(v, i, iterable, z);
      if(ret["@@step"]) {
          z = _append(ret.z,ret.v);
      } else {
          z = ret;
      }
      //yield z;
      i++;
    }
    return z;
  };
}
*/
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
      if(ret["@@step"]) {
          z = _append(ret.z,ret.v);
      } else {
          z = ret;
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

function step(z,v){
    // we're going to process this further
    return {
        z:z,
        v:v,
        "@@step":true
    };
}

export function forEach$1(f) {
  return function (v, i, iterable, z) {
    return step(z, f(v, i, iterable));
  };
}

export function filter$1(f) {
  return function (v, i, iterable, z) {
    if (f(v, i, iterable)) {
      return step(z, v);
    }
    return z;
  };
}

export function foldLeft$1(f, z) {
  return function (v, i, iterable, z) {
    return f(z, v, i, iterable);
  };
}

export function forEach(iterable, f) {
    if(arguments.length == 1) return forEach$1(iterable);
  return _iterate(iterable,forEach$1(f),_new(iterable));
}

export function filter(iterable, f) {
    if(arguments.length == 1) return filter$1(iterable);
  return _iterate(iterable, filter$1(f),_new(iterable));
}

export function foldLeft(iterable, f, z) {
  return _iterate(iterable, foldLeft$1(f), z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
export function transform(iterable,f){
    return _iterate(iterable,f);
//    return new Iterator(iterable, f);
}

export function into(iterable,f,z){
    return _iterate(iterable,f,z);
}

// TODO:
// add Take/Nth/dropWhile/Range
// rewindable/fastforwardable iterators

const DONE = {
    done: true
};

function Iterator(iterable, f, z) {
    this.iterable = iterable;
    // iterate anything
    this.iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
      next: function () {
        return { value: iterable, done: true };
      }
    };
    this.f = f;
    this.z = (z === undefined) ? _new(iterable) : z;
    this.i = 0;
}

Iterator.prototype.next = function () {
    let next = this.iter.next();
    if(next.done) return DONE;
      let v = next.value;
      let z = this.z;
      let ret = this.f(v, this.i, this.iterable, z);
      if(ret["@@step"]) {
          z = _append(ret.z,ret.v);
      } else {
          z = ret;
      }
      this.z = z;
      this.i++;
    return { value: this.z };
};

Iterator.prototype[Symbol.iterator] = function () {
    return this;
};
