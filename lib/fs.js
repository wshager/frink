"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.readdir = exports.readFile = undefined;

var _util = require("./util");

var readFile = exports.readFile = function readFile() {
	var l = arguments.length;
	var source = arguments.length <= 0 ? undefined : arguments[0];
	var cb = l == 2 ? arguments.length <= 1 ? undefined : arguments[1] : arguments.length <= 2 ? undefined : arguments[2];
	var options = l == 2 ? "utf-8" : arguments.length <= 1 ? undefined : arguments[1];
	if (typeof options == "string") options = { encoding: options };
	if (_util.isNodeEnv) {
		require("fs").readFile(source, options, cb);
	} else {
		var reader = new FileReader();
		reader.onloadend = function (evt) {
			// file is loaded
			cb(null, evt.target.result);
		};
		reader.onerror = function (err) {
			cb(err);
		};
		reader.readAsText(source, options.encoding);
	}
};

var readdir = exports.readdir = function readdir() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return _util.isNodeEnv ? require("fs").readdir.apply(undefined, args) : function () {};
};