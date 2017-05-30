"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.validate = validate;
exports.validation = validation;

var _doc = require("./doc");

var _access = require("./access");

var _transducers = require("./transducers");

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(obj, prop) {
	if (obj.hasOwnProperty(prop)) return obj[prop];
}

function _formAttrNameToKey(k) {
	if (k == "data-type") return "type";
	if (k == "type") return "format";
	if (k == "min") return "minimum";
	if (k == "max") return "maximum";
	if (k == "maxlength") return "maxLength";
	return k;
}

function _formNodeToSchema(node) {
	var inode = node.inode;
	var attrs = inode.attributes;
	var s = {};
	for (let a of attrs) {
		let k = _formAttrNameToKey(a.name);
		if (validator[k]) {
			s[k] = a.value;
		}
	}
	if (inode.type == "select-one") {
		s.enum = _transducers.into(inode.options, _transducers.forEach(o => o.value), []);
	}
	return s;
}

/**
 * Validate a doc against a schema
 * @param  {INode|VNode} doc    The doc or VNode to validate
 * @param  {any} schema A JSON schema with XML extension
 * @return {VNode}        A document containing errors
 */
function validate(node, schema, params = {}) {
	node = node.inode ? node : _doc.ensureDoc.bind(this)(node);
	var depth = node.depth,
	    entries = [],
	    err = [],
	    index = "#",
	    path = "";
	if (params.form) {
		index = node.name;
		path = node.parent.name;
		schema = _formNodeToSchema(node);
	}
	var entry = validation(schema, params, index, path, err);
	entry[0].call(null, node);
	//var errCount = [err.length];
	while (node) {
		node = _access.nextNode(node);
		if (!node) return err;
		if (params.form) {
			if (node.type == 17) continue;
			entry = validation(_formNodeToSchema(node), params, node.name, path, err);
			if (entry) entry[0].call(null, node);
		} else {
			if (node.type == 17) {
				depth--;
				entry = entries[depth];
			} else if (node.depth == depth + 1) {
				entries[depth] = entry;
				depth++;
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1](node);
				if (entry) entry[0].call(null, node);
			} else if (node.depth == depth) {
				entry = entries[depth - 1];
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1].call(null, node);
				if (entry) entry[0].call(null, node);
			}
		}
	}
	return err;
}

function compose(funcs) {
	var len = funcs.length;
	return node => {
		var entries = [[], []];
		for (var i = 0; i < len; i++) {
			if (!funcs[i]) continue;
			let ret = funcs[i].call(null, node);
			if (ret && ret.length) {
				entries[0].push(ret[0]);
				entries[1].push(ret[1]);
			}
		}
		return [compose(entries[0]), compose(entries[1])];
	};
}

function validation(schema, params, index, path, err) {
	var sc = schema.constructor;
	var entry;
	if (sc === Object) {
		var keys = Object.keys(schema);
		let funcs = [];
		// TODO compose a function that will contain all rules for a level
		for (let k of keys) {
			if (!/properties|patternProperties|items/.test(k)) {
				if (!validator[k]) {
					console.log("Unsupported " + k);
					continue;
				}
				funcs.push(validator[k].bind(null, schema, k, params, index, path, err));
			}
		}
		// TODO what if there are more?
		var childFuncs = [];
		for (let k of ["properties", "patternProperties", "items"]) {
			let childSchema = get(schema, k);
			if (childSchema) childFuncs.push(validator[k].bind(null, schema, k, params, index, path, err));
		}
		entry = [compose(funcs), compose(childFuncs)];
	} else if (sc === Array) {
		// an array of schemas to validate against, meaning at least one of the must match
		let funcs = [];
		let childFuncs = [];
		for (let i = 0, len = schema.length; i < len; i++) {
			let entry = validation(schema[i], params, index, path, err);
			funcs.push(entry[0]);
			childFuncs.push(entry[1]);
		}
		entry = [compose(funcs), compose(childFuncs)];
	} else if (sc === String) {
		entry = [validator.type.bind(null, { type: schema }, "type", params, index, path, err)];
	}
	return entry;
}

