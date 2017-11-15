import * as ohamt from "ohamt";

import { seq, isSeq, of, isExactlyOne, exactlyOne } from "./seq";

import { isObject } from "./util";

import { map } from "./access";

import { error } from "./error";

//import { eq } from "./op";

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

export function isMap(maybe){
	return !!(maybe && maybe.__is_Map);
}

const fromEntries = (entries, m = _create()) => {
	m = m.beginMutation();
	for(const kv of entries) m = m.set(kv[0],kv[1]);
	return m.endMutation();
};

const _create = () => ohamt.make({
	keyEq: (x,y) => x instanceof Object && "eq" in x ? x.eq(y) : x === y
});

export default function construct(...a){
	const l = a.length;
	if(l===0){
		return seq(_create());
	}
	if(l==1){
		const s = a[0];
		if (isSeq(s)) return merge(s);
		if (isMap(s)) return of(s);
		if (isObject(s)) return of(fromEntries(Object.entries(s)));
		// TODO VNode conversion + detect tuple
		if (map()(s)) return of(s.toMap());
		return error("XXX","Not a map or tuple");
	}
	// expect a sequence of maps or each argument to be a map
	return merge(seq(a.map(x => seq(x))).concatAll());
}

export const merge = $m => {
	if ($m === undefined) return error("XPTY0004");
	// assume a sequence of vectors
	return $m.reduce(function(pre,cur){
		// TODO force persistent cx
		if(map()(cur)) cur = cur.toMap();
		if(!isMap(cur)) return error("XPTY0004","One of the items for map:merge is not a map.");
		return fromEntries(cur,pre);
	},_create());
};

export function put($m,$k,$v) {
	return exactlyOne($m).concatMap(m => {
		$v = seq($v);
		return exactlyOne($k)
			.concatMap(k => isExactlyOne($v).concatMap(test => test ? $v.map(v => m.set(k, v)) : m.set(k,$v)));
	});
}

export function keys($m) {
	return exactlyOne($m).concatMap(m => m.keys());
}

export function contains($m,$k){
	return exactlyOne($m).concatMap(m => exactlyOne($k).map(k => m.has(k)));
}

export function size($m) {
	return exactlyOne($m).map(m => m.count());
}

export function forEachEntry($m,$fn){
	return exactlyOne($fn).concatMap(fn => exactlyOne($m).concatMap(m => m.entries()).concatMap(kv => fn(seq(kv[0]),seq(kv[1]))));
}

export function entry($k,$v){
	// TODO template errors
	$v = seq($v);
	return seq($k).concatMap(k => {
		var m  = _create();
		return isExactlyOne($v).concatMap(test => test ? $v.map(v => m.set(k,v)) : m.set(k,$v));
	});
}

export function get($m,$k) {
	return exactlyOne($m).concatMap(m => exactlyOne($k).map(k => m.get(k)));
}

export function remove($m,$k) {
	return exactlyOne($m).concatMap(m => exactlyOne($k).map(k => m.delete(k)));
}
