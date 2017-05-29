import { ensureDoc } from "./doc";

import { compose, into, transform, forEach, filter, cat, distinctCat, foldLeft } from "./transducers";

import { seq, isSeq } from "./seq";

import { prettyXML } from "./pretty";

export function VNodeIterator(iter, parent, f){
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.indexInParent = -1;
	this.__is_VNodeIterator = true;
}

const DONE = {
    done: true
};

VNodeIterator.prototype.next = function () {
    var v = this.iter.next();
	this.indexInParent++;
    if (v.done) return DONE;
    return { value: this.f(v.value,this.parent,this.indexInParent) };
};

export function Step(inode,name,parent,depth,indexInParent){
	this.inode = inode;
	this.name = name;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function(){
	return "Step {depth:"+this.depth+", closes:"+this.parent.name+"}";
};

export function* docIter(node, reverse = false) {
	node = ensureDoc.bind(this)(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if(node) yield node;
	}
}

export function nextNode(node /* VNode */) {
	var type = node.type,
		inode = node.inode,
		parent = node.parent,
		indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	if(type != 17 && node.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = node.first();
		// TODO handle arrays
		node = parent.vnode(inode, parent, depth, indexInParent);
		//console.log("found first", node.name, depth,indexInParent);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new Step(inode, node.name, node.parent, depth, node.indexInParent);
			//console.log("found step", node.name, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode !== undefined) {
				node = parent.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.name, depth, indexInParent);
				return node;
			}
			throw new Error("Node "+parent.name+" hasn't been completely traversed. Found "+ indexInParent + ", contains "+ parent.count());
		}
	}
}

export function* prevNode(node){
	var depth = node.depth;
	while(node){
		if(!node.size) {
			depth--;
			node = node.parent;
			if(!node) break;
			yield node;
		} else{
			if(!("indexInParent" in node)) node.indexInParent = node.parent.size;
			node.indexInParent--;
			node = node.getByIndex(node.indexInParent);
		}
	}
}

