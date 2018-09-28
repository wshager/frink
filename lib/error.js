"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.error = error;

var _rxjs = require("rxjs");

var _errorCodes = require("./error-codes.js");

function error(qname, message) {
  // TODO handle QName
  var code = typeof qname == "string" ? qname.replace(/^[^:]*:/, "") : qname; //.getLocalPart();

  if (!message) message = _errorCodes.codes[code];
  var err = new Error(message || "Unknown error"); //console.trace();

  err.name = code;
  return (0, _rxjs.throwError)(err);
}
//# sourceMappingURL=error.js.map