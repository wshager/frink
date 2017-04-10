"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.error = exports.sort = exports.apply = exports.functionLookup = exports.module = exports.parse = exports.collection = exports.doc = exports.normalizeUnicode = exports.concat = exports.stringJoin = exports.stringLength = exports.replace = exports.matches = exports.normalizeSpace = exports.lowerCase = exports.upperCase = exports.codepointsToString = exports.stringToCodepoints = exports.substring = exports.tokenize = exports.analyzeString = exports.t = exports.f = exports.minus = exports.instanceOf = exports.op = exports.logic = exports.cast = exports.boolean = exports.float = exports.double = exports.number = exports.string = exports.integer = exports.decimal = exports.data = exports.drop = exports.take = exports.into = exports.compose = exports.transform = exports.get = exports.cat = exports.foldLeft = exports.filter = exports.forEach = exports.reverse = exports.remove = exports.tail = exports.head = exports.subsequence = exports.insertBefore = exports.count = exports.exists = exports.empty = exports.isEmptySeq = exports.first = exports.isSeq = exports.seq = exports.jsFromL3 = exports.jsToL3 = exports.iterJS = exports.toJS = exports.fromJS = exports.toL3 = exports.fromL3 = exports.name = exports.isEmptyNode = exports.isNode = exports.followingSibling = exports.position = exports.child = exports.select = exports.attribute = exports.text = exports.node = exports.element = exports.stringify = exports.childrenByName = exports.children = exports.parent = exports.nextSibling = exports.firstChild = exports.nextNode = exports.docIter = exports.iter = exports.removeChild = exports.insertChildBefore = exports.appendChild = exports.q = exports.p = exports.c = exports.l = exports.m = exports.d = exports.x = exports.a = exports.e = undefined;
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
Object.defineProperty(exports, "x", {
    enumerable: true,
    get: function () {
        return _vnode.x;
    }
});
Object.defineProperty(exports, "d", {
    enumerable: true,
    get: function () {
        return _vnode.d;
    }
});
Object.defineProperty(exports, "m", {
    enumerable: true,
    get: function () {
        return _vnode.m;
    }
});
Object.defineProperty(exports, "l", {
    enumerable: true,
    get: function () {
        return _vnode.l;
    }
});
Object.defineProperty(exports, "c", {
    enumerable: true,
    get: function () {
        return _vnode.c;
    }
});
Object.defineProperty(exports, "p", {
    enumerable: true,
    get: function () {
        return _vnode.p;
    }
});
Object.defineProperty(exports, "q", {
    enumerable: true,
    get: function () {
        return _vnode.q;
    }
});

var _modify = require("./modify");

