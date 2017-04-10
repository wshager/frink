import * as ohamt from "ohamt";

import * as rrb from "rrb-vector";

import { prettyXML } from "./pretty";

import { forEach, into } from "./transducers";

import { seq, isSeq } from "./seq";

export function Value(type, name, value, depth) {
	this._type = type;
	this._name = name;
	this._value = value;
	this._depth = depth;
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

export function VNode(inode,type,name,value,parent,indexInParent){
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function(){
	var root = ensureRoot(this);
	return root.inode.toString();
};

export function vnode(inode, parent, indexInParent){
	return new VNode(inode, inode._type, inode._ns ? q(inode._ns.uri, inode._name) : inode._name, inode._value, parent, indexInParent);
}

export function VNodeIterator(iter, parent, f){
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.index = -1;
	this.__is_VNodeIterator = true;
}

const DONE = {
    done: true
};

VNodeIterator.prototype.next = function () {
    var v = this.iter.next();
	this.index++;
    if (v.done) return DONE;
    return { value: this.f(v.value,this.parent,this.index) };
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function(){
	return new VNodeIterator(this.inode.values(),this, vnode);
};

VNode.prototype.get = function(idx){
	var val = this.inode.get(idx);
	if(!val) return [];
	val = val.constructor == Array ? val : [val];
	return new VNodeIterator(val[Symbol.iterator](), this, vnode);
};

export function Step(inode,parent,indexInParent){
	this.inode = inode;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function(){
	return "Step {depth:"+this._depth+", closes:"+this.parent.name+"}";
};

export function emptyINode(type, name, depth, attrs, ns) {
    var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
    inode._type = type;
    inode._name = name;
    inode._depth = depth;
    inode._attrs = attrs;
	inode._ns = ns;
    return inode;
}

export function restoreNode(next,node){
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._ns = node._ns;
	next._depth = node._depth;
	return next;
}

export function emptyAttrMap(){
	return ohamt.empty.beginMutation();
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

function _modify(pinode,node,ref) {
	var type = pinode._type;
	if(type == 1){
		if (ref !== undefined) {
			return restoreNode(pinode.insertBefore([ref.name,ref.inode],[node.name,node.inode]), pinode);
		} else {
			// FIXME check the parent type
			return restoreNode(pinode.push([node.name,node.inode]), pinode);
		}
	} else if(type == 5){
		if (ref !== undefined) {
			return restoreNode(pinode.insertBefore(ref,node.inode), pinode);
		} else {
			return restoreNode(pinode.push(node.inode), pinode);
		}
	} else if(type == 6){
		return restoreNode(pinode.set(node.name,node.inode), pinode);
	}
}

function _n(type, name, children){
	if(isSeq(children)) children = children.toArray();
	if(children.constructor != Array) {
		if(children === undefined) {
			children = [];
		} else {
			if(!children.__is_VNode) children = x(children);
			children = [children];
		}
	}
	var node = new VNode(function (parent, ref) {
		let pinode = parent.inode;
		let name = node.name, ns;
		if(type == 1) {
			if(_isQName(name)) {
				ns = name;
				name = name.name;
			} else if(/:/.test(name)){
				// TODO where are the namespaces?
			}
		}
		let inode = emptyINode(type, name, pinode._depth + 1, type == 1 ? ohamt.empty.beginMutation() : undefined, ns);
		node.inode = inode;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			child = child.inode(node);
		}
		node.inode = node.inode.endMutation();
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		parent.inode = _modify(pinode, node, ref);
		node.parent = parent;
		return node;
	}, type, name);
	return node;
}

function _a(type, name, value) {
	var node = new VNode(function (parent, ref) {
		let attrMap = parent.inode._attrs;
		if (ref !== undefined) {
			parent.inode._attrs = attrMap.insertBefore([ref.name,ref.value],[name,value]);
		} else {
			parent.inode._attrs = attrMap.push([name,value]);
		}
		node.parent = parent;
		return node;
	}, type, name, value);
	return node;
}

function _v(type,value,name) {
	var node = new VNode(function (parent, ref) {
		let pinode = parent.inode;
		// reuse insertIndex here to create a named map entry
		if(node.name === undefined) node.name = pinode.count() + 1;
		node.inode = new Value(node.type, node.name, value, pinode._depth + 1);
		node.name = name;
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		parent.inode = _modify(pinode,node,ref);
		node.parent = parent;
		return node;
	}, type, name, value);
	return node;
}

/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
export function e(qname, children) {
	return _n(1,qname,children);
}

export function l(name, children) {
	if(arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(5,name,children);
}

export function m(name,children){
	if(arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(6,name,children);
}

export function a(name,value){
	return _a(2,name,value);
}

export function p(name,value){
	return _a(7,name,value);
}

export function x(name, value) {
	if(arguments.length == 1) value = name;
	return _v(typeof value == "string" ? 3 : 12, value, name);
}

export function c(value, name){
	return _v(8, value, name);
}

export function d(uri = null,prefix = null,doctype = null) {
	var attrs = ohamt.empty;
	if(uri) {
		attrs = attrs.set("xmlns" + (prefix ? ":" + prefix : ""), uri);
	}
	if(doctype) {
		attrs = attrs.set("DOCTYPE", doctype);
	}
	return new VNode(emptyINode(9,"#document",0, attrs), 9, "#document");
}

export function ensureRoot(node){
	if(!node) return;
	if(!node.inode) {
		let root = node.first();
		return vnode(root, vnode(node));
	}
	if(typeof node.inode === "function") {
		node.inode(d());
		return node;
	}
	return node;
}

export function _isQName(maybe){
	return !!(maybe && maybe.__is_QName);
}

export function QName(uri, name) {
	var prefix = /:/.test(name) ? name.replace(/:.+$/,"") : null;
    return {
        __is_QName: true,
		name: name,
		prefix,
        uri: uri
    };
}

export const q = QName;
