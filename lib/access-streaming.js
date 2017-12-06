"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.children = children;
exports.child = child;

var _frink = require("frink");

var n = _interopRequireWildcard(_frink);

require("rxjs/add/operator/takeWhile");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const _vnodeFromCx = (cx, node) => cx && "vnode" in cx ? cx.vnode : node.type == 17 ? node.node.cx.vnode : node.cx.vnode;

function children(axis,node) {
	const cx = this;
	// FIXME what about filters / transformation functions?
	var f = axis.f ?
		axis.f.__is_NodeTypeTest ?
			axis.f.__Accessor ?
				n => axis.f(n) && n.name == axis.f.__Accessor :
				axis.f :
			axis.f :
		n => n;
	axis.start = axis.start || node.type != 17 && node.parent === axis.x && f(node);
	var end = axis.end;
	axis.end = axis.end || node.type == 17 && node.parent === axis.x && f(node.node);
	if(axis.start && !end) {
		return node;
	}
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
	return n.seq($f).map(f => {
		if (f.__is_NodeTypeTest) {
			// this means it's a predicate, and the actual function should become a filter
			if (f.__Accessor) {
				// TODO this means we can try direct access on a node
			}
		}
		var axis = Axis(void(0), f, 1, contextNode);
		const stepper = (node) => children.bind(cx,axis)(node);
		axis.g = stepper;
		return axis;
	});
}

function _axify($path, contextNode) {
	return n.seq($path).concatMap(path => {
		if (!path.__is_Axis) {
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? n.attribute(path, contextNode) : child(n.element(path), contextNode);
			} else if (typeof path == "function") {
				if (path.__is_NodeTypeTest) return child(path, contextNode);
				return self(path);
			} else {
				return error("XXX", "Unknown axis provided");
			}
		}
		if(!path.x) path.x = contextNode;
		return n.seq(path);
	});
}

function selectStreaming($node, ...paths) {
	var cx = this;
	$node = n.seq($node);
	//var boundEnsureDoc = n.ensureDoc.bind(cx);
	return $node.first(node => {
		return node.type == 1;
	}).concatMap(contextNode => {
		return n.seq(paths)
			.concatMap(path => n.seq(_axify(path, contextNode)))
			.map(path => {
				return $node => {
				// make sure all paths are funcs
				// TODO skip self
				//var skipCompare = path.__type == 2 || path.__type == 3;
					//var f = path.f;
					// rebind step function to the context
					// no comparer required for streaming select
					//if (!skipCompare) f = pipe(f, filter(_comparer()));
					return $node.concatMap(node => {
						const step = path.g(node);
						return (step !== undefined) ? n.seq(step) : n.seq();
					});
				};
			})
		// update the context state
			.reduce(($node, changeFn) => {
				return changeFn($node);
			},$node)
			.concatAll();
	});
}
