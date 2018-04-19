"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isExactlyOne = exports.isOneOrMore = exports.isZeroOrOne = exports.first = exports.skip = exports.take = exports.fromPromise = exports.of = exports.from = exports.foldLeft = exports.filter = exports.forEach = exports.fromArgs = undefined;
exports.compose = compose;

var _operators = require("rxjs/operators");

Object.defineProperty(exports, "take", {
	enumerable: true,
	get: function get() {
		return _operators.take;
	}
});
Object.defineProperty(exports, "skip", {
	enumerable: true,
	get: function get() {
		return _operators.skip;
	}
});
exports.when = when;
exports.isSeq = isSeq;
exports.seq = seq;
exports.create = create;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.range = range;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;
exports.transform = transform;

var _Observable = require("rxjs/Observable");

var _error = require("./error");

var _util = require("./util");

var _access = require("./access");

require("rxjs/add/observable/of");

require("rxjs/add/observable/from");

require("rxjs/add/observable/range");

require("rxjs/add/observable/empty");

require("rxjs/add/observable/throw");

require("rxjs/add/operator/toArray");

require("rxjs/add/operator/isEmpty");

require("rxjs/add/operator/take");

require("rxjs/add/operator/takeWhile");

require("rxjs/add/operator/skip");

require("rxjs/add/operator/skipWhile");

require("rxjs/add/operator/first");

require("rxjs/add/operator/scan");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/merge");

require("rxjs/add/operator/mergeMap");

require("rxjs/add/operator/mergeAll");

require("rxjs/add/operator/concat");

require("rxjs/add/operator/concatMap");

require("rxjs/add/operator/concatAll");

require("rxjs/add/operator/switch");

require("rxjs/add/operator/switchMap");

require("rxjs/add/operator/zip");

require("rxjs/add/operator/shareReplay");

require("rxjs/add/operator/count");

var _pipe = require("rxjs/util/pipe");

_Observable.Observable.prototype.call = function($, ...a) {
	return forEach(exactlyOne(this), s => {
		const _isList = _util.isList(s);
		if (_isList || _util.isMap(s)) {
			const len = a.length;
			let [k, v] = a;
			if (len == 1) {
				return forEach(exactlyOne(k), k => {
					const v = s.get(_isList ? k - 1 : k);
					return _util.isUndef(v) ? seq() : v;
				});
			}
			if (len == 2) return forEach(exactlyOne(k), k => s.set(k, v));
			throw new Error("Incorrect number of arguments");
		}
		if (typeof s == "function") {
			//console.log("func",id,s);
			var ret = s.apply(null, a);
			//console.log(ret);
			return ret;
		}
		throw new Error("No callable type");
	});
};

const isArraySeq = s => !!(s && s.__is_ArraySeq);