function X(schema, key, path, validationMessage, faults) {
	this.schema = schema;
	this.key = key;
	this.path = path;
	this.validationMessage = validationMessage;
	this.faults = faults;
}

function x(schema, key, params, path, node, faults) {
	var validationMessage = params.form ? node.attr("validationMessage") : "";
	return new X(schema, key, path, validationMessage, faults);
}

// TODO types are functions, so allow adding custom functions
// TODO use XVType, coersion
const types = {
	null: function (node) {
		return node.type == 12 && node.value === null;
	},
	string: function (node) {
		return node.type == 3;
	},
	number: function (node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	double: function (node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	boolean: function (node) {
		return node.type == 12 && typeof node.value == "boolean";
	},
	integer: function (node) {
		var val = node.value;
		if (val === null || val === undefined) return false;
		var cc = val.constructor;
		try {
			if (val.constructor != _big2.default) val = new _big2.default(val);
		} catch(err){
			console.log(val,err);
		}
		return node.type == 3 && val.constructor == _big2.default && val.e === 0;
	},
	element: function (node) {
		return node.type == 1;
	},
	array: function (node) {
		return node.type == 5;
	},
	object: function (node) {
		return node.type == 6;
	},
	map: function (node) {
		return node.type == 6;
	}
};

const patternMatcher = function (patterns, key) {
	for (var k in patterns) {
		if (patterns[k].test(key)) return true;
	}
	return false;
};

var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;
var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
// uri-template: https://tools.ietf.org/html/rfc6570
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[a-f0-9]{2})|\{[+#.\/;?&=,!@|]?(?:[a-z0-9_]|%[a-f0-9]{2})+(?:\:[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[a-f0-9]{2})+(?:\:[1-9][0-9]{0,3}|\*)?)*\})*$/i;
// For the source: https://gist.github.com/dperini/729294
// For test cases: https://mathiasbynens.be/demo/url-regex
// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
var UUID = /^(?:urn\:uuid\:)?[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~\/]|~0|~1)*)*$|^\#(?:\/(?:[a-z0-9_\-\.!$&'()*+,;:=@]|%[a-f0-9]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:\#|(?:\/(?:[^~\/]|~0|~1)*)*)$/;

const formats = {
	// date: http://tools.ietf.org/html/rfc3339#section-5.6
	date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
	// date-time: http://tools.ietf.org/html/rfc3339#section-5.6
	time: /^[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i,
	'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
	// uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
	uri: /^(?:[a-z][a-z0-9+-.]*)(?:\:|\/)\/?[^\s]*$/i,
	'uri-reference': /^(?:(?:[a-z][a-z0-9+-.]*:)?\/\/)?[^\s]*$/i,
	'uri-template': URITEMPLATE,
	url: URL,
	// email (sources from jsen validator):
	// http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
	// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
	email: /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
	hostname: HOSTNAME,
	// optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
	// optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	ipv6: /^\s*(?:(?:(?:[a-f0-9]{1,4}:){7}(?:[a-f0-9]{1,4}|:))|(?:(?:[a-f0-9]{1,4}:){6}(?::[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){5}(?:(?:(?::[a-f0-9]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){4}(?:(?:(?::[a-f0-9]{1,4}){1,3})|(?:(?::[a-f0-9]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){3}(?:(?:(?::[a-f0-9]{1,4}){1,4})|(?:(?::[a-f0-9]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){2}(?:(?:(?::[a-f0-9]{1,4}){1,5})|(?:(?::[a-f0-9]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){1}(?:(?:(?::[a-f0-9]{1,4}){1,6})|(?:(?::[a-f0-9]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[a-f0-9]{1,4}){1,7})|(?:(?::[a-f0-9]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
	regex: regex,
	// uuid: http://tools.ietf.org/html/rfc4122
	uuid: UUID,
	// JSON-pointer: https://tools.ietf.org/html/rfc6901
	// uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
	'json-pointer': JSON_POINTER,
	// relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
	'relative-json-pointer': RELATIVE_JSON_POINTER
};

const Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
	if (Z_ANCHOR.test(str)) return false;
	try {
		new RegExp(str);
		return true;
	} catch (e) {
		return false;
	}
}

const validator = {
	value: function (schema, key, params, index, path, err, node) {
		if (params.form) {
			if (!node.inode.checkValidity()) {
				err.push(x(schema, key, params, path + "/" + index, node));
			}
		}
	},
	type: function (schema, key, params, index, path, err, node) {
		var type = schema[key];
		var ret;
		if (type instanceof Array) {
			ret = _transducers.foldLeft(_transducers.forEach(type, t => {
				return types[t](node)
			}), false, (r, z) => r || z);
		} else {
			ret = types[type](node);
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	format: function (schema, key, params, index, path, err, node) {
		var name = schema[key];
		var format = params.formats ? params.formats[name] : formats[name];
		if (!format) {
			console.log("Unknown format " + name);
		} else {
			let fn = typeof format == "function" ? format : v => !!v.match(format);
			if (!fn(node.value)) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	required: function (schema, key, params, index, path, err, node) {
		// for forms:
		if (params.form) {
			if (!node.value) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	properties: function (schema, key, params, index, path, err, node) {
		// default is allErrors=true, so all children should be validated
		// this function will be passed to the children matching key + schema
		// when applied, the function uses the matching prop and updated path
		var props = schema[key];
		schema = get(props, node.name);
		if (schema) return validation(schema, params, node.name, path + "/" + index, err);
	},
	patternProperties: function (schema, key, params, index, path, err, node) {
		var pattProps = get(schema, key);
		var pattern;
		var patterns;
		if (pattProps) {
			patterns = get(schema, "patternPropertiesREGEXP");
			if (!patterns) {
				patterns = {};
				for (let k in pattProps) {
					patterns[k] = new RegExp(k);
				}
				schema.patternPropertiesREGEXP = patterns;
			}
		}
		const patternMatcher = function (key) {
			var ret = [];
			for (var k in patterns) {
				if (patterns[k].test(key)) ret.push(pattProps[k]);
			}
			return ret;
		};
		let newpath = path + "/" + index;
		var schemas = patternMatcher(node.name);
		if (schemas.length) return validation(schemas, params, node.name, newpath, err);
	},
	additionalProperties: function (schema, key, params, index, path, err, node) {
		var additionalProps = get(schema, key);
		if (additionalProps === false) {
			var props = get(schema, "properties");
			var pattProps = get(schema, "patternProperties");
			var patterns;
			if (pattProps) {
				patterns = get(schema, "patternPropertiesREGEXP");
				if (!patterns) {
					patterns = {};
					for (let k in pattProps) {
						patterns[k] = new RegExp(k);
					}
					schema.patternPropertiesREGEXP = patterns;
				}
			}
			const patternMatcher = function (key) {
				for (var k in patterns) {
					if (patterns[k].test(key)) return true;
				}
				return false;
			};
			var faults = [];
			let newpath = path + "/" + index;
			let keys = node.keys();
			var len = node.count();
			for (let k of keys) {
				if (props[k] || patternMatcher(k)) {
					len--;
				} else {
					faults.push(k);
				}
			}
			if (len > 0) err.push(x(schema, key, params, newpath, node, faults));
		}
	},
	items: function (schema, key, params, index, path, err, node) {
		var schemas = schema[key];
		let newpath = path + "/" + index;
		schema = schemas[node.indexInParent];
		if (schema) return validation(schema, params, node.name, newpath, err);
	},
	additionalItems: function (schema, key, params, index, path, err, node) {
		var additionalItems = schema[key];
		var items = schema.items;
		if (items.length !== node.count()) err.push(x(schema, key, params, path + "/" + index, node));
	},
	minimum: function (schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.gte(test);
		} else {
			ret = node.value >= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maximum: function (schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.lte(test);
		} else {
			ret = node.value <= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maxLength: function (schema, key, params, index, path, err, node) {
		var test = schema[key];
		if (!node.value) return;
		if (node.value.length >= test) err.push(x(schema, key, params, path + "/" + index, node));
	}
};
