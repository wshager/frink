import * as inode from "./inode";

import { isSeq } from "./seq";

import { x } from "./construct";

export function ensureDoc(node){
	if(!node) return;
	var cx = this && this.vnode ? this : inode;
	if(!node.inode) {
		if(cx.getType(node) == 9) {
			let root = cx.first(node);
			return cx.vnode(root, cx.vnode(node), 1, 0);
		} else {
			// create a document-fragment by default!
			let doc = t.bind(cx)();
			let root = cx.vnode(node, doc, 1, 0);
			doc = doc.push(root);
			return root;
		}
	}
	if(typeof node.inode === "function") {
		node = node.inode(d.bind(cx)());
	}
	return node;
}

function _d(type,children){
	var cx = this.vnode ? this : inode;
	let node = cx.vnode(cx.emptyINode(type,"#document"),null,0);
	if(children === undefined) {
		children = [];
	} else if(isSeq(children)) {
		children = children.toArray();
	} else if(children.constructor != Array) {
		if(!children.__is_VNode) children = x(children);
		children = [children];
	}
	for (let i = 0; i < children.length; i++) {
		let child = children[i];
		child = child.inode(node);
	}
	return node.finalize();
}

export function d(children) {
	const cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(9,children);
}

export function t(children) {
	const cx = this && this.vnode ? this : inode;
	return _d.bind(cx)(11,children);
}
