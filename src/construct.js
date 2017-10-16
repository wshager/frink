import { isQName } from "./qname";

import { isSeq } from "./seq";

// faux VNode
function vnode(inode,type,name,value){
	return {
		inode:inode,
		type:type,
		name:name,
		value:value,
		__is_VNode:true
	};
}

function _n(type, name, children){
	if(children === undefined) {
		children = [];
	} else if(isSeq(children)) {
		children = children.toArray();
	} else if(children.constructor != Array) {
		if(!children.__is_VNode) children = x(children);
		children = [children];
	}
	return vnode(function (parent, ref) {
		var ns;
		if(type == 1) {
			if(isQName(name)) {
				ns = name;
				name = name.name;
			} else if(/:/.test(name)){
				// TODO where are the namespaces?
			}
		}
		// convert to real VNode instance
		var node = parent.vnode(
			parent.emptyINode(type, name, type == 1 ? parent.emptyAttrMap() : undefined, ns),
			parent,
			parent.depth + 1,
			-1,
			type
		);
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

function _a(name, child) {
	return vnode(function (parent) {
		let node = parent.vnode(parent.ituple(name, child), parent);
		child = child.inode(node);
		node = node.finalize();
		if(parent.type == 1){
			// TODO conversion rules!
			parent.attr(name,node.value+"");
		} else if(parent.type == 6){
			// tuple
			parent.push(node);
		}
		return node;
	}, 2, name);
}

function _v(type,val) {
	return vnode(function (parent, ref) {
		// reuse insertIndex here to create a named map entry
		let node = parent.vnode(parent.ivalue(type, val), parent);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		node.parent = parent.modify(node,ref);
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
export function e(name, children) {
	return _n(1, name, children);
}

export function l(children) {
	return _n(5, null, children);
}

export function m(children){
	return _n(6, null, children);
}

export function a(name, value){
	return _a(name,value);
}

export function p(target, content){
	return _v(7, target+" "+content);
}

export function x(value = null) {
	return _v(typeof value == "string" ? 3 : 12, value);
}

export function c(value){
	return _v(8, value);
}
