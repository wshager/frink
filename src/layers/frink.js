import { first } from "../seq";

import { Observable } from "rxjs/Observable";

import "rxjs/add/observable/from";

import * as inode from "../inode";

import * as dom from "../dom";

export * from "../construct";

export * from "../modify";

export * from "../access";

export * from "../l3";

export * from "../validate";

export * from "../render";

export * from "../seq";

export * from "../doc";

export { dom };

export const toObservable = x => Observable.from(x); 

//export * from "../dom-util";

import { Parser } from "../parser";

export function parseString(str, cb) {
	var parser = new Parser(inode);
	return parser.parseString(str, cb);
}

export function parse($a){
	var xml = first($a);
	var result;
	parseString(xml,function(err,ret){
		if(err) console.log(err);
		result = ret;
	});
	return result;
}
