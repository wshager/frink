/**
 * @file Transducers.js
 * @copyright 2014, James Long All rights reserved.
 * @copyright 2017 W.S. Hager, slightly modified + extended version /w basic Observable interop and XQuery nomenclature
*/

// NOTE "seq" is reserved for Frink sequences

import { Observable } from "rxjs/Observable";


// basic protocol helpers
var symbolExists = typeof Symbol !== "undefined";

var protocols = {
	iterator: symbolExists ? Symbol.iterator : "@@iterator"
};

function throwProtocolError(name, coll) {
	throw new Error("don't know how to " + name + " collection: " + coll);
}

function fulfillsProtocol(obj, name) {
	if(name === "iterator") {
		// Accept ill-formed iterators that don"t conform to the
		// protocol by accepting just next()
		return obj[protocols.iterator] || obj.next;
	}

	return obj[protocols[name]];
}

function getProtocolProperty(obj, name) {
	return obj[protocols[name]];
}

function iterator(coll) {
	var iter = getProtocolProperty(coll, "iterator");
	if(iter) {
		return iter.call(coll);
	}
	else if(coll.next) {
		// Basic duck typing to accept an ill-formed iterator that doesn"t
		// conform to the iterator protocol (all iterators should have the
		// @@iterator method and return themselves, but some engines don"t
		// have that on generators like older v8)
		return coll;
	}
	else if(isArray(coll)) {
		return new ArrayIterator(coll);
	}
	else if(isObject(coll)) {
		return new ObjectIterator(coll);
	}
}

function ArrayIterator(arr) {
	this.arr = arr;
	this.index = 0;
}

ArrayIterator.prototype.next = function() {
	if(this.index < this.arr.length) {
		return {
			value: this.arr[this.index++],
			done: false
		};
	}
	return {
		done: true
	};
};

function ObjectIterator(obj) {
	this.obj = obj;
	this.keys = Object.keys(obj);
	this.index = 0;
}

ObjectIterator.prototype.next = function() {
	if(this.index < this.keys.length) {
		var k = this.keys[this.index++];
		return {
			value: [k, this.obj[k]],
			done: false
		};
	}
	return {
		done: true
	};
};

// helpers

var toString = Object.prototype.toString;
var isArray = typeof Array.isArray === "function" ? Array.isArray : function(obj) {
	return toString.call(obj) == "[object Array]";
};

export function isFunction(x) {
	return typeof x === "function";
}

export function isObject(x) {
	return x instanceof Object &&
		Object.getPrototypeOf(x) === Object.getPrototypeOf({});
}

export function isNumber(x) {
	return typeof x === "number";
}

function Reduced(value) {
	this["@@transducer/reduced"] = true;
	this["@@transducer/value"] = value;
}

function isReduced(x) {
	return (x instanceof Reduced) || (x && x["@@transducer/reduced"]);
}

function deref(x) {
	return x["@@transducer/value"];
}

/**
 * This is for transforms that may call their nested transforms before
 * Reduced-wrapping the result (e.g. "take"), to avoid nested Reduced.
 */
function ensureReduced(val) {
	if(isReduced(val)) {
		return val;
	} else {
		return new Reduced(val);
	}
}

/**
 * This is for tranforms that call their nested transforms when
 * performing completion (like "partition"), to avoid signaling
 * termination after already completing.
 */
function ensureUnreduced(v) {
	if(isReduced(v)) {
		return deref(v);
	} else {
		return v;
	}
}

export function isObservable(a) {
	return a && a instanceof Observable;
}

function TransduceObserver(o, xform) {
	this._o = o;
	this._xform = xform;
}

TransduceObserver.prototype.next = function (x) {
	this._xform["@@transducer/step"].call(this._xform, this._o, x);
};

TransduceObserver.prototype.error = function (e) {
	this._o.error(e);
};

TransduceObserver.prototype.complete = function () {
	this._xform["@@transducer/result"](this._o);
};

function transformForObserver(o) {
	return {
		"@@transducer/init": function () {
			return o;
		},
		"@@transducer/step": function (obs, input) {
			return obs.next(input);
		},
		"@@transducer/result": function (obs) {
			return obs.complete();
		}
	};
}

