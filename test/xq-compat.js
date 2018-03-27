var n = require("../lib/index");
var map = require("../lib/map");
var array = require("../lib/array");
var a = require("../lib/array-util");
const xqc = require("../lib/xq-compat-b.js");
const console = require("../lib/console");
//const Scheduler = require("rxjs/Scheduler").Scheduler;

var x = xqc.analyzeChars(n.from(`
	xquery version "3.1";

module namespace xqc="http://raddle.org/xquery-compat";

import module namespace console="http://exist-db.org/xquery/console";
import module namespace a="http://raddle.org/array-util" at "../lib/array-util.xql";
import module namespace dawg="http://lagua.nl/dawg" at "../lib/dawg.xql";
`),map.map(n.pair("$compat","xquery")));
x.subscribe(console.log);
