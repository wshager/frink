import { iter, nextNode } from "./access";
import { nodesList } from "./dom";

function same(node,vnode){
	if(node === vnode) return true;
	if(node === undefined || vnode === undefined) return false;
	var inode = vnode.inode;
	if(node.nodeType !== vnode.type) return false;
	if(node["@@doc-depth"] !== inode._depth) return false;
	if(node.nodeValue !== null) {
		if(node.nodeValue !== vnode.value) return false;
	} else {
		if(vnode.value !== undefined) return false;
		if(node.nodeName !== (inode._name+'').toUpperCase()) return false;
		if(node.children.length !== inode.count()) return false;
		if(node.id && inode._attrs.get("id") !== node.id) return false;
		if(node.className && inode._attrs.get("class") !== node.className) return false;
	}
	return true;
}

export function render(vnode, root) {
	// fixme stateless
	var parents = [{ domNode: root }];
	const attrFunc = (domNode, v, k) => (domNode.setAttribute(k, v), domNode);
	// ensure paths by calling iter
	var domNodes = nodesList(root);
	var i = 0;
	var skipDepth = 0, append = false, nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		var type = node.type,
		    inode = node.inode,
		    domNode = node.domNode,
		    cur = domNodes[i],
			next = domNodes[i+1],
			nn = nextNode(node);
		var curSame = nextSame || same(cur, node);
		nextSame = same(next,nn);
		if (cur && curSame && nextSame) {
			// skip until next
			// console.log("same",cur,cur["@@doc-depth"],node.name,inode._depth);
			node.domNode = cur;
			skipDepth = cur["@@doc-depth"];
			if (type == 1) parents[inode._depth] = node;
		} else {
			if (cur) {
				if (cur["@@doc-depth"] == inode._depth - 1) {
					//console.log("append",cur);
					append = true;
				} else if (cur["@@doc-depth"] == inode._depth + 1) {
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					if (cur.nodeType == 1) cur.parentNode.removeChild(cur);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if(type == 1){
						if (cur.nodeType != 17) cur.parentNode.removeChild(cur);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if(cur["@@doc-depth"] == skipDepth + 1){
							cur.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if(!cur || append){
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[inode._depth - 1]) parents[inode._depth - 1].domNode.appendChild(domNode);
					inode._attrs.reduce(attrFunc, domNode);
					parents[inode._depth] = node;
				} else if (type == 3) {
					domNode = document.createTextNode(node.value);
					parents[inode._depth - 1].domNode.appendChild(domNode);
				}
				node.domNode = domNode;
			}
		}
		if(!append) {
			i++;
		} else {
			append = false;
		}
	};
	iter(vnode, handleNode);
	var l = domNodes.length;
	for (; --l >= i;) {
		var node = domNodes[l];
		if (node.nodeType == 1) node.parentNode.removeChild(node);
	}
}
