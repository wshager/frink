const util = require("util");
const microtime = require("microtime");

const ops = {
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
	223: "group by",
	300: "or",
	400: "and",
	501: "eq",
	502: "ne",
	503: "lt",
	504: "le",
	505: "gt",
	506: "ge",
	508: "!=",
	509: "<=",
	510: ">=",
	511: "<<",
	512: ">>",
	515: "is",
	600: "||",
	700: "to",
	902: "idiv",
	903: "div",
	904: "mod",
	1001: "union",
	1101: "intersect",
	1102: "except",
	1200: "instance of",
	1300: "treat as",
	1400: "castable as",
	1500: "cast as",
	1600: "=>",
	2101: "array",
	2102: "attribute",
	2103: "comment",
	2104: "document",
	2105: "element",
	2106: "function",
	2107: "map",
	2108: "namespace",
	2109: "processing-instruction",
	2110: "text(",
	2201: "array(",
	2202: "attribute(",
	2203: "comment(",
	2204: "document-node(",
	2205: "element(",
	2206: "empty-sequence(",
	2208: "item(",
	2209: "map(",
	2210: "namespace-node",
	2211: "node",
	2212: "processing-instruction",
	2213: "schema-attribute",
	2214: "schema-element",
	2215: "text",
	2400: "as",
	2501: "(:",
	2502: ":)"
};


function process(cps,root,map,processed,op){
	if(!cps.length) return;
	let cp = cps.shift();
	processed.push(cp);
	if(map[cp]) {
		//process further
		return process(cps,root, map[cp], processed, op);
	} else {
		if(map.constructor == Array){
			for(let i=0;i<map.length;i++){
				if(map[i][cp]) {
					return process(cps,root, map[i][cp], processed, op);
				}
			}
		}
		//insert
		map = root;
		do {
			let cp = processed.shift();
			if(map[cp]) {
				var newmap = {};
				if(map[cp].constructor == Array){
					map[cp].push(newmap);
				} else {
					map[cp] = [map[cp],newmap];
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
					if(found) cp = processed.shift();
					if(!found) break;
				}
				map[cp] = op;
			}
		} while(processed.length);
	}
}

function createDawg(operators) {
	var root = {};
	Object.keys(operators).sort(function(a,b){
		return operators[a].localeCompare(operators[b]);
	}).forEach(function(op){
		let cps = str2array(operators[op]);
		process(cps,root,root,[],op);
	});
	return root;
}

function str2array(str){
	var ar = [];
	for (var i=0, strLen=str.length; i<strLen; i++) {
		ar[i] = str.charCodeAt(i);
	}
	return ar;
}

function traverse(dawg,word,map){
	var c = 0;
	var cps = str2array(word);
	var result = [];
	//console.log(cps)
	var cp = cps[c];
	var entry = dawg;
	while(true){
		if(entry.constructor == Array){
			// add multiple options for backtracking
			result.push(entry);
			var found = false;
			for(var i = 0; i < entry.length; i++){
				let a = entry[i];
				if(a.constructor !== Object && word === map[entry]) {
					entry = a;
					found = true;
					break;
				} else if(a[cp]) {
					entry = a[cp];
					//console.log("a", cp,entry)
					cp = cps[++c];
					found = true;
					break;
				}
			}
			if(!found) return;
		} else if(entry.constructor == Object){
			entry = entry[cp];
			//console.log("o", cp,entry)
			cp = cps[++c];
		} else {
			var match = word === map[entry];
			//console.log("e",entry,match)
			while(!match && result.length){
				// backtrack
				entry = result.pop()[0];
			}
			return match ? entry : undefined;
		}
	}
}

var dawg = createDawg(ops);
var t = microtime.now();
var ret = traverse(dawg,"module",ops);
var e = microtime.now();
console.log((e - t) / 1000);
console.log(dawg);

//var fs = require("fs");
//fs.writeFileSync(__dirname+"/dawg.json",JSON.stringify(dawg));
