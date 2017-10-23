"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.render = render;
exports.renderStream = renderStream;

var _access = require("./access");

var _doc = require("./doc");

var _dom = require("./dom");

var dom = _interopRequireWildcard(_dom);

var _Observable = require("rxjs/Observable");

var _Subject = require("rxjs/Subject");

require("rxjs/add/operator/switchMap");

require("rxjs/add/observable/from");

require("rxjs/add/observable/empty");

require("rxjs/add/observable/never");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function same(cur, nxt) {
	if (nxt === cur) return true;
	if (nxt === undefined || cur === undefined) return false;
	//var inxt = nxt.inode, icur = cur.inode;
	if (nxt.type !== cur.type) return false;
	if (nxt.depth !== cur.depth) return false;
	if (nxt.value !== null) {
		if (nxt.value !== cur.value) return false;
	} else {
		if (cur.value !== undefined) return false;
		if (nxt.name.toUpperCase() !== cur.name.toUpperCase()) return false;
		if (cur.count() !== nxt.count()) return false;
		if (cur.attrs("id") && nxt.attrs("id") !== cur.attrs("id")) return false;
		if (cur.attrs("class") && nxt.attrs("class") !== cur.attrs("class")) return false;
	}
	return true;
}

function render(vnode, root) {
	// FIXME stateless
	var oriParent = root.parentNode;
	// this could be achieved by updating documentFragment, which is in root.parent
	var parents = [];
	var attrFunc = function attrFunc(domNode, kv) {
		return domNode.setAttribute(kv[0], kv[1]), domNode;
	};
	// ensure paths by calling iter
	// TODO stream / iterator
	var cur = _doc.ensureDoc.bind(dom)(root);
	var skipDepth = 0,
	    append = false,
	    nextSame = false;
	var handleNode = function handleNode(node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		if (node.type == 9) return;
		var type = node.type,
		    depth = node.depth,
		    domNode = node.domNode;
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
					cur = (0, _access.nextNode)(cur);
					return handleNode(node);
				} else {
					if (type == 1) {
						if (cur.type != 17) cur.inode.parentNode.removeChild(cur.inode);
						// remove from dom, retry this node
						cur = (0, _access.nextNode)(cur);
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if (cur.depth == skipDepth + 1) {
							// TODO fix interface
							cur.inode.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if (!cur || append) {
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[depth - 1]) {
						var parent = parents[depth - 1];
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
		if (!append) {
			if (cur) cur = (0, _access.nextNode)(cur);
		} else {
			append = false;
		}
	};
	(0, _access.iter)(vnode, handleNode);
	//var l = domNodes.length;
	if (cur) {
		do {
			cur = (0, _access.nextNode)(cur);
			if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
		} while (cur);
	}
	// place back updated node
	oriParent.appendChild(root);
}

function renderStream(source, root) {
	var shouldAppend = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	// FIXME stateless
	var oriParent = root.parentNode;
	// this could be achieved by updating documentFragment, which is in root.parent
	var parents = [];
	var attrFunc = function attrFunc(domNode, kv) {
		return domNode.setAttribute(kv[0], kv[1]), domNode;
	};
	// ensure paths by calling iter
	var cur = _doc.ensureDoc.bind(dom)(root);

	var pauserSrc = new _Subject.Subject();

	var pausableSrc = pauserSrc.switchMap(function (paused) {
		if (paused) console.log("pausedSrc");
		return paused ? _Observable.Observable.empty() : source;
	});

	var skipDepth = 0,
	    append = false;
	if (shouldAppend && cur) {
		// we should append to the selected DOM node, not overwrite it
		parents[0] = { domNode: cur.inode };
		cur = cur.first();
	}
	var handleNode = function handleNode(node, paused) {
		// FIXME it would be better to separate VNode and domNodes, but where to put the WeakMap?
		if (!node || node.type == 9) return;
		var type = node.type,
		    depth = node.depth,
		    domNode = node.domNode;
		var curSame = same(cur, node);
		// NOTE pair-wise comparison doesn't work!
		if (cur && curSame) {
			// skip until next
			node.domNode = cur.inode;
			skipDepth = cur.depth;
			if (type == 1) parents[depth] = node;
		} else {
			if (cur) {
				if (cur.depth == depth - 1) {
					// this means there's a different node in the DOM tree
					// if the DOM depth equals the source depth minus one,
					// it means that it's a sibling of something to be rendered,
					// so we're going to append to it's parent
					//console.log("append",cur);
					append = true;
				} else if (cur.depth == depth + 1) {
					// this means the DOM depth is higher than our source
					// so we're going to remove it no matter what
					// when it's removed, we retry the source to see
					// if it's the same as the next DOM node or
					// if we can append to the next DOM node, etc.
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					// TODO l3 nodes, use VNode interface
					if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
					// remove from dom, retry this node
					// keep node until everything is removed
					pauserSrc.next(true);
					if (cur) cur = (0, _access.nextNode)(cur);
					return handleNode(node, true);
				} else {
					// this means the depth of the DOM node is either equal (but the nodes aren't the same)
					// or it's way off
					// in case it's a branch we're going to retry either way
					if (type == 1) {
						if (cur.type != 17) cur.inode.parentNode.removeChild(cur.inode);
						// remove from dom, retry this node
						pauserSrc.next(true);
						if (cur) cur = (0, _access.nextNode)(cur);
						return handleNode(node, true);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if (cur.depth == skipDepth + 1) {
							// TODO fix interface
							cur.inode.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if (!cur || append) {
				// we may append
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[depth - 1]) {
						var parent = parents[depth - 1];
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
		if (!append) {
			if (cur) cur = (0, _access.nextNode)(cur);
		} else {
			pauserSrc.next(false);
		}
	};
	pausableSrc.subscribe({
		complete: function complete() {
			if (cur) {
				do {
					cur = (0, _access.nextNode)(cur);
					if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
				} while (cur);
			}
			// place back updated node
			oriParent.appendChild(root);
		},
		next: function next(node) {
			handleNode(node);
		}
	});
	pauserSrc.next(false);
}