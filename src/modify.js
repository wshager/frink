import { seq, switchMap, pipe, foldLeft } from "./seq";

import { inode, ensureDoc } from "l3n";

import { firstChild } from "./access";

import { error } from "./error";

const _isDocOrFrag = node => node.type == 9 || node.type == 11;

function _ascend(node,cx){
	var child;
	while (node.parent) {
		child = node;
		node = node.parent;
		node = node.set(child.name,child.inode);
	}
	// this ensures immutability
	return _isDocOrFrag(node) ? firstChild.bind(cx)(node) : node;
}

export function appendChild(node, child) {
	const cx = this && "vnode" in this ? this : inode;
	return switchMap(ensureDoc.bind(cx)(node),function (node) {
		//if(!node || !node.size) return;
		if (_isDocOrFrag(node) && node.count() > 0) {
			return error("XXX","Document can only contain one child.");
		}
		return pipe(switchMap(function (child) {
			return typeof child.inode === "function" ? child.inode(node) : seq(child);
		}),foldLeft(function (node, child) {
			return node.modify(child);
		}, node))(child);
		//.map(node =>
		//	(0, _seq.seq)(_ascend(node, cx))
		//);
	});
}

export function insertChildBefore(node,ins){
	const cx = this && "vnode" in this ? this : inode;
	return switchMap(ensureDoc.bind(cx)(node),function (node) {
		//if(!node || !node.size) return;
		let parent = node.parent;
		if(typeof ins.inode == "function") {
			ins.inode(parent,node);
		} else {
			// what?
		}
		node = parent;
		return _ascend(node,cx);
	});
}

export function removeChild(node,child){
	return switchMap(ensureDoc.bind(this)(node),node => {
		//if(!node || !node.size || !child) return;
		// TODO error
		if(child.parent.inode !== node.inode) return;
		node = node.removeChild(child);
		return _ascend(node,this);
	});
}
