"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appendChild = appendChild;
exports.insertChildBefore = insertChildBefore;
exports.removeChild = removeChild;

var _seq = require("./seq");

var _l3n = require("l3n");

var _access = require("./access");

var _error = require("./error");

const _isDocOrFrag = node => node.type == 9 || node.type == 11;

function _ascend(node, cx) {
  var child;

  while (node.parent) {
    child = node;
    node = node.parent;
    node = node.set(child.name, child.inode);
  } // this ensures immutability


  return _isDocOrFrag(node) ? _access.firstChild.bind(cx)(node) : node;
}

function appendChild(node, child) {
  const cx = this && "vnode" in this ? this : _l3n.inode;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)(node), function (node) {
    //if(!node || !node.size) return;
    if (_isDocOrFrag(node) && node.count() > 0) {
      return (0, _error.error)("XXX", "Document can only contain one child.");
    }

    return (0, _seq.pipe)((0, _seq.switchMap)(function (child) {
      return typeof child.inode === "function" ? child.inode(node) : (0, _seq.seq)(child);
    }), (0, _seq.foldLeft)(function (node, child) {
      return node.modify(child);
    }, node))(child); //.map(node =>
    //	(0, _seq.seq)(_ascend(node, cx))
    //);
  });
}

function insertChildBefore(node, ins) {
  const cx = this && "vnode" in this ? this : _l3n.inode;
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(cx)(node), function (node) {
    //if(!node || !node.size) return;
    let parent = node.parent;

    if (typeof ins.inode == "function") {
      ins.inode(parent, node);
    } else {// what?
    }

    node = parent;
    return _ascend(node, cx);
  });
}

function removeChild(node, child) {
  return (0, _seq.switchMap)(_l3n.ensureDoc.bind(this)(node), node => {
    //if(!node || !node.size || !child) return;
    // TODO error
    if (child.parent.inode !== node.inode) return;
    node = node.removeChild(child);
    return _ascend(node, this);
  });
}
//# sourceMappingURL=modify.js.map