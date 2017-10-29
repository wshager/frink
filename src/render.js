import { iter, nextNode } from "./access";
import { ensureDoc } from "./doc";
import * as dom from "./dom";

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

import "rxjs/add/observable/from";
import "rxjs/add/observable/of";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/never";
import "rxjs/add/observable/merge";

import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/buffer";
import "rxjs/add/operator/do";
import "rxjs/add/operator/distinctUntilChanged";


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
	var cur = ensureDoc.bind(dom)(root);
	var skipDepth = 0, append = false, nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		if(node.type == 9) return;
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
					cur = nextNode(cur);
					return handleNode(node);
				} else {
					if(type == 1){
						if (cur.type != 17) cur.inode.parentNode.removeChild(cur.inode);
						// remove from dom, retry this node
						cur = nextNode(cur);
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
			if(cur) cur = nextNode(cur);
		} else {
			append = false;
		}
	};
	iter(vnode, handleNode);
	//var l = domNodes.length;
	if(cur) {
		do {
			cur = nextNode(cur);
			if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
		} while(cur);
	}
	// place back updated node
	oriParent.appendChild(root);
}

Observable.prototype.pausableBuffered = function pausableBuffered(pauser) {
	const source = this;
	const output = new Subject();
	const sourceComplete = Observable.create(function(observer) {
		observer.next(false);
		source.subscribe({
			complete: () => {
				observer.next(true);
				observer.complete();
			}
		});
	});

	const initializedPauser = Observable.merge(
		Observable.of(false),
		pauser,
		sourceComplete
	);
	const endPauseSignal = initializedPauser
		.map(x => !!x)
		.distinctUntilChanged();

	const passthrough = initializedPauser
		.switchMap(paused => paused ? Observable.never() : source);
	const bufferableEvents = initializedPauser
		.switchMap(paused => paused ? source : Observable.never());

	const buffered = new Subject();
	bufferableEvents
		.buffer(endPauseSignal)
		.subscribe(arr => arr.forEach(val => buffered.next(val)));

	const bufferedOutput = Observable.merge(
		passthrough,
		buffered
	);

	// Becuase Rx.Observable.never doesn't complete, the resulting merge
	// will not either
	sourceComplete
		.switchMap(complete => complete ? Observable.empty() : bufferedOutput)
		.subscribe(output);

	return output;
};

export function renderStream(source, root, shouldAppend = false) {
	// FIXME stateless
	const oriParent = root.parentNode;
	// this could be achieved by updating documentFragment, which is in root.parent
	var parents = [];
	const attrFunc = (domNode, kv) => (domNode.setAttribute(kv[0], kv[1]), domNode);
	// ensure paths by calling iter
	var cur = ensureDoc.bind(dom)(root);
	oriParent.appendChild(root);
	//const pauser = new Subject();

	//const pausable = source.pausableBuffered(pauser);

	var skipDepth = 0, append = false;
	if(shouldAppend && cur) {
		// we should append to the selected DOM node, not overwrite it
		parents[0] = {domNode:cur.inode};
		cur = cur.first();
	}
	const handleNode = function(node) {
		// FIXME it would be better to separate VNode and domNodes, but where to put the WeakMap?
		if(!node || node.type == 9) return;
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
					//pauser.next(true);
					if(cur) cur = nextNode(cur);
					return handleNode(node,true);
				} else {
					// this means the depth of the DOM node is either equal (but the nodes aren't the same)
					// or it's way off
					// in case it's a branch we're going to retry either way
					if(type == 1){
						if (cur.type != 17) cur.inode.parentNode.removeChild(cur.inode);
						// remove from dom, retry this node
						//pauser.next(true);
						if(cur) cur = nextNode(cur);
						return handleNode(node,true);
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
				// we may append
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
			if(cur) cur = nextNode(cur);
		} else {
			//pauser.next(false);
		}
	};
	return source.do({
		complete:function(){
			if(cur) {
				do {
					cur = nextNode(cur);
					if (cur.type == 1) cur.inode.parentNode.removeChild(cur.inode);
				} while(cur);
			}
			// place back updated node

		},
		next:function (node) {
			handleNode(node);
		}
	});
	//pauser.next(false);
}
