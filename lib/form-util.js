"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.process = process;

var _seq = require("./seq");

var _access = require("./access");

// iter form and replace fieldset types
function process($node) {
	$node = (0, _seq.exactlyOne)($node);
	_access.vdoc.bind(this)($node).forEach(function (node) {
		if (node.type == 6) {
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
	return $node;
}