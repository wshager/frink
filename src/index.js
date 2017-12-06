import * as inode from "./inode";

import { zeroOrOne, create } from "./seq";

import { Parser } from "./parser";

import { parse as parseStreaming } from "./parser-l3-stream";

import { readdir, readFile } from "./fs";

import { isNodeEnv } from "./util";

if(isNodeEnv && !global.URL) {
	let url = require("url");
	global.URL = url.URL;
}

export function parseString(str, cb) {
	var parser = new Parser(inode);
	return parser.parseString(str, cb);
}

export function parse($s){
	return zeroOrOne($s).concatMap(s => create(o => {
		parseString(s,function(err,ret){
			if(err) return o.error(err);
			o.next(ret);
			o.complete();
		});
	})).share();
}

export function doc($file){
	return zeroOrOne($file).concatMap(file => create(o => {
		readFile(file.toString(),(err, res) => {
			if(err) return o.error(err);
			parse(res.toString()).subscribe({
				next:x => o.next(x),
				error: err => o.error(err),
				complete: () => o.complete()
			});
		});
	})).share();
}

export function docStreaming($file) {
	return zeroOrOne($file).concatMap(file => create(o => {
		readFile(file.toString(),(err, res) => {
			if(err) return o.error(err);
			return parseStreaming(res.toString()).subscribe({
				next:x => o.next(x),
				error: err => o.error(err),
				complete: () => o.complete()
			});
		});
	})).share();
}

export function collection($uri) {
	return zeroOrOne($uri).concatMap(uri => create(o => {
		readdir(uri,function(err,res){
			if(err) return o.error(err);
			res.forEach(file => {
				doc(uri+"/"+file).subscribe({
					next: x => o.next(x),
					error: err => o.error(err)
				});
			});
			o.complete();
		});
	})).share();
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
