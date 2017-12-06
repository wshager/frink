import * as sax from "sax";

import { create, zeroOrOne } from "./seq";

import { stripBOM } from "./bom";

const hasProp = {}.hasOwnProperty;

export function parse($str) {
	const saxParser = sax.parser(true, {
		trim: false,
		normalize: false,
		xmlns: true,
		position: false
	});
	const parents = [];
	return create(o => {
		saxParser.onerror = (function(error) {
			o.error(error);
		});
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
			parents.push(nodeType);
			const last = parents[parent.length];
			if(last == 6) {
				// emit the element as tuple when its parent is marked as map
				// use the nodeName as key
				o.next(2);
				o.next(nodeName);
			} else {
				// don't emit the name when the parent is an array
				// the nodes are usually named json:value
				if(nodeType == 1) {
					if(nodeName != "json:value") {
						o.next(nodeType);
						o.next(nodeName);
						for(let k in attrs) {
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
		});
		saxParser.onclosetag = function() {
			parents.pop();
			o.next(17);
		};
		saxParser.onend = (function() {
			o.complete();
		});
		var ontext = function(val, type=3) {
			if (/\S/.test(val)) {
				o.next(type);
				o.next(val);
			}
		};
		saxParser.ontext = ontext;
		saxParser.oncdata = function(value) {
			// TODO handle CDATA text?
			ontext(value, 3);
		};
		saxParser.ondoctype = function(value){
			ontext(value,16);
		};
		saxParser.onprocessinginstruction = function(pi) {
			ontext(pi.name+" "+pi.body, 7);
		};
		saxParser.oncomment = function(value) {
			ontext(value, 8);
		};
		$str = zeroOrOne($str).concatMap(str => {
			try {
				str = str.toString();
				if (str.trim() === "") {
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
					saxParser.write(str).close();
				}
			} catch (err) {
				o.error(err);
			}
		});
	});
}
