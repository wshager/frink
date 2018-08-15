"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  selectStreaming: true,
  childrenStreaming: true,
  parseString: true,
  parse: true,
  doc: true,
  docL3Streaming: true,
  docStreaming: true,
  collection: true,
  "if": true,
  "false": true,
  "true": true
};
exports.parseString = parseString;
exports.parse = parse;
exports.doc = doc;
exports.docL3Streaming = docL3Streaming;
exports.docStreaming = docStreaming;
exports.collection = collection;
exports.true = exports.false = exports.if = exports.childrenStreaming = exports.selectStreaming = void 0;

var _l3n = require("l3n");

var _seq = require("./seq");

Object.keys(_seq).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _seq[key];
    }
  });
});

var _card = require("./seq/card");

var _parser = require("./parser");

var _parserL3Stream = require("./parser-l3-stream");

var _fs = require("./fs");

var _util = require("./util");

var _accessStreaming = require("./access-streaming");

var _qname = require("./qname");

Object.keys(_qname).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _qname[key];
    }
  });
});

var _modify = require("./modify");

Object.keys(_modify).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _modify[key];
    }
  });
});

var _access = require("./access");

Object.keys(_access).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _access[key];
    }
  });
});

var _subseq = require("./subseq");

Object.keys(_subseq).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _subseq[key];
    }
  });
});

var _type = require("./type");

Object.keys(_type).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _type[key];
    }
  });
});

var _string = require("./string");

Object.keys(_string).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _string[key];
    }
  });
});

var _function = require("./function");

Object.keys(_function).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _function[key];
    }
  });
});

var _op = require("./op");

Object.keys(_op).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _op[key];
    }
  });
});

var _validate = require("./validate");

Object.keys(_validate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _validate[key];
    }
  });
});

const boundSelectStreaming = _accessStreaming.select.bind(_l3n.inode);

exports.selectStreaming = boundSelectStreaming;

const boundChildrenStreaming = _accessStreaming.children.bind(_l3n.inode);

exports.childrenStreaming = boundChildrenStreaming;

if (_util.isNodeEnv && !global.URL) {
  let url = require("url");

  global.URL = url.URL;
}

function parseString(str, cb) {
  var parser = new _parser.Parser(_l3n.inode);
  return parser.parseString(str, cb);
}

function parse($s) {
  return (0, _seq.forEach)((0, _card.zeroOrOne)($s), s => (0, _seq.create)(o => {
    parseString(s, function (err, ret) {
      if (err) return o.error(err);
      o.next(ret);
      o.complete();
    });
  }));
}

function doc($file) {
  return (0, _seq.forEach)((0, _card.zeroOrOne)($file), file => (0, _seq.create)(o => {
    (0, _fs.readFile)(file.toString(), (err, res) => {
      if (err) return o.error(err);
      parse(res.toString()).subscribe({
        next: x => o.next(x),
        error: err => o.error(err),
        complete: () => o.complete()
      });
    });
  }));
}

function docL3Streaming($file) {
  return (0, _seq.forEach)((0, _card.zeroOrOne)($file), file => (0, _parserL3Stream.parse)(file.toString()));
}

function docStreaming($file) {
  // TODO streaming parsing
  return (0, _l3n.toVNodeStream)(docL3Streaming($file), 2);
}

function collection($uri) {
  return (0, _seq.forEach)((0, _card.zeroOrOne)($uri), uri => (0, _seq.create)(o => {
    (0, _fs.readdir)(uri, function (err, res) {
      if (err) return o.error(err);
      res.forEach(file => {
        doc(uri + "/" + file).subscribe({
          next: x => o.next(x),
          error: err => o.error(err)
        });
      });
      o.complete();
    });
  }));
}

const iff = (c, t, f) => (0, _seq.forEach)((0, _seq.boolean)(c), ret => ret ? t.apply() : f.apply());

exports.if = iff;

const _f = () => false;

exports.false = _f;

const _t = () => true;

exports.true = _t;
//# sourceMappingURL=index.js.map