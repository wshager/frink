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

var _transducers = require("./transducers");

function domify(n) {
    // render
} /**
   * DOM util module
   * @module dom-util
   */

function ready() {
    return new Promise(function (resolve, reject) {
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

function byId(id, doc = document) {
    return doc.getElementById(id);
}

function query(query, doc = document) {
    return doc.querySelectorAll(query);
}

function on(elm, type, fn, context = document) {
    if (!elm) {
        console.error("TypeError: You're trying to bind an event, but the element is null");
        return;
    }
    try {
        if (elm instanceof NodeList || _seq.isSeq(elm)) {
            var handles = [];
            _transducers.forEach(elm, function (_) {
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
        if (_access.isVNode(elm)) elm = elm._domNode || domify(elm);
        elm.addEventListener(type, fn);
        return function () {
            elm.removeEventListener(type, fn);
        };
    } catch (e) {
        console.error(e);
    }
}

function click(elm) {
    if (elm instanceof NodeList) return _transducers.forEach(elm, click);
    var clk = elm.onclick || elm.click;
    if (typeof clk == "function") {
        clk.apply(elm);
    }
}

function hasClass(elm, name) {
    if (elm instanceof NodeList) {
        return _transducers.foldLeft(elm, false, function (pre, _) {
            return pre || hasClass(_, name);
        });
    }
    return !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"));
}

function removeClass(elm, name) {
    //elm.classList.remove(name);
    if (elm instanceof NodeList) {
        _transducers.forEach(elm, function (_) {
            removeClass(_, name);
        });
    } else {
        elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
    }
}

function toggleClass(elm, name, state = null) {
    var hasc = hasClass(elm, name);
    if (state === false || state === null && hasc) {
        removeClass(elm, name);
    } else if (!hasc) {
        elm.className += " " + name;
    }
}

function removeAttr(elm, name) {
    if (elm instanceof NodeList) {
        _transducers.forEach(elm, function (_) {
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
    if (_access.isVNode(node)) node = node._domNode || domify(node);
    if (_access.isVNode(target)) target = target._domNode || domify(target);
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

function elem(name, children = [], ns = null) {
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

function attr(name, value, ns = null) {
    var node = document.createAttribute(name);
    node.value = value;
    return node;
}

function text(value) {
    return document.createTextNode(value);
}

function empty(node) {
    if (_access.isVNode(node)) node = node._domNode;
    if (!node) return;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function remove(node) {
    empty(node);
    node.parentNode.removeChild(node);
}

function placeAt(node, target, replace = false) {
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
        if (!!(node && node.matches(selector))) return node;
    }
}