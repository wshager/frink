import * as rrb from "rrb-vector";

import { error } from "./error";

import { isSeq, foldLeft as seqFoldLeft, forEach as seqForEach, filter as seqFilter, from } from "./seq";

// TODO option: call ensureDoc and handle everything via VNode (i.e. persistent or not)
//import { ensureDoc } from "./doc";

//import { list } from "./access";

import { isUndef } from "./util";

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
	return seqFoldLeft((pre, cur) => {
		// TODO force persistent cx
		//if (list()(cur)) cur = cur.toArray();
		//if (!isList(cur)) return error("XPTY0004", "One of the items for array:join is not an array.");
		return rrb.concat(pre, cur);
	}, rrb.empty)($a);
}

// TODO iterator to Observable using transducer protocol
// at the completion of the operation, create a new list
// array:transform($input, ... functions) => zeroOrOne()
// for now:
export function head(a) {
	return rrb.get(a,0);
}

export function tail(a) {
	return rrb.slice(a,1);
}

export function size(a) {
	return a.count();
}

export function subarray(a, s, l) {
	s = s.valueOf() - 1;
	return isUndef(l) ?
		rrb.slice(a, s) :
		l => rrb.slice(a, s, Math.max(s + Number(l), 0));
}

export function insertBefore(a, i, v) {
	return a.slice(0, i).push(v).concat(a.slice(i));
}


export function pop(a) {
	return a.pop();
}

export function set(a,i,v) {
	return a.set(i,v);
}

export function remove(a, i) {
	return a.slice(0, i - 1).concat(a.slice(i));
}

export function append(a, v) {
	return a.push(v);
}

export function reverse(a) {
	return rrb.fromArray(a.toJS(true).reverse());
}

export function flatten(a) {
	return from(a);
}

export function filter(a,fn) {
	return seqFilter(flatten(a),fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

export function forEach(a,fn) {
	return seqForEach(flatten(a),fn).reduce((acc,x) => acc.push(x),rrb.empty);
}

export function get(a, i) {
	return a.size ? a.get(i - 1) : null;
}

export function foldLeft(a, z, f) {
	return seqFoldLeft(flatten(a), z, f);
}
