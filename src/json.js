import { VNode, Value, emptyINode, emptyAttrMap } from './vnode';
import { array2str, str2array, convert } from "./l3";

function process(entry, parent, depth, key) {
	var cc = entry.constructor;
	if (cc === Object) {
		let name = key !== undefined ? key : "#object";
		let node = emptyINode(6, name, depth);
		parent = parent.set(name, node);
		let keys = Object.keys(entry);
		for (let k of keys) {
			process(entry[k], node, depth+1, k);
		}
	} else if (cc === Array) {
		let name = key !== undefined ? key : "#array";
		let node = emptyINode(5, name, depth);
		parent = parent.set(name, node);
		for (let i = 0, len = entry.length; i < len; i++) {
			process(entry[i], node, depth+1, i);
		}
	} else {
		let node = new Value(entry.constructor === String ? 3 : 12, key, entry, depth);
		parent = parent.set(key, node);
	}
}

export function fromJS(json) {
	var doc = emptyINode(9, "#document", 0, emptyAttrMap());
	process(json, doc, 1);
	return doc;
}

export function toJS(doc) {
	function process(inode, out, key) {
		let type = inode._type,
		    name = inode._name;
		if (type == 1) {
			for (let attr of inode._attrs.entries()) {}
		} else if (type == 3) {
			out[key] = inode._value;
		} else if (type == 12) {
			out[key] = inode._value;
		} else if (type == 5) {
			var arr = [];
			for (var i = 0; i < inode.size; i++) {
				process(inode.get(i), arr, i);
			}
			if (out === undefined) {
				out = arr;
			} else {
				out[key] = arr;
			}
		} else if (type == 6) {
			var obj = {};
			inode.forEach((v, k) => {
				process(v, obj, k);
			});
			if (out === undefined) {
				out = obj;
			} else {
				out[key] = obj;
			}
		}
		return out;
	}
	// discard DOC for now
	return process(doc.first());
}

function step(node,depth){
	return {
		__isStep:true,
		node:node,
		depth:depth
	};
}

function getType(val){
	let cc = val.constructor;
	return cc == Array ? 5 : cc == Object ? 6 : cc == String ? 3 : 12;
}

export function iter(json,fn){
	var parents = [], pindexes = [], indexInParent = 0;
	function next(node, skipFirst) {
		var type = node[0],
			depth = node[1],
			entry = node[3];
		if (type == 6) {
			let ks = Object.keys(entry);
			var klen = ks.length;
			// try first entry
			if(klen > 0 && !skipFirst){
				//console.log("found first",ks[0], depth);
				pindexes[depth] = indexInParent;
				parents[depth] = entry;
				indexInParent = 0;
				depth++;
				pindexes[depth] = 0;
				let key = ks[0];
				let val = entry[key];
				return [getType(val),depth,key,val];
			} else {
				pindexes[depth] = ++indexInParent;
				if(indexInParent < klen){
					//console.log("found next",indexInParent,ks[indexInParent]);
					// continue with next
					let key = ks[indexInParent];
					let val = entry[key];
					return [getType(val),depth,key,val];
				} else {
					// go up
					depth--;
					if(depth == 1) return;
					indexInParent = pindexes[depth];
					let parent = parents[depth-1];
					return next([getType(parent),depth,0,parent],true);
				}
			}
		} else if (type == 5) {
			let len = entry.length;
			// try first entry
			if(len > 0 && !skipFirst){
				//console.log("found first",entry[0], depth);
				pindexes[depth] = indexInParent;
				parents[depth] = entry;
				indexInParent = 0;
				depth++;
				pindexes[depth] = 0;
				let key = 0;
				let val = entry[key];
				return [getType(val),depth,key,val];
			} else {
				pindexes[depth] = ++indexInParent;
				if(indexInParent < len){
					//console.log("found next",indexInParent);
					// continue with next
					let key = indexInParent;
					let val = entry[key];
					return [getType(val),depth,key,val];
				} else {
					// go up
					depth--;
					if(depth == 1) return;
					indexInParent = pindexes[depth];
					//console.log("go up a",depth,indexInParent);
					let parent = parents[depth-1];
					return next([getType(parent),depth,0,parent],true);
				}
			}
		} else {
			indexInParent = pindexes[depth];
			let parent = parents[depth-1];
			return next([getType(parent),depth,0,parent],true);
		}
	}
	// this is not the doc, so depth starts at 1
	var node = [getType(json),1,"#",json];
	fn(node);
	do {
		node = next(node);
		if(node) fn(node);
	} while(node);
}

const isObject = function(parent){
	return !!parent && parent.constructor === Object;
};

export function fromL3(l3) {
	var names = {},
	    parents = [],
		n = 0;
	const process = function(entry){
		var type = entry[0],
			depth = entry[1];
		if(type == 15){
			n++;
			names[n] = array2str(entry,1);
		} else {
			let parent = parents[depth - 1];
			let isObj = isObject(parent);
			let index = isObj ? 3 : 2;
			let key = isObj ? names[entry[2]] : null;
			//console.log("key",key, depth, parents[depth]);
			var val;
			if(type == 3){
				val = array2str(entry,index);
			} else if(type == 12){
				val = convert(array2str(entry,index));
			} else if(type == 5){
				val = [];
				parents[depth] = val;
			} else if(type == 6){
				val = {};
				parents[depth] = val;
			}
			if (parent !== undefined) {
				if(isObj){
					parent[key] = val;
				} else {
					parent.push(val);
				}
			}
		}
	};
	var entry = [];
	for (var i = 0, l = l3.length; i < l; i++) {
		if(l3[i] === 0){
			process(entry);
			entry = [];
		} else {
			entry.push(l3[i]);
		}
	}
    process(entry);
	return parents[1];
}


export function toL3(doc){
	var out = [],
	    names = {},
	    i = 1;
	const process = function (node) {
		let type = node[0],
		    depth = node[1],
		    name = node[2],
			val = node[3];
		// detect if parent is object/map, otherwise use integer
		var nameIndex;
		if (typeof name === "string") {
			if(!names[name]) {
				names[name] = i;
				i++;
				out.push(0);
				out.push(15);
				str2array(name,out);
			}
			nameIndex = names[name];
		}
		out.push(0);
		out.push(type);
		out.push(depth);
		if(nameIndex) out.push(nameIndex);
		if (type == 3) {
			str2array(val,out);
		} else if(type == 12) {
			str2array(val+"",out);
		}
	};
	iter(doc, process);
	out.shift();
	return out;
}
