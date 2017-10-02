import { Observable } from "rxjs/Observable";
import { seq as transform } from "transducers.js";
import { error } from "./error";
import "rxjs/add/observable/from";
import "rxjs/add/operator/reduce";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";


function TransduceObserver(o, xform) {
	this._o = o;
	this._xform = xform;
}

TransduceObserver.prototype.next = function (x) {
	this._xform["@@transducer/step"].call(this._xform, this._o, x);
};

TransduceObserver.prototype.error = function (e) { this._o.error(e); };

TransduceObserver.prototype.completed = function () {
	this._xform["@@transducer/result"](this._o);
};

function transformForObserver(o) {
	return {
		"@@transducer/init": function() {
			return o;
		},
		"@@transducer/step": function(obs, input) {
			return obs.next(input);
		},
		"@@transducer/result": function(obs) {
			return obs.completed();
		}
	};
}

/**
 * Executes a transducer to transform the observable sequence
 * @param {Transducer} transducer A transducer to execute
 * @returns {Observable} An Observable sequence containing the results from the transducer.
 */
function transduceObservable(source, xf) {
	return new Observable(function(o) {
		return source.subscribe(new TransduceObserver(o, xf(transformForObserver(o))));
	}, source);
}

export function LazySeq(iterable){
	this.iterable = isSeq(iterable) ? iterable.iterable : iterable || [];
}

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

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@transducer/step"] = function(s,v) {
	return s.concat(v);
};

LazySeq.prototype["@@transducer/result"] = function(s) { return s; };

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function (...a) {
	// TODO lazy concat
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);
	for(var i = 0, l = a.length; i < l; i++){
		var x = a[i];
		if(_isArray(x)) {
			//  assume flat
			ret = ret.concat(x);
		} else if(isSeq(x)){
			ret = ret.concat(x.toArray());
		} else {
			ret.push(x);
		}
	}
	return new LazySeq(ret);
};

LazySeq.prototype.toString = function(){
	return "Seq [" + this.iterable + "]";
};

LazySeq.prototype.transform = function(xf){
	var iterable = this.iterable;
	if(_isObservable(iterable)) return new LazySeq(transduceObservable(this.iterable,xf));
	return new LazySeq(transform(this.iterable,xf));
};

LazySeq.prototype.count = function(){
	const iter = this.iterable;
	return _isArray(iter) ? iter.length : Infinity;
};

LazySeq.prototype.toArray = function() {
	return Array.from(this.iterable);
};

// just resolve a seq of promises, like Promise.all
export function when(s,rs,rj){
	var a = _isArray(s.iterable) ? s.iterable : Array.from(s.iterable);
	//console.log(ret)
	return Promise.all(a).then(res => {
		var ret = seq();
		for(var x of res){
			ret = ret.concat(x);
		}
		return rs(ret);
	},rj);
}

Object.defineProperty(LazySeq.prototype,"size",{
	get:function(){
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = _isIter(iterable) ? iterable : iterable[Symbol.iterator]();
}

const DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

LazySeq.prototype.subscribe = function(o) {
	return Observable.from(this.iterable).subscribe(o);
};

LazySeq.prototype.reduce = function(f,z){
	return Observable.from(this.iterable).reduce(f,z);
};

LazySeq.prototype.map = function(f,z){
	return Observable.from(this.iterable).map(f,z);
};

function _isArray(a){
	return a && a.constructor == Array;
}

function _isIter(a) {
	return a && typeof a.next == "function";
}

function _isObservable(a) {
	return a && a instanceof Observable;
}

export function seq(...a){
	if (a.length == 1){
		var x = a[0];
		if(isSeq(x)) return x;
		if(_isArray(x) || _isIter(x) || _isObservable(x)) return new LazySeq(x);
	}
	var s = new LazySeq();
	if(a.length === 0) return s;
	return s.concat.apply(s, a);
}

export function isSeq(a){
	return !!(a && a.__is_Seq);
}

export const Seq = LazySeq;

function _first(iter){
	const next = iter.next();
	if(!next.done) return next.value;
}

export const first = s => {
	if(!isSeq(s)) return s;
	const i = s.iterable;
	return _isArray(i) ? i[0] : _isIter(i) ? _first(i) : i;
};

const undef = s => s === undefined || s === null;

export function empty(s){
	return isSeq(s) ? !s.count() : undef(s);
}

export function exists(s){
	return isSeq(s) ? !!s.count() : !undef(s);
}

export function count(s){
	return empty(s) ? 0 : isSeq(s) ? s.count() : undef(s) ? 0 : 1;
}

export function insertBefore(s,pos,ins) {
	pos = first(pos);
	pos = pos === 0 ? 1 : pos - 1;
	var a = s.toArray();
	var n = a.slice(0,pos);
	if(isSeq(ins)) {
		n = n.concat(ins.toArray());
	} else {
		n.push(ins);
	}
	return seq(n.concat(a.slice(pos)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
export function zeroOrOne($arg) {
	if($arg === undefined) return seq();
	if(!isSeq($arg)) return $arg;
	if($arg.size > 1) return error("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	if($arg === undefined) return error("FORG0004");
	if(!isSeq($arg)) return $arg;
	if($arg.size === 0) return error("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	if($arg === undefined) return error("FORG0005");
	if(!isSeq($arg)) return $arg;
	if($arg.size != 1) return error("FORG0005");
	return $arg;
}
