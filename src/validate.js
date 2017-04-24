import { iter, nextNode, firstChild } from "./access";
import * as Big from "big.js";

function get(obj, prop) {
	if (obj.hasOwnProperty(prop)) return obj[prop];
}

function ValidationIterator(node,f, cf){
	this.node = node;
	this.f = f;
	this.cf = cf;
}

ValidationIterator.prototype.next = function () {
	var node = nextNode(this.node);
	if (!node) return DONE;
	var depth = node.depth;
	if(next.depth === depth + 1){
		this.f = this.cf;
		var entry = this.f.call(null, next);
		entry[0].call(null, next);
	} else if(next.depth === depth){
		this.f.call(null, node);

	}
	return { value: this.f(node) };
};

ValidationIterator.prototype[Symbol.iterator] = function () {
	return this;
};

/**
 * Validate a doc against a schema
 * @param  {INode|VNode} doc    The doc or VNode to validate
 * @param  {any} schema A JSON schema with XML extension
 * @return {VNode}        A document containing errors
 */
export function validate(node, schema, params = {}) {
	node = node.inode ? node : firstChild(node);
	var depth = node.depth;
	var entries = [];
	var err = [];
	var entry = _validate(schema, params, "#", "", err);
	entry[0].call(null, node);
	//var errCount = [err.length];
	while (node) {
		node = nextNode(node);
		if(!node) return err;
		if(node.type == 17){
			depth--;
			//errCount[depth] = 0;
			entry = entries[depth];
		} else if (node.depth == depth + 1) {
			entries[depth] = entry;
			depth++;
			if(!entry[1]) {
				//console.log("skipping",node.name);
				continue;
			}
			entry = entry[1](node);
			if(entry) entry[0].call(null, node);
			//let errLen = err.length;
			//errCount[depth] = errLen - (errCount[depth] | 0);
		} else if (node.depth == depth) {
			entry = entries[depth - 1];
			if(!entry[1]) {
				//console.log("skipping",node.name);
				continue;
			}
			entry = entry[1].call(null, node);
			if(entry) entry[0].call(null, node);
			//let errLen = err.length;
			//errCount[depth] = errLen - errCount[depth] || 0;
		}
	}
	return err;
}


function compose(funcs) {
	var len = funcs.length;
	return node => {
		var entries = [[],[]];
		for (var i = 0; i < len; i++) {
			if(!funcs[i]) continue;
			let ret = funcs[i].call(null, node);
			if(ret && ret.length){
				entries[0].push(ret[0]);
				entries[1].push(ret[1]);
			}
		}
		return [compose(entries[0]),compose(entries[1])];
	};
}

function _validate(schema, params, index, path, err) {
	var sc = schema.constructor;
	var entry;
	if (sc === Object) {
		var keys = Object.keys(schema);
		let funcs = [];
		// TODO compose a function that will contain all rules for a level
		for (let k of keys) {
			if (!/properties|patternProperties|items/.test(k)) {
				if(!validator[k]){
					console.log("Unsupported "+k);
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
		let funcs  = [];
		let childFuncs = [];
		for(let i=0, len = schema.length;i<len;i++) {
			let entry = _validate(schema[i],params, index, path, err);
			funcs.push(entry[0]);
			childFuncs.push(entry[1]);
		}
		entry = [compose(funcs),compose(childFuncs)];
	} else if (sc === String) {
		entry = [validator.type.bind(null, { type: schema }, "type", params, index, path, err)];
	}
	return entry;
}

function X(schema, key, path) {
	this.schema = schema;
	this.key = key;
	this.path = path;
}

function x(schema, key, path) {
	return new X(schema, key, path);
}

// TODO types are functions, so allow adding custom functions
// TODO use XVType, coersion
const types = {
	string: function (node) {
		return node.type == 3;
	},
	number: function (node) {
		return node.type == 12 && node.value.constructor == Number;
	},
	double: function (node) {
		return node.type == 12 && node.value.constructor == Number;
	},
	integer: function (node) {
		return node.type == 12 && node.value.constructor == Big && node.value.e === 0;
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
		return node.type == 5;
	}
};

const patternMatcher = function(patterns,key){
	for(var k in patterns){
		if(patterns[k].test(key)) return true;
	}
	return false;
};

const validator = {
	type: function (schema, key, params, index, path, err, node) {
		var type = schema[key];
		if (!types[type](node)) err.push(x(schema, key, path + "/" + index));
	},
	properties: function (schema, key, params, index, path, err, node) {
		// default is allErrors=true, so all children should be validated
		// this function will be passed to the children matching key + schema
		// when applied, the function uses the matching prop and updated path
		var props = schema[key];
		schema = get(props, node.name);
		if (schema) return _validate(schema, params, node.name, path + "/" + index, err);
	},
	patternProperties: function(schema, key, params, index, path, err, node){
		var pattProps = get(schema, key);
		var pattern;
		var patterns;
		if (pattProps) {
			patterns = get(schema, "patternPropertiesREGEXP");
			if (!patterns) {
				patterns = {};
				for(let k in pattProps){
					patterns[k] = new RegExp(k);
				}
				schema.patternPropertiesREGEXP = patterns;
			}
		}
		const patternMatcher = function(key){
			var ret = [];
			for(var k in patterns){
				if(patterns[k].test(key)) ret.push(pattProps[k]);
			}
			return ret;
		};
		let newpath = path + "/" + index;
		var schemas = patternMatcher(node.name);
		if (schemas.length) return _validate(schemas, params, node.name, newpath, err);
	},
	additionalProperties: function (schema, key, params, index, path, err, node) {
		if (additionalProps === false) {
			var props = get(schema, "properties");
			var pattProps = get(schema, "patternProperties");
			var patterns;
			if (pattProps) {
				patterns = get(schema, "patternPropertiesREGEXP");
				if (!patterns) {
					patterns = {};
					for(let k in pattProps){
						patterns[k] = new RegExp(k);
					}
					schema.patternPropertiesREGEXP = patterns;
				}
			}
			const patternMatcher = function(key){
				for(var k in patterns){
					if(patterns[k].test(key)) return true;
				}
				return false;
			};
			let newpath = path + "/" + index;
			let keys = node.keys();
			var len = node.count();
			for (let k of keys) {
				if (props[k] || patternMatcher(k)) len--;
			}
			if (len > 0) err.push(x(schema, key, newpath));
		}
	},
	items:function(schema, key, params, index, path, err, node){
		var schemas = schema[key];
		let newpath = path + "/" + index;
		schema = schemas[node.indexInParent];
		if (schema) return _validate(schema, params, node.name, newpath, err);
	},
	additionalItems:function(schema, key, params, index, path, err, node){
		var additionalItems = schema[key];
		var items = schema.items;
		if(items.length !== node.count()) err.push(x(schema,key,path + "/" + index));
	},
	minimum:function(schema, key, params, index, path, err, node){
		var test = schema[key];
		var ret = false;
		if(node.value && node.value.constructor == Big){
			ret = node.value.greaterThan(test);
		} else {
			ret = node.value > test;
		}
		if(!ret) err.push(x(schema,key,path + "/" + index));
	},
	maximum:function(schema, key, params, index, path, err, node){
		var test = schema[key];
		var ret = false;
		if(node.value && node.value.constructor == Big){
			ret = node.value.lessThan(test);
		} else {
			ret = node.value < test;
		}
		if(!ret) err.push(x(schema,key,path + "/" + index));
	}
};
