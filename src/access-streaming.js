import { seq, create } from "./seq";

import { error } from "./error";

import { element, attribute } from "./access";

import "rxjs/add/operator/takeWhile";

//const _vnodeFromCx = (cx,node) => cx && "vnode" in cx ? cx.vnode : node.cx.vnode;

export function children($node,axis) {

	var f = axis && axis.f ?
		axis.f.__is_NodeTypeTest ?
			axis.f.__Accessor ?
				node => axis.f(node) && node.name == axis.f.__Accessor :
				axis.f :
			axis.f :
		n => n;
	let start = false, end = false;
	const test = node => {
		start = start || (node.type != 17 && node.parent === axis.x && f(node));
		const flagEnd = end;
		end = end || (node.type == 17 && node.parent === axis.x && f(node.node));
		return start && !flagEnd;
	};
	return $node.takeWhile(node => test(node));
}

function Axis(g, f, type, contextNode) {
	return {
		__is_Axis: true,
		__type: type || 1,
		x: contextNode,
		f: f,
		g: g
	};
}
function child($f, contextNode) {
	const cx = this;
	return seq($f).map(f => {
		var axis = Axis(void(0), f, 1, contextNode);
		const stepper = $node => children.bind(cx)($node,axis);
		axis.g = stepper;
		return axis;
	});
}

function _axify($path, contextNode) {
	return seq($path).concatMap(path => {
		if (!path.__is_Axis) {
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? attribute(path, contextNode) : child(element(path), contextNode);
			} else if (typeof path == "function") {
				if (path.__is_NodeTypeTest) return child(path, contextNode);
				return self(path);
			} else {
				return error("XXX", "Unknown axis provided");
			}
		}
		if(!path.x) path.x = contextNode;
		return seq(path);
	});
}

export function selectStreaming($node, ...paths) {
	var cx = this;
	$node = seq($node);
	// make sure the root is a valid context
	return $node.first(node => node.type == 1)
		.concatMap(contextNode =>
			seq(paths)
				.concatMap(path => seq(_axify(path, contextNode)))
			// execute the axis stepping function,
			// it should now take care of the testing / transformation function
				.map(path => $node => path.g.bind(cx)($node))
			// update the context state
				.reduce(($node, changeFn) => changeFn($node),$node)
				.concatAll());
}
