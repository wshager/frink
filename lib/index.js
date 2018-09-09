"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  selectStreaming: true,
  childrenStreaming: true,
  "if": true,
  "false": true,
  "true": true,
  boolean: true,
  not: true
};
Object.defineProperty(exports, "boolean", {
  enumerable: true,
  get: function () {
    return _value.boolean;
  }
});
Object.defineProperty(exports, "not", {
  enumerable: true,
  get: function () {
    return _value.not;
  }
});
exports.true = exports.false = exports.if = exports.childrenStreaming = exports.selectStreaming = void 0;

var _l3n = require("l3n");

var _seq = require("./seq");

Object.keys(_seq).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _seq[key];
    }
  });
});

var _value = require("./boolean/value");

var _util = require("./util");

var _accessStreaming = require("./access-streaming");

var _qname = require("./qname");

Object.keys(_qname).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _qname[key];
    }
  });
});

var _access = require("./access");

Object.keys(_access).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _access[key];
    }
  });
});

var _op = require("./seq/op");

Object.keys(_op).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _op[key];
    }
  });
});

var _card = require("./seq/card");

Object.keys(_card).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _card[key];
    }
  });
});

var _value2 = require("./seq/value");

Object.keys(_value2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _value2[key];
    }
  });
});

var _aggregate = require("./seq/aggregate");

Object.keys(_aggregate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _aggregate[key];
    }
  });
});

var _type = require("./type");

Object.keys(_type).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _type[key];
    }
  });
});

var _typed = require("./typed");

Object.keys(_typed).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _typed[key];
    }
  });
});

var _string = require("./string");

Object.keys(_string).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _string[key];
    }
  });
});

var _function = require("./function");

Object.keys(_function).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _function[key];
    }
  });
});

var _op2 = require("./op");

Object.keys(_op2).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _op2[key];
    }
  });
});

const boundSelectStreaming = _accessStreaming.select.bind(_l3n.inode);

exports.selectStreaming = boundSelectStreaming;

const boundChildrenStreaming = _accessStreaming.children.bind(_l3n.inode);

exports.childrenStreaming = boundChildrenStreaming;

if (_util.isNodeEnv && !global.URL) {
  let url = require("url");

  global.URL = url.URL;
}

const iff = (c, t, f) => (0, _seq.forEach)((0, _value.boolean)(c), ret => ret ? t.apply() : f.apply());

exports.if = iff;

const _f = () => false;

exports.false = _f;

const _t = () => true;

exports.true = _t;
//# sourceMappingURL=index.js.map