//import { isSeq } from "../src/seq.js";
const attr = ({ $name, $value }) => {
	const a = document.createAttribute($name);
	if (isSeq($value)) {
		$value.subscribe(val => {
			if (a.value !== val) a.value = val;
		});
		return a;
	} else {
		a.value = $value;
	}
	return a;
};

const text = (data) => {
	const t = document.createTextNode(data);
	if (isSeq(data)) {
		data.subscribe(val => {
			t.data = val;
		});
		return t;
	}
	return t;
};
// elem can receive a diff of children
// uses $name and $children so object can be spread as-is
const elem = ({ $name, $children = [], is, ...props }, mountpoint) => {
	const e = document.createElement($name, is);
	const _append = child => {
		// any child may re-render or remove itself, also #text
		const { eventType, childNode, refNode } = child;
		if (eventType === "insert") {
			e.appendChild(childNode);
		} else if (eventType === "delete") {
			childNode.remove();
		} else if (eventType === "move") {
			this.insertBefore(childNode, refNode);
		} else if (child.nodeType === 2) {
			e.setAttributeNode(child);
		} else {
			e.appendChild(child);
		}
	};
	if (isSeq($children)) {
		$children.subscribe(_append);
	} else {
		$children.forEach(_append);
	}
	const _set = (node, key, val) => {
		if (key === null || key === undefined) {
			throw new Error("Key is empty");
		}
		if (typeof val === "object" && val !== null && !Array.isArray(val)) {
			node[key] = Object.assign(node[key], val);
		}
		node[key] = val;
		return node;
	};
	Object.entries(props).forEach(([key, val]) => {
		_set(e, key, val);
	});
	if (mountpoint) {
		mountpoint.appendChild(e);
	}
	return e;
};