import { VNode, Step } from './vnode';

import { compose, transform, forEach, filter } from "./transducers";

import { LazySeq } from "./seq";

import { prettyXML } from "./pretty";

export function* docIter(node, reverse = false) {
	while (node) {
		if (!node.inode) {
			node = ensureRoot(node);
			yield node;
		} else {
			node = nextNode(node);
			if(node) yield node;
		}
	}
}

export function nextNode(node /* VNode */) {
	var type = node.type,
		inode = node.inode,
		path = node.path,
		index = node.index,
		parent = node.parent,
		indexInParent = node.indexInParent;
	var depth = inode._depth;
	index++;
	if(path[index]) {
		return path[index];
	}
	if(type != 17 && inode.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = inode;
		inode = inode.first();
		// TODO handle arrays
		//console.log("found first", inode._name,index);
		node = new VNode(inode, inode._type, inode._name, inode._value, path, index, parent, indexInParent);
		node.path.push(node);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			let i = index;
			while(inode._depth != depth){
				node = path[--i];
				if(!node) return;
				inode = node.inode;
			}
			node = new Step(inode, path, index, node.parent, node.indexInParent);
			node.path.push(node);
			return node;
		} else {
			// return the next child
			inode = parent.next(inode._name, inode, path[index-1]);
			if (inode) {
				//console.log("found next", inode._name, index);
				node = new VNode(inode, inode._type, inode._name, inode._value, path, index, parent, indexInParent);
				node.path.push(node);
				return node;
			}
			throw new Error("Node "+parent._name+" hasn't been completely traversed. Found "+ indexInParent + ", contains "+ parent.count());
		}
	}
}

export function* prevNode(node){
	var depth = node._depth;
	while(node){
		if(!node.size) {
			depth--;
			node = node._parent;
			if(!node) break;
			yield node;
		} else{
			if(!("_index" in node)) node._index = node.size;
			node._index--;
			node = node.getByIndex(node._index);
		}
	}
}

export function stringify(input){
	var str = "";
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	const docAttrFunc = (z, v, k) => {
		return z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	};
	for (let node of docIter(input)) {
		let type = node.type;
		if (type == 1) {
			let inode = node.inode;
			str += "<" + node.name;
			str = inode._attrs.reduce(attrFunc, str);
			if (!inode._size) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			let inode = node.inode;
			str += node._attrs.reduce(docAttrFunc, str);
		} else if (type == 17) {
			let inode = node.inode;
			if (inode._type == 1) str += "</" + inode._name + ">";
		}
	}
	return prettyXML(str);
}

export function firstChild(node, fltr = 0) {
	if(!node.inode) return ensureRoot(node);
	var next = nextNode(node);
	if (node.inode._depth == next.inode._depth - 1) return next;
}

/*
export function nextSibling(node){
	// SLOW version, but we have a path+index
	var inode = node.inode,
		path = node.path,
		i = node.index;
	var depth = inode._depth;
	// run down path
	inode = {};
	while(inode._depth != depth) {
		node = nextNode(node);
		if(node.type==17) continue;
		if(!node) break;
		inode = node.inode;
	}
	return node;
}
*/
export function nextSibling(node){
	var pvnode = node.parent,
		i = node.indexInParent+1;
	var next = pvnode.next(node.name,node.inode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if(next) return new VNode(next,next.type,next.name,node.path,-1,pvnode,i);
}

export function* children(node){
	var inode = node;
	var i = 0, iter = inode.values();
	while(!iter.done){
		let c = iter.next().value;
		yield new VNode(c,c.type,c.name,node.path,-1,inode,i);
		i++;
	}
}

export function childrenByName(node, name) {
	var hasWildcard = /\*/.test(name);
	if (hasWildcard) {
		var regex = new RegExp(name.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		var xf = compose(filter(c => regex.test(c.name),forEach((c, i) => new VNode(c, c._type, c._name, c._value, node.path, -1, node.inode, i))));
		return new LazySeq(transform(node.inode,xf));
	} else {
		let entry = node.inode.get(name);
		if(entry === undefined) return new LazySeq();
		if (entry.constructor == Array) {
			return new LazySeq(forEach(c => new VNode(c, c._type, c._name, c._value, node.path, -1, node.inode)));
		} else {
			return new LazySeq([new VNode(entry, entry._type, entry._name, entry._value, node.path, -1, node.inode)]);
		}
	}
}


export function getRoot(node) {
	return node.path[0];
}

export function getDoc(node) {
	if(node.index < 0) return node;
	var inode = getRoot(node).parent;
	return new VNode(inode, inode._type, inode._name, null, node.path, -1);
}

export function lastNode(node){
	var depth = node.inode._depth;
	if(depth < 0) return node;
	var inode = {};
	var last;
	while(inode._depth != depth) {
		if(node.type<17) last = node;
		node = nextNode(node);
		if(!node) break;
		inode = node.inode;
	}
	return last;
}

export function parent(node) {
	// path walking version of parent
	if(!node.inode) return;
	var inode = node.inode,
	    path = node.path,
	    i = node.index - 1;
	var depth = inode._depth - 1;
	// run up path
	while (inode._depth != depth) {
		node = path[i--];
		if (!node || node.parent._type==9) break;
		if (node.type == 17) continue;
		inode = node.inode;
	}
	return node;
}

export function doc(node){
	while(node.parent){
		node = node.parent;
	}
	return node;
}

function ensureRoot(node){
	let root = node.first();
	node = new VNode(root, root._type, root._name, root._value, [], 0, node, 0);
	node.path.push(node);
	return node;
}

export function iter(node, f) {
	// FIXME pass doc?
	var i=0,prev;
	if(!f) f = (node) => {prev = node;};
	while (node) {
		if (!node.inode) {
			node = ensureRoot(node);
			f(node,i++);
		} else {
			node = nextNode(node);
			if(node) {
				f(node,i++);
			}
		}
	}
	return prev;
}
