'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.stripBOM = stripBOM;
function stripBOM(str) {
	if (str[0] === '\uFEFF') {
		return str.substring(1);
	} else {
		return str;
	}
}