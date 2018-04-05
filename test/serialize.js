var n = require("../lib/index");
var array = require("../lib/array");
var map = require("../lib/map");

var x = map.map(
	n.pair("xq-compat", n.true()),
	n.pair("char", n.seq("a","b")),
	n.pair("type", 0),
	n.pair("buffer", n.seq()),
	n.pair("string", 0),
	n.pair("var", n.false()),
	n.pair("ws", n.false()),
	n.pair("number", n.false()),
	n.pair("comment", n.false()),
	n.pair("opentag", n.false()),
	n.pair("closetag", n.false()),
	n.pair("attrkey", n.false()),
	n.pair("attrval", n.false()),
	n.pair("enc-expr", n.false()),
	n.pair("has-quot", 0),
	n.pair("opencount", 0),
	n.pair("r", array.array(map.map(n.pair("t",4),n.pair("v",n.create($o => {
		setTimeout(() => {
			$o.next(5);
			$o.complete();
		},100);
	}))))),
	n.pair("d", 1),
	n.pair("o", array.array(n.seq(2,3))),
	n.pair("i", map.map()),
	n.pair("p", array.array()),
	n.pair("out", n.seq())
);
var y = array.array(map.map({"a":n.create($o => {
	setTimeout(() => {
		$o.next(1);
		$o.complete();
	},1000);
}),"b":2}));
n.serialize(x).toArray().subscribe(x => console.log(x.map(JSON.stringify).join()));
