import * as ohamt from "ohamt";

import { seq, first, isSeq } from "./seq";

import { error } from "./error";

import { into, cat } from "./transducers";

import { eq } from "./op";

const OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype._type = 6;

OrderedMap.prototype["@@transducers/init"] = function(){
	return ohamt.empty;
};

OrderedMap.prototype["@@transducers/step"] = function(m,kv) {
	return m.append(kv[0],kv[1]);
};

OrderedMap.prototype["@@transducers/result"] = function(m) {
	return m;
};

export function isMap($maybe){
	let maybe = first($maybe);
	return !!(maybe && maybe.__is_Map);
}

export default function map(...a){
	var l = a.length;
	var m = ohamt.make({
		keyEq: (x,y) => eq(x,y)
	}).beginMutation();
	if(l===0){
		return m.endMutation();
	}
	// expect a sequence of maps or each argument to be a map
	if(l==1 && isSeq(a[0])){
		a = a[0];
		if(!a.size) return m.endMutation();
	}
	return into(a,cat,m).endMutation();
}

export const merge = map;

export function put($map,$k,$v) {
	var k = first($k);
	var map = first($map);
	return map.set(k,isSeq($v) && $v.size != 1 ? $v : first($v).valueOf());
}

export function keys($map) {
	return seq(first($map).keys());
}

export function contains($map,$k){
	return first($map).has(first($k));
}

export function size($map) {
	return first($map).size;
}

export function forEachEntry($map,$fn){
	let map = first($map);
	let fn = first($fn);
	var ret = seq();
	map.forEach(function(v,k){
		ret = ret.push(fn(k,v));
	});
	return ret;
}

export function entry(...a){
	// TODO template errors
	if(a.length!=2) return error("err:XPST0017","Number of arguments of function map.entry doesn't match function signature (expected 2, got "+a.length+")");
	var m  = ohamt.empty,
		k = first(a[0]),
		v = a[1];
	return m.set(k,isSeq(v) && v.size != 1 ? v : first(v).valueOf());
}

export function get($map,$key) {
	var map = first($map);
	var k = first($key);
	var v = map.get(k);
	return v !== undefined ? v : seq();
}
