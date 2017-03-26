"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.into = exports.compose = exports.transform = exports.get = exports.cat = exports.foldLeft = exports.filter = exports.forEach = exports.toSeq = exports.isSeq = exports.seq = exports.jsFromL3 = exports.jsToL3 = exports.iterJS = exports.toJS = exports.fromJS = exports.toL3 = exports.fromL3 = exports.child = exports.select = exports.attribute = exports.text = exports.node = exports.element = exports.stringify = exports.childrenByName = exports.children = exports.parent = exports.nextSibling = exports.firstChild = exports.nextNode = exports.docIter = exports.iter = exports.removeChild = exports.insertBefore = exports.appendChild = exports.qname = exports.processingInstruction = exports.comment = exports.cdata = exports.d = exports.t = exports.a = exports.e = undefined;
exports.parseString = parseString;

var _vnode = require("./vnode");

Object.defineProperty(exports, "e", {
    enumerable: true,
    get: function () {
        return _vnode.e;
    }
});
Object.defineProperty(exports, "a", {
    enumerable: true,
    get: function () {
        return _vnode.a;
    }
});
Object.defineProperty(exports, "t", {
    enumerable: true,
    get: function () {
        return _vnode.t;
    }
});
Object.defineProperty(exports, "d", {
    enumerable: true,
    get: function () {
        return _vnode.d;
    }
});
Object.defineProperty(exports, "cdata", {
    enumerable: true,
    get: function () {
        return _vnode.cdata;
    }
});
Object.defineProperty(exports, "comment", {
    enumerable: true,
    get: function () {
        return _vnode.comment;
    }
});
Object.defineProperty(exports, "processingInstruction", {
    enumerable: true,
    get: function () {
        return _vnode.processingInstruction;
    }
});
Object.defineProperty(exports, "qname", {
    enumerable: true,
    get: function () {
        return _vnode.qname;
    }
});

var _modify = require("./modify");

Object.defineProperty(exports, "appendChild", {
    enumerable: true,
    get: function () {
        return _modify.appendChild;
    }
});
Object.defineProperty(exports, "insertBefore", {
    enumerable: true,
    get: function () {
        return _modify.insertBefore;
    }
});
Object.defineProperty(exports, "removeChild", {
    enumerable: true,
    get: function () {
        return _modify.removeChild;
    }
});

var _access = require("./access");

Object.defineProperty(exports, "iter", {
    enumerable: true,
    get: function () {
        return _access.iter;
    }
});
Object.defineProperty(exports, "docIter", {
    enumerable: true,
    get: function () {
        return _access.docIter;
    }
});
Object.defineProperty(exports, "nextNode", {
    enumerable: true,
    get: function () {
        return _access.nextNode;
    }
});
Object.defineProperty(exports, "firstChild", {
    enumerable: true,
    get: function () {
        return _access.firstChild;
    }
});
Object.defineProperty(exports, "nextSibling", {
    enumerable: true,
    get: function () {
        return _access.nextSibling;
    }
});
Object.defineProperty(exports, "parent", {
    enumerable: true,
    get: function () {
        return _access.parent;
    }
});
Object.defineProperty(exports, "children", {
    enumerable: true,
    get: function () {
        return _access.children;
    }
});
Object.defineProperty(exports, "childrenByName", {
    enumerable: true,
    get: function () {
        return _access.childrenByName;
    }
});
Object.defineProperty(exports, "stringify", {
    enumerable: true,
    get: function () {
        return _access.stringify;
    }
});
Object.defineProperty(exports, "element", {
    enumerable: true,
    get: function () {
        return _access.element;
    }
});
Object.defineProperty(exports, "node", {
    enumerable: true,
    get: function () {
        return _access.node;
    }
});
Object.defineProperty(exports, "text", {
    enumerable: true,
    get: function () {
        return _access.text;
    }
});
Object.defineProperty(exports, "attribute", {
    enumerable: true,
    get: function () {
        return _access.attribute;
    }
});
Object.defineProperty(exports, "select", {
    enumerable: true,
    get: function () {
        return _access.select;
    }
});
Object.defineProperty(exports, "child", {
    enumerable: true,
    get: function () {
        return _access.child;
    }
});

var _l = require("./l3");

Object.defineProperty(exports, "fromL3", {
    enumerable: true,
    get: function () {
        return _l.fromL3;
    }
});
Object.defineProperty(exports, "toL3", {
    enumerable: true,
    get: function () {
        return _l.toL3;
    }
});

var _json = require("./json");

Object.defineProperty(exports, "fromJS", {
    enumerable: true,
    get: function () {
        return _json.fromJS;
    }
});
Object.defineProperty(exports, "toJS", {
    enumerable: true,
    get: function () {
        return _json.toJS;
    }
});
Object.defineProperty(exports, "iterJS", {
    enumerable: true,
    get: function () {
        return _json.iter;
    }
});
Object.defineProperty(exports, "jsToL3", {
    enumerable: true,
    get: function () {
        return _json.toL3;
    }
});
Object.defineProperty(exports, "jsFromL3", {
    enumerable: true,
    get: function () {
        return _json.fromL3;
    }
});

var _seq = require("./seq");

Object.defineProperty(exports, "seq", {
    enumerable: true,
    get: function () {
        return _seq.seq;
    }
});
Object.defineProperty(exports, "isSeq", {
    enumerable: true,
    get: function () {
        return _seq.isSeq;
    }
});
Object.defineProperty(exports, "toSeq", {
    enumerable: true,
    get: function () {
        return _seq.toSeq;
    }
});

var _transducers = require("./transducers");

Object.defineProperty(exports, "forEach", {
    enumerable: true,
    get: function () {
        return _transducers.forEach;
    }
});
Object.defineProperty(exports, "filter", {
    enumerable: true,
    get: function () {
        return _transducers.filter;
    }
});
Object.defineProperty(exports, "foldLeft", {
    enumerable: true,
    get: function () {
        return _transducers.foldLeft;
    }
});
Object.defineProperty(exports, "cat", {
    enumerable: true,
    get: function () {
        return _transducers.cat;
    }
});
Object.defineProperty(exports, "get", {
    enumerable: true,
    get: function () {
        return _transducers.get;
    }
});
Object.defineProperty(exports, "transform", {
    enumerable: true,
    get: function () {
        return _transducers.transform;
    }
});
Object.defineProperty(exports, "compose", {
    enumerable: true,
    get: function () {
        return _transducers.compose;
    }
});
Object.defineProperty(exports, "into", {
    enumerable: true,
    get: function () {
        return _transducers.into;
    }
});

var _parser = require("./parser");

function parseString(str, cb) {
    var parser = new _parser.Parser();
    return parser.parseString(str, cb);
}