import { prettyXML } from "./pretty";

import { ensureRoot } from './construct';

import { forEach, into } from "./transducers";

import { seq, isSeq } from "./seq";

export function value(type, name, value){
	return value;
}

export function VNode(inode,type,name,value,parent,depth,indexInParent){
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function(){
	var root = ensureRoot(this);
	return root.inode.toString();
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
	if(type == 1 || type == 9) return inode.$children.length;
	if(type == 5) return inode.length;
	if(type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.values = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children.length;
	if(type == 5) return inode.length;
	if(type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.first = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children.length;
	if(type == 5) return inode.length;
	if(type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.last = function(){
	var type = this.type, inode = this.inode;
	if(type == 1 || type == 9) return inode.$children.length;
	if(type == 5) return inode.length;
	if(type == 6) return Object.keys(inode).length;
	return 0;
};

VNode.prototype.next = function(node){
	var inode = node.inode;
	return this.inode.next(inode._name,inode);
};

export function vnode(inode, parent, depth, indexInParent){
	var type, cc = inode.constructor;
	if(cc == Array) {
		type = 5;
	} else if(cc == Object){
		if(inode.$name) {
			type = inode.$attrs.has("DOCTYPE") ? 9 : 1;
		} else {
			type = 6;
		}
	} else {
		type = (cc == Boolean || cc == Number) ? 12 : 3;
	}
	return new VNode(inode, type, inode.$ns ? q(inode.$ns.uri, inode.$name) : inode.$name, (type == 3 || type == 12) ? inode : null, parent, depth, indexInParent);
}

VNode.prototype._get = function(idx){
	if(this.type == 1 || this.type == 9) {
		var children = this.inode.$children;
		for(let i = 0, l = children.length; i<l; i++){
			if(children[i].$name == idx) return children[i];
		}
	}
	return this.inode[idx];
};

export function emptyINode(type, name, attrs, ns) {
    var inode = type == 5 ? [] : {};
	if(type == 1 || type == 9)
    inode.$name = name;
    inode.$attrs = attrs;
	inode.$ns = ns;
	inode.$children = [];
    return inode;
}

export function restoreNode(next,node){
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._ns = node._ns;
	return next;
}


export function emptyAttrMap(){
	return Map();
}

function elemToString(e){
	const attrFunc = (z,v,k) => {
		return z += " "+k+"=\""+v+"\"";
	};
	let str = "<"+e._name;
	let ns = e._ns;
	if(ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = e._attrs.reduce(attrFunc,str);
	if(e.size > 0){
		str += ">";
		for(let c of e.values()){
			str += c.toString(false);
		}
		str += "</"+e._name+">";
	} else {
		str += "/>";
	}
	return str;
}

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.__is_Map = true;

OrderedMap.prototype.toString = function(root = true, json = false){
	var str = "";
	var type = this._type;
	const docAttrFunc = (z,v,k) =>
		z += k=="DOCTYPE" ? "<!"+k+" "+v+">" : "<?"+k+" "+v+"?>";
	const objFunc = (kv) => "\""+kv[0]+"\":"+kv[1].toString(false,true);
	if(type==1) {
		str += elemToString(this);
	} else if(type==3 || type == 12){
		str += this.toString();
	} else  if(type == 6){
		str += "{";
		str += into(this,forEach(objFunc),[]).join(",");
		str += "}";
	} else if(type==9){
		str = this._attrs.reduce(docAttrFunc,str);
		for(let c of this.values()){
			str += c.toString(false);
		}
	}
	return root ? prettyXML(str) : str;
};

var List = rrb.empty.constructor;

List.prototype.__is_List = true;

List.prototype.toString = function(root = true, json = false){
	var str = "[";
	for(var i=0,l = this.size; i < l; ){
		str += this.get(i).toString(false,true);
		i++;
		if(i<l) str += ",";
	}
	return str + "]";
};
