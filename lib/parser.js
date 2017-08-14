'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Parser = undefined;

var _sax = require('sax');

var sax = _interopRequireWildcard(_sax);

var _events = require('events');

var _inode = require('./inode');

var inode = _interopRequireWildcard(_inode);

var _bom = require('./bom');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const hasProp = {}.hasOwnProperty;

const saxParser = sax.parser(true, {
	trim: false,
	normalize: false,
	xmlns: true
});

class Parser extends _events.EventEmitter {
	constructor(cx) {
		super();
		this.cx = cx || inode;
		this.reset();
	}
	reset() {
		var cx = this.cx;
		var last = cx.emptyINode(9, "#document", cx.emptyAttrMap());
		var parents = [];
		this.removeAllListeners();
		saxParser.errThrown = false;
		saxParser.onerror = function (error) {
			saxParser.resume();
			if (!saxParser.errThrown) {
				saxParser.errThrown = true;
				return this.emit("error", error);
			}
		}.bind(this);
		saxParser.ended = false;
		saxParser.onopentag = function (node) {
			var nodeName = node.name,
			    nodeType = 1;
			var key,
			    ref = node.attributes;
			// FIXME xmlns attributes are stored!
			if (node.uri) {
				// TODO abuse types deprecated by DOM4
				if (/json\.org/.test(node.uri)) {
					if (node.local == "array") {
						nodeType = 5;
					} else if (node.local == "map") {
						nodeType = 6;
					} else if (node.local == "literal") {
						nodeType = 12;
					}
				}
				//nodeName = qname(node.uri, node.name);
			}
			var attrs = {};
			for (key in ref) {
				if (!hasProp.call(ref, key)) continue;
				var attr = node.attributes[key];
				if (/json\.org/.test(attr.uri) && attr.local == "type") {
					//var last = nodes.size-1;
					if (attr.value == "array") {
						nodeType = 5;
					} else if (attr.value == "map") {
						nodeType = 6;
					} else if (attr.value == "literal") {
						nodeType = 12;
					}
				}
				//ret = ret.concat(attribute(attr.uri ? qname(attr.uri, attr.name) : attr.name, attr.value));
				attrs[attr.name] = attr.value;
			}
			let n = cx.emptyINode(nodeType, nodeName, cx.emptyAttrMap(attrs));
			if (last) {
				last = cx.push(last, [nodeName, n]);
				parents.push(last);
			}
			last = n;
		}.bind(this);
		saxParser.onclosetag = function () {
			// here we can be sure that mutation has stopped
			// BUT the problem is now that last children's parents are still mutable
			// that's why we retain properties, because we won't be mutating until parsing is done
			last = cx.finalize(last);
			last = parents.pop();
		};
		saxParser.onend = function () {
			saxParser.ended = true;
			return this.emit("end", cx.finalize(last));
		}.bind(this);
		var ontext = function (val, type = 3) {
			if (/\S/.test(val)) {
				let name = cx.count(last) + 1;
				let n = cx.ivalue(type, name, val);
				last = cx.push(last, [name, n]);
			}
		};
		saxParser.ontext = ontext;
		saxParser.oncdata = function (value) {
			// TODO handle CDATA text
			ontext(value, 3);
		};
		saxParser.ondoctype = function (value) {
			last = cx.setAttribute(last, "DOCTYPE", value);
		};
		saxParser.onprocessinginstruction = function (pi) {
			last = cx.setAttribute(last, pi.name, pi.body);
		};
		saxParser.oncomment = function (value) {
			ontext(value, 8);
		};
	}
	parseString(str, cb) {
		if (cb !== null && typeof cb === "function") {
			this.on("end", function (result) {
				this.reset();
				return cb(null, result);
			});
			this.on("error", function (err) {
				this.reset();
				return cb(err);
			});
		}
		try {
			str = str.toString();
			if (str.trim() === '') {
				this.emit("end", null);
				return true;
			}
			str = _bom.stripBOM(str);
			if (saxParser.closed) {
				saxParser.onready = function () {
					saxParser.onready = null;
					saxParser.write(str).close();
				};
			} else {
				return saxParser.write(str).close();
			}
		} catch (err) {
			if (!(saxParser.errThrown || saxParser.ended)) {
				this.emit('error', err);
				saxParser.errThrown = true;
				return true;
			} else if (saxParser.ended) {
				throw err;
			}
		}
	}
}
exports.Parser = Parser;
