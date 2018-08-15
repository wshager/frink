"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readdir = exports.readFile = void 0;

var _util = require("./util");

const readFile = (...args) => {
  const l = args.length;
  const source = args[0];
  const cb = l == 2 ? args[1] : args[2];
  let options = l == 2 ? "utf-8" : args[1];
  if (typeof options == "string") options = {
    encoding: options
  };

  if (_util.isNodeEnv) {
    require("fs").readFile(source, options, cb);
  } else {
    var reader = new FileReader();

    reader.onloadend = evt => {
      // file is loaded
      cb(null, evt.target.result);
    };

    reader.onerror = err => {
      cb(err);
    };

    reader.readAsText(source, options.encoding);
  }
};

exports.readFile = readFile;

const readdir = (...args) => _util.isNodeEnv ? require("fs").readdir.apply(void 0, args) : () => {};

exports.readdir = readdir;
//# sourceMappingURL=fs.js.map