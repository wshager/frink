const util = require("util");
const microtime = require("microtime");

const ops = {
	1:"(",
	2:")",
	3:"{",
	4:"}",
	5:";",
	6:"&quot;",
	7:"&apos;",
	8:".",
	9:"$",
	100:",",
	201: "some",
	202: "every",
	203: "switch",
	204: "typeswitch",
	205: "try",
	206: "if",
	207: "then",
	208: "else",
	209: "let",
	210: ":=",
	211: "return",
	212: "case",
	213: "default",
	214: "xquery",
	215: "version",
	216: "module",
	217: "declare",
	218: "variable",
	219: "import",
	220: "at",
	221: "for",
	222: "in",
	223: "where",
	224: "order by",
	225: "group by",
	300: "or",
	400: "and",
	501: ">>",
	502: "<<",
	503: "is",
	504: ">=",
	505: ">",
	506: "<=",
	507: "<",
	508: "!=",
	509: "=",
	510: "ge",
	511: "gt",
	512: "le",
	513: "lt",
	514: "ne",
	515: "eq",
	600: "||",
	700: "to",
	801: "-",
	802: "+",
	901: "mod",
	902: "idiv",
	903: "div",
	904: "*",
	1001: "union",
	1002: "|",
	1101: "intersect",
	1102: "except",
	1200: "instance of",
	1300: "treat as",
	1400: "castable as",
	1500: "cast as",
	1600: "=>",
	1701: "+",
	1702: "-",
	1800: "!",
	1901: "/",
	1902: "//",
	2001: "[",
	2002: "]",
	2003: "?",
	2101: "array",
	2102: "attribute",
	2103: "comment",
	2104: "document",
	2105: "element",
	2106: "function",
	2107: "map",
	2108: "namespace",
	2109: "processing-instruction",
	2110: "text",
	2201: "array",
	2202: "attribute",
	2203: "comment",
	2204: "document-node",
	2205: "element",
	2206: "empty-sequence",
	2207: "function",
	2208: "item",
	2209: "map",
	2210: "namespace-node",
	2211: "node",
	2212: "processing-instruction",
	2213: "schema-attribute",
	2214: "schema-element",
	2215: "text",
	2400: "as",
	2501: "(:",
	2502: ":)",
	2600: ":"
};

function process(word,root,map,processed,op, c){
	if(c==word.length) return;
	let cp = word[c++];
	processed += cp;
	if(map[cp]) {
		return process(word,root, map[cp], processed, op, c);
	} else {
		if(map.constructor == Array){
			for(let i=0;i<map.length;i++){
				if(map[i][cp]) {
					return process(word,root, map[i][cp], processed, op, c);
				}
			}
		}
		map = root;
		var len = processed.length;
		c = 0;
		do {
			let cp = processed[c++];
			if(map[cp]) {
				var newmap = {};
				let entry = map[cp];
				if(entry.constructor == Array){
					map[cp].push(newmap);
				} else {
					map[cp] = [entry,newmap];
				}
				newmap.parent = map[cp];
				map = newmap;
			} else {
				while(map.parent) {
					var found = false;
					var oldmap = map;
					for(var i=0;i<map.parent.length;i++){
						if(map.parent[i][cp]){
							let newmap = {};
							if(map.parent[i][cp].constructor == Array){
								map.parent[i][cp].push(newmap);
							} else {
								map.parent[i][cp] = [map.parent[i][cp],newmap];
							}
							newmap.parent = map.parent[i][cp];
							map = newmap;
							found = true;
							break;
						}
					}
					delete oldmap.parent;
					if(found) cp = processed[c++];
					if(!found) break;
				}
				map[cp] = {_k:word,_v:parseInt(op)};
			}
		} while(c<len);
	}
}

function createDawg(map,order) {
	var root = {};
	if(!order) {
		order = function(a,b){
			var sa = map[a], sb = map[b];
			return sa > sb ? 1 : sa < sb ? -1 : 0;
		};
	}
	Object.keys(map).sort(order).forEach(function(k){
		process(map[k],root,root,"",k,0);
	});
	const stripObj = x => {
		if("_k" in x) return x;
		for(var k in x) {
			x[k] = strip(x[k]);
		}
		return x;
	};
	const strip = x =>
		x instanceof Array ?
			x.filter(entry => Object.keys(entry).length).map(strip) :
			typeof x == "object" ? stripObj(x) : x;
	return strip(root);
}

function traverse(tmp,word){
	var b ="";
	var ret = tmp[0], path = tmp[1] || [];
	let i = 0,l=word.length;
	for(; i<l; i++){
		let c = word[i];
		b+=c;
		tmp = find(ret,c,b,path);
		ret = tmp[0];
		path = tmp[1];
		if(!ret) return;
	}
	if(ret.constructor == Array){
		let entry = ret[0];
		if(entry._v && entry._k == b) return entry._v;
	} else {
		if(ret._v && ret._k == b) return ret._v;
	}
	for(let entry of path) {
		if(entry._v && entry._k == b) return entry._v;
	}
	return [ret,path];
}

function filter(path,cp,pos){
	if(path.length && path[0]._k[pos] != cp) path.shift();
	return path.length ? path : null;
}
function find(entry,cp,word,path){
	if(entry.constructor == Array){
		let pos = word.length - 1;
		let len = entry.length;
		var ret;
		for(var i = 0; i < len; i++){
			let a = entry[i];
			if(a._v) {
				if(a._k[pos] == cp){
					if(path[path.length-1] !== a) path.push(a);
					ret = a;
				}
			} else {
				if(a[cp]) {
					return [a[cp],path];
				}
			}
		}
		//entry = ret;
		if(ret) return [ret,path];
		return [filter(path,cp,pos),[]];
	} else if(!entry._v){
		return [entry[cp],path];
	} else {
		let pos = word.length - 1;
		if(entry._k[pos] == cp) {
			if(path[path.length-1] !== entry) path.push(entry);
			return [entry,path];
		}
		return [filter(path,cp,pos),[]];
	}
}

var t = microtime.now();
var dawg = createDawg(ops);
var e = microtime.now();
console.log((e-t) / 1000);
//var ret = traverse(dawg,"module",ops);
var ret = dawg;
var reversed = {};
for(let x in ops) reversed[ops[x]] = x;

var failed = false;
var out = [];


t = microtime.now();
for(var x of Object.keys(ops)){
	var ret = traverse([dawg],ops[x],ops);
	if(!ret || ret+"" !== x) {
		//console.log(ret+"",x)
		failed = true;
	} else {
		out.push([ret,x]);
	}
}
e = microtime.now();

if(!failed) console.log(out,e-t);


var w = "(:";
t = microtime.now();
var out2 = traverse([dawg], w, ops);
e = microtime.now();
console.log((e - t)/1000, out2);


var fs = require("fs");
fs.writeFileSync(__dirname+"/dawg.json",JSON.stringify(dawg));
