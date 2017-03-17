import { VNode, Value, emptyINode, emptyAttrMap } from './vnode';


export function fromJS(json) {
	var doc = emptyINode(9, "#document", 0, emptyAttrMap());
	function process(entry, parent, depth, key) {
		var cc = entry.constructor;
		if (cc === Object) {
			let name = key !== undefined ? key : "#object";
			let node = emptyINode(6, name, depth);
			parent = parent.set(name, node);
			let keys = Object.keys(entry);
			for (let k of keys) {
				process(entry[k], node, depth+1, k);
			}
		} else if (cc === Array) {
			let name = key !== undefined ? key : "#array";
			let node = emptyINode(5, name, depth);
			parent = parent.set(name, node);
			for (let i = 0, len = entry.length; i < len; i++) {
				process(entry[i], node, depth+1, i);
			}
		} else {
			// TODO type inferrence string/bool/num
			let node = new Value(3, key, entry, depth);
			parent = parent.set(key, node);
		}
	}
	process(json, doc, 1);
	return doc;
}

export function toJS(doc) {
	function process(inode, out, key) {
		let type = inode._type,
		    name = inode._name;
		if (type == 1) {
			for (let attr of inode._attrs.entries()) {}
		} else if (type == 3) {
			out[key] = inode._value;
		} else if (type == 5) {
			var arr = [];
			for (var i = 0; i < inode.size; i++) {
				process(inode.get(i), arr, i);
			}
			if (out === undefined) {
				out = arr;
			} else {
				out[key] = arr;
			}
		} else if (type == 6) {
			var obj = {};
			inode.forEach((v, k) => {
				process(v, obj, k);
			});
			if (out === undefined) {
				out = obj;
			} else {
				out[key] = obj;
			}
		}
		return out;
	}
	// discard DOC for now
	return process(doc.first());
}
