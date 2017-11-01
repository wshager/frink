function VNodeIterator(iter, parent, f){
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.indexInParent = -1;
	this.__is_VNodeIterator = true;
}

const DONE = {
	done: true
};

VNodeIterator.prototype.next = function () {
	var v = this.iter.next();
	this.indexInParent++;
	if (v.done) return DONE;
	return { value: this.f(v.value,this.parent,this.indexInParent) };
};

export function _attrGet(node,key){
	var iter;
	if(key !== undefined){
		var val =  node.attrs.get(key);
		if(!val) return [];
		iter = [[key,val]];
	} else {
		iter = node.attrs;
	}
	return new VNodeIterator(iter[Symbol.iterator](), node, (v, parent, index) => node.vnode(node.ituple(v[0], v[1]), node.depth + 1, parent, index));
}

export const _isVNodeIterator = n => !!n && n.__is_VNodeIterator;


export const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;


function SiblingIterator(inode, parent, depth, indexInParent, dir){
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

SiblingIterator.prototype.next = function(){
	var v = this.dir.call(this.parent.inode,this.name,this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

export function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = ensureDoc(node);
	return seq(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent, next));
}


export function parent(node) {
	if(!arguments.length) return Axis(parent);
	return node.parent ? seq(new VNodeIterator([node.parent.inode][Symbol.iterator](),node.parent.parent, vnode)) : seq();
}

export function self(node) {
	if(!arguments.length) return Axis(self);
	return node ? seq(new VNodeIterator([node.inode][Symbol.iterator](),node.parent, vnode)) : seq();
}
