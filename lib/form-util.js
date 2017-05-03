"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.process = process;

var _access = require("./access");

// iter form and replace fieldset types
function process(node) {
	_access.iter.bind(this)(node, function (node) {
		if (node.type == 6) {
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
}