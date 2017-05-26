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
	if (children === undefined) {
		children = [];
	} else if (_seq.isSeq(children)) {
		children = children.toArray();
	} else if (children.constructor != Array) {
		if (!children.__is_VNode) children = x(children);
		children = [children];
	}
	return vnode(function (parent, ref) {
		var ns;
		if (type == 1) {
			if (_qname.isQName(name)) {
				ns = name;
				name = name.name;
			} else if (/:/.test(name)) {
				// TODO where are the namespaces?
			}
		}
		// convert to real VNode instance
		var node = parent.vnode(parent.emptyINode(type, name, type == 1 ? parent.emptyAttrMap() : undefined, ns), parent);
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			child = child.inode(node);
		}
		node = node.finalize();
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		node.parent = parent.modify(node, ref);
		return node;
	}, type, name);
}

function _a(type, name, val) {
	return vnode(function (parent, ref) {
		var node = parent.vnode(parent.ivalue(type, name, val));
		node.parent = parent.attr(name, val);
		return node;
	}, type, name, val);
}

function _v(type, val, name) {
	return vnode(function (parent, ref) {
		// reuse insertIndex here to create a named map entry
		var node = parent.vnode(parent.ivalue(type, name ? name : parent.count() + 1, val), parent);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		node.parent = parent.modify(node, ref);
		return node;
	}, type, name, val);
}

/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
function e(qname, children) {
	return _n(1, qname, children);
}

function l(name, children) {
	if (arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(5, name, children);
}

function m(name, children) {
	if (arguments.length == 1) {
		children = name;
		name = "#";
	}
	return _n(6, name, children);
}

function a(name, value) {
	return _a(2, name, value);
}

function p(name, value) {
	return _a(7, name, value);
}

function x(name, value = null) {
	if (value === null) {
		value = name;
		return _v(typeof value == "string" ? 3 : 12, value);
	}
	return _v(typeof value == "string" ? 3 : 12, value, name);
}

function c(value, name) {
	return _v(8, value, name);
}