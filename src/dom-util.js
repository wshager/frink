/**
 * DOM util module
 * @module dom-util
 */

/// <reference path="./typings/lib.es6.d.ts"/>

import { isNode } from "./access";
import { isSeq } from "./seq";
import { forEach, foldLeft } from "./transducers";

function domify(n){
	// render
}

export function ready() {
	return new Promise(function(resolve,reject){
	    function completed() {
	        document.removeEventListener("DOMContentLoaded", completed, false);
	        window.removeEventListener("load", completed, false);
	        resolve();
	    }

	    if (document.readyState === "complete") {
	        // Handle it asynchronously to allow scripts the opportunity to delay ready
	        setTimeout(callback);

	    } else {

	        // Use the handy event callback
	        document.addEventListener("DOMContentLoaded", completed, false);

	        // A fallback to window.onload, that will always work
	        window.addEventListener("load", completed, false);
	    }
	});
}

export function byId(id, doc = document) {
    return doc.getElementById(id);
}

export function query(query, doc = document) {
    return doc.querySelectorAll(query);
}

export function on(elm, type, fn, context = document) {
    if (!elm) {
        console.error("TypeError: You're trying to bind an event, but the element is null");
        return;
    }
    try {
        if (elm instanceof NodeList || isSeq(elm)) {
            var handles = [];
            forEach(elm, function (_) {
                handles.push(on(_, type, fn));
            });
            return function () {
                handles.forEach(function (_) {
                    _();
                });
            };
        }
        if (typeof elm == "string") {
            return on(query(elm, context), type, fn);
        }
        if (isNode(elm)) elm = elm._domNode || domify(elm);
        elm.addEventListener(type, fn);
        return function () {
            elm.removeEventListener(type, fn);
        };
    } catch (e) {
        console.error(e);
    }
}

export function click(elm) {
    if (elm instanceof NodeList) return forEach(elm, click);
    var clk = elm.onclick || elm.click;
    if (typeof clk == "function") {
        clk.apply(elm);
    }
}

export function hasClass(elm, name) {
    if (elm instanceof NodeList) {
        return foldLeft(elm, false, function (pre, _) {
            return pre || hasClass(_, name);
        });
    }
    return !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"));
}

export function removeClass(elm, name) {
    //elm.classList.remove(name);
    if (elm instanceof NodeList) {
        forEach(elm, function (_) {
            removeClass(_, name);
        });
    } else {
        elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
    }
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
    if (isNode(node)) node = node._domNode || domify(node);
    if (isNode(target)) target = target._domNode || domify(target);
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
    if (isNode(node)) node = node._domNode;
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
        if (!!(node && node.matches(selector))) return node;
    }
}
