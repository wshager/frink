var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var a = require("../lib/array-util");
const xqc = require("../lib/xq-compat-b.js");
const console = require("../lib/console");
//const Scheduler = require("rxjs/Scheduler").Scheduler;

var x = xqc.analyzeChars(n.from(`
	xquery version "4.1";

module namespace xqc="http://raddle.org/xquery-compat";

import module namespace console="http://exist-db.org/xquery/console";
import module namespace a="http://raddle.org/array-util" at "../lib/array-util.xql";
import module namespace dawg="http://lagua.nl/dawg" at "../lib/dawg.xql";
`),map.map(n.pair("$compat","xquery")));
console.log(x)

async function _t(...$) {
	$ = n.frame($);
	return $("flags", $(1)),
		$("char", $(2)),
		$("oldType", $("flags").call($, "type")),
		$("buffer", $("flags").call($, "buffer")),
			//console.log("flags",$("flags")),
	$("buffer",
		(await n.when(n.and($("zero"), $("flag"))) ?
				$("buffer") :
				(
					n.seq($("buffer"), $("char"))
				)
		)),
	console.log("buffer1",$("buffer")),
	$("flags", map.put($("flags"), "buffer", $("buffer"))),
	console.log("flags",$("flags")),
	$("flags")
}

function t(x,s) {
	return n.fromPromise(_t(x,s))
}
async function _a() {
	var $ = n.frame();
	console.log("A called")
	$("r",array.array(map.map({t:1,d:1,v:1})));
	$("tpl",map.map({t:2,d:2,v:2}));
	$("r", await n.when(n.exists($("tpl")),"exists-tpl") ?
		array.append($("r"), $("tpl")) :
		$("r"));
	return $("r");
}

async function _b() {
	var $ = n.frame();
	$("r",n.fromPromise(_a(),"A"));
	$("size",array.size($("r")));
	return await n.when(n.gt($("size"),1)) ?
		(console.log("true-size-0"),$("last", $("r").call("size", $("size"))),
			//console.log("GG-LAST",$("last")),
			await n.when(n.empty($("last"))) ?
			(console.log("true-empty-last"),map.map()) :
			(console.log("false-empty-last"),await n.when(n.eq($("last").call("t", "t"), 9)) ?
				(console.log("true-last-t-9"),n.seq()) :
				(console.log("false-last-t-9"),$("last")))) :
		(console.log("false-size-0"),map.map())
}

/*
$("flags", map.map({
	"char":"t",
	"type": 0,
	"zero": false,
	"buffer":n.seq("a","b"),
	"flag":n.seq()
}))
$("flags", t($("flags"),"e"))
$("flags", t($("flags"),"s"))
$("flags", t($("flags"),"t"))
$("flags").subscribe(console.log);
*/
