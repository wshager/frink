import * as ohamt from "ohamt";

import * as rrb from "rrb-vector";

import { ensureRoot, q } from './construct';

import { prettyXML } from "./pretty";

import { forEach, into } from "./transducers";

export function Value(type, name, value) {
	this._type = type;
	this._name = name;
	this._value = value;
}

Value.prototype.__is_Value = true;

Value.prototype.get = function(){
	return this._value;
};

Value.prototype[Symbol.iterator] = function*(){
	yield this;
};

Value.prototype.values = function(){
	return this[Symbol.iterator]();
};

Value.prototype.count = function(){
	return 0;
};

Value.prototype.size = 0;

Value.prototype.toString = function(root = true, json = false) {
	var str = this._value + "";
	if(this._type == 3 && json) return '"'+str+'"';
	return str;
};

export function value(type, name, value){
	return new Value(type, name, value);
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

VNode.prototype._get = function(idx){
	return this.inode.get(idx);
};

VNode.prototype.count = function(){
	return this.inode.count();
};

VNode.prototype.keys = function(){
	return this.inode.keys();
};

VNode.prototype.values = function(){
	return this.inode.values();
};

VNode.prototype.first = function(){
	return this.inode.first();
};

VNode.prototype.last = function(){
	return this.inode.last();
};

VNode.prototype.next = function(node){
	var inode = node.inode;
	return this.inode.next(inode._name,inode);
};

VNode.prototype.push = function(val){
	this.inode = restoreNode(this.inode.push(val), this.inode);
	return this;
};

VNode.prototype.set = function(key,val){
	this.inode = restoreNode(this.inode.set(key,val), this.inode);
	return this;
};

VNode.prototype.removeValue = function(key,val){
	this.inode = restoreNode(this.inode.removeValue(key, val), this.inode);
	return this;
};


export function vnode(inode, parent, depth, indexInParent){
	return new VNode(inode, inode._type, inode._ns ? q(inode._ns.uri, inode._name) : inode._name, inode._value, parent, depth, indexInParent);
}

export function emptyINode(type, name, attrs, ns) {
    var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
    inode._type = type;
    inode._name = name;
    inode._attrs = attrs;
	inode._ns = ns;
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
	return ohamt.empty.beginMutation();
}

VNode.prototype.modify = function(node,ref) {
	var pinode = this.inode;
	var type = this.type;
	if(type == 1 || type == 9){
		if (ref !== undefined) {
			this.inode = restoreNode(pinode.insertBefore([ref.name,ref.inode],[node.name,node.inode]), pinode);
		} else {
			// FIXME check the parent type
			this.inode = restoreNode(pinode.push([node.name,node.inode]), pinode);
		}
	} else if(type == 5){
		if (ref !== undefined) {
			this.inode = restoreNode(pinode.insertBefore(ref,node.inode), pinode);
		} else {
			this.inode = restoreNode(pinode.push(node.inode), pinode);
		}
	} else if(type == 6){
		this.inode = restoreNode(pinode.set(node.name,node.inode), pinode);
	}
	return this;
};

VNode.prototype.finalize = function(){
	this.inode = this.inode.endMutation();
	return this;
};

VNode.prototype.setAttribute = function(key,value,ref){
	// ignore ref for now
	this.inode._attrs = this.inode._attrs.set(key,value);
	return this;
};

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
