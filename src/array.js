import * as rrb from "rrb-vector";

import { error } from "./error";

import { seq, isSeq, foldLeft as seqFoldLeft, forEach as seqForEach, filter as seqFilter, exactlyOne, from } from "./seq";

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
//import { ensureDoc } from "./doc";

//import { list } from "./access";

import { isUndef, isList } from "./util";

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


List.prototype.call = function($,$k,$v){
	const len = arguments.length;
	return len == 2 ? get(this,$k) : len == 3 ? set(this,$k,$v) : this;
};

module.exports.List = List;

export function array(...a) {
	const l = a.length;
	if (l === 0) {
		return rrb.empty;
	}
	if(l == 1) {
		a = a[0];
		return isSeq(a) ? a.reduce((acc,a) => acc.push(a),rrb.empty) : rrb.empty.push(a);
	}
	return a.reduce((acc,a) => acc.push(a),rrb.empty);
}

export function join($a) {
	if ($a === undefined) return error("XPTY0004");
	// assume a sequence of vectors
	return seq($a).reduce((pre, cur) => {
		// TODO force persistent cx
		//if (list()(cur)) cur = cur.toArray();
		if (!isList(cur)) return error("XPTY0004", "One of the items for array:join is not an array.");
		return rrb.concat(pre, cur);
	}, rrb.empty);
}

const _checked = ($a, fn) => {
	if ($a === undefined) return error("XPTY0004");
	return seqForEach(exactlyOne($a),a => !isList(a) ? error("XPTY0004", "The provided item is not an array.") : fn(a));
};

// TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:
export function head($a) {
	return _checked($a, a => rrb.get(a,0));
}

export function tail($a) {
	return _checked($a, a => rrb.slice(a,1));
}

export function size($a) {
	return _checked($a, a => a.count());
}

export function subarray($a, $s, $l) {
	return _checked($a, a =>
		seqForEach(exactlyOne($s),s => {
			s = s.valueOf() - 1;
			return isUndef($l) ?
				rrb.slice(a, s) :
				seqForEach(exactlyOne($l), l => rrb.slice(a, s, Math.max(s + Number(l), 0)));
		}));
}

const _insertBefore = (a, i, v) => a.slice(0, i).push(v).concat(a.slice(i));

export function insertBefore($a, $i, $v) {
	return _checked($a, a => seqForEach($i, i => seqForEach(exactlyOne($v),v =>_insertBefore(a, i - 1, v))));
}

const _remove = (a, i) => a.slice(0, i - 1).concat(a.slice(i));

export function pop($a) {
	return _checked($a, a => a.pop());
}

export function set($a,$i,$v) {
	return _checked($a, a => seqForEach(exactlyOne($i), i => seqForEach(exactlyOne($v),v => a.set(i,v))));
}

export function remove($a, $i) {
	return _checked($a, a => seqForEach(exactlyOne($i), i => _remove(a, i < 1 ? 1 : i)));
}

export function append($a, $v) {
	return _checked($a, a => seqForEach(exactlyOne($v),v => a.push(v)));
}

export function reverse($a) {
	return _checked($a, a => rrb.fromArray(a.toJS(true).reverse()));
}

export function flatten($a) {
	return seq($a).mergeMap(a => from(a));
}

export function filter($a,$fn) {
	return seqFilter(flatten(exactlyOne($a)),$fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

export function forEach($a,$fn) {
	return seqForEach(flatten(exactlyOne($a)),$fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

export function get($a, $i) {
	if (isUndef($i)) return error("XPST0017");
	return _checked($a, a => seqForEach(exactlyOne($i), i => a.size ? a.get(i - 1) : seq()));
}

export function foldLeft($a, $z, $f) {
	if (isUndef($f)) {
		$f = $z;
		$z = undefined;
	}
	return seqFoldLeft(flatten(exactlyOne($a)), $z, $f);
}
