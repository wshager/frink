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
exports.removeAttr = removeAttr;
exports.matchAncestorOrSelf = matchAncestorOrSelf;

var _access = require("./access");

var _seq = require("./seq");

var _fromEvent = require("rxjs/observable/fromEvent");

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

function on($elm, $type) {
	var $doc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;

	return (0, _seq.oneOrMore)($elm).concatMap(function (elm) {
		if (typeof elm == "string") {
			return on(query(elm, $doc), $type);
		}
		if ((0, _access.isVNode)(elm)) elm = elm._domNode || domify(elm);
		return (0, _seq.exactlyOne)($type).concatMap(function (type) {
			return (0, _fromEvent.fromEvent)(elm, type);
		});
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
		return (0, _seq.oneOrMore)($name).map(function (name) {
			return elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
		});
	});
}

function removeAttr($elm, $name) {
	return (0, _seq.oneOrMore)($elm).concatMap(function (elm) {
		return (0, _seq.oneOrMore)($name).map(function (name) {
			elm.removeAttribute(name);
			return elm;
		});
	});
}
/*

export function toggleClass(elm, name, state = null) {
	var hasc = hasClass(elm, name);
	if (state === false || (state === null && hasc)) {
		removeClass(elm, name);
	} else if (!hasc) {
		elm.className += " " + name;
	}
}

export function toggle(elm) {
	// TODO move to CSS checked state
	var cur = elm.style.display;
	elm.style.display = cur.match(/^(none)?$/) ? "block" : "none";
}

export function hide(elm) {
	elm.style.display = "none";
}

function place(node, target, position) {
	if (isVNode(node)) node = node._domNode || domify(node);
	if (isVNode(target)) target = target._domNode || domify(target);
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

export function elem(name, children = [], ns = null) {
	var node = document.createElement(name);
	children.forEach(c => {
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

export function attr(name, value, ns = null) {
	var node = document.createAttribute(name);
	node.value = value;
	return node;
}

export function text(value) {
	return document.createTextNode(value);
}

export function empty(node) {
	if (isVNode(node)) node = node._domNode;
	if (!node) return;
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

export function remove(node) {
	empty(node);
	node.parentNode.removeChild(node);
}

export function placeAt(node, target, replace = false) {
	return place(node, target, replace ? 1 : 0);
}
export function placeAfter(node, target) {
	return place(node, target, 2);
}
export function placeBefore(node, target) {
	return place(node, target, 3);
}
*/
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