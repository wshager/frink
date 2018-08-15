"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.children = children;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.previousSibling = previousSibling;
exports.getDoc = getDoc;
exports.lastChild = lastChild;
exports.parent = parent;
exports.self = self;
exports.cxFilter = cxFilter;
exports.element = element;
exports.list = list;
exports.map = map;
exports.processingInstruction = processingInstruction;
exports.comment = comment;
exports.attribute = attribute;
exports.text = text;
exports.node = node;
exports.child = child;
exports.siblingsOrSelf = siblingsOrSelf;
exports.select = select;
exports.isEmptyNode = isEmptyNode;
exports.name = name;
exports.last = exports.position = exports.isVNode = void 0;

var _l3n = require("l3n");

var _error = require("./error");

var _seq = require("./seq");

var _util = require("./util");

const _vnodeFromCx = (cx, node) => cx && "vnode" in cx ? cx.vnode : node.cx.vnode;

function children($node) {
  const cx = this;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => {
    const vnode = _vnodeFromCx(cx, node);

    const values = node.type == 2 ? [node.inode] : node.values();
    const depth = node.depth + 1;
    return (0, _seq.forEach)(values, (inode, idx) => vnode(inode, node, depth, idx + 1));
  });
}

function firstChild($node) {
  const cx = this; // assume ensureDoc returns the correct node

  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => {
    const vnode = _vnodeFromCx(cx, node);

    let next = node.first();
    return next ? (0, _seq.seq)(vnode(next, node, node.depth + 1, 0)) : (0, _seq.seq)();
  });
}

const _nextOrPrev = (cx, $node, dir) => {
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => {
    const vnode = _vnodeFromCx(cx, node);

    var parent = node.parent;
    const sib = parent && parent[dir > 0 ? "next" : "previous"](node);
    return sib ? (0, _seq.seq)(vnode(sib, parent, node.depth, node.indexInParent + dir)) : (0, _seq.seq)();
  });
};

function nextSibling($node) {
  return _nextOrPrev(this, $node, 1);
}

function previousSibling($node) {
  return _nextOrPrev(this, $node, -1);
}

function getDoc($node) {
  var cx = this;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => {
    do {
      node = node.parent;
    } while (node.parent);

    return (0, _seq.seq)(node);
  });
}

function lastChild($node) {
  var cx = this;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => {
    const last = node.last();
    const vnode = cx.vnode || node.cx.vnode;
    return last ? (0, _seq.seq)(vnode(last, node, node.depth, node.count() - 1)) : (0, _seq.seq)();
  });
}

function parent($node) {
  if (!arguments.length) return Axis(parent);
  var cx = this;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => (0, _seq.seq)(node.parent));
}

function self(f) {
  if (f.name !== "forEach" && f.name !== "filter") f = (0, _seq.forEach)(f);
  return Axis(node => node, f, 3);
}

const isVNode = n => !!n && n.__is_VNode;

exports.isVNode = isVNode;

const _isElement = n => isVNode(n) && n.type == 1;

const _isAttribute = n => isVNode(n) && n.type == 2;

const _isText = n => isVNode(n) && n.type == 3;

const _isList = n => isVNode(n) && n.type == 5;

const _isMap = n => isVNode(n) && n.type == 6;

const _isPI = n => isVNode(n) && n.type == 7;

const _isComment = n => isVNode(n) && n.type == 8;

const _isLiteral = n => isVNode(n) && n.type == 12;

function cxFilter(iterable, f) {
  return (0, _seq.filter)(iterable, function (v, k, i) {
    if (!(0, _seq.isSeq)(v) && !isVNode(v)) v = (0, _seq.seq)(v);
    v.__cx = [k, i];
    return f(v, k, i);
  });
}

const position = n => n.__cx ? n.__cx[0] + 1 : n.indexInParent;

exports.position = position;

const last = n => n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;

exports.last = last;

const _isEq = (a, b) => a === b; // TODO convert qname to integer when parent is array


function _nodeTest(typeTest, qnameOrKey) {
  var f;

  if (qnameOrKey === undefined) {
    f = typeTest;
  } else {
    var hasWildcard = /\*/.test(qnameOrKey);

    if (hasWildcard) {
      var regex = new RegExp(qnameOrKey.replace(/\*/, "(\\w[\\w0-9-_]*)"));

      f = n => {
        let isTuple = n.parent.type == 6;

        if (isTuple || n.name) {
          return typeTest(n) && regex.test(isTuple ? n.key : n.name);
        }

        return typeTest(n);
      };
    } else {
      f = n => {
        let isTuple = n.parent.type == 6;

        if (isTuple || n.name) {
          return _isEq(isTuple ? n.key : n.name, qnameOrKey) && typeTest(n);
        }

        return typeTest(n);
      };

      f.__Accessor = qnameOrKey;
    }
  }

  f.__is_NodeTypeTest = true;
  return f;
}

