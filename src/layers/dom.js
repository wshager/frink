import { forEach } from "./seq";

import { boolean, not } from "./boolean/value";

import { isNodeEnv } from "./util";

if(isNodeEnv && !global.URL) {
	let url = require("url");
	global.URL = url.URL;
}

export * from "./qname";

export * from "./seq";

export * from "./seq/op";

export * from "./seq/card";

export * from "./seq/value";

export * from "./seq/aggregate";

export * from "./type";

export * from "./typed";

export * from "./string";

export * from "./function";

export * from "./op";

const iff = (c,t,f) => forEach(boolean(c),ret => ret ? t.apply() : f.apply());

export { iff as if };

const _f = () => false;
const _t = () => true;

export { boolean, not, _f as false, _t as true};