Object.defineProperty(exports, "appendChild", {
    enumerable: true,
    get: function () {
        return _modify.appendChild;
    }
});
Object.defineProperty(exports, "insertChildBefore", {
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
Object.defineProperty(exports, "position", {
    enumerable: true,
    get: function () {
        return _access.position;
    }
});
Object.defineProperty(exports, "followingSibling", {
    enumerable: true,
    get: function () {
        return _access.followingSibling;
    }
});
Object.defineProperty(exports, "isNode", {
    enumerable: true,
    get: function () {
        return _access.isNode;
    }
});
Object.defineProperty(exports, "isEmptyNode", {
    enumerable: true,
    get: function () {
        return _access.isEmptyNode;
    }
});
Object.defineProperty(exports, "name", {
    enumerable: true,
    get: function () {
        return _access.name;
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
Object.defineProperty(exports, "first", {
    enumerable: true,
    get: function () {
        return _seq.first;
    }
});
Object.defineProperty(exports, "isEmptySeq", {
    enumerable: true,
    get: function () {
        return _seq.isEmpty;
    }
});
Object.defineProperty(exports, "empty", {
    enumerable: true,
    get: function () {
        return _seq.empty;
    }
});
Object.defineProperty(exports, "exists", {
    enumerable: true,
    get: function () {
        return _seq.exists;
    }
});
Object.defineProperty(exports, "count", {
    enumerable: true,
    get: function () {
        return _seq.count;
    }
});
Object.defineProperty(exports, "insertBefore", {
    enumerable: true,
    get: function () {
        return _seq.insertBefore;
    }
});

var _subseq = require("./subseq");

Object.defineProperty(exports, "subsequence", {
    enumerable: true,
    get: function () {
        return _subseq.subsequence;
    }
});
Object.defineProperty(exports, "head", {
    enumerable: true,
    get: function () {
        return _subseq.head;
    }
});
Object.defineProperty(exports, "tail", {
    enumerable: true,
    get: function () {
        return _subseq.tail;
    }
});
Object.defineProperty(exports, "remove", {
    enumerable: true,
    get: function () {
        return _subseq.remove;
    }
});
Object.defineProperty(exports, "reverse", {
    enumerable: true,
    get: function () {
        return _subseq.reverse;
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
Object.defineProperty(exports, "take", {
    enumerable: true,
    get: function () {
        return _transducers.take;
    }
});
Object.defineProperty(exports, "drop", {
    enumerable: true,
    get: function () {
        return _transducers.drop;
    }
});

var _type = require("./type");

Object.defineProperty(exports, "data", {
    enumerable: true,
    get: function () {
        return _type.data;
    }
});
Object.defineProperty(exports, "decimal", {
    enumerable: true,
    get: function () {
        return _type.decimal;
    }
});
Object.defineProperty(exports, "integer", {
    enumerable: true,
    get: function () {
        return _type.integer;
    }
});
Object.defineProperty(exports, "string", {
    enumerable: true,
    get: function () {
        return _type.string;
    }
});
Object.defineProperty(exports, "number", {
    enumerable: true,
    get: function () {
        return _type.number;
    }
});
Object.defineProperty(exports, "double", {
    enumerable: true,
    get: function () {
        return _type.double;
    }
});
Object.defineProperty(exports, "float", {
    enumerable: true,
    get: function () {
        return _type.float;
    }
});
Object.defineProperty(exports, "boolean", {
    enumerable: true,
    get: function () {
        return _type.boolean;
    }
});
Object.defineProperty(exports, "cast", {
    enumerable: true,
    get: function () {
        return _type.cast;
    }
});
Object.defineProperty(exports, "logic", {
    enumerable: true,
    get: function () {
        return _type.logic;
    }
});
Object.defineProperty(exports, "op", {
    enumerable: true,
    get: function () {
        return _type.op;
    }
});
Object.defineProperty(exports, "instanceOf", {
    enumerable: true,
    get: function () {
        return _type.instanceOf;
    }
});
Object.defineProperty(exports, "minus", {
    enumerable: true,
    get: function () {
        return _type.minus;
    }
});
Object.defineProperty(exports, "f", {
    enumerable: true,
    get: function () {
        return _type.f;
    }
});
Object.defineProperty(exports, "t", {
    enumerable: true,
    get: function () {
        return _type.t;
    }
});

var _string = require("./string");

Object.defineProperty(exports, "analyzeString", {
    enumerable: true,
    get: function () {
        return _string.analyzeString;
    }
});
Object.defineProperty(exports, "tokenize", {
    enumerable: true,
    get: function () {
        return _string.tokenize;
    }
});
Object.defineProperty(exports, "substring", {
    enumerable: true,
    get: function () {
        return _string.substring;
    }
});
Object.defineProperty(exports, "stringToCodepoints", {
    enumerable: true,
    get: function () {
        return _string.stringToCodepoints;
    }
});
Object.defineProperty(exports, "codepointsToString", {
    enumerable: true,
    get: function () {
        return _string.codepointsToString;
    }
});
Object.defineProperty(exports, "upperCase", {
    enumerable: true,
    get: function () {
        return _string.upperCase;
    }
});
Object.defineProperty(exports, "lowerCase", {
    enumerable: true,
    get: function () {
        return _string.lowerCase;
    }
});
Object.defineProperty(exports, "normalizeSpace", {
    enumerable: true,
    get: function () {
        return _string.normalizeSpace;
    }
});
Object.defineProperty(exports, "matches", {
    enumerable: true,
    get: function () {
        return _string.matches;
    }
});
Object.defineProperty(exports, "replace", {
    enumerable: true,
    get: function () {
        return _string.replace;
    }
});
Object.defineProperty(exports, "stringLength", {
    enumerable: true,
    get: function () {
        return _string.stringLength;
    }
});
Object.defineProperty(exports, "stringJoin", {
    enumerable: true,
    get: function () {
        return _string.stringJoin;
    }
});
Object.defineProperty(exports, "concat", {
    enumerable: true,
    get: function () {
        return _string.concat;
    }
});
Object.defineProperty(exports, "normalizeUnicode", {
    enumerable: true,
    get: function () {
        return _string.normalizeUnicode;
    }
});

var _function = require("./function");

Object.defineProperty(exports, "doc", {
    enumerable: true,
    get: function () {
        return _function.doc;
    }
});
Object.defineProperty(exports, "collection", {
    enumerable: true,
    get: function () {
        return _function.collection;
    }
});
Object.defineProperty(exports, "parse", {
    enumerable: true,
    get: function () {
        return _function.parse;
    }
});
Object.defineProperty(exports, "module", {
    enumerable: true,
    get: function () {
        return _function.module;
    }
});
Object.defineProperty(exports, "functionLookup", {
    enumerable: true,
    get: function () {
        return _function.functionLookup;
    }
});
Object.defineProperty(exports, "apply", {
    enumerable: true,
    get: function () {
        return _function.apply;
    }
});
Object.defineProperty(exports, "sort", {
    enumerable: true,
    get: function () {
        return _function.sort;
    }
});
Object.defineProperty(exports, "error", {
    enumerable: true,
    get: function () {
        return _function.error;
    }
});

var _op = require("./op");

Object.keys(_op).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _op[key];
        }
    });
});

var _parser = require("./parser");

function parseString(str, cb) {
    var parser = new _parser.Parser();
    return parser.parseString(str, cb);
}