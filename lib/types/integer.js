"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Integer = void 0;

var _big = _interopRequireDefault(require("big.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Integer extends _big.default {
  constructor(a) {
    super(~~a);
    this.constructor = Integer;
  }

}

exports.Integer = Integer;
var _default = Integer;
exports.default = _default;
//# sourceMappingURL=integer.js.map