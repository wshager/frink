'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VNode = VNode;

var _construct = require('./construct');

var _access = require('./access');

var _persist = require('./persist');

function VNode(inode, type, name, value, parent, depth, indexInParent, cache) {
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
	var root = _construct.ensureRoot(this);
	return _persist.stringify(root.inode);
};

VNode.prototype.count = function () {
	if (typeof this.inode == "function") return 0;
	return _persist.count(this.inode);
};

VNode.prototype.keys = function () {
	var cache = this.cache || _persist.cached(this.inode, this.type);
	if (cache) return cache.keys();
	return _persist.keys(this.inode, this.type);
};

VNode.prototype.values = function () {
	return _persist.values(this.inode, this.type);
};

VNode.prototype.first = function () {
	return _persist.first(this.inode, this.type);
};

VNode.prototype.last = function () {
	return _persist.last(this.inode, this.type);
};

VNode.prototype.next = function (node) {
	return _persist.next(this.inode, node, this.type);
};

VNode.prototype.push = function (child) {
	this.inode = _persist.push(this.inode, [child.name, child.inode], this.type);
	return this;
};

VNode.prototype.set = function (key, val) {
	this.inode = _persist.set(this.inode, key, val, this.type);
	return this;
};

VNode.prototype.removeChild = function (child) {
	this.inode = _persist.removeChild(this.inode, child, this.type);
	return this;
};

VNode.prototype.finalize = function () {
	this.inode = _persist.finalize(this.inode);
	return this;
};

VNode.prototype.modify = function (node, ref) {
	this.inode = _persist.modify(this.inode, node, ref, this.type);
	return this;
};

// hitch this on VNode for reuse
VNode.prototype.vnode = _persist.vnode;

VNode.prototype.ivalue = _persist.ivalue;

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function () {
	return new _access.VNodeIterator(this.values(), this, _persist.vnode);
};

VNode.prototype.get = function (idx) {
	var val = _persist.get(this.inode, idx, this.type, this.cache);
	if (!val) return [];
	val = val.constructor == Array ? val : [val];
	return new _access.VNodeIterator(val[Symbol.iterator](), this, _persist.vnode);
};