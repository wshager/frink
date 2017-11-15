import * as inode from "./inode";

import { seq, first } from "./seq";

import { Parser } from "./parser";

import * as array from "./array";

import * as map from "./map";

// TODO move to better location
// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module
import { readFileSync, readdirSync } from "fs";

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

export function doc($file){
	var file = first($file);
	return parse(readFileSync(file.toString(),"utf-8"));
}

export function collection($uri) {
	var uri = first($uri);
	return seq(readdirSync(uri).map(file => doc(uri+"/"+file)));
}

export * from "./doc";

export * from "./construct";

export * from "./qname";

export * from "./modify";

export * from "./access";

export * from "./l3";

export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export * from "./seq";

export * from "./subseq";

//export * from "./transducers";

export * from "./type";

export * from "./string";

export * from "./function";

export * from "./op";

export * from "./validate";

//export { array, map};
