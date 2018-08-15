import { camelCase } from "./util";

import { map } from "./map";

const modules = {
	"http://www.w3.org/2005/xpath-functions":"./function"
};

export function loadModule(moduleUri) {
	// conflict?
	//if (module.uri in modules) return;
	// let js manager handle logic
	return map(require(modules[moduleUri]));
}

export function functionLookup(qname,arity){
	var uri = qname.uri.toString();
	var name = camelCase(qname.name.toString().split(/:/).pop());
	var fn = modules[uri][name+"$"+arity];
	if(!fn) fn = modules[uri][name+"$"];
	return fn ? fn : null;
}

export function apply(fn,a) {
	return fn.apply(this,a.toJS ? a.toJS() : a);
}
