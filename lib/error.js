"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.error = error;

var _Observable = require("rxjs/Observable");

require("rxjs/add/observable/throw");

var _errors = require("../errors.json");

var codes = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function error(qname, message) {
	// TODO handle QName

	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/, "") : qname; //.getLocalPart();
	if (!message) message = codes[code];
	console.log(message)
	//console.trace()
	throw new Error(message);

}