class ArraySeq {
	constructor(a = []) {
		this.$array = a;
		this.__is_ArraySeq = true;
	}
	call($,...a) {
		//console.trace("call",this.$array.map(x => x && x.toJS ? x.toJS() : x),a);
		const s = this.first();
		const _isList = _util.isList(s);
		if (_isList || _util.isMap(s)) {
			const len = a.length;
			let [k, v] = a;
			if (len == 1) {
				return forEach(exactlyOne(k), k => {
					const v = s.get(_isList ? k - 1 : k);
					//console.log(k,v);
					return _util.isUndef(v) ? seq() : v;
				});
			}
			if (len == 2) return forEach(exactlyOne(k), k => s.set(k, v));
			throw new Error("Incorrect number of arguments");
		}
		if (typeof s == "function") {
			console.log("func",s);
			return s.apply(null, a);
		}

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
		for(var i=0, l = a.length; i<l; i++) {
			const ret = fn(a[i],i);
			if(isSeq(ret)) {
				if(isArraySeq(ret)) {
					buffer.push(...ret.$array);
				} else {
					buffer.push(ret);
					hasOb = true;
				}
			} else {
				buffer.push(ret);
			}
		}
		//console.log("B",buffer);
		return hasOb ? _Observable.Observable.from(buffer).mergeAll() : new ArraySeq(buffer);
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
		return new ArraySeq([a.reduce(fn,seed)]);
	}
	zip(other) {
		const a = this.$array, o = other.$array, buffer = [], l = a.length, l2 = o.length;
		for(let i=0; i<l; i++) {
			const v = a[i];
			if(i < l2) buffer.push([v,o[i]]);
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
		return new ArraySeq(this.$array.slice(0,bufSize));
	}
	subscribe(observer) {
		if(typeof observer == "function") {
			this.$array.forEach(x => observer(x));
		} else if(observer.next) {
			this.$array.forEach(x => observer.next(x));
			observer.complete();
		} else {
			//whatever
		}
	}
	take(n) {
		return new ArraySeq(this.$array.slice(0,n));
	}
	takeWhile(fn) {
		const a = this.$array, buffer = [];
		for(var i=0, l = a.length; i<l; i++) {
			const v = a[i];
			if(!fn(v,i)) break;
			buffer.push(v);
		}
		return new ArraySeq(buffer);
	}
	skip(n) {
		return new ArraySeq(this.$array.slice(n));
	}
	skipWhile(fn) {
		const a = this.$array, buffer = [];
		let skip = true;
		for(var i=0, l = a.length; i<l; i++) {
			const v = a[i];
			if(skip && !fn(v,i)) skip = false;
			if(!skip) buffer.push(v);
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
		return from(this.$array);
	}
	toArray() {
		return new ArraySeq([this.$array]);
	}
}

var fromArgs = exports.fromArgs = function fromArgs(args) {
	return seq(args.map(function(x) {
		return seq(x);
	})).concatAll();
};

function compose() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return fromArgs(args).toArray().map(function(a) {
		return _pipe.pipe.apply(a, a);
	});
}


var forEach = exports.forEach = function forEach($s, $fn) {
	if (!(0, _util.isUndef)($fn)) {
		if(isSeq($fn)) throw new Error("Function is ArraySeq");
		if (!isSeq($s)) {
			return $fn($s);
		}
		return $s.concatMap(x => {
			return fromPromise($fn(x));
		}).shareReplay();
	}
	return seq($s).map(function(fn) {
		return (0, _operators.concatMap)(function(x) {
			return seq(fn(x));
		});
	});
};
exports.filter = function filter($s, $fn) {
	const addCx = (x,index) => {
		try {
			x.__cx = [index];
		} catch (err) {
			x = new x.constructor(x);
			x.__cx = [index];
		}
		return x;
	};
	//console.trace();
	if(!isSeq($s)) {
		const ret = fromPromise($fn(addCx($s,0), 0));
		//console.log("filter",$s,ret);
		return isSeq(ret) ? ret.filter(t => t).map(() => $s) : ret ? $s : seq();
	}
	return $s.zip($s.map((v,i) => {
		const t = fromPromise($fn(addCx(v,i), v));
		delete v.__cx;
		return t;
	}).concatAll()).filter(vt => vt[1]).map(vt => vt[0]).shareReplay();
};

exports.boolean = boolean;

exports.foldLeft = function foldLeft($a, $seed, $fn, name) {
	if(!isSeq($a)) {
		const ret = $fn($seed,$a);
		return fromPromise(ret);
	}
	return $a.reduce(function(acc,x){
		const ret = $fn(acc,x);
		//if(name) console.log("SEQ",name,acc,x,ret);
		return fromPromise(ret);
	},$seed).concatAll().shareReplay(1);
};

//var from = exports.from = _Observable.Observable.from;
var from = exports.from = a => new ArraySeq(Array.from(a));
//var of = exports.of = _Observable.Observable.of;
var of = exports.of = (...a) => new ArraySeq(a);

const subscribeToPromise = promise => subscriber => {
	promise.then(value => {
		if (!subscriber.closed) {
			if(isSeq(value)) {
				value.subscribe(subscriber);
			} else {
				subscriber.next(value);
				subscriber.complete();
			}
		}
	},err => {
		subscriber.error(err);
		//process.exit(1);
	})
		.then(null, err => global.setTimeout(() => { throw err; }));
	return subscriber;
};

var fromPromise = exports.fromPromise = function fromPromise(a) {
	if(a instanceof Promise) return create(subscribeToPromise(a));
	return a;
};
var toPromise = exports.toPromise = function(s) {
	if(isArraySeq(s)) return s.toPromise();
	return new Promise((rs,rj) => {
		s.first().subscribe({
			next:rs,
			error:rj
		});
	});
};

var hasZeroOrOne = function hasZeroOrOne($a) {
	return $a.skip(1).isEmpty();
};

function boolean($a) {
	// type test
	if(!isSeq($a)) {
		return !!($a !== undefined && $a.valueOf());
	}
	if($a.__is_ArraySeq) {
		if(!$a.count()) return false;
		for(let i = 0, l = $a.$array.length; i < l; i++) {
			const a = $a.$array[i];
			const isVNode = (0, _access.isVNode)(a);
			if(i > 0) {
				if(!isVNode) {
					return _error.error("err:FORG0006", "Item " + (i + 1) + " is not a node");
				}
			} else {
				if(!isVNode) {
					return !!a;
				}
			}
		}
		return true;
	}
	return create($o => {
		var i = 0, done = false;
		$a.takeWhile(() => !done).subscribe({
			next: a => {
				const isVNode = (0, _access.isVNode)(a);
				if(i > 0) {
					if(!isVNode) {
						$o.error("err:FORG0006", "Item " + (i + 1) + " is not a node");
						done = true;
						return;
					}
				} else {
					if(!isVNode) {
						$o.next(!!a.valueOf());
					}
				}
				i++;
			},
			complete:() => {
				if(i === 0) $o.next(false);
				if(i > 1) $o.next(true);
				$o.complete();
			},
			error: err => {
				$o.error(err);
			}
		});
	}).shareReplay(1);
}

// resolve an observable like a promise
function when(a) {
	if (a instanceof Promise) return a;
	a = boolean(a);
	if (isSeq(a)) {
		return toPromise(a);
	}
	return a;
	//return a
}

function isSeq(a) {
	return isArraySeq(a) || isObservable(a);
}

function isObservable(a) {
	return !!(a && a instanceof _Observable.Observable);
}

function fromType2(x) {
	if (isSeq(x)) {
		return x;
	}
	if ((0, _util.isUndefOrNull)(x)) return new ArraySeq();
	if ((0, _util.isObject)(x) && (x instanceof Promise || typeof x.then == "function")) return fromPromise(x);
	if(Array.isArray(x)) return new ArraySeq([x]);
	if (x[Symbol.iterator] && typeof x != "string" && !(0, _util.isDOMNode)(x) && !(0, _util.isUntypedAtomic)(x) && !(0, _access.isVNode)(x) && !(0, _util.isList)(x) && !(0, _util.isMap)(x)) return new ArraySeq(Array.from(x));
	return new ArraySeq([x]);
}

function fromType(x) {
	if (isSeq(x)) {
		return x;
	}
	if ((0, _util.isUndefOrNull)(x)) return _Observable.Observable.empty();
	if ((0, _util.isObject)(x) && (x instanceof Promise || typeof x.then == "function")) return fromPromise(x);
	if (Array.isArray(x) || x[Symbol.iterator] && typeof x != "string" && !(0, _util.isDOMNode)(x) && !(0, _util.isUntypedAtomic)(x) && !(0, _access.isVNode)(x) && !(0, _util.isList)(x) && !(0, _util.isMap)(x)) return from(x);
	return of(x);
}


function seq() {
	for (var _len3 = arguments.length, a = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		a[_key3] = arguments[_key3];
	}
	const len = a.length;
	if (len == 0) return fromType2();
	if(len == 1) return fromType2(a[0]);
	return from(a).concatAll();
}


function aseq() {
	for (var _len3 = arguments.length, a = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		a[_key3] = arguments[_key3];
	}
	const len = a.length;
	if (len == 0) return fromType2();
	if(len == 1) return fromType2(a[0]);
	return from(a).mergeAll();
}

//exports.aseq = aseq;

function create(o) {
	return _Observable.Observable.create(o);
}

var first = exports.first = function first(s) {
	if (!isSeq(s)) return s;
	return s.first();
};

function empty(s) {
	if (!isSeq(s)) return _util.isUndefOrNull(s);
	return s.isEmpty();
}

function exists(s) {
	if (!isSeq(s)) return !_util.isUndefOrNull(s);
	if(s.__is_ArraySeq) return !empty(s);
	return empty(s).map(x => !x);
}

function count(s) {
	return seq(s).count();
}

function insertBefore(s, pos, ins) {
	s = seq(s);
	pos = pos - 1;
	return s.take(pos).merge(seq(ins), s.skip(pos));
}

function range($n) {
	var $s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	$n = zeroOrOne($n);
	$s = zeroOrOne($s);
	return forEach($s, function(s) {
		return forEach($n, function(n) {
			return _Observable.Observable.range(s, n);
		});
	});
}

var isZeroOrOne = exports.isZeroOrOne = function isZeroOrOne(s) {
	return s.skip(1).isEmpty();
};

var isOneOrMore = exports.isOneOrMore = function isOneOrMore(s) {
	return s.isEmpty().map(function(x) {
		return !x;
	});
};

var isExactlyOne = exports.isExactlyOne = function isExactlyOne(s) {
	return s.isEmpty().zip(s.skip(1).isEmpty(), function(x, y) {
		return !x && y;
	});
};

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param	{ArraySeq|Observable} $arg [Sequence to test]
 * @return {ArraySeq|Observable|Error}		 [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if (!isSeq($arg)) return $arg;
	var s = $arg;//.publishReplay(2).refCount();
	return isZeroOrOne(s).switchMap(function(test) {
		return test ? $arg : (0, _error.error)("FORG0003");
	});
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param	{ArraySeq|Observable} $arg [Sequence to test]
 * @return {ArraySeq|Observable|Error}			[Process Error in implementation]
 */
function oneOrMore($arg) {
	if (!isSeq($arg)) return $arg;
	var s = $arg;//.publishReplay().refCount();
	return isOneOrMore(s).switchMap(function(test) {
		return test ? $arg : (0, _error.error)("FORG0004");
	});
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param	{ArraySeq|Observable} $arg [Sequence to test]
 * @return {ArraySeq|Observable|Error}			[Process Error in implementation]
 */
function exactlyOne($arg) {
	if (!isSeq($arg)) return $arg;
	if(isArraySeq($arg)) return $arg.count() == 1 ? $arg : (0, _error.error)("FORG0005");
	var s = $arg;//.shareReplay(2);
	return isExactlyOne(s).switchMap(function(test) {
		if(!test) require("./console").log("exactlyOne failed",$arg);
		return test ? $arg : (0, _error.error)("FORG0005");
	});
}

function transform($arg, $fn) {
	var s = seq($arg);
	return seq($fn).concatMap(function(fn) {
		return isExactlyOne(s).switchMap(function(test) {
			return test ? s.concatMap(function(x) {
				return x[Symbol.iterator] ? from(x).pipe(fn).reduce(function(a, x) {
					return a["@@transducer/step"](a, x);
				}, x["@@transducer/init"]()).map(function(x) {
					return x["@@transducer/result"](x);
				}) : s.pipe(fn);
			}) : s.pipe(fn);
		});
	});
}
