import * as rrb from "rrb-vector";

import { error } from "./error";

import { seq, first, isSeq, isEmpty } from "./seq";

import { into, transform, compose, filter, forEach, foldLeft, cat } from "./transducers";


var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype["@@empty"] = function(){
	return rrb.empty;
}

List.prototype["@@append"] = List.prototype.push;

rrb.TreeIterator.prototype["@@empty"] = function(){
	return rrb.empty;
}

rrb.TreeIterator.prototype["@@append"] = List.prototype.push;


export function isArray($maybe) {
	let maybe = first($maybe);
	return !!(maybe && maybe.__is_List);
}

export default function(...a) {
	var l = a.length;
	if(l===0){
		return rrb.empty;
	}
	if(l==1 && isSeq(a[0])){
		return rrb.fromArray(a[0].toArray());
	}
	return rrb.fromArray(a);//into(a,compose(filter(_ => !isEmpty(_)), forEach(_ => first(_))), rrb.empty);
}

export function join($a) {
	if ($a === undefined) return error("XPTY0004");
	// assume a sequence of vectors
	return foldLeft(a,rrb.empty,function(pre,cur){
		var v = first(cur);
		if(!isArray(v)) return error("XPTY0004","One of the items for array:join is not an array.");
		return pre.concat(v);
	});
}


function _checked($a, fn, ...args) {
	if ($a === undefined) return error("XPTY0004");
	var a = $a;
	if (isSeq($a)) {
		if ($a.size > 1) return error("XPTY0004");
		a = first($a);
	}
	if (!isArray(a)) return error("XPTY0004");
	args.unshift(a);
	return fn.apply(a, args);
}

export function head($a) {
	return _checked($a, rrb.slice,0,1);
}

export function tail($a) {
	return _checked($a, rrb.slice,1);
}

export function size($a) {
	return _checked($a, List.prototype.count);
}

export function subarray($a,$s,$l) {
	var s =  first($s) || 1, l = first($l);
	var sx = s - 1;
	return _checked($a, rrb.slice, sx,  l ? sx + l : undefined);
}

export function insertBefore($a, $i, $v) {
	var i = first($i) || 1;
	var ix = i.valueOf() - 1;
	// unmarshal Singleton
	var v = isSeq($v) && $v.size > 1 ? $v : first($v);
	return _checked($a, function(a){
		// slice from 0 to i
		// slice form i to end
		// concat s1 + v + s2
		return a.slice(0,ix).push(v).concat(a.slice(ix));
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
	var v = isSeq($v) && $v.size > 1 ? $v : first($v);
	return _checked($a,rrb.push,v);
}

export function reverse($a) {
	return _checked($a,function(a){
		return rrb.fromArray(rrb.toArray(a).reverse());
	});
}

export function flatten($a) {
	return into($a,cat,seq());
}

export function get($a,$i) {
	var i = first($i) || 1;
	var ix = i.valueOf() - 1;
	return _checked($a,rrb.get,ix);
}
