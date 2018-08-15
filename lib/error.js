"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.error = error;

var _rxjs = require("rxjs");

var codes = _interopRequireWildcard(require("../errors.json"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function error(qname, message) {
  // TODO handle QName
  var code = typeof qname == "string" ? qname.replace(/^[^:]*:/, "") : qname; //.getLocalPart();

  if (!message) message = codes[code];
  var err = new Error(message); //console.trace();

  err.name = code;
  return (0, _rxjs.throwError)(err);
}
//# sourceMappingURL=error.js.map