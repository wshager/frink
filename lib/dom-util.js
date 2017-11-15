"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ready = ready;
exports.byId = byId;
exports.query = query;
exports.on = on;
exports.click = click;
exports.hasClass = hasClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.removeAttr = removeAttr;
exports.toggle = toggle;
exports.hide = hide;
exports.elem = elem;
exports.attr = attr;
exports.text = text;
exports.empty = empty;
exports.remove = remove;
exports.placeAt = placeAt;
exports.placeAfter = placeAfter;
exports.placeBefore = placeBefore;
exports.matchAncestorOrSelf = matchAncestorOrSelf;

var _access = require("./access");

var _seq = require("./seq");

var _util = require("./util");

var _error = require("./error");

/**
 * DOM util module
 * @module dom-util
 */

function domify() {}

function ready() {
	return (0, _seq.create)(function (o) {
		var completed = function completed() {
			document.removeEventListener("DOMContentLoaded", completed, false);
			window.removeEventListener("load", completed, false);
			o.next();
			o.complete();
		};

		if (document.readyState === "complete") {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout(completed, 0);
		} else {

			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", completed, false);

			// A fallback to window.onload, that will always work
			window.addEventListener("load", completed, false);
		}
	});
}

function byId($id) {
	var $doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	return (0, _seq.exactlyOne)($id).concatMap(function (id) {
		return (0, _seq.exactlyOne)($doc).map(function (doc) {
			return doc.getElementById(id);
		});
	});
}

function query($query) {
	var $doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

	return (0, _seq.exactlyOne)($query).concatMap(function (query) {
		return (0, _seq.exactlyOne)($doc).concatMap(function (doc) {
			return doc.querySelectorAll(query);
		});
	});
}

function on($elm, $type, $fn) {
	var $doc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document;

	(0, _seq.oneOrMore)($elm).concatMap(function (elm) {
		try {
			if (typeof elm == "string") {
				return on(query(elm, $doc), $type, $fn);
			}
			if ((0, _access.isVNode)(elm)) elm = elm._domNode || domify(elm);
			return (0, _seq.exactlyOne)($type).concatMap(function (type) {
				return (0, _seq.exactlyOne)($fn).map(function (fn) {
					elm.addEventListener(type, fn);
					return function () {
						return elm.removeEventListener(type, fn);
					};
				});
			});
		} catch (e) {
			return (0, _error.error)(e);
		}
	});
}

function click($elm) {
	return (0, _seq.oneOrMore)($elm).map(function (elm) {
		var clk = elm.onclick || elm.click;
		if (typeof clk == "function") {
			clk.apply(elm);
		}
		return elm;
	});
}

function hasClass($elm, $name) {
	return (0, _seq.oneOrMore)($elm).concatMap(function (elm) {
		return (0, _seq.exactlyOne)($name).map(function (name) {
			return !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"));
		});
	});
}

function removeClass($elm, $name) {
	return (0, _seq.oneOrMore)($elm).concatMap(function (elm) {
		return (0, _seq.exactlyOne)($name).map(function (name) {
			return elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
		});
	});
}

function toggleClass(elm, name) {
	var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var hasc = hasClass(elm, name);
	if (state === false || state === null && hasc) {
		removeClass(elm, name);
	} else if (!hasc) {
		elm.className += " " + name;
	}
}

function removeAttr(elm, name) {
	if (elm instanceof NodeList) {
		(0, _util.forEach)(elm, function (_) {
			_.removeAttribute(name);
		});
	} else {
		elm.removeAttribute(name);
	}
}

function toggle(elm) {
	// TODO move to CSS checked state
	var cur = elm.style.display;
	elm.style.display = cur.match(/^(none)?$/) ? "block" : "none";
}

function hide(elm) {
	elm.style.display = "none";
}

function place(node, target, position) {
	if ((0, _access.isVNode)(node)) node = node._domNode || domify(node);
	if ((0, _access.isVNode)(target)) target = target._domNode || domify(target);
	if (position == 1) {
		empty(target);
	}
	if (position > 1) {
		var parent = target.parentNode;
		if (position == 2) {
			parent.insertBefore(node, target.nextSibling);
		} else {
			parent.insertBefore(node, target);
		}
	} else {
		target.appendChild(node);
	}
	return node;
}

function elem(name) {
	var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var node = document.createElement(name);
	children.forEach(function (c) {
		if (c) {
			if (c.nodeType == 2) {
				node.setAttributeNode(c);
			} else {
				node.appendChild(c);
			}
		}
	});
	return node;
}

function attr(name, value) {
	var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var node = document.createAttribute(name);
	node.value = value;
	return node;
}

function text(value) {
	return document.createTextNode(value);
}

function empty(node) {
	if ((0, _access.isVNode)(node)) node = node._domNode;
	if (!node) return;
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function remove(node) {
	empty(node);
	node.parentNode.removeChild(node);
}

function placeAt(node, target) {
	var replace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	return place(node, target, replace ? 1 : 0);
}
function placeAfter(node, target) {
	return place(node, target, 2);
}
function placeBefore(node, target) {
	return place(node, target, 3);
}

/**
 * Match a DOM Node to a selector, or, if it doesn't match,
 * try matching up the ancestor tree
 * @param  {Node} elem The base element (self)
 * @param  {String} selector The selector to match
 * @return {HTMLElement|null} Null if no match
 */
function matchAncestorOrSelf(elem, selector) {
	var node = elem;
	if (node.matches(selector)) return node;
	while (node.parentNode) {
		node = node.parentNode;
		if (node && node.matches(selector)) return node;
	}
}