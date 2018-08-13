import * as ohamt from "ohamt";

import { seq, isSeq, of, from, forEach, exactlyOne } from "./seq";

import { isObject } from "./util";

//import { map } from "./access";

import { error } from "./error";

//import { eq } from "./op";

const OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype._type = 6;

OrderedMap.prototype["@@transducer/init"] = function(){
	return ohamt.empty;
};

OrderedMap.prototype["@@transducer/step"] = function(m,kv) {
	return m.append(kv[0],kv[1]);
};

OrderedMap.prototype["@@transducer/result"] = function(m) {
	return m;
};

OrderedMap.prototype.call = function($,$k,$v) {
	const len = arguments.length;
	if(len == 2) return get(this,$k);
	if(len == 3) return set(this,$k,$v);
	return this;
};

export function isMap(maybe){
	return !!(maybe && maybe.__is_Map);
}

export const fromEntries = (entries, m = _create()) => {
	m = m.beginMutation();
	for(const [k,v] of entries) m = m.set(k,v);
	return m.endMutation();
};

const _create = () => ohamt.make({
	keyEq: (x,y) => x instanceof Object && "eq" in x ? x.eq(y) : x === y
});

export function map(...a) {
	var l = a.length;
	if (l === 0) {
		return _create();
	}
	if (l == 1) {
		var s = a[0];
		if (isSeq(s)) return merge(s);
		if (isMap(s)) return s;
		if (isObject(s)) return fromEntries(Object.entries(s));
		if(Array.isArray(s)) return fromEntries(s);
		// TODO VNode conversion + detect tuple
		//if ((0, _access.map)()(s)) return s.toMap();
		return error("XXX", "Not a map or tuple");
	}
	// expect a sequence of maps or each argument to be a map
	return merge(from(a).mergeAll());
}

export function merge($m) {
	if ($m === undefined) return error("XPTY0004");
	// assume a sequence of vectors
	return $m.reduce((pre, cur) => {
		// TODO force persistent cx
		//if ((0, _access.map)()(cur)) cur = cur.toMap();
		if (!isMap(cur)) {
			return error("XPTY0004", "One of the items for map:merge is not a map.");
		}
		return fromEntries(cur, pre);
	}, _create());
}

const _checked = ($m, fn) => {
	if ($m === undefined) return error("XPTY0004");
	return forEach(exactlyOne($m),m => !isMap(m) ? error("XPTY0004", "The provided item is not a map.") : fn(m));
};

export function set($m, $k, $v) {
	return _checked($m, m => forEach(exactlyOne($k), k => forEach(exactlyOne($v), v => m.set(k,$v))));
}

export function keys($m) {
	return _checked($m, m => m.keys());
}

export function contains($m, $k) {
	return _checked($m, m => forEach(exactlyOne($k), k => m.has(k)));
}

export function size($m) {
	return _checked($m, m => m.count());
}

export function forEachEntry($m, $fn) {
	return _checked($m, m => forEach(exactlyOne($fn), fn => forEach(from(m.entries()),([k,v]) => fn(k, v))));
}

export function entry($k, $v) {
	// TODO template errors
	return forEach(exactlyOne($k),k => forEach(exactlyOne($v), v => fromEntries([[k,v]])));
}

export function get($m, $k) {
	return _checked($m, m => forEach(exactlyOne($k),k => m.has(k) ? m.get(k) : seq()));
}

export function remove($m, $k) {
	return _checked($m, m => forEach(exactlyOne($k), k => m.delete(k)));
}

export { set as put, map as default };