/**
 * Executes a transducer to transform the observable sequence
 * @param {Transducer} transducer A transducer to execute
 * @returns {Observable} An Observable sequence containing the results from the transducer.
 */
function transduceObservable(source, xform) {
	return new Observable(function(o) {
		return source.subscribe(new TransduceObserver(o, xform(transformForObserver(o))));
	}, source);
}


function reduce(coll, xform, init) {
	let uninit = arguments.length == 2;
	if (isArray(coll)) {
		let index = uninit ? 0 : -1;
		let result = uninit ? coll[index] : init;
		let len = coll.length;
		while (++index < len) {
			result = xform["@@transducer/step"](result, coll[index]);
			if (isReduced(result)) {
				result = deref(result);
				break;
			}
		}
		return xform["@@transducer/result"](result);
	} else if (isObject(coll) || fulfillsProtocol(coll, "iterator")) {
		let iter = iterator(coll);
		let val = iter.next();
		let result = !val.done && uninit ? val.value : init;
		if(!val.done && uninit) val = iter.next();
		while (!val.done) {
			result = xform["@@transducer/step"](result, val.value);
			if (isReduced(result)) {
				result = deref(result);
				break;
			}
			val = iter.next();
		}
		return xform["@@transducer/result"](result);
	} else if (isObservable(coll)) {
		let result = init;
		coll.subscribe({
			next:cur => {
				xform["@@transducer/step"](result,cur);
			},
			complete: () => {
				result = xform["@@transducer/result"](result);
			}
		});
		return result;
	}
	throwProtocolError("iterate", coll);
}

function transduce(coll, xform, reducer, init) {
	xform = xform(reducer);
	if(init === undefined) {
		init = xform["@@transducer/init"]();
	}
	return reduce(coll, xform, init);
}

export function compose() {
	var l = arguments.length;
	var funcs = new Array(l);
	for(var i = 0; i < l; ++i) {
		funcs[i] = arguments[i];
	}
	return r => {
		var value = r;
		for(var i = l - 1; i >= 0; i--) {
			value = funcs[i](value);
		}
		return value;
	};
}


// transformations
function transformer(f) {
	var t = {};
	t["@@transducer/init"] = function() {
		throw new Error("init value unavailable");
	};
	t["@@transducer/result"] = function(v) {
		return v;
	};
	t["@@transducer/step"] = f;
	return t;
}

function bound(f, ctx, count) {
	count = count != null ? count : 1;

	if(!ctx) {
		return f;
	} else {
		switch(count) {
		case 1:
			return x => f.call(ctx, x);
		case 2:
			return (x, y) => f.call(ctx, x, y);
		default:
			return f.bind(ctx);
		}
	}
}

function arrayMap(arr, f, ctx) {
	var index = -1;
	var length = arr.length;
	var result = Array(length);
	f = bound(f, ctx, 2);

	while (++index < length) {
		result[index] = f(arr[index], index);
	}
	return result;
}

function arrayFilter(arr, f, ctx) {
	var len = arr.length;
	var result = [];
	f = bound(f, ctx, 2);

	for(var i=0; i<len; i++) {
		if(f(arr[i], i)) {
			result.push(arr[i]);
		}
	}
	return result;
}

function Map(f, xform) {
	this.xform = xform;
	this.f = f;
}

Map.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Map.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Map.prototype["@@transducer/step"] = function(res, input) {
	return this.xform["@@transducer/step"](res, this.f(input));
};

function map(coll, f, ctx) {
	if(isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);

	if(coll) {
		if(isArray(coll)) {
			return arrayMap(coll, f, ctx);
		}
		return transform(coll, map(f));
	}

	return xform => new Map(f, xform);
}

function Filter(f, xform) {
	this.xform = xform;
	this.f = f;
}

Filter.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Filter.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Filter.prototype["@@transducer/step"] = function(res, input) {
	if(this.f(input)) {
		return this.xform["@@transducer/step"](res, input);
	}
	return res;
};

export function filter(coll, f, ctx) {
	if(isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);

	if(coll) {
		if(isArray(coll)) {
			return arrayFilter(coll, f, ctx);
		}
		return transform(coll, filter(f));
	}

	return function(xform) {
		return new Filter(f, xform);
	};
}

