import * as sax from 'sax';

import { EventEmitter } from 'events';

import { emptyINode, emptyAttrMap, ivalue, push, finalize, setAttribute, count } from './persist';

import { stripBOM } from "./bom";

const hasProp = {}.hasOwnProperty;

const saxParser = sax.parser(true, {
	trim: false,
	normalize: false,
	xmlns: true
});

export class Parser extends EventEmitter {
	constructor() {
		super();
		this.reset();
	}
	reset() {
		var last = emptyINode(9,"#document",emptyAttrMap());
		var parents = [];
		this.removeAllListeners();
		saxParser.errThrown = false;
		saxParser.onerror = (function(error) {
			saxParser.resume();
			if (!saxParser.errThrown) {
				saxParser.errThrown = true;
				return this.emit("error", error);
			}
		}).bind(this);
		saxParser.ended = false;
		saxParser.onopentag = (function(node) {
			var nodeName = node.name,
				nodeType = 1;
			var key, ref = node.attributes;
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
			let n = emptyINode(nodeType,nodeName,emptyAttrMap(attrs));
			if(last) {
				last = push(last,[nodeName,n]);
				parents.push(last);
			}
			last = n;
		}).bind(this);
		saxParser.onclosetag = function() {
			// here we can be sure that mutation has stopped
			// BUT the problem is now that last children's parents are still mutable
			// that's why we retain properties, because we won't be mutating until parsing is done
			last = finalize(last);
			last = parents.pop();
		};
		saxParser.onend = (function() {
			saxParser.ended = true;
			return this.emit("end", finalize(last));
		}).bind(this);
		var ontext = function(val, type=3) {
			if (/\S/.test(val)) {
				let name = count(last) + 1;
				let n = ivalue(type,name,val);
				last = push(last,[name,n]);
			}
		};
		saxParser.ontext = ontext;
		saxParser.oncdata = function(value) {
			ontext(value, 4);
		};
		saxParser.ondoctype = function(value){
			last = setAttribute(last,"DOCTYPE",value);
		};
		saxParser.onprocessinginstruction = function(pi) {
			last = setAttribute(last,pi.name,pi.body);
		};
		saxParser.oncomment = function(value) {
			ontext(value, 8);
		};
	}
	parseString(str, cb) {
		if ((cb !== null) && typeof cb === "function") {
			this.on("end", function(result) {
				this.reset();
				return cb(null, result);
			});
			this.on("error", function(err) {
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
			str = stripBOM(str);
			if(saxParser.closed) {
				saxParser.onready = function(){
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


/*
function _inherits(subClass, superClass) {
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
	});
	Object.setPrototypeOf(subClass, superClass);
}

_inherits(INode,OrderedMap);
 */

 /*
 function repeat(str,t) {
 	let out = "";
 	for(i = 0;i<t;i++) out += str;
 	return out;
 }
 */
