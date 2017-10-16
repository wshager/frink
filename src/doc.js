import * as inode from "./inode";

export function ensureDoc(node){
	if(!node) return;
	var cx = this && this.vnode ? this : inode;
	if(!node.inode) {
		if(cx.getType(node) == 9) {
			let root = cx.first(node);
			return cx.vnode(root, cx.vnode(node), 1, 0);
		} else {
			let doc = d.bind(cx)();
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

export function d(doctype) {
	var attrs = {};
	var cx = this.vnode ? this : inode;
	if(doctype) {
		attrs.DOCTYPE = doctype;
	}
	return cx.vnode(cx.emptyINode(9,"#","#document",0, cx.emptyAttrMap(attrs)));
}
