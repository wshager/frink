import { seq } from "./seq";

import { exactlyOne } from "./seq/card";

import { isUndef, camelCase } from "./util";

import * as map from "./map";

const modules = {
	"http://www.w3.org/2005/xpath-functions":"./function"
};

export function loadModule($moduleUri) {
	// conflict?
	//if (module.uri in modules) return;
	// let js manager handle logic
	return exactlyOne($moduleUri).concatMap(moduleUri => map.default(require(modules[moduleUri])));
}

export function functionLookup($qname,$arity){
	return exactlyOne($qname).concatMap(qname => {
		return exactlyOne($arity).concatMap(arity => {
			var uri = qname.uri.toString();
			var name = camelCase(qname.name.toString().split(/:/).pop());
			var fn = modules[uri][name+"$"+arity];
			if(!fn) fn = modules[uri][name+"$"];
			return fn ? seq(fn) : seq();
		});
	});
}

export function apply($fn,$a) {
	return exactlyOne($fn).concatMap(fn => exactlyOne($a).concatAll().toArray().map(a => fn.apply(this,a)));
}

// FIXME check if seq + apply data
export function sort($s,$fn){
	var crit = function(a,b){
		const hasComp = typeof a == "object" && "gt" in a;
		const gt = (a,b) => hasComp ? a.gt(b) : a > b;
		const lt = (a,b) => hasComp ? a.lt(b) : a < b;
		return gt(a,b) ? 1 : lt(a,b) ? -1 : 0;
	};
	return seq($s).toArray().concatMap(a => isUndef($fn) ? seq(a.sort(crit)) : seq($fn).concatMap(fn => a.sort(fn)));
}
