import * as rrb from "rrb-vector";

import { error } from "./error";

import { seq, from, of, first, isSeq, foldLeft as seqFoldLeft, zeroOrOne, exactlyOne, isExactlyOne } from "./seq";

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
import { ensureDoc } from "./doc";

import { list } from "./access";

import { isArray, isUndef, isList } from "./util";


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

export default function array(...a) {
	var l = a.length;
	if(l===0){
		return seq(rrb.empty);
	}
	if(l==1){
		const s = a[0];
		if (isSeq(s)) return join(s);
		if (isList(s)) return of(s);
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
		if(list()(cur)) cur = cur.toArray();
		if(!isList(cur)) return error("XPTY0004","One of the items for array:join is not an array.");
		return rrb.concat(pre,cur);
	},rrb.empty);
}

function _checked($a, fn, ...args) {
	if ($a === undefined) return error("XPTY0004");
	return exactlyOne($a).concatMap(a => !isList(a) ? error("XPTY0004","The provided item is not an array.") : seq(fn.bind(a,a).apply(a, args)));
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
		return isUndef($l) ? rrb.slice(a,s) : seq($l).map(l => rrb.slice(a,s,Math.max(s + Number(l),0)));
	}));
}

const _singleOrSeq = ($v,fn) => {
	$v = seq($v);
	return isExactlyOne($v).switchMap(test => test ? $v.map(fn) : fn($v));
};

const _insertBefore = (a,i,v) => a.slice(0,i).push(v).concat(a.slice(i));

export function insertBefore($a, $i, $v) {
	return seq($i).concatMap(i => _checked($a, a => _singleOrSeq($v,_insertBefore.bind(a,a,i - 1))).concatAll());
}

const _remove = (a, i) => a.slice(0,i - 1).concat(a.slice(i));

export function remove($a,$i) {
	return seq($i).concatMap(i => _checked($a, a => _remove(a,i < 1 ? 1 : i)));
}

export function append($a,$v) {
	return _checked($a,a => _singleOrSeq($v,rrb.push.bind(a,a))).concatAll();
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

export function foldLeft($a,$z,$f){
	if(isUndef($f)) {
		$f = $z;
		$z = undefined;
	}
	return seqFoldLeft(flatten(exactlyOne($a)),$z,$f);
}
