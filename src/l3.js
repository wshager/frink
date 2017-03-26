// optional:
//import FastIntCompression from "fastintcompression";

import { VNode, Value, emptyINode, emptyAttrMap } from './vnode';

import { iter } from "./access";


export function str2array(str, ar){
    for (var i=0, strLen=str.length; i<strLen; i++) {
        ar.push(str.codePointAt(i));
    }
}

export function array2str(ar,i){
	var str = "",l = ar.length;
    for (; i<l; i++) {
    	str += String.fromCodePoint(ar[i]);
    }
    return str;
}

export function convert(v){
	var i = parseFloat(v);
	if(!isNaN(i)) return i;
	if(v === "true" || v === "false") return v !== "false";
	return v;
}

export function toNative1(val){
    if(val === 1) return false;
    if(val === 2) return true;
    if(val === 3) return 0;
    if(val === 4) return null;
}

export function toNative(v,i){
    if(v.length == 1) return new Float64Array(new Uint32Array([0,v[i]]))[0];
    return new Float64Array(new Uint32Array([v[i],v[i+1]]))[0];
}


export function fromNative(v,arr){
    var f = new Float64Array(1);
    f[0] = v;
    var i = new Uint32Array(f.buffer);
    if(i[0]) arr.push(i[0]);
    arr.push(i[1]);
}

function docAttrType(k) {
	switch (k) {
		case "DOCTYPE": return 10;
		default: return 7;
	}
}

/**
 * Create a flat buffer from the document tree
 * @param  {VNode} doc The document
 * @return {ArrayBuffer}  A flat buffer
 */
export function toL3(doc){
	var out = [],
	    names = {},
	    i = 1;
	for (let attr of doc._attrs.entries()) {
		let name = attr[0], attrname = "@"+name;
		if (!names[attrname]) {
			names[attrname] = i;
			i++;
			out.push(0);
			out.push(15);
			str2array(name,out);
		}
		out.push(docAttrType(attr[0]));
		str2array(attr[0],out);
		str2array(attr[1],out);
	}
	iter(doc, function (node) {
		let type = node.type,
		    inode = node.inode,
		    depth = inode._depth,
		    name = node.name;
        var nameIndex = 0;
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
		if (type == 1) {
			for (let attr of inode._attrs.entries()) {
				let name = attr[0], attrname = "@"+name;
				if (!names[attrname]) {
					names[attrname] = i;
					i++;
					out.push(0);
					out.push(15);
					str2array(name,out);
				}
				out.push(0);
				out.push(2);
				out.push(names[attrname]);
				str2array(attr[1],out);
			}
		} else if (type == 3) {
			str2array(node.value,out);
        } else if(type == 12){
            str2array(node.value+"",out);
        }
	});
    // remove first 0
    out.shift();
	return out;
}


export function fromL3(l3) {
	var names = {},
	    n = 0,
	    parents = [],
		depth = 0;
	var doc = emptyINode(9, "#document", 0, emptyAttrMap());
	parents[0] = doc;
	const process = function(entry){
		let type = entry[0];
        // TODO have attributes accept any type
        if(type == 2){
            let parent = parents[depth];
            let name = names[entry[1]];
			parent._attrs = parent._attrs.push([name, array2str(entry,2)]);
        } else if(type == 7 || type == 10){
            doc._attrs = doc._attrs.push([entry[1],array2str(entry,2)]);
        } else if(type == 15){
            n++;
            names[n] = array2str(entry,1);
        } else {
            depth = entry[1];
            let parent = parents[depth - 1];
            let isArray = !!parent && parent._type == 5;
    		let valIndex = isArray ? 2 : 3;
    		let name = isArray ? parent.count() : names[entry[2]];
            var node;
    		if(type == 1 || type == 5 || type == 6) {
                if(parents[depth]) parents[depth] = parents[depth].endMutation();
    			node = emptyINode(type, name, depth, emptyAttrMap());
    			parents[depth] = node;
    		} else if(type == 3){
    			node = new Value(type,name,array2str(entry,valIndex),depth);
            } else  if(type == 12){
                node = new Value(type,name,convert(array2str(entry,valIndex)),depth);
            }
            if (parent) parent = !isArray ? parent.push([name, node]) : parent.push(node);
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
	return parents[0].endMutation();
}
