import * as sax from 'sax';

import { EventEmitter } from 'events';

import { Value, emptyINode, emptyAttrMap } from './pvnode';

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
		var doc = emptyINode(9,"#document",emptyAttrMap()), depth = 0;
		var last = doc, parents = [];
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
			//depth++;
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
			let attrMap = emptyAttrMap();
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
				attrMap = attrMap.set(attr.name,attr.value);
			}
			let n = emptyINode(nodeType,nodeName,attrMap.endMutation(true));
			if(last) {
				last = last.push([nodeName,n]);
				parents.push(last);
			}
			last = n;
		}).bind(this);
		saxParser.onclosetag = function() {
			//depth--;
			// here we can be sure that mutation has stopped
			// BUT the problem is now that last children's parents are still mutable
			// that's why we retain properties, because we won't be mutating until parsing is done
			last = last.endMutation(true);
			last = parents.pop();
		};
		saxParser.onend = (function() {
			saxParser.ended = true;
			let doc = last.endMutation(true);
			doc._attrs = last._attrs.endMutation(true);
			return this.emit("end", doc);
		}).bind(this);
		var ontext = function(value, type=3) {
			if (/\S/.test(value)) {
				let name = last.count() + 1;
				let n = new Value(type,name,value);
				last = last.push([name,n]);
			}
		};
		saxParser.ontext = ontext;
		saxParser.oncdata = function(value) {
			ontext(value, 4);
		};
		saxParser.ondoctype = function(value){
			last._attrs = last._attrs.set("DOCTYPE",value);
		};
		saxParser.onprocessinginstruction = function(pi) {
			last._attrs = last._attrs.set(pi.name,pi.body);
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
