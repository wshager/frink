"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uncompress = exports.compress = exports.render = exports.toL3 = exports.fromL3 = exports.childrenByName = exports.children = exports.parent = exports.nextSibling = exports.firstChild = exports.nextNode = exports.docIter = exports.removeChild = exports.insertBefore = exports.appendChild = exports.qname = exports.processingInstruction = exports.comment = exports.cdata = exports.text = exports.attr = exports.elem = undefined;

var _vnode = require("./vnode");

Object.defineProperty(exports, "elem", {
  enumerable: true,
  get: function () {
    return _vnode.elem;
  }
});
Object.defineProperty(exports, "attr", {
  enumerable: true,
  get: function () {
    return _vnode.attr;
  }
});
Object.defineProperty(exports, "text", {
  enumerable: true,
  get: function () {
    return _vnode.text;
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

var _render = require("./render");

Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _render.render;
  }
});

var _fastintcompression = require("fastintcompression");

var _fastintcompression2 = _interopRequireDefault(_fastintcompression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const compress = _fastintcompression2.default.compress;
const uncompress = _fastintcompression2.default.uncompress;

exports.compress = compress;
exports.uncompress = uncompress;