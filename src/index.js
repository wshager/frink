import { inode } from "l3n";

import { create, forEach, boolean } from "./seq";

import { zeroOrOne } from "./seq/card";

import { Parser } from "./parser";

import { parse as parseStreaming } from "./parser-l3-stream";

import { readdir, readFile } from "./fs";

import { isNodeEnv } from "./util";

import { toVNodeStream } from "l3n";

import { select as selectStreaming, children as childrenStreaming } from "./access-streaming";

const boundSelectStreaming = selectStreaming.bind(inode);

const boundChildrenStreaming = childrenStreaming.bind(inode);

export { boundSelectStreaming as selectStreaming, boundChildrenStreaming as childrenStreaming };

if(isNodeEnv && !global.URL) {
	let url = require("url");
	global.URL = url.URL;
}

export function parseString(str, cb) {
	var parser = new Parser(inode);
	return parser.parseString(str, cb);
}

export function parse($s){
	return forEach(zeroOrOne($s),s => create(o => {
		parseString(s,function(err,ret){
			if(err) return o.error(err);
			o.next(ret);
			o.complete();
		});
	}));
}

export function doc($file){
	return forEach(zeroOrOne($file),file => create(o => {
		readFile(file.toString(),(err, res) => {
			if(err) return o.error(err);
			parse(res.toString()).subscribe({
				next:x => o.next(x),
				error: err => o.error(err),
				complete: () => o.complete()
			});
		});
	}));
}

export function docL3Streaming($file) {
	return forEach(zeroOrOne($file),file => parseStreaming(file.toString()));
}

export function docStreaming($file) {
	// TODO streaming parsing
	return toVNodeStream(docL3Streaming($file),2);
}

export function collection($uri) {
	return forEach(zeroOrOne($uri),uri => create(o => {
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
	}));
}

export * from "./qname";

export * from "./modify";

export * from "./access";

//export * from "./l3";

//export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export * from "./seq";

export * from "./subseq";

export * from "./type";

export * from "./string";

export * from "./function";

export * from "./op";

export * from "./validate";

const iff = (c,t,f) => forEach(boolean(c),ret => ret ? t.apply() : f.apply());

export { iff as if };

const _f = () => false;
const _t = () => true;

export { _f as false, _t as true} ;
