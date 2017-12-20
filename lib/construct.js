"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.e = e;
exports.l = l;
exports.m = m;
exports.a = a;
exports.p = p;
exports.x = x;
exports.c = c;

var _qname = require("./qname");

var _seq = require("./seq");

var _access = require("./access");

// faux VNode
function vnode(inode, type, name, value) {
	return {
		inode: inode,
		type: type,
		name: name,
		value: value,
		__is_VNode: true
	};
}

function _n(type, name, children) {
	if (typeof name == "function") name = name();
	if (typeof children == "function") children = children();
	children = (0, _seq.seq)(children).concatMap(function (c) {
		return (0, _seq.isSeq)(c) ? c : (0, _access.isVNode)(c) ? (0, _seq.seq)(c) : x(c);
	});
	return vnode(function (parent, ref) {
		var ns;
		if (type == 1) {
			if ((0, _qname.isQName)(name)) {
				ns = name;
				name = name.name;
			} else if (/:/.test(name)) {
				// TODO where are the namespaces?
			}
		}
		// convert to real VNode instance
		var node = parent.vnode(parent.emptyINode(type, name, type == 1 ? parent.emptyAttrMap() : undefined, ns), parent, parent.depth + 1, 0, type);
		return children.concatMap(function (child) {
			return child.inode(node);
		}).reduce(function (node, child) {
			return node.modify(child, ref);
		}, node);
	}, type, name);
}

function _a(name, child) {
	child = (0, _seq.exactlyOne)(child).concatMap(function (c) {
		return (0, _seq.isSeq)(c) ? c : (0, _access.isVNode)(c) ? (0, _seq.seq)(c) : x(c);
	});
	return vnode(function (parent) {
		var node = parent.vnode(parent.ituple(name), parent);
		// node is an attr node /w child as $val
		return child.concatMap(function (child) {
			return child.inode(node);
		}).reduce(function (node, child) {
			return node.modify(child, name);
		}, node);
	}, 2, name);
}

function _v(type, val) {
	return vnode(function (parent) {
		return (0, _seq.seq)(val).map(function (val) {
			return parent.vnode(parent.ivalue(type, val), parent);
		});
	}, type, null, val);
}

/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
function e(name, children) {
	return (0, _seq.exactlyOne)(name).map(function (name) {
		return _n(1, name, children);
	});
}

function l(children) {
	return (0, _seq.seq)(_n(5, null, children));
}

function m(children) {
	return (0, _seq.seq)(_n(6, null, children));
}

function a(name, value) {
	return (0, _seq.exactlyOne)(name).map(function (name) {
		return _a(name, value);
	});
}

function p(target, content) {
	return (0, _seq.seq)(_v(7, target + " " + content));
}

function x() {
	var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	return (0, _seq.seq)(_v(3, value));
}

function c(value) {
	return (0, _seq.seq)(_v(8, value));
}