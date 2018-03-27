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

require("rxjs/add/observable/fromPromise");

require("rxjs/add/observable/range");

require("rxjs/add/observable/empty");

require("rxjs/add/observable/throw");

require("rxjs/add/operator/toArray");

require("rxjs/add/operator/isEmpty");

require("rxjs/add/operator/take");

require("rxjs/add/operator/takeWhile");

require("rxjs/add/operator/skip");

require("rxjs/add/operator/first");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/buffer");

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

require("rxjs/add/operator/publishReplay");

require("rxjs/add/operator/count");

require("rxjs/add/operator/do");

require("rxjs/add/operator/observeOn");

var _pipe = require("rxjs/util/pipe");

_Observable.Observable.prototype.call = function($,...a) {
	return forEach(exactlyOne(this),s => {
		const _isList = _util.isList(s);
		if(_isList || _util.isMap(s)) {
			const len = a.length;
			let [k,v] = a;
			if(len == 1) return forEach(exactlyOne(k), k => {
				const v = s.get(_isList? k - 1 : k);
				return _util.isUndef(v) ? seq() : v;
			});
			if(len == 2) return forEach(exactlyOne(k), k => s.set(k,v));
			throw new Error("Incorrect number of arguments");
		}
		if(typeof s == "function") return s.apply(null,a);
		throw new Error("No callable type");
	});
};

function replay($s) {
	if(!($s.source && $s.source.subjectFactory)) {
		$s = $s.publishReplay().refCount();
	}
	return $s;
}

module.exports.replay = replay;

var fromArgs = exports.fromArgs = function fromArgs(args) {
	return seq(args.map(function (x) {
		return seq(x);
	})).concatAll();
};

function compose() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return fromArgs(args).toArray().map(function (a) {
		return _pipe.pipe.apply(a, a);
	});
}


class Thunk {
	constructor(f,args) {
		this.f = f;
		this.args = args;
	}
	apply($o) {
		var args = this.args, f = this.f;
		//return create($o => {
		var done = 0;
		var len = args.length;
		var vals = new Array(len);
		const _complete = () => {
			var ret = f.apply(null,vals);
			if(isSeq(ret)) {
				ret.subscribe({
					next:function(x) {
						console.log("x",x);
						if(x instanceof Thunk) {
							x.apply($o);
						} else {
							$o.next(x);
							$o.complete();
						}
					}
				});
			} else {
				$o.next(ret);
				$o.complete();
			}
		};
		for(var i=0;i<len;i++) {
			const a = args[i];
			if(isSeq(a)) {
				var ret = [];
				a.subscribe({
					next:function(x) {
						ret.push(x);
					},
					complete: function() {
						done++;
						vals[i] = from(ret);
						if(done == len) _complete();
					}
				});
			} else {
				vals[i] = a;
				done++;
				if(done == len) _complete();
			}
		}
		//});
	}
}

exports.rec = (f,...a) => {
	return new Thunk(f,a);
};

var forEach = exports.forEach = function forEach($s, $fn) {
	if (!(0, _util.isUndef)($fn)) {
		if(!isSeq($s)) {
			//console.log("forEach direct complete",$s);
			return $fn($s);
			//$s = of($s);
		}
		//return seq($fn).switchMap(fn => {
		return replay(create($o => {
			var index = 0;
			var active = 1;
			const _next = function(ret) {
				//var sub = this;
				if(isSeq(ret)) {
					ret.subscribe({
						next:function(v)  {
							if(v instanceof Thunk) {
								console.log("thunk1",v);
								v.apply($o);
							} else {
								$o.next(v);
							}
						},
						complete:function() {
							active--;
							if(active == 0) {
								//console.log("forEach inner complete");
								//this.unsubscribe();
								//sub.unsubscribe();
								$o.complete();
							}
						},
						error:err => {
							$o.error(err);
						}
					});
				} else {
					if(ret instanceof Thunk) {
						console.log("thunk2");
						ret.apply($o);
					} else {
						$o.next(ret);
						active--;
						if(active == 0) $o.complete();
					}
				}
			};
			$s.subscribe({
				next:function(x) {
					active++;
					var ret = $fn(x,index++);
					_next(ret);
				},
				complete:function() {
					active--;
					if(active == 0) {
						//console.log("forEach outer complete");
						$o.complete();
						//this.unsubscribe();
					}
				},
				error:err => {
					$o.error(err);
				}
			});
		}));
	}
	return seq($s).map(function (fn) {
		return (0, _operators.concatMap)(function (x) {
			return seq(fn(x));
		});
	});
};
var filter = exports.filter = function($s,$fn) {
	return replay(create($o => {
		var index = 0;
		var active = 1;
		$s.subscribe({
			next:function (x) {
				active++;
				try {
					x.__cx = [index];
				} catch(err) {
					x = new x.constructor(x);
					x.__cx = [index];
				}
				var ret = $fn(x,index++);
				if(isSeq(ret)) {
					ret.subscribe({
						next:v => {
							if(v) $o.next(x);
						},
						complete:() => {
							active--;
							//console.log("filter inner complete",active);
							if(active == 0) $o.complete();
						},
						error:err => {
							$o.error(err);
						}
					});
				} else {
					if(ret) $o.next(x);
					active--;
					if(active == 0) $o.complete();
				}
			},
			complete:() => {
				active--;
				//console.log("filter outer complete",active);
				if(active == 0) $o.complete();
			},
			error:err => {
				$o.error(err);
			}
		});
	}));
};
var _wrap = function _wrap(fn) {
	return function () {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return seq(fn.apply(null, args.map(function (x) {
			return seq(x);
		})));
	};
};

