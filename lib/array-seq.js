"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArraySeq = exports.isArraySeq = void 0;

var _rxjs = require("rxjs");

const isArraySeq = s => !!(s && s.__is_ArraySeq);

exports.isArraySeq = isArraySeq;

class ArraySeq {
  constructor(a = []) {
    this.$array = a;
    this.__is_ArraySeq = true;
  }

  merge(other) {
    return new ArraySeq(this.$array.concat(other.$array));
  }

  concat(other) {
    return this.merge(other);
  }

  first() {
    return this.$array[0];
  }

  map(fn) {
    return new ArraySeq(this.$array.map(fn));
  }

  mergeMap(fn) {
    const a = this.$array;
    const buffer = [];
    let hasOb = false;

    for (var i = 0, l = a.length; i < l; i++) {
      const ret = fn(a[i], i);

      if (isArraySeq(ret)) {
        buffer.push(...ret.$array);
      } else if ((0, _rxjs.isObservable)(ret)) {
        buffer.push(ret);
        hasOb = true;
      } else {
        buffer.push(ret);
      }
    } //console.log("B",buffer);


    return hasOb ? (0, _rxjs.from)(buffer) : new ArraySeq(buffer);
  }

  concatMap(fn) {
    return this.mergeMap(fn);
  }

  mergeAll() {
    return this.mergeMap(x => x);
  }

  concatAll() {
    return this.mergeAll();
  }

  reduce(...args) {
    const fn = args.shift();
    const a = this.$array.slice(0);
    let seed = args.shift() || a.shift();
    return new ArraySeq([a.reduce(fn, seed)]);
  }

  zip(other) {
    const a = this.$array,
          o = other.$array,
          buffer = [],
          l = a.length,
          l2 = o.length;

    for (let i = 0; i < l; i++) {
      const v = a[i];
      if (i < l2) buffer.push([v, o[i]]);
    }

    return new ArraySeq(buffer);
  }

  filter(fn) {
    return new ArraySeq(this.$array.filter(fn));
    /*
    const a = this.$array;
    const buffer = [];
    for(var i=0, l = a.length; i<l; i++) {
    	const v = a[i];
    	const ret = fn(v,i);
    	if(!ret) continue;
    	if(isArraySeq(v)) buffer.push(...v.$array);
    	else buffer.push(v);
    }
    return new ArraySeq(buffer);
    */
  }

  shareReplay(bufSize) {
    return new ArraySeq(this.$array.slice(0, bufSize));
  }

  subscribe(observer) {
    if (typeof observer == "function") {
      this.$array.forEach(x => observer(x));
    } else if (observer.next) {
      this.$array.forEach(x => observer.next(x));
      observer.complete();
    } else {//whatever
    }
  }

  take(n) {
    return new ArraySeq(this.$array.slice(0, n));
  }

  takeWhile(fn) {
    const a = this.$array,
          buffer = [];

    for (var i = 0, l = a.length; i < l; i++) {
      const v = a[i];
      if (!fn(v, i)) break;
      buffer.push(v);
    }

    return new ArraySeq(buffer);
  }

  skip(n) {
    return new ArraySeq(this.$array.slice(n));
  }

  skipWhile(fn) {
    const a = this.$array,
          buffer = [];
    let skip = true;

    for (var i = 0, l = a.length; i < l; i++) {
      const v = a[i];
      if (skip && !fn(v, i)) skip = false;
      if (!skip) buffer.push(v);
    }

    return new ArraySeq(buffer);
  }

  isEmpty() {
    return !this.$array.length;
  }

  count() {
    return this.$array.length;
  }

  toPromise() {
    return Promise.resolve(this.first());
  }

  toObservable() {
    return (0, _rxjs.from)(this.$array);
  }

  toArray() {
    return new ArraySeq([this.$array]);
  }

}

exports.ArraySeq = ArraySeq;
//# sourceMappingURL=array-seq.js.map