export function erase(coll, f, ctx) {
	if(isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);
	return filter(coll, x => !f(x));
}

export function keep(coll) {
	return filter(coll, x => x != null);
}

function Dedupe(xform) {
	this.xform = xform;
	this.last = undefined;
}

Dedupe.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Dedupe.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Dedupe.prototype["@@transducer/step"] = function(result, input) {
	if(input !== this.last) {
		this.last = input;
		return this.xform["@@transducer/step"](result, input);
	}
	return result;
};

export function dedupe(coll) {
	if(coll) {
		return transform(coll, dedupe());
	}

	return xform => new Dedupe(xform);
}

function TakeWhile(f, xform) {
	this.xform = xform;
	this.f = f;
}

TakeWhile.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

TakeWhile.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

TakeWhile.prototype["@@transducer/step"] = function(result, input) {
	if(this.f(input)) {
		return this.xform["@@transducer/step"](result, input);
	}
	return new Reduced(result);
};

export function takeWhile(coll, f, ctx) {
	if(isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);

	if(coll) {
		return transform(coll, takeWhile(f));
	}

	return xform => new TakeWhile(f, xform);
}

function Take(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
}

Take.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Take.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Take.prototype["@@transducer/step"] = function(result, input) {
	if (this.i < this.n) {
		result = this.xform["@@transducer/step"](result, input);
		if(this.i + 1 >= this.n) {
			// Finish reducing on the same step as the final value. TODO:
			// double-check that this doesn"t break any semantics
			result = ensureReduced(result);
		}
	}
	this.i++;
	return result;
};

export function take(coll, n) {
	if(isNumber(coll)) { n = coll; coll = null; }

	if(coll) {
		return transform(coll, take(n));
	}

	return xform => new Take(n, xform);
}

function Drop(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
}

Drop.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Drop.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Drop.prototype["@@transducer/step"] = function(result, input) {
	if(this.i++ < this.n) {
		return result;
	}
	return this.xform["@@transducer/step"](result, input);
};

export function drop(coll, n) {
	if(isNumber(coll)) { n = coll; coll = null; }

	if(coll) {
		return transform(coll, drop(n));
	}

	return xform => new Drop(n, xform);
}

function DropWhile(f, xform) {
	this.xform = xform;
	this.f = f;
	this.dropping = true;
}

DropWhile.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

DropWhile.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

DropWhile.prototype["@@transducer/step"] = function(result, input) {
	if(this.dropping) {
		if(this.f(input)) {
			return result;
		}
		else {
			this.dropping = false;
		}
	}
	return this.xform["@@transducer/step"](result, input);
};

export function dropWhile(coll, f, ctx) {
	if(isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);

	if(coll) {
		return transform(coll, dropWhile(f));
	}

	return xform => new DropWhile(f, xform);
}

function Partition(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
	this.part = new Array(n);
}

Partition.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Partition.prototype["@@transducer/result"] = function(v) {
	if (this.i > 0) {
		return ensureUnreduced(this.xform["@@transducer/step"](v, this.part.slice(0, this.i)));
	}
	return this.xform["@@transducer/result"](v);
};

Partition.prototype["@@transducer/step"] = function(result, input) {
	this.part[this.i] = input;
	this.i += 1;
	if (this.i === this.n) {
		var out = this.part.slice(0, this.n);
		this.part = new Array(this.n);
		this.i = 0;
		return this.xform["@@transducer/step"](result, out);
	}
	return result;
};

export function partition(coll, n) {
	if (isNumber(coll)) {
		n = coll; coll = null;
	}

	if (coll) {
		return transform(coll, partition(n));
	}

	return xform => new Partition(n, xform);
}

var NOTHING = {};

function PartitionBy(f, xform) {
	// TODO: take an "opts" object that allows the user to specify
	// equality
	this.f = f;
	this.xform = xform;
	this.part = [];
	this.last = NOTHING;
}

PartitionBy.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

PartitionBy.prototype["@@transducer/result"] = function(v) {
	var l = this.part.length;
	if (l > 0) {
		return ensureUnreduced(this.xform["@@transducer/step"](v, this.part.slice(0, l)));
	}
	return this.xform["@@transducer/result"](v);
};

