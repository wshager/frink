import { seq, forEach } from "./seq";

import { error } from "./error";

import { element, attribute } from "./access";

export function children($node, axis) {
	var parentNode, childNode, depth = NaN;
	// move to first childNode if isNaN, or the same depth
	var f = axis && axis.f ?
		axis.f.__is_NodeTypeTest ?
			axis.f.__Accessor ?
				node => axis.f(node) && node.name == axis.f.__Accessor :
				axis.f :
			axis.f :
		n => n;
	const _hasAncestor = (node,maybeAncestor) => {
		while(node.parent) {
			if(node.parent == maybeAncestor) return true;
			node = node.parent;
		}
	};
	const test = (node) => {
		if (isNaN(depth)) depth = node.depth;
		// if depth is at node, switch context
		// TODO filter while depth > cxDepth, move cx down while nodetest true
		const isClose = node.type == 17;
		if(!isClose) {
			if (node.depth == depth) {
				parentNode = node;
				//console.log("init",node.type,node.name);
			} else if(node.parent == parentNode) {
				if(f(node)) {
					childNode = node;
					//console.log("cx",node.type,node.name);
				}
			}
		}
		// 1. never emit init
		// 2. emit only cx nodes that pass filter
		// 3. emit only nodes that have cx as ancestor
		return (isClose ? node.node : node) == parentNode ? false :
			(isClose ? node.node : node) == childNode ? true :
				_hasAncestor(node,childNode);
	};
	return $node.filter(test);
}

export function Axis(g, f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f,
		g: g
	};
}

export function child($f) {
	var cx = this;
	return seq($f).map(f => {
		var axis = Axis(void 0, f, 1);
		var stepper = $node => children.bind(cx || this)($node, axis);
		axis.g = stepper;
		return axis;
	});
}

export function self($f) {
	return seq($f).map(f => {
		var axis = Axis(void 0, f, 1);
		var stepper = $node => $node;
		axis.g = stepper;
		return axis;
	});
}

function _axify($path) {
	return seq($path).concatMap(path => {
		if (!path.__is_Axis) {
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? attribute(path) : child(element(path));
			} else if (typeof path == "function") {
				if (path.__is_NodeTypeTest) return child(path);
				return self(path);
			} else {
				return error("XXX", "Unknown axis provided");
			}
		}
		return seq(path);
	});
}

export function select($node, ...paths) {
	var cx = this;
	$node = seq($node).skipWhile(node => node.type != 1);
	// make sure the root is a valid context

	var axes = forEach(seq(paths),_axify);

	// execute the axis stepping function,
	// it should now take care of the testing / transformation function
	return axes
		.map(path => $node => path.g.bind(cx)($node))
		// update the context state
		.reduce(($node, changeFn) => changeFn($node), $node)
		.concatAll();
}