function element(qname) {
  return _nodeTest(_isElement, qname);
}

function list(keyOrIndex) {
  return _nodeTest(_isList, keyOrIndex);
}

function map() {
  return _nodeTest(_isMap);
}

function processingInstruction() {
  return _nodeTest(_isPI);
}

function comment() {
  return _nodeTest(_isComment);
}

function _attrGet(key, $node) {
  return (0, _seq.switchMap)($node, node => {
    var entries;

    if (key !== null) {
      var val = node.attr(key);
      if (!val) return [];
      entries = [[key, val]];
    } else {
      entries = node.attrEntries();
    }

    return (0, _seq.forEach)(entries, function (kv) {
      return node.vnode(node.pair(kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent);
    });
  });
} // TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq


function attribute($qname) {
  if ((0, _util.isUndef)($qname)) $qname = "*";
  return (0, _seq.switchMap)($qname, qname => {
    var hasWildcard = /\*/.test(qname); // getter of attributes / pre-processor of attributes
    // TODO iterator!
    // filter of attributes

    var f;

    if (hasWildcard) {
      var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)")); //	attrEntries returns tuples

      f = n => _isAttribute(n) && regex.test(n.name); // no direct access


      qname = null;
    } else {
      // name check provided by directAccess
      f = n => _isAttribute(n);
    }

    return Axis(_attrGet.bind(null, qname), (0, _seq.filter)(f), 2);
  });
}

function text() {
  var f = n => _isText(n) && !!n.value;

  f.__is_NodeTypeTest = true;
  return f;
}

function node() {
  var f = n => _isElement(n) || _isText(n) && !!n.value;

  f.__is_NodeTypeTest = true;
  return (0, _seq.seq)(f);
} // TODO create axis functions that return a function
// child(element(qname))
// works like a filter: filter(children(node|nodelist),n => element(qname,n))
// nextSibling(element()): filter(nextSibling(node|nodelist),n => element(undefined,n))
// filterOrGet: when f is called, and null or wildcard match was supplied as its qname parameter, call filter
// else call get
// if it is a seq, apply the function iteratively:
// we don't want to filter all elements from a seq, we want to retrieve all elements from elements in a seq
// final edge case: when node is of type array, and name is not an integer: filter


function Axis(g, f, type) {
  return {
    __is_Axis: true,
    __type: type || 1,
    f: f,
    g: g
  };
}

function child(f) {
  const cx = this;

  if (f.__is_NodeTypeTest) {
    // this means it's a predicate, and the actual function should become a filter
    if (f.__Accessor) {// TODO this means we can try direct access on a node
    }

    f = (0, _seq.filter)(f);
  }

  return Axis(node => children.bind(cx)(node), f);
}

function siblingsOrSelf($node) {
  var cx = this;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)($node), node => children.bind(cx)(node.parent));
}

function select($node, ...paths) {
  var cx = this;

  var boundEnsureDoc = _l3n.ensureDoc.bind(cx);

  return (0, _seq.foldLeft)((0, _seq.forEach)((0, _seq.forEach)(paths, path => _axify(path)), // we're passing $node here, because we want to update it every iteration
  path => $node => {
    // make sure all paths are funcs
    // TODO skip self
    var skipCompare = path.__type == 2 || path.__type == 3;
    var f = path.f; // rebind step function to the context

    var bound = function bound(n) {
      return path.g(boundEnsureDoc(n));
    };

    if (!skipCompare) f = (0, _seq.pipe)(f, (0, _seq.filter)(_comparer()));
    return (0, _seq.switchMap)($node, node => f(bound(node)));
  }), boundEnsureDoc($node), ($node, changeFn) => changeFn($node));
}

function _comparer() {
  // dirty preserve state on function
  var f = function (node) {
    var has = f._checked.has(node);

    if (!has) f._checked.set(node, true);
    return !has;
  };

  f._checked = new WeakMap();
  return f;
}

function _axify($path) {
  return (0, _seq.switchMap)($path, path => {
    if (!path.__is_Axis) {
      // process strings (can this be combined?)
      if (typeof path == "string") {
        var at = /^@/.test(path);
        if (at) path = path.substring(1);
        return at ? attribute(path) : child(element(path));
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

function isEmptyNode(node) {
  node = _l3n.ensureDoc.bind(this)(node);
  if (!isVNode(node)) return false;
  if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
  return !node.count();
}

function name($a) {
  if (!arguments.length) return name;
  return (0, _seq.switchMap)($a, a => {
    if (!isVNode(a)) {
      return (0, _error.error)("XXX", "This is not a node");
    }

    if (a.type != 1) return null;
    return a.name;
  });
}
//# sourceMappingURL=access.js.map