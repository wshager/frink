import * as ohamt from "ohamt";

import { prettyXML } from "./pretty";


export function Value(type, name, value, depth) {
	this._type = type;
	this._name = name;
	this._value = value;
	this._depth = depth;
}

Value.prototype.count = function(){
	return 0;
};

Value.prototype.size = 0;

Value.prototype.toString = function(doc) {
	return this._value;
};

export function Node(vnode,type,name,value,path,index,parent,indexInParent){
	this.vnode = vnode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.path = path;
	this.index = index;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Node.prototype.toString = function(){
	return this.vnode.toString();
};

export function Step(vnode,path,index,parent,indexInParent){
	this.vnode = vnode;
	this.path = path;
	this.index = index;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function(){
	return "Step {depth:"+this._depth+", closes:"+this.parent.name+"}";
};

var OrderedMap = ohamt.empty.constructor;

export function emptyVNode(type, name, depth, attrs) {
    //return new VNode(type,name,depth,attrs);
    var vnode = ohamt.make().beginMutation();
    vnode._type = type;
    vnode._name = name;
    vnode._depth = depth;
    vnode._attrs = attrs;
    return vnode;
}

export function restoreNode(next,node){
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._depth = node._depth;
	return next;
}

export function emptyAttrMap(){
	return ohamt.empty.beginMutation();
}

function elemToString(e){
	const attrFunc = (z,v,k) => {
		return z += " "+k+"=\""+v+"\"";
	};
	let str = "<"+e._name;
	str = e._attrs.reduce(attrFunc,str);
	if(e._size){
		str += ">";
		for(let c of e.values()){
			str += c.toString(false);
		}
		str += "</"+e._name+">";
	} else {
		str += "/>";
	}
	return str;
}

OrderedMap.prototype.toString = function(root = true){
	var str = "";
	var type = this._type;
	const docAttrFunc = (z,v,k) => {
		return z += k=="DOCTYPE" ? "<!"+k+" "+v+">" : "<?"+k+" "+v+"?>";
	};
	if(type==1) {
		str += elemToString(this);
	} else if(type==3){
		str += this.toString();
	} else if(type==9){
		str = this._attrs.reduce(docAttrFunc,str);
		for(let c of this.values()){
			str += c.toString(false);
		}
	}
	return root ? prettyXML(str) : str;
};

export function map(name,children){

}

export function elem(name, children) {
	var node = new Node(function (parent, insertIndex = -1) {
		var attrMap = ohamt.empty; //.beginMutation();
		let path = parent.path;
		let pvnode = parent.vnode;
		let vnode = emptyVNode(1, name, pvnode._depth + 1, attrMap); //.beginMutation();
		node.vnode = vnode;
		node.index = path.length;
		node.indexInParent = pvnode.count();
		path.push(node);
		node.path = path;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			if (child.type == 2) {
				attrMap = attrMap.set(child.name, child.value);
			} else {
				child = child.vnode(node);
				node.vnode = restoreNode(child.parent, node.vnode);
			}
		}
		//node.vnode = node.vnode; //.endMutation(true);
		node.vnode._attrs = attrMap; //.endMutation(true);
		// insert into the parent means: update all parents until we come to the root
		// BUT creating an element doesn't mutate the doc yet, just the path
		// however, the parent is mutated, which means I have a new parent
		// so we just update our copy in the path
		if (insertIndex > -1) {
			node.parent = pvnode.insert(insertIndex, node.vnode);
		} else {
			node.parent = restoreNode(pvnode.push(node.name,node.vnode), pvnode);
		}
		return node;
	}, 1, name);
	return node;
}

export function text(value) {
	var node = new Node(function (parent) {
		let pvnode = parent.vnode;
		let path = parent.path;
		node.indexInParent = pvnode.count();
		node.name = node.indexInParent + 1;
		node.vnode = new Value(3, node.name, value, pvnode._depth + 1);
		node.index = path.length;
		path.push(node);
		node.path = path;
		node.parent = restoreNode(pvnode.push(node.name,node.vnode),pvnode);
		return node;
	}, 3, null, value);
	return node;
}

export function doc() {
	return new Node(emptyVNode(9,"#document",-1,ohamt.empty), 9, "#document", null, [], -1);
}
