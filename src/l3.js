import FastIntCompression from "fastintcompression";

import { VNode, Value, emptyINode, emptyAttrMap } from './vnode';

import { iter } from "./access";


function str2array(str, ar = []){
    for (var i=0, strLen=str.length; i<strLen; i++) {
      ar.push(str.codePointAt(i));
    }
    return ar;
}

function array2str(ar,i){
	var str = "",l = ar.length;
    for (; i<l; i++) {
    	str += String.fromCodePoint(ar[i]);
    }
    return str;
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
			out = str2array(name,out);
		}
		out.push(docAttrType(attr[0]));
		out = str2array(attr[0],out);
		out = str2array(attr[1],out);
	}
	iter(doc, function (node) {
		let type = node.type,
		    inode = node.inode,
		    depth = inode._depth,
		    name = node.name;
		if (type == 1) {
			if (!names[name]) {
				names[name] = i;
				i++;
				out.push(0);
				out.push(15);
				out = str2array(name,out);
			}
			out.push(0);
			out.push(type);
			out.push(depth);
			out.push(names[name]);
			for (let attr of inode._attrs.entries()) {
				let name = attr[0], attrname = "@"+name;
				if (!names[attrname]) {
					names[attrname] = i;
					i++;
					out.push(0);
					out.push(15);
					out = str2array(name,out);
				}
				out.push(0);
				out.push(2);
				out.push(names[attrname]);
				out = str2array(attr[1],out);
			}
		} else if (type == 3) {
			out.push(0);
			out.push(type);
			out.push(depth);
			out = str2array(node.value,out);
        }
	});
	return FastIntCompression.compress(out);
}


export function fromL3(buf) {
	var l3 = FastIntCompression.uncompress(buf);
	var names = {},
	    n = 1,
	    parents = [],
		depth = 0,
		c = 0;
	var doc = emptyINode(9, "#document", 0, emptyAttrMap());
	parents[0] = doc;
	function process(entry){
		var type = entry[0];
		switch (type) {
			case 1:
			{
				depth = entry[1];
                if(parents[depth]) parents[depth] = parents[depth].endMutation();
				let name = names[entry[2]];
				let node = emptyINode(type, name, depth, emptyAttrMap());
				let parent = parents[depth - 1];
				if (parent) parent = parent.push([name, node]);
				parents[depth] = node;
				break;
			}
			case 2:
			{
				let name = names[entry[1]];
				let parent = parents[depth];
				parent._attrs = parent._attrs.push([name, array2str(entry,2)]);
				break;
			}
			case 3:
			{
				depth = entry[1];
				let parent = parents[depth - 1];
				let name = parent.count();
				let node = new Value(type,name,array2str(entry,2),depth);
				parent = parent.push([name, node]);
				break;
			}
			case 7:
			case 10:
				doc._attrs = doc._attrs.push([entry[1],array2str(entry,2)]);
			break;
			case 15:
				names[n] = array2str(entry,1);
				n++;
				break;
		}
	}
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
