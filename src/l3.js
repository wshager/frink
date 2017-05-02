import * as inode from './inode';

import { iter } from "./access";

export function str2array(str, ar, idx){
    for (var i=0, strLen=str.length; i<strLen; i++) {
        //ar.push(str.codePointAt(i));
        ar[idx++] = str.codePointAt(i);
    }
    return idx;
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
    var block = 1024 * 1024 * 8;
	var out = new Uint32Array(block),
	    names = {},
	    i = 0,
        j = 0;
	for (let attr of attrEntries(doc)) {
		let name = attr[0], attrname = "@"+name;
		if (!names[attrname]) {
			names[attrname] = ++j;
			out[i++] = 0;
			out[i++] = 15;
			i = str2array(name,out,i);
		}
		out[i++] = docAttrType(attr[0]);
		i = str2array(attr[0],out,i);
		i = str2array(attr[1],out,i);
	}
    var cx = this.vnode ? this : inode;
	iter.bind(cx)(doc, function (node) {
		let type = node.type,
		    depth = node.depth,
		    name = node.name;
        var nameIndex = 0;
        if (typeof name === "string") {
			if(!names[name]) {
				names[name] = ++j;
				out[i++] = 0;
				out[i++] = 15;
				i = str2array(name,out,i);
			}
			nameIndex = names[name];
		}
        out[i++] = 0;
        out[i++] = type;
        out[i++] = depth;
        if(nameIndex) out[i++] = nameIndex;
		if (type == 1) {
			for (let attr of node.attrEntries()) {
				let name = attr[0], attrname = "@"+name;
				if (!names[attrname]) {
					names[attrname] = ++j;
					out[i++] = 0;
					out[i++] = 15;
					i = str2array(name,out,i);
				}
				out[i++] = 0;
				out[i++] = 2;
				out[i++] = names[attrname];
				i = str2array(attr[1],out,i);
			}
		} else if (type == 3) {
			i = str2array(node.value,out,i);
        } else if(type == 12){
            i = str2array(node.value+"",out,i);
        }
	});
    // remove first 0
    //out.shift();
	return out.subarray(1,i+1);
}

export function fromL3(l3) {
	var names = {},
	    n = 0,
	    parents = [],
		depth = 0;
    var cx = this.vnode ? this : inode;
	var doc = cx.emptyINode(9, "#document", cx.emptyAttrMap());
	parents[0] = doc;
	const process = function(entry){
		let type = entry[0];
        // TODO have attributes accept any type
        if(type == 2){
            let parent = parents[depth];
            let name = names[entry[1]];
			parent = cx.setAttribute(parent, name, array2str(entry,2));
        } else if(type == 7 || type == 10){
            doc = cx.setAttribute(doc, entry[1], array2str(entry,2));
        } else if(type == 15){
            n++;
            names[n] = array2str(entry,1);
        } else if(type != 17){
            depth = entry[1];
            let parent = parents[depth - 1];
            let parentType = !!parent && parent._type;
            var node, name, valIndex;
    		if(type == 1 || type == 5 || type == 6) {
                name = names[entry[2]];
                if(parents[depth]) {
                    parents[depth] = cx.finalize(parents[depth]);
                }
    			node = cx.emptyINode(type, name, cx.emptyAttrMap());
    			parents[depth] = node;
    		} else if(type == 3){
                if(parentType == 1 || parentType == 9){
                    name = count(parent);
                    valIndex = 2;
                } else {
                    name = names[entry[2]];
                    valIndex = 3;
                }
    			node = cx.ivalue(type,name,array2str(entry,valIndex));
            } else  if(type == 12){
                if(parentType == 1 || parentType == 9){
                    name = cx.count(parent);
                    valIndex = 2;
                } else {
                    name = names[entry[2]];
                    valIndex = 3;
                }
                node = cx.ivalue(type,name,convert(array2str(entry,valIndex)),depth);
            }
            if (parent) parent = push(parent,[name, node]);
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
	return cx.finalize(parents[0]);
}
