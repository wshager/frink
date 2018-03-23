var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var a = require("../lib/array-util");
const xqc = require("../lib/xq-compat-b.js");
//const console = require("../lib/console");
const Scheduler = require("rxjs/Scheduler").Scheduler;

var x = xqc.analyzeChars(n.from(`
	module namespace xqc="http://raddle.org/xquery-compat";
	console:log("test")
`),map.map(n.pair("$compat","xquery")));
//var x = array.array(1);
function tracePrototypeChainOf(object) {

	var proto = object.constructor.prototype;
	var result = "";

	while (proto) {
		result += " -> " + proto.constructor.name;
		proto = Object.getPrototypeOf(proto);
	}

	return result;
}
//console.log(n.matches("m","\\p{L}"));
x.concatMap(x => n.serialize(x)).subscribe({
	next: x => {
		console.log(x);
	},
	error: err => {
		console.error(err);
	},
	complete: () => {
		console.log("complete");
	}
});