PartitionBy.prototype["@@transducer/step"] = function(result, input) {
	var current = this.f(input);
	if (current === this.last || this.last === NOTHING) {
		this.part.push(input);
	} else {
		result = this.xform["@@transducer/step"](result, this.part);
		this.part = [input];
	}
	this.last = current;
	return result;
};

export function partitionBy(coll, f, ctx) {
	if (isFunction(coll)) { ctx = f; f = coll; coll = null; }
	f = bound(f, ctx);

	if (coll) {
		return transform(coll, partitionBy(f));
	}

	return xform => new PartitionBy(f, xform);
}

function Interpose(sep, xform) {
	this.sep = sep;
	this.xform = xform;
	this.started = false;
}

Interpose.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Interpose.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Interpose.prototype["@@transducer/step"] = function(result, input) {
	if (this.started) {
		var withSep = this.xform["@@transducer/step"](result, this.sep);
		if (isReduced(withSep)) {
			return withSep;
		} else {
			return this.xform["@@transducer/step"](withSep, input);
		}
	} else {
		this.started = true;
		return this.xform["@@transducer/step"](result, input);
	}
};

/**
 * Returns a new collection containing elements of the given
 * collection, separated by the specified separator. Returns a
 * transducer if a collection is not provided.
 */
export function interpose(coll, separator) {
	if (arguments.length === 1) {
		separator = coll;
		return function(xform) {
			return new Interpose(separator, xform);
		};
	}
	return transform(coll, interpose(separator));
}

function Repeat(n, xform) {
	this.xform = xform;
	this.n = n;
}

Repeat.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Repeat.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Repeat.prototype["@@transducer/step"] = function(result, input) {
	var n = this.n;
	var r = result;
	for (var i = 0; i < n; i++) {
		r = this.xform["@@transducer/step"](r, input);
		if (isReduced(r)) {
			break;
		}
	}
	return r;
};

/**
 * Returns a new collection containing elements of the given
 * collection, each repeated n times. Returns a transducer if a
 * collection is not provided.
 */
export function repeat(coll, n) {
	if (arguments.length === 1) {
		n = coll;
		return function(xform) {
			return new Repeat(n, xform);
		};
	}
	return transform(coll, repeat(n));
}

function TakeNth(n, xform) {
	this.xform = xform;
	this.n = n;
	this.i = -1;
}

TakeNth.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

TakeNth.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

TakeNth.prototype["@@transducer/step"] = function(result, input) {
	this.i += 1;
	if (this.i % this.n === 0) {
		return this.xform["@@transducer/step"](result, input);
	}
	return result;
};

/**
 * Returns a new collection of every nth element of the given
 * collection. Returns a transducer if a collection is not provided.
 */
export function takeNth(coll, nth) {
	if (arguments.length === 1) {
		nth = coll;
		return function(xform) {
			return new TakeNth(nth, xform);
		};
	}
	return transform(coll, takeNth(nth));
}

// pure transducers (cannot take collections)

function Cat(xform) {
	this.xform = xform;
}

Cat.prototype["@@transducer/init"] = function() {
	return this.xform["@@transducer/init"]();
};

Cat.prototype["@@transducer/result"] = function(v) {
	return this.xform["@@transducer/result"](v);
};

Cat.prototype["@@transducer/step"] = function(result, input) {
	var xform = this.xform;
	var newxform = {};
	newxform["@@transducer/init"] = function() {
		return xform["@@transducer/init"]();
	};
	newxform["@@transducer/result"] = function(v) {
		return v;
	};
	newxform["@@transducer/step"] = function(result, input) {
		var val = xform["@@transducer/step"](result, input);
		return isReduced(val) ? deref(val) : val;
	};
	return reduce(input, newxform, result);
};

export function cat(xform) {
	return new Cat(xform);
}

export function concatMap(f, ctx) {
	f = bound(f, ctx);
	return compose(map(f), cat);
}

// collection helpers

function push(arr, x) {
	arr.push(x);
	return arr;
}

function merge(obj, x) {
	if(isArray(x) && x.length === 2) {
		obj[x[0]] = x[1];
	}
	else {
		var keys = Object.keys(x);
		var len = keys.length;
		for(var i=0; i<len; i++) {
			obj[keys[i]] = x[keys[i]];
		}
	}
	return obj;
}

