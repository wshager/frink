"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VNode = VNode;

var _access = require("./access");

function VNode(cx, inode, type, name, value, parent, depth, indexInParent, cache) {
	this.cx = cx;
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

VNode.prototype.toString = function () {
	return this.cx.stringify(this.inode);
};

VNode.prototype.count = function () {
	if (typeof this.inode == "function") return 0;
	return this.cx.count(this.inode);
};

VNode.prototype.keys = function () {
	var cache = this.cache || this.cx.cached(this.inode, this.type);
	if (cache) return cache.keys();
	return this.cx.keys(this.inode, this.type);
};

VNode.prototype.values = function () {
	return this.cx.values(this.inode, this.type);
};

VNode.prototype.first = function () {
	return this.cx.first(this.inode, this.type);
};

VNode.prototype.last = function () {
	return this.cx.last(this.inode, this.type);
};

VNode.prototype.next = function (node) {
	return this.cx.next(this.inode, node, this.type);
};

VNode.prototype.push = function (child) {
	this.inode = this.cx.push(this.inode, [child.name, child.inode], this.type);
	return this;
};

VNode.prototype.set = function (key, val) {
	this.inode = this.cx.set(this.inode, key, val, this.type);
	return this;
};

VNode.prototype.removeChild = function (child) {
	this.inode = this.cx.removeChild(this.inode, child, this.type);
	return this;
};

VNode.prototype.finalize = function () {
	this.inode = this.cx.finalize(this.inode);
	return this;
};

VNode.prototype.attrEntries = function () {
	return this.cx.attrEntries(this.inode);
};

VNode.prototype.attr = function (k, v) {
	if (arguments.length == 1) return this.cx.getAttribute(this.inode, k);
	if (arguments.length === 0) {
		this.inode = this.cx.clearAttributes(this.inode);
	} else {
		this.inode = this.cx.setAttribute(this.inode, k, v);
	}
	return this;
};

VNode.prototype.modify = function (node, ref) {
	this.inode = this.cx.modify(this.inode, node, ref, this.type);
	return this;
};

// hitch this on VNode for reuse
VNode.prototype.vnode = function (inode, parent, depth, indexInParent) {
	return this.cx.vnode(inode, parent, depth, indexInParent);
};

VNode.prototype.ivalue = function (type, name, value) {
	return this.cx.ivalue(type, name, value);
};

VNode.prototype.emptyINode = function (type, name, attrs, ns) {
	return this.cx.emptyINode(type, name, attrs, ns);
};

VNode.prototype.emptyAttrMap = function (init) {
	return this.cx.emptyAttrMap(init);
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function () {
	return new _access.VNodeIterator(this.values()[Symbol.iterator](), this, this.cx.vnode);
};

VNode.prototype.get = function (idx) {
	var val = this.cx.get(this.inode, idx, this.type, this.cache);
	if (!val) return [];
	//val = val.next || val.constructor == Array ? val : [val];
	//console.log(val[Symbol.iterator]());
	return new _access.VNodeIterator(val.next ? val : val[Symbol.iterator](), this, this.cx.vnode);
};
