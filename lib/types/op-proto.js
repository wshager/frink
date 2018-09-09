"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.opProto = void 0;
const opProto = {
  plus(other) {
    return this + other;
  },

  minus(other) {
    return this - other;
  },

  times(other) {
    return this * other;
  },

  div(other) {
    return this / other;
  },

  neg() {
    return -this;
  }

};
exports.opProto = opProto;
var _default = opProto;
exports.default = _default;
//# sourceMappingURL=op-proto.js.map