var arrayReducer = {};
arrayReducer["@@transducer/init"] = function() {
	return [];
};
arrayReducer["@@transducer/result"] = function(v) {
	return v;
};
arrayReducer["@@transducer/step"] = push;

var objReducer = {};
objReducer["@@transducer/init"] = function() {
	return {};
};
objReducer["@@transducer/result"] = function(v) {
	return v;
};
objReducer["@@transducer/step"] = merge;

// building new collections
/*
function toArray(coll, xform) {
	if(!xform) {
		return reduce(coll, arrayReducer, []);
	}
	return transduce(coll, xform, arrayReducer, []);
}

function toObj(coll, xform) {
	if(!xform) {
		return reduce(coll, objReducer, {});
	}
	return transduce(coll, xform, objReducer, {});
}

function toIter(coll, xform) {
	if(!xform) {
		return iterator(coll);
	}
	return new LazyTransformer(xform, coll);
}
*/
// renamed to transform
export function transform(coll, xform) {
	if(isArray(coll)) {
		return transduce(coll, xform, arrayReducer, []);
	}
	else if(isObject(coll)) {
		return transduce(coll, xform, objReducer, {});
	} else if(coll["@@transducer/step"]) {
		var init;
		if(coll["@@transducer/init"]) {
			init = coll["@@transducer/init"]();
		}
		else {
			init = new coll.constructor();
		}
		return transduce(coll, xform, coll, init);
	} else if(fulfillsProtocol(coll, "iterator")) {
		return new LazyTransformer(xform, coll);
	} else if(isObservable(coll)) {
		return transduceObservable(coll, xform);
	}
	throwProtocolError("transform", coll);
}

// from and to are reversed
export function into(from, xform, to) {
	if(isArray(to)) {
		return transduce(from, xform, arrayReducer, to);
	}
	else if(isObject(to)) {
		return transduce(from, xform, objReducer, to);
	}
	else if(to["@@transducer/step"]) {
		return transduce(from,xform,to,to);
	}
	throwProtocolError("into", to);
}

// laziness

var stepper = {};
stepper["@@transducer/result"] = function(v) {
	return isReduced(v) ? deref(v) : v;
};
stepper["@@transducer/step"] = function(lt, x) {
	lt.items.push(x);
	return lt.rest;
};

function Stepper(xform, iter) {
	this.xform = xform(stepper);
	this.iter = iter;
}

Stepper.prototype["@@transducer/step"] = function(lt) {
	var len = lt.items.length;
	while(lt.items.length === len) {
		var n = this.iter.next();
		if(n.done || isReduced(n.value)) {
			// finalize
			this.xform["@@transducer/result"](this);
			break;
		}

		// step
		this.xform["@@transducer/step"](lt, n.value);
	}
};

function LazyTransformer(xform, coll) {
	this.iter = iterator(coll);
	this.items = [];
	this.stepper = new Stepper(xform, iterator(coll));
}

LazyTransformer.prototype[protocols.iterator] = function() {
	return this;
};

LazyTransformer.prototype.next = function() {
	this["@@transducer/step"]();

	if(this.items.length) {
		return {
			value: this.items.pop(),
			done: false
		};
	}
	else {
		return { done: true };
	}
};

LazyTransformer.prototype["@@transducer/step"] = function() {
	if(!this.items.length) {
		this.stepper["@@transducer/step"](this);
	}
};

export function forEach(iterable, f) {
	if (arguments.length == 1) return map(iterable);
	return transform(iterable, map(f));
}
/*
export function distinctCat(iterable, f) {
	if (arguments.length < 2) return distinctCat$1(iterable || _contains);
	return _iterate(iterable, distinctCat$1(f), _new(iterable));
}
*/
// non-composable
export function foldLeft(iterable, z, f) {
	if (isFunction(iterable.reduce)) {
		return arguments.length == 2 ? iterable.reduce(z) : iterable.reduce(f, z);
	}
	return arguments.length == 2 ? reduce(iterable, transformer(z)) : reduce(iterable, transformer(f), z);
}