export function stringify(input){
	var str = "";
	const attrFunc = (z, kv) => {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	const docAttrFunc = (z, kv) => {
		return z += k == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	for (let node of docIter(input)) {
		let type = node.type;
		if (type == 1) {
			str += "<" + node.name;
			str = foldLeft(node.attrEntries(),str,attrFunc);
			if (!node.count()) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			str += foldLeft(node.attrEntries(),str,docAttrFunc);
		} else if (type == 17) {
			str += "</" + node.name + ">";
		}
	}
	return prettyXML(str);
}

export function firstChild(node, fltr = 0) {
	// FIXME return root if doc (or something else?)
	var next = ensureDoc.bind(this)(node);
	if(node !== next) return next;
	// next becomes parent, node = firstChild
	node = next.first();
	if(node) return next.vnode(node,next,next.depth + 1, 0);
}

export function nextSibling(node){
	node = ensureDoc.bind(this)(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if(next) return parent.vnode(next, parent, node.depth, node.indexInParent+1);
}

export function* children(node){
	node = ensureDoc.bind(this)(node);
	var i = 0;
	for(var c of node.values()){
		if(c) yield node.vnode(c, node, node.depth + 1, i++);
	}
}

export function getDoc(node) {
	node = ensureDoc.bind(this)(node);
	do {
		node = node.parent;
	} while(node.parent);
	return node;
}

export function lastChild(node){
	node = ensureDoc.bind(this)(node);
	var last = node.last();
	return node.vnode(last,node,node.depth+1, node.count() - 1);
}

export function parent(node) {
	if(!arguments.length) return Axis(parent);
	return node.parent ? seq(new VNodeIterator([node.parent.inode][Symbol.iterator](),node.parent.parent, vnode)) : seq();
}

export function self(node) {
	if(!arguments.length) return Axis(self);
	return node ? seq(new VNodeIterator([node.inode][Symbol.iterator](),node.parent, vnode)) : seq();
}

export function iter(node, f) {
	// FIXME pass doc?
	var i=0,prev;
	if(!f) f = (node) => {prev = node;};
	node = ensureDoc.bind(this)(node);
	f(node,i++);
	while (node) {
		node = nextNode(node);
		if(node) {
			f(node,i++);
		}
	}
	return prev;
}

export const isVNode = n => !!n && n.__is_VNode;

const _isElement = n => isVNode(n) && n.type == 1;

const _isAttribute = n => isVNode(n) && n.type == 2;

const _isText = n => isVNode(n) && n.type == 3;

const _isList = n => isVNode(n) && n.type == 5;

const _isMap = n => isVNode(n) && n.type == 6;

const _isLiteral = n => isVNode(n) && n.type == 12;

function _get(idx, type){
	return {
		__is_Accessor: true,
		f: filter(n => n.name===idx),
		__type: type,
		__index: idx
	};
}

export function cxFilter(iterable,f){
    return filter(iterable,function(v,k,i){
        if(!isSeq(v) && !isVNode(v)) v = seq(v);
        v.__cx = [k,i];
        return f(v,k,i);
	});
}

export const position = n => n.__cx ? n.__cx[0] + 1 : n.indexInParent;

export const last = n => n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;

// TODO convert qname to integer when parent is array
function _nodeTest(qname){
	if(qname === undefined){
		return filter(_isElement);
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			return seq(filter(_isElement),filter(n => regex.test(n.name)));
		} else {
			return seq(_get(qname,1),filter(_isElement));
		}
	}
}

export function element(qname){
	return seq(child(),_nodeTest(qname));
}

function _attrGet(node,key){
	var iter;
	if(key !== undefined){
		var val =  node.attrs.get(key);
		if(!val) return [];
		iter = [[key,val]];
	} else {
		iter = node.attrs;
	}
	return new VNodeIterator(iter[Symbol.iterator](), node, (v, parent, index) => node.vnode(node.ivalue(2, v[0], v[1], node.depth + 1), parent, index));
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
export function attribute(qname,node){
	if(arguments.length < 2) return Axis(attribute.bind(null,qname),2);
	var hasWildcard = /\*/.test(qname);
	if (hasWildcard) {
		var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		return into(_attrGet(node), filter(n => regex.test(n.name)), seq());
	}
	return seq(_attrGet(node,qname));
}

// FIXME should this be in document order?
function _getTextNodes(n) {
    //if (isSeq(n)) return into(n, compose(filter(_ => _isElement(_)), forEach(_ => _getTextNodes(_), cat)), seq());
    return ;
}

export function text() {
	return n => _isText(n) && !!n.value;
}

export function node() {
	return filter(n => _isElement(n) || _isText(n));
}

// TODO create axis functions that return a function
// child(element(qname))
// works like a filter: filter(children(node|nodelist),n => element(qname,n))
// nextSibling(element()): filter(nextSibling(node|nodelist),n => element(undefined,n))
// filterOrGet: when f is called, and null or wildcard match was supplied as its qname parameter, call filter
// else call get
// if it is a seq, apply the function iteratively:
// we don't want to filter all elements from a seq, we want to retrieve all elements from elements in a seq
// final edge case: when node is of type array, and name is not an integer: filter
function Axis(f,type){
	return {
		__is_Axis: true,
		__type: type || 1,
		f:f
	};
}
export function child(){
	return Axis(x => seq(x));
}

const _isSiblingIterator = n => !!n && n.__is_SiblingIterator;

const isVNodeIterator = n => !!n && n.__is_VNodeIterator;

function SiblingIterator(inode, parent, depth, indexInParent, dir){
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

SiblingIterator.prototype.next = function(){
	var v = this.dir.call(this.parent.inode,this.name,this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
    return this;
};

export function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = ensureDoc.bind(this)(node);
	return seq(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent, next));
}

// make sure all paths are transducer-funcs
export function select(node, ...paths) {
    // usually we have a sequence
    var cur = node, path;
    while (paths.length > 0) {
        path = paths.shift();
        cur = _selectImpl(cur, path);
    }
    return cur;
}

export function selectAttribute(node, ...paths) {
    // usually we have a sequence
    var cur = node, path;
    while (paths.length > 0) {
        path = paths.shift();
        cur = _selectImpl(cur, path,true);
    }
    return cur;
}

function _comparer() {
	// dirty preserve state on function
	var f = function (seq, node) {
		var has = f._checked.has(node.inode);
		if (!has) f._checked.set(node.inode,true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

// TODO use direct functions as much as passible, e.g. isVNode instead of node
function _selectImpl(node, path) {
	if(!isSeq(path)) path = seq(path);
	var axis = self(), directAccess;
	// process strings (can this be combined?)
	path = transform(path,compose(forEach(function(path){
		if(typeof path == "string") {
			var at = /^@/.test(path);
			if(at) path = path.substring(1);
			return at ? attribute(path) : element(path);
		}
		return [path];
	}),cat));
	var filtered = transform(path,compose(forEach(function(path){
		if(path.__is_Axis) {
			axis = path;
		} else if(path.__is_Accessor){
			directAccess = path.__index;
			return path.f;
		} else {
			return path;
		}
	}),filter(_ => !!_)));
	var bed = ensureDoc.bind(this);
	var attr = axis.__type == 2;
	var composed = compose.apply(null,filtered.toArray());
	const process = n => into(directAccess && !isVNodeIterator(n) && !_isSiblingIterator(n) ? n.get(directAccess) : n, composed, seq());
	//var nodeFilter = n => _isElement(n) || isVNodeIterator(n) || _isSiblingIterator(n) || _isMap(n) || _isList(n);
	// if seq, apply axis to seq first
	// if no axis, expect context function call, so don't process + cat
	var list = isSeq(node) ? node = transform(node, compose(forEach(n => axis.f(bed(n))), cat)) : axis.f(bed(node));
	return transform(list,compose(forEach(process), (n,k,i,z) =>
		!isVNode(n) || attr ? cat(isSeq(n) ? n : [n],k,i,z) : distinctCat(_comparer())(n,k,i,z)));
}


export function isEmptyNode(node){
	node = ensureDoc.bind(this)(node);
	if(!isVNode(node)) return false;
	if(_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

export function name($a) {
	if(isSeq($a)) return forEach($a,name);
	if(!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}
