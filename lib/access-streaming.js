"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.children = children;
exports.selectStreaming = selectStreaming;

var _seq = require("./seq");

var _error = require("./error");

var _access = require("./access");

require("rxjs/add/operator/skipWhile");

require("rxjs/add/operator/takeWhile");

//const _vnodeFromCx = (cx,node) => cx && "vnode" in cx ? cx.vnode : node.cx.vnode;

function children($node, axis) {
	var contextNode,
	    depth = NaN;
	// move to first contextNode if isNaN, or the same depth
	var f = axis && axis.f ? axis.f.__is_NodeTypeTest ? axis.f.__Accessor ? function (node) {
		return axis.f(node) && node.name == axis.f.__Accessor;
	} : axis.f : axis.f : function (n) {
		return n;
	};
	var start = false,
	    end = false;
	var test = function test(node) {
		if (isNaN(depth)) depth = node.depth;
		var switchContext = false;
		if (node.depth == depth) {
			switchContext = true;
			contextNode = node;
		}
		start = start || node.type != 17 && node.parent === contextNode && f(node);
		var flagEnd = end;
		end = end || node.type == 17 && node.parent === contextNode && f(node.node);
		return switchContext || start && !flagEnd;
	};
	return $node.takeWhile(function (node) {
		//console.log("NODE",node);
		return test(node);
	}).filter(function (node) {
		return node.depth > depth;
	});
}

function Axis(g, f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f,
		g: g
	};
}
function child($f) {
	var cx = this;
	return (0, _seq.seq)($f).map(function (f) {
		var axis = Axis(void 0, f, 1);
		var stepper = function stepper($node) {
			return children.bind(cx || this)($node, axis);
		};
		axis.g = stepper;
		return axis;
	});
}

function self($f) {
	var cx = this;
	return (0, _seq.seq)($f).map(function (f) {
		var axis = Axis(void 0, f, 1);
		var stepper = function stepper($node) {
			return $node;
		};
		axis.g = stepper;
		return axis;
	});
}

function _axify($path) {
	return (0, _seq.seq)($path).concatMap(function (path) {
		if (!path.__is_Axis) {
			// process strings (can this be combined?)
			if (typeof path == "string") {
				var at = /^@/.test(path);
				if (at) path = path.substring(1);
				return at ? (0, _access.attribute)(path) : child((0, _access.element)(path));
			} else if (typeof path == "function") {
				if (path.__is_NodeTypeTest) return child(path);
				return self(path);
			} else {
				return (0, _error.error)("XXX", "Unknown axis provided");
			}
		}
		return (0, _seq.seq)(path);
	});
}

function selectStreaming($node) {
	var cx = this;
	$node = (0, _seq.seq)($node).skipWhile(function (node) {
		return node.type != 1;
	});
	// make sure the root is a valid context
	//

	for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		paths[_key - 1] = arguments[_key];
	}

	var axes = _seq.forEach((0, _seq.seq)(paths),function (path) {
		return _axify(path);
	});

	// execute the axis stepping function,
	// it should now take care of the testing / transformation function
	return axes
		.map(function (path) {
			return function ($node) {
				return path.g.bind(cx)($node);
			};
		})
		// update the context state
		.reduce(function ($node, changeFn) {
			return changeFn($node);
		}, $node).concatAll();
}
