import { Node, Value, Step } from './vnode';

import { forEach, filter } from "./transducers";

import { LazySeq } from "./seq";

export function* docIter(node, reverse = false) {
	while (node) {
		if (!node.vnode) {
			let root = node.first();
			node = new Node(root, root._type, root._name, root._value, [], 0, node, 0);
			node.path.push(node);
			yield node;
		} else {
			node = nextNode(node);
			if(node) yield node;
		}
	}
}

export function nextNode(node) {
	var type = node.type,
		vnode = node.vnode,
		path = node.path,
		index = node.index,
		parent = node.parent,
		indexInParent = node.indexInParent;
	var depth = vnode._depth;
	index++;
	if(path[index]) {
		return path[index];
	}
	if(type != 17 && vnode.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = vnode;
		vnode = vnode.first();
		// TODO handle arrays
		//console.log("found first", vnode._name,index);
		node = new Node(vnode, vnode._type, vnode._name, vnode._value, path, index, parent, indexInParent);
		node.path.push(node);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//vnode = parent;
			depth--;
			//console.log("found step", vnode._name, indexInParent, depth, vnode._depth);
			let i = index-1;
			while(vnode._depth != depth){
				node = path[i--];
				if(!node) return;
				vnode = node.vnode;
			}
			node = new Step(vnode, path, index, node.parent, node.indexInParent);
			node.path.push(node);
			return node;
		} else {
			// return the next child
			vnode = parent.next(vnode._name, vnode);
			if (vnode) {
				//console.log("found next", vnode._name, index);
				node = new Node(vnode, vnode._type, vnode._name, vnode._value, path, index, parent, indexInParent);
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
	let doc = input;
	while(doc._parent) doc = doc._parent;
	const attrFunc = (z,v,k) => {
		return z += " "+k+"=\""+v+"\"";
	};
	const docAttrFunc = (z,v,k) => {
		return z += k=="DOCTYPE" ? "<!"+k+" "+v+">" : "<?"+k+" "+v+"?>";
	};
	for(let node of docIter(input)){
		let type = node._type;
		if(type==1) {
			str += "<"+node._name;
			if(node._attrs.size > 0){
				str = node._attrs.reduce(attrFunc,str);
			}
			if(!node._size) str +="/";
			str +=">";
		} else if(type==3){
			str += node.toString(doc);
		} else if(type==9) {
			if(node._attrs.size > 0){
				str = node._attrs.reduce(docAttrFunc,str);
			}
		} else if(type==17){
			node = node.node;
			if(node.type==1) str += /*"\r\n" + repeat("  ",node.depth) +*/ "</"+node.name+">";
		}
	}
	return prettyXML(str);
}

export function firstChild(node, fltr = 0) {
	var next = nextNode(node);
	if (node.vnode._depth == next.vnode._depth - 1) return next;
}

/*
export function nextSibling(node){
	// SLOW version, but we have a path+index
	var vnode = node.vnode,
		path = node.path,
		i = node.index;
	var depth = vnode._depth;
	// run down path
	vnode = {};
	while(vnode._depth != depth) {
		node = nextNode(node);
		if(node.type==17) continue;
		if(!node) break;
		vnode = node.vnode;
	}
	return node;
}
*/
export function nextSibling(node){
	var pvnode = node.parent,
		i = node.indexInParent+1;
	var next = pvnode.next(node.name,node.vnode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if(next) return new Node(next,next.type,next.name,node.path,-1,pvnode,i);
}

export function* children(node){
	var vnode = node;
	var i = 0, iter = vnode.values();
	while(!iter.done){
		let c = iter.next().value;
		yield new Node(c,c.type,c.name,node.path,-1,vnode,i);
		i++;
	}
}

export function childrenByName(node, name) {
	var hasWildcard = /\*/.test(name);
	if (hasWildcard) {
		var regex = new RegExp(name.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		return new LazySeq(filter(node.vnode, c => regex.test(c.name))).map((c, i) => new Node(c, c._type, c._name, c._value, node.path, -1, node.vnode, i));
	} else {
		let entry = node.vnode.get(name);
		if (entry.constructor == Array) {
			return new LazySeq(entry).map(c => new Node(c, c._type, c._name, c._value, node.path, -1, node.vnode));
		} else {
			return new LazySeq([new Node(entry, entry._type, entry._name, entry._value, node.path, -1, node.vnode)]);
		}
	}
}


export function getRoot(node) {
	return node.path[0];
}

export function getDoc(node) {
	if(node.index < 0) return node;
	var vnode = getRoot(node).parent;
	return new Node(vnode, vnode._type, vnode._name, null, node.path, -1);
}

export function lastNode(node){
	var depth = node.vnode._depth;
	if(depth < 0) return node;
	var vnode = {};
	var last;
	while(vnode._depth != depth) {
		if(node.type<17) last = node;
		node = nextNode(node);
		if(!node) break;
		vnode = node.vnode;
	}
	return last;
}

export function parent(node) {
	// path walking version of parent
	var vnode = node.vnode,
	    path = node.path,
	    i = node.index - 1;
	var depth = vnode._depth - 1;
	// run up path
	while (vnode._depth != depth) {
		node = path[i--];
		if (!node || node.parent._type==9) break;
		if (node.type == 17) continue;
		vnode = node.vnode;
	}
	return node;
}
