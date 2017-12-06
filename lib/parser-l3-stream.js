"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.parse = parse;

var _sax = require("sax");

var sax = _interopRequireWildcard(_sax);

var _seq = require("./seq");

var _bom = require("./bom");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var hasProp = {}.hasOwnProperty;

function parse(str) {

	var saxParser = sax.parser(true, {
		trim: false,
		normalize: false,
		xmlns: true,
		position: false
	});
	var parents = [];
	return (0, _seq.create)(function (o) {
		saxParser.onerror = function (error) {
			o.error(error);
		};
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
				nodeName = node.name;
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
			var last = parents[parents.length-1];
			parents.push(nodeType);

			if (last == 6) {
				// emit the element as tuple when its parent is marked as map
				// use the nodeName as key
				o.next(2);
				o.next(nodeName);
			} else {
				// don't emit the name when the parent is an array
				// the nodes are usually named json:value
				if (nodeType == 1) {
					if (nodeName != "json:value") {
						o.next(nodeType);
						o.next(nodeName);
						for (var k in attrs) {
							o.next(2);
							o.next(k);
							o.next(3);
							o.next(attrs[k]);
						}
					}
				} else {
					o.next(nodeType);
				}
			}
		};
		saxParser.onclosetag = function () {
			parents.pop();
			const last = parents[parents.length - 1];
			if(last != 6) {
				o.next(17);
			}
		};
		saxParser.onend = function () {
			o.complete();
		};
		var ontext = function ontext(val) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3;

			if (/\S/.test(val)) {
				o.next(type);
				o.next(val);
			}
		};
		saxParser.ontext = ontext;
		saxParser.oncdata = function (value) {
			// TODO handle CDATA text?
			ontext(value, 3);
		};
		saxParser.ondoctype = function (value) {
			ontext(value, 16);
		};
		saxParser.onprocessinginstruction = function (pi) {
			ontext(pi.name + " " + pi.body, 7);
		};
		saxParser.oncomment = function (value) {
			ontext(value, 8);
		};
		try {
			str = str.toString();
			if (str.trim() === "") {
				return true;
			}
			str = (0, _bom.stripBOM)(str);
			if (saxParser.closed) {
				saxParser.onready = function () {
					saxParser.onready = null;
					saxParser.write(str).close();
				};
			} else {
				saxParser.write(str).close();
			}
		} catch (err) {
			o.error(err);
		}
	});
}
