"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.compProto = void 0;
const compProto = {
  eq(other) {
    return this.valueOf() === other.valueOf();
  },

  gt(other) {
    return this.valueOf() > other.valueOf();
  },

  lt(other) {
    return this.valueOf() < other.valueOf();
  },

  gte(other) {
    return this.valueOf() >= other.valueOf();
  },

  lte(other) {
    return this.valueOf() <= other.valueOf();
  }

};
exports.compProto = compProto;
var _default = compProto;
exports.default = _default;
//# sourceMappingURL=comp-proto.js.map