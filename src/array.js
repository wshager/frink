import * as rrb from "rrb-vector";

import { error } from "./error";

import { seq, from, of, first, isSeq, foldLeft as seqFoldLeft, zeroOrOne, exactlyOne } from "./seq";

import { ensureDoc } from "./doc";

import { list } from "./access";

import { isArray, isUndef } from "./util";


var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype._type = 5;

List.prototype["@@transducer/init"] = function(){
	return rrb.empty;
};

List.prototype["@@transducer/step"] = function(l,x) {
	return l.push(x);
};

List.prototype["@@transducer/result"] = function(l) {
	return l;
};

rrb.TreeIterator.prototype["@@transducer/init"] = function(){
	return rrb.empty;
};

rrb.TreeIterator.prototype["@@transducer/step"] = function(l,x) {
	return l.push(x);
};

rrb.TreeIterator.prototype["@@transducer/result"] = function(l) {
	return l;
};

function _isList(maybe) {
	return maybe && maybe.__is_List;
}

export function isList($maybe) {
	let maybe = first($maybe);
}

export default function array(...a) {
	var l = a.length;
	if(l===0){
		return seq(rrb.empty);
	}
	if(l==1){
		const s = a[0];
		if (isSeq(s)) return s;
		if (_isList(s)) return of(s);
		if (isArray(s)) return of(rrb.fromArray(s));
		// TODO VNode conversion
		if (list()(s)) return of(s.toArray());
		return rrb.empty.push(s);
	}
	return join(seq(a.map(of)).concatAll().map(a => array(a)));
}

export function join($a) {
	if ($a === undefined) return error("XPTY0004");
	// assume a sequence of vectors
	return $a.reduce(function(pre,cur){
		// TODO force persistent cx
		if(list(cur)) cur = cur.toArray();
		if(!_isList(cur)) return error("XPTY0004","One of the items for array:join is not an array.");
		return pre.concat(cur);
	},rrb.empty);
}

function _checked($a, fn, ...args) {
	if ($a === undefined) return error("XPTY0004");
	return exactlyOne($a).map(a => !_isList(a) ? error("XPTY0004") : fn.bind(a,a).apply(a, args));
}

// TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:
export function head($a) {
	return _checked($a, rrb.get,0);
}

export function tail($a) {
	return _checked($a, rrb.slice,1);
}

export function size($a) {
	return _checked($a, List.prototype.count);
}

export function subarray($a,$s,$l) {
	return exactlyOne($a).concatMap(a => seq($s).concatMap(s => {
		s = s.valueOf() - 1;
		$l = seq($l);
		return $l.isEmpty().map(test => test ? rrb.slice(a,s) : $l.map(l => rrb.slice(a,s,Math.max(s + Number(l),0))));
	}));
}

export function insertBefore($a, $i, $v) {
	return seq($i).concatMap(i => {
		return _checked($a, function(a){
			const ix = i - 1;
			// slice from 0 to i
			// slice form i to end
			// concat s1 + v + s2
			return a.slice(0,ix).push($v).concat(a.slice(ix));
		});
	});
}

export function remove($a,$i) {
	var i = first($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a, function(a){
		return a.slice(0,ix).concat(a.slice(i));
	});
}

export function append($a,$v) {
	return _checked($a,rrb.push,$v);
}

export function reverse($a) {
	return _checked($a,function(a){
		return rrb.fromArray(a.toJS(true).reverse());
	});
}

export function flatten($a) {
	return $a.concatAll();
}

export function get($a,$i) {
	if(isUndef($i)) return error("XPST0017");
	return exactlyOne($i).concatMap(i => _checked($a,function(a){
		if(a.size) return a.get(i - 1);
		//return seq();
	}));
}

export function forEach($a,$f){
	return t.forEach(first($a),first($f));
}

export function filter($a,$f){
	return t.filter(first($a),first($f));
}

export function foldLeft($a,$z,$f){
	// TODO use iterator to seq, foldLeft seq into new array
	//return zeroOrOne($a).concatMap(a => seq())
	return zeroOrOne($a).concatMap(a => exactlyOne($z).concatMap(z => exactlyOne($f).concatMap(f => t.foldLeft(a,z,f))));
}
