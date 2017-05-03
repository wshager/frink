"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.validate = exports.select = exports.lastChild = exports.firstChild = exports.d = exports.ensureDoc = undefined;

var _transducers = require("./transducers");

Object.keys(_transducers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _transducers[key];
    }
  });
});

var _domUtil = require("./dom-util");

Object.keys(_domUtil).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _domUtil[key];
    }
  });
});

var _iform = require("./iform");

var inode = _interopRequireWildcard(_iform);

var _doc = require("./doc");

var dc = _interopRequireWildcard(_doc);

var _access = require("./access");

var ac = _interopRequireWildcard(_access);

var _validate = require("./validate");

var va = _interopRequireWildcard(_validate);

var _formUtil = require("./form-util");

var fu = _interopRequireWildcard(_formUtil);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const ensureDoc = exports.ensureDoc = dc.ensureDoc.bind(inode);

const d = exports.d = dc.d.bind(inode);

const firstChild = exports.firstChild = ac.firstChild.bind(inode);

const lastChild = exports.lastChild = ac.lastChild.bind(inode);

const select = exports.select = ac.select.bind(inode);

const validate = exports.validate = va.validate.bind(inode);

const process = exports.process = fu.process.bind(inode);