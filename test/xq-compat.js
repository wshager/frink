var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var a = require("../lib/array-util");
const xqc = require("../lib/compat.js");
//const console = require("../lib/console");
const Observable = require("rxjs/Observable").Observable;
const queue = require("rxjs/Scheduler/queue").queue;


var options = map.map({"$compat":"xquery","$transpile":"l3"});
var x = xqc.analyzeChars(Observable.from(`
    xquery version "3.1";

    module namespace c="http://raddle.org/compat";

    (:import module namespace console="urn:console" at "../lib/console.xql";:)
    import module namespace a="http://raddle.org/array-util" at "../lib/array-util.xql";
    import module namespace rx="http://reactivex.io" at "../lib/rx.xql";
    (:import module namespace trie="http://lagua.nl/trie" at "../lib/trie.xql";:)
`),options);
//console.log(n.toJS(n.fromL3Stream(x, NaN)));
//console.log(x);
x.subscribe({
	next:x => console.log("x",x),
	complete:() => {
		console.log("complete");
	}
});
//x[1].subscribe(y => console.log("y",y));
