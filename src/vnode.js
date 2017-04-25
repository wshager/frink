import { ensureRoot, q } from './construct';

import { prettyXML } from "./pretty";

import { forEach, foldLeft, into, range } from "./transducers";

import * as multimap from "./multimap";

import * as entries from "entries";

export function value(type, name, value){
	return value;
}

export function VNode(inode,type,name,value,parent,depth,indexInParent,cache){
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
	this.cache = cache;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function(){
	var root = ensureRoot(this);
	return stringify(root.inode);
};


VNode.prototype._get = function(idx){
	if(this.type == 1 || this.type == 9) {
		let keys = this.cache || this.keys();
		return keys[idx];
	}
	return this.inode[idx];
};

VNode.prototype.count = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children.length;
	if(type == 5) return inode.length;
	if(type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.keys = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) {
		let children = inode.$children, len = children.length, cache = multimap.default();
		for(let i = 0; i<len; i++){
			cache.push([children[i].$name || i + 1,children[i]]);
		}
		this.cache = cache;
		return cache.keys();
	}
	if(type == 5) return range(inode.length).toArray();
	if(type == 6) {
		let keys = Object.keys(inode);
		this.cache = keys;
		return keys;
	}
	return [];
};

VNode.prototype.values = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children;
	if(type == 5) return inode;
	if(type == 6) return Object.values(inode);
	return inode;
};

VNode.prototype.first = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children[0];
	if(type == 5) return inode[0];
	if(type == 6) {
		var keys = this.cache || this.keys();
		return inode[keys[0]];
	}
};

function _last(a){
	return a[a.length-1];
}

VNode.prototype.last = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return _last(inode.$children);
	if(type == 5) return _last(inode);
	if(type == 6) {
		var keys = this.cache || this.keys();
		return inode[_last(keys)];
	}
};

VNode.prototype.next = function(node){
	var type = this.type, inode = this.inode, idx = node.name;
	if(type == 1 || type == 9) {
		return inode.$children[node.indexInParent+1];
	}
	if(type == 5) return inode[idx];
	if(type == 6) {
		var entry = inode[idx];
		return entry;
	}
};


VNode.prototype.push = function(child){
	var name = child.name, val = child.inode;
	var type = this.type;
	if(type == 5) {
		this.inode.push(val);
	} else if(type == 6){
		this.inode[name] = val;
	}
	return this;
};

VNode.prototype.set = function(key,val){
	// used to restore immutable parents, never modifies mutable
	return this;
};

VNode.prototype.removeChild = function(child){
	var type = this.type;
	if(type == 5) {
		this.inode.splice(child.indexInParent,1);
	} else if(type == 6){
		delete this.inode[child.name];
	}
	return this;
};

VNode.prototype.finalize = function(){
	return this;
};

VNode.prototype.modify = function(node,ref) {
	var pinode = this.inode;
	var type = this.type;
	if(type == 1 || type == 9){
		if (ref !== undefined) {
			pinode.$children.splice(ref.indexInParent,0,node.inode);
		} else {
			pinode.$children.push(node.inode);
		}
	} else if(type == 5){
		if (ref !== undefined) {
			pinode.splice(ref.indexInParent,0,node.inode);
		} else {
			pinode.push(node.inode);
		}
	} else if(type == 6){
		pinode[node.name] = node.inode;
	}
	return this;
};


export function vnode(inode, parent, depth, indexInParent) {
	var type,
	    name,
	    value,
	    cc = inode.constructor;
	if (cc == Array) {
		type = 5;
		name = parent.keys()[indexInParent];
	} else if (cc == Object) {
		if (inode.$name) {
			name = inode.$name;
			type = name == "#document" ? 9 : 1;
		} else {
			type = 6;
			name = parent.keys()[indexInParent];
		}
	} else {
		type = cc == Boolean || cc == Number ? 12 : 3;
		value = inode;
		name = parent.keys()[indexInParent];
	}
	return new VNode(inode, type, inode.$ns ? _construct.q(inode.$ns.uri, name) : name, value, parent, depth, indexInParent);
}

export function emptyINode(type, name, attrs, ns) {
    var inode = type == 5 ? [] : {};
	if(type == 1 || type == 9)
    inode.$name = name;
    inode.$attrs = attrs;
	inode.$ns = ns;
	inode.$children = [];
    return inode;
}

export function emptyAttrMap(init){
	return init || {};
}

export function push(inode,val){
	var cc = inode.constructor;
	if(cc == Array) {
		inode.push(val);
	} else if(cc == Object){
		if(inode.$name) {
			inode.$children.push(val[1]);
		} else {
			inode[val[0]] = val[1];
		}
	}
	return inode;
}

export function finalize(inode){
	return inode;
}

export function setAttribute(inode,key,val){
	if(inode.$attrs) inode.$attrs[key]  = val;
	return inode;
}

export function count(inode){
	var cc = inode.constructor;
	if(cc == Array) {
		return inode.length;
	} else if(cc == Object){
		if(inode.$name) {
			return inode.$children.length;
		} else {
			return Object.keys(inode).length;
		}
	}
	return 0;
}

export function first(inode){
	var cc = inode.constructor;
	if(cc == Array) {
		return inode[0];
	} else if(cc == Object){
		if(inode.$name) {
			return inode.$children[0];
		} else {
			return Object.values(inode)[0];
		}
	}
}

export function attrEntries(inode){
	return entries.default(inode.$attrs);
}

function stringify(e,root=true,json=false){
	var str = "";
	var cc = e.constructor;
	if(cc == Array){
		str += "[";
		str += forEach(e,c => stringify(c,false,json)).join(",");
		str += "]";
	} else if(cc == Object){
		if(e.$name) {
			str += elemToString(e);
		} else {
			str += "{";
			str += forEach(entries.default(e),c => '"'+c[0]+'":'+stringify(c[1],false,json)).join(",");
			str += "}";
		}
	} else {
		str = e.toString();
	}
	return root && !json ? prettyXML(str) : str;
}

function elemToString(e){
	const attrFunc = (z,kv) => {
		return z += " "+kv[0]+"=\""+kv[1]+"\"";
	};
	let str = "<"+e.$name;
	let ns = e.$ns;
	if(ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = foldLeft(entries.default(e.$attrs),str,attrFunc);
	if(e.$children.length > 0){
		str += ">";
		for(let c of e.$children){
			str += stringify(c,false);
		}
		str += "</"+e.$name+">";
	} else {
		str += "/>";
	}
	return str;
}
