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
	} else if ((0, _seq.isSeq)(children)) {
		children = children.toArray();
	} else if (children.constructor != Array) {
		if (!children.__is_VNode) children = x(children);
		children = [children];
	}

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
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
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

function _a(name, child) {
	if(_seq.isSeq(child)) {
		child = _seq.first(child);
	} else if(Array.isArray(child)){
		child = child[0];
	} else if(!child.__is_VNode) {
		child = x(child);
	}
	return vnode(function (parent) {
		var node = parent.vnode(parent.ituple(name, child), parent);
		// node is an attr node /w child as $val
		// push node to
		child = child.inode(node);
		//node.type = child.type;
		node = node.finalize();
		if (parent.type == 1) {
			// TODO conversion rules!
			parent.attr(name, node.value + "");
		} else if (parent.type == 6) {
			// tuple
			parent.push(node.inode);
		}
		return node;
	}, 2, name);
}

function _v(type, val) {
	return vnode(function (parent, ref) {
		// reuse insertIndex here to create a named map entry
		var node = parent.vnode(parent.ivalue(type, val), parent);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		node.parent = parent.modify(node, ref);
		return node;
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
	return _n(1, name, children);
}

function l(children) {
	return _n(5, null, children);
}

function m(children) {
	return _n(6, null, children);
}

function a(name, value) {
	return _a(name, value);
}

function p(target, content) {
	return _v(7, target + " " + content);
}

function x() {
	var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	return _v(typeof value == "string" ? 3 : 12, value);
}

function c(value) {
	return _v(8, value);
}
