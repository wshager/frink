import * as inode from "./persist";

import { Parser } from "./parser";

import * as dc from "./doc";

import * as md from "./modify";

import * as ac from "./access";

import * as l3 from "./l3";

// TODO move to better location
// TODO update when loader spec is solid
// TODO add easy access to a xhr / db module
import { readFileSync, readdirSync } from 'fs';

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
    return seq(readDirSync(uri).map(file => doc(uri+"/"+file)));
}

export const ensureDoc = dc.ensureDoc.bind(inode);

export const d = dc.d.bind(inode);

export const appendChild = md.appendChild.bind(inode);

export const insertChildBefore = md.insertChildBefore.bind(inode);

export const removeChild = md.removeChild.bind(inode);

export const firstChild = ac.firstChild.bind(inode);

export const lastChild = ac.lastChild.bind(inode);

export const select = ac.select.bind(inode);

export const fromL3 = l3.fromL3.bind(inode);

export const toL3 = l3.toL3.bind(inode);

// TODO
export { fromJS, toJS, iter as iterJS, toL3 as jsToL3, fromL3 as jsFromL3 } from "./json";

export * from "./construct";

export * from "./qname";

export * from "./seq";

export * from "./subseq";

export * from "./transducers";

export * from "./type";

export * from "./string";

export * from "./function";

export * from "./op";
