import * as inode from "./inode";

import { seq, isSeq } from "./seq";

import { x } from "./construct";

import { isVNode } from "./access";

export function ensureDoc($node){
	// FIXME if isVNode(node) use cx on node
	var cx = this && this.vnode ? this : inode;
	return seq($node).concatMap(node => {
		if (!node.inode) {
			var type = cx.getType(node);
			if (type == 9 || type == 11) {
				var root = cx.first(node);
				return seq(cx.vnode(root, cx.vnode(node), 1, 0));
			} else {
				// create a document-fragment by default!
				var doc = t.bind(cx)();
				var _root = cx.vnode(node, doc, 1, 0);
				return doc.concatMap(function (doc) {
					doc = doc.push([0, _root.inode]);
					var next = doc.first();
					return next ? seq(doc.vnode(next, doc, doc.depth + 1, 0)) : seq();
				});
			}
		}
		if (typeof node.inode === "function") {
			// NOTE never bind to current node.cx, but purposely allow cross-binding
			return d.bind(cx)(node).concatMap(node => {
				let next = node.first();
				return next ? seq(node.vnode(next,node,node.depth + 1, 0)) : seq();
			});
		}
		return seq(node);
	});
}

function _d(type,children){
	children = seq(children).concatMap(c => isSeq(c) ? c : isVNode(c) ? seq(c) : x(c));
	var cx = this.vnode ? this : inode;
	let node = cx.vnode(cx.emptyINode(type,"#document"),null,0);
	return children
		.concatMap(child => child.inode(node))
		.reduce((node, child) => node.modify(child), node);
}

export function d(children) {
	const cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(9,children);
}

export function t(children) {
	const cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(11,children);
}
