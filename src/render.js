import { iter, nextNode } from "./access";
import * as dom from "./dom";

function same(cur,nxt){
	if(nxt === cur) return true;
	if(nxt === undefined || cur === undefined) return false;
	//var inxt = nxt.inode, icur = cur.inode;
	if(nxt.type !== cur.type) return false;
	if(nxt.depth !== cur.depth) return false;
	if(nxt.value !== null) {
		if(nxt.value !== cur.value) return false;
	} else {
		if(cur.value !== undefined) return false;
		if(nxt.name.toUpperCase() !== cur.name.toUpperCase()) return false;
		if(cur.count() !== nxt.count()) return false;
		if(cur.attrs("id") && nxt.attrs("id") !== cur.attrs("id")) return false;
		if(cur.attrs("class") && nxt.attrs("class") !== cur.attrs("class")) return false;
	}
	return true;
}

export function render(vnode, root) {
	// FIXME stateless
	const oriParent = root.parentNode;
	// this could be achieved by updating documentFragment, which is in root.parent
	var parents = [];
	const attrFunc = (domNode, kv) => (domNode.setAttribute(kv[0], kv[1]), domNode);
	// ensure paths by calling iter
	// TODO stream / iterator
	var domNodes = [];
	// iter/ensureDoc will append the root to a documentFragment
	// other use cases will have to rely on fastdom.js
	iter.bind(dom)(root,node => {
		domNodes.push(node);
	});
	var i = 0;
	var skipDepth = 0, append = false, nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		if(node.type == 9) return;
		var type = node.type,
		    inode = node.inode,
			depth = node.depth,
		    domNode = node.domNode,
		    cur = domNodes[i];
			//next = domNodes[i+1],
			//nn = nextNode(node);
		var curSame = nextSame || same(cur, node);
		// NOTE pair-wise comparison doesn't work!
		//nextSame = same(next,nn);
		if (cur && curSame) {
			// skip until next
			node.domNode = cur.inode;
			skipDepth = cur.depth;
			if (type == 1) parents[depth] = node;
		} else {
			if (cur) {
				if (cur.depth == depth - 1) {
					//console.log("append",cur);
					append = true;
				} else if (cur.depth == depth + 1) {
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					// TODO l3 nodes, use VNode interface
					if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if(type == 1){
						if (cur.type != 17) cur.inode.parentNode.removeChild(cur.inode);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if(cur.depth == skipDepth + 1){
							// TODO fix interface
							cur.inode.nodeValue = node.value;
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
					if (parents[depth - 1]) {
						let parent = parents[depth - 1];
						parent.domNode.appendChild(domNode);
					}
					node.attrEntries().reduce(attrFunc, domNode);
					parents[depth] = node;
				} else if (type == 3) {
					domNode = document.createTextNode(node.value);
					parents[depth - 1].domNode.appendChild(domNode);
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
		if (node.type == 1) node.inode.parentNode.removeChild(node.inode);
	}
	// place back updated node
	oriParent.appendChild(root);
}
