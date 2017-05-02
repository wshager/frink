import * as inode from "./persist";

export function ensureDoc(node){
	if(!node) return;
	var cx = this.vnode ? this : inode;
	if(!node.inode) {
		let root = cx.first(node);
		return cx.vnode(root, cx.vnode(node), 1, 0);
	}
	if(typeof node.inode === "function") {
		node.inode(d.bind(cx)());
		return node;
	}
	return node;
}

export function d(uri = null,prefix = null,doctype = null) {
	var attrs = {};
	var cx = this.vnode ? this : inode;
	if(uri) {
		attrs["xmlns" + (prefix ? ":" + prefix : "")] = uri;
	}
	if(doctype) {
		attrs.DOCTYPE = doctype;
	}
	return cx.vnode(cx.emptyINode(9,"#document",0, cx.emptyAttrMap(attrs)), 9, "#document");
}
