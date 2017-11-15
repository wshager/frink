/**
 * DOM util module
 * @module dom-util
 */

import { isVNode } from "./access";
import { seq, isSeq, create, exactlyOne, oneOrMore } from "./seq";
import { forEach } from "./util";
import { error } from "./error";

function domify(){
}

export function ready() {
	return create(o => {
		const completed = () => {
			document.removeEventListener("DOMContentLoaded", completed, false);
			window.removeEventListener("load", completed, false);
			o.next();
			o.complete();
		};

		if (document.readyState === "complete") {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout(completed,0);

		} else {

			// Use the handy event callback
			document.addEventListener("DOMContentLoaded", completed, false);

			// A fallback to window.onload, that will always work
			window.addEventListener("load", completed, false);
		}
	});
}

export function byId($id, $doc = document) {
	return exactlyOne($id).concatMap(id => exactlyOne($doc).map(doc => doc.getElementById(id)));
}

export function query($query, $doc = document) {
	return exactlyOne($query).concatMap(query => exactlyOne($doc).concatMap(doc => doc.querySelectorAll(query)));
}

export function on($elm, $type, $fn, $doc = document) {
	oneOrMore($elm).concatMap(elm => {
		try {
			if (typeof elm == "string") {
				return on(query(elm, $doc), $type, $fn);
			}
			if (isVNode(elm)) elm = elm._domNode || domify(elm);
			return exactlyOne($type).concatMap(type => exactlyOne($fn).map(fn => {
				elm.addEventListener(type, fn);
				return () => elm.removeEventListener(type, fn);
			}));
		} catch (e) {
			return error(e);
		}
	});
}

export function click($elm) {
	return oneOrMore($elm).map(elm => {
		var clk = elm.onclick || elm.click;
		if (typeof clk == "function") {
			clk.apply(elm);
		}
		return elm;
	});
}

export function hasClass($elm, $name) {
	return oneOrMore($elm).concatMap(elm => exactlyOne($name).map(name => !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"))));
}

export function removeClass($elm, $name) {
	return oneOrMore($elm).concatMap(elm => exactlyOne($name).map(name => elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "")));
}

export function toggleClass(elm, name, state = null) {
	var hasc = hasClass(elm, name);
	if (state === false || (state === null && hasc)) {
		removeClass(elm, name);
	} else if (!hasc) {
		elm.className += " " + name;
	}
}

export function removeAttr(elm, name) {
	if (elm instanceof NodeList) {
		forEach(elm,function (_) {
			_.removeAttribute(name);
		});
	} else {
		elm.removeAttribute(name);
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

/**
 * Match a DOM Node to a selector, or, if it doesn't match,
 * try matching up the ancestor tree
 * @param  {Node} elem The base element (self)
 * @param  {String} selector The selector to match
 * @return {HTMLElement|null} Null if no match
 */
export function matchAncestorOrSelf(elem, selector) {
	var node = elem;
	if (node.matches(selector)) return node;
	while (node.parentNode) {
		node = node.parentNode;
		if (node && node.matches(selector)) return node;
	}
}