var foldLeft = exports.foldLeft = function foldLeft($a,$seed,$fn) {
	let $out = create($o => {
		var _complete = () => {
			if(!isSeq($seed)) {
				$o.next($seed);
				$o.complete();
			} else {
				$seed.subscribe({
					next: s => {
						$o.next(s);
					},
					complete:() => {
						$o.complete();
					},
					error:err => {
						$o.error(err);
					}
				});
			}
		};
		var _handle = a => {
			$seed = $fn($seed,a);
		};
		if(!isSeq($a)) {
			console.log("a1",$a);
			_handle($a);
			_complete();
		} else {
			$a.subscribe({
				next: a => {
					_handle(a);
				},
				complete:() => {
					_complete();
				},
				error:err => {
					$o.error(err);
				}
			});
		}
	});
	return replay($out);
};

var from = exports.from = function from(a) {
	return replay(_Observable.Observable.from(a));
};

var of = exports.of = function of(a) {
	return replay(_Observable.Observable.of(a));
};

var fromPromise = exports.fromPromise = function fromPromise(a) {
	return replay(_Observable.Observable.fromPromise(a));
};

exports.toPromise = function(s) {
	return s.toPromise();
};
/*function _asyncIteratorToObservable(asyncIter) {
	const forEach = (ai, fn, cb) => {
		return ai.next().then(function (r) {
			if (!r.done) {
				try {
					fn(r.value);
				} catch(err) {
					cb(err);
				}
				return forEach(ai, fn, cb);
			} else {
				cb();
			}
		}, cb);
	};
	return new Observable(sink => {
		forEach(asyncIter,x => sink.next(x), err => {
			if(err) return sink.error(err);
			sink.complete();
		});
	});
}*/
/*
LazySeq.prototype.toString = function(){
	return "Seq [" + this.iterable + "]";
};
*/
// resolve an observable like a promise
function when(s, rs, rj) {
	return s.buffer().subscribe({
		next: function next(buf) {
			rs(buf);
		},
		error: function error(err) {
			rj(err);
		}
	});
}

function isSeq(a) {
	return !!(a && a instanceof _Observable.Observable);
}

function seq() {
	for (var _len3 = arguments.length, a = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
		a[_key3] = arguments[_key3];
	}

	if (a.length == 0) return replay(_Observable.Observable.empty());
	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) {
			return replay(x);
		}
		if ((0, _util.isUndefOrNull)(x)) return replay(_Observable.Observable.empty());
		if ((0, _util.isObject)(x) && (x instanceof Promise || typeof x.then == "function")) return fromPromise(x);
		if (Array.isArray(x) || x[Symbol.iterator] && typeof x != "string" && !(0, _util.isDOMNode)(x) && !(0, _util.isUntypedAtomic)(x) && !(0, _access.isVNode)(x) && !(0, _util.isList)(x) && !(0, _util.isMap)(x)) return replay(from(x));
		return of(x);
	}
	return from(a.map(x => isSeq(x) ? x : _Observable.Observable.of(x))).mergeAll();
}

function create(o) {
	return _Observable.Observable.create(o);
}

var first = exports.first = function first(s) {
	return seq(s).first();
};

function empty(s) {
	return seq(s).isEmpty();
}

function exists(s) {
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
	return forEach($s,function (s) {
		return forEach($n,function (n) {
			return replay(_Observable.Observable.range(s, n));
		});
	});
}

var isZeroOrOne = exports.isZeroOrOne = function isZeroOrOne(s) {
	return s.skip(1).isEmpty();
};

var isOneOrMore = exports.isOneOrMore = function isOneOrMore(s) {
	return s.isEmpty().map(function (x) {
		return !x;
	});
};

var isExactlyOne = exports.isExactlyOne = function isExactlyOne(s) {
	return s.isEmpty().zip(s.skip(1).isEmpty(), function (x, y) {
		return !x && y;
	});
};

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if(!isSeq($arg)) return $arg;
	var s = $arg.publishReplay(2).refCount();
	return isZeroOrOne(s).switchMap(function (test) {
		return test ? $arg : (0, _error.error)("FORG0003");
	});
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if(!isSeq($arg)) return $arg;
	var s = $arg.publishReplay().refCount();
	return isOneOrMore(s).switchMap(function (test) {
		return test ? $arg : (0, _error.error)("FORG0004");
	});
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if(!isSeq($arg)) return $arg;
	var s = $arg;//.publishReplay(2).refCount();
	return isExactlyOne(s).switchMap(function (test) {
		//if(!test) $arg.count().subscribe(x => console.log("exactlyOne failed",x));
		return test ? $arg : (0, _error.error)("FORG0005");
	});
}

function transform($arg, $fn) {
	var s = seq($arg);
	return seq($fn).concatMap(function (fn) {
		return isExactlyOne(s).switchMap(function (test) {
			return test ? s.concatMap(function (x) {
				return x[Symbol.iterator] ? from(x).pipe(fn).reduce(function (a, x) {
					return a["@@transducer/step"](a, x);
				}, x["@@transducer/init"]()).map(function (x) {
					return x["@@transducer/result"](x);
				}) : s.pipe(fn);
			}) : s.pipe(fn);
		});
	});
}
