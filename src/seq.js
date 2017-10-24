import { Observable } from "rxjs/Observable";
import { error } from "./error";
import "rxjs/add/observable/of";
import "rxjs/add/observable/from";
import "rxjs/add/operator/isEmpty";
import "rxjs/add/operator/take";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/findIndex";
import "rxjs/add/operator/first";
import "rxjs/add/operator/reduce";
import "rxjs/add/operator/map";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/buffer";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/concatMap";
import "rxjs/add/operator/switchMap";

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
// just resolve a seq of promises, like Promise.all
export function when(s,rs,rj){
	return s.buffer().subscribe({
		next:buf => {
			rs(buf);
		},
		error: err => {
			rj(err);
		}
	});
}

export function isSeq(a){
	return !!(a && a instanceof Observable);
}

const undef = s => s === undefined || s === null;

export function seq(...a){
	if (a.length == 0) return Observable.empty();
	if (a.length == 1){
		var x = a[0];
		if(isSeq(x)) return x;
		if(undef(x)) return Observable.empty();
		if(Array.isArray(x) || (x[Symbol.iterator] && typeof x != "string") || typeof x.next == "function") return Observable.from(x);
		return Observable.of(x);
	}
	return Observable.from(a);
}

export function create(o){
	return Observable.create(o);
}

export const first = s => {
	if(!isSeq(s)) s = seq(s);
	return s.first();
};


export function empty(s){
	return seq(s).isEmpty();
}

export function exists(s){
	return !empty(s);
}

export function count(s){
	return seq(s).count();
}

export function insertBefore(s,pos,ins) {
	s = seq(s);
	pos = pos - 1;
	return s.take(pos).merge(seq(ins),s.drop(pos));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
export function zeroOrOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).take(1).isEmpty()).reduce((a,x) => a || x).switchMap(isEmptyOrOne => isEmptyOrOne ? s : error("FORG0003"));
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function oneOrMore($arg) {
	var s = seq($arg);
	return s.isEmpty().switchMap(isEmpty => isEmpty ? error("FORG0004") : s);
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
export function exactlyOne($arg) {
	var s = seq($arg);
	return s.isEmpty().merge(s.skip(1).take(1).isEmpty()).reduce((a,x) => a || x).switchMap(isEmptyOrOne => isEmptyOrOne ? error("FORG0005") : s);
}
