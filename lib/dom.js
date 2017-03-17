"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.nodesList = nodesList;
exports.nextNode = nextNode;
exports.previousNode = previousNode;
function Step(node, depth) {
	this.node = node;
	this.nodeName = node.nodeName;
	this.parentNode = node.parentNode;
	this.nextSibling = node.nextSibling;
	this.previousSibling = node.previousSibling;
	this["@@doc-depth"] = depth;
}

Step.prototype.nodeType = 17;

function nodesList(node) {
	var list = [];
	var next = nextNode(node);
	do {
		list.push(next);
		next = next && nextNode(next);
	} while (next);
	return list;
}

// nextNode means:
// descend into firstChild or nextSibling
// if no more siblings, go back up using Step
// if Step, firstChild will be skipped, so nextSibling will be retried
function nextNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"] || 0;
	//index = node["@@doc-index"],
	//indexInParent = 0;
	//if(index === undefined) index = -1;
	//index++;
	if (type != 17 && node.firstChild) {
		// if we can still go down, return firstChild
		node = node.firstChild;
		//indexInParent = node.indexInParent = 0;
		node["@@doc-depth"] = ++depth;
		//node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		// FIXME we could also directly return the parent's nextSibling
		if (!node.nextSibling) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			node = node.parentNode;
			if (!node || node["@@doc-depth"] !== depth) return;
			node = new Step(node, depth);
			return node;
		} else {
			// return the next child
			node = node.nextSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			return node;
		}
	}
}

// FIXME going back means:
// try previousSibling, else ascend into parentNode
// if we came from a Step, TODO!!
function previousNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"];
	//if(index === undefined) index = -1;
	//index--;
	if (type != 17 && node.parentNode) {
		// if we can still go down, return firstChild
		depth--;
		node = node.parentNode;
		node["@@doc-depth"] = depth;
		node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (!node.previousSibling) {
			//inode = parent;
			depth++;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			while (node["@@doc-depth"] != depth) {
				node = node.firstChild;
				if (!node) return;
			}
			node = new Step(node, depth, index);
			return node;
		} else {
			// return the next child
			node = node.previousSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			node["@@doc-index"] = index;
			return node;
		}
	}
}