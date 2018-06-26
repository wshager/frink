var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var dawg = require("../lib/dawg");
const xqc = require("../lib/xq-compat-b.js");
const console = require("../lib/console");

//console.log(xqc.operatorTrie)
console.log(dawg.traverse(xqc.operatorTrie,n.from("at")));
