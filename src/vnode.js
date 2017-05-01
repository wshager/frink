import { ensureRoot } from './construct';

import { VNodeIterator } from './access';


import {
	ivalue,
	vnode,
	emptyINode,
	emptyAttrMap,
	get,
	next,
	push,
	set,
	removeChild,
	cached,
	keys,
	values,
	finalize,
	setAttribute,
	count,
	first,
	last,
	attrEntries,
	modify,
	stringify
} from "./persist";

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

VNode.prototype.count = function(){
	if(typeof this.inode == "function") return 0;
	return count(this.inode);
};

VNode.prototype.keys = function(){
	var cache = this.cache || cached(this.inode, this.type);
	if(cache) return cache.keys();
	return keys(this.inode,this.type);
};

VNode.prototype.values = function(){
	return values(this.inode,this.type);
};

VNode.prototype.first = function(){
	return first(this.inode,this.type);
};

VNode.prototype.last = function(){
	return last(this.inode,this.type);
};

VNode.prototype.next = function(node){
	return next(this.inode,node,this.type);
};

VNode.prototype.push = function(child){
	this.inode = push(this.inode,[child.name,child.inode],this.type);
	return this;
};

VNode.prototype.set = function(key,val){
	this.inode = set(this.inode,key,val,this.type);
	return this;
};

VNode.prototype.removeChild = function(child){
	this.inode = removeChild(this.inode,child,this.type);
	return this;
};

VNode.prototype.finalize = function(){
	this.inode = finalize(this.inode);
	return this;
};

VNode.prototype.modify = function(node,ref) {
	this.inode = modify(this.inode,node,ref,this.type);
	return this;
};


// hitch this on VNode for reuse
VNode.prototype.vnode = vnode;

VNode.prototype.ivalue = ivalue;


// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function(){
	return new VNodeIterator(this.values(),this, vnode);
};

VNode.prototype.get = function(idx){
	var val = get(this.inode,idx,this.type,this.cache);
	if(!val) return [];
	val = val.constructor == Array ? val : [val];
	return new VNodeIterator(val[Symbol.iterator](), this, vnode);
};
