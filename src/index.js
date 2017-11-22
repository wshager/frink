import * as inode from "./inode";

import { seq, create, exactlyOne, zeroOrOne } from "./seq";

import { Parser } from "./parser";

// TODO move to better location
// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module
import { readFile, readdir } from "fs";

export function parseString(str, cb) {
	var parser = new Parser(inode);
	return parser.parseString(str, cb);
}

export function parse($a){
	return zeroOrOne($a).concatMap(a => create(o => {
		parseString(a,function(err,ret){
			if(err) return o.error(err);
			o.next(ret);
			o.complete();
		});
	}));
}

export function doc($file){
	return zeroOrOne($file).concatMap(file => create(o => {
		readFile(file.toString(),"utf-8",function(err,res){
			if(err) return o.error(err);
			parse(res.toString()).subscribe({
				error: err => o.error(err),
				next:x => o.next(x),
				complete:() => o.complete()
			});
		});
	}));
}

export function collection($uri) {
	return zeroOrOne($uri).concatMap(uri => create(o => {
		readdir(uri,function(err,res){
			if(err) return o.error(err);
			res.forEach(file => {
				doc(uri+"/"+file).subscribe({
					error:err => o.error(err),
					next:x => o.next(x)
				});
			});
			o.complete();
		});
	}));
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

export * from "./type";

export * from "./string";

export * from "./function";

export * from "./op";

export * from "./validate";

//export { array, map};
