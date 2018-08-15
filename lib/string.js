"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _codepoint = require("./string/codepoint");

Object.keys(_codepoint).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _codepoint[key];
    }
  });
});

var _value = require("./string/value");

Object.keys(_value).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _value[key];
    }
  });
});

var _substringMatch = require("./string/substring-match");

Object.keys(_substringMatch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _substringMatch[key];
    }
  });
});

var _regex = require("./string/regex");

Object.keys(_regex).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _regex[key];
    }
  });
});
//# sourceMappingURL=string.js.map