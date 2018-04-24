const map = require("../lib/map");
const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

map.merge(n.seq(map.map(n.pair("x",2)),map.map(n.pair("a",n.seq(1))))).subscribe(console.log);

/*
var x = map.default(map.default({"a":1}));

const operatorMap = map.default(n.seq(
	map.entry(n.decimal(2.06), n.string("iff")),
	map.entry(n.decimal(2.09), n.string("item")),
	map.entry(n.decimal(5.01), n.string("eq")),
	map.entry(n.decimal(5.02), n.string("ne")),
	map.entry(n.decimal(5.03), n.string("lt")),
	map.entry(n.decimal(5.04), n.string("le")),
	map.entry(n.decimal(5.05), n.string("gt")),
	map.entry(n.decimal(5.06), n.string("ge")),
	map.entry(n.decimal(5.07), n.string("geq")),
	map.entry(n.decimal(5.08), n.string("gne")),
	map.entry(n.decimal(5.09), n.string("gle")),
	map.entry(n.decimal(5.10), n.string("gge")),
	map.entry(n.decimal(5.11), n.string("precedes")),
	map.entry(n.decimal(5.12), n.string("follows")),
	map.entry(n.decimal(5.13), n.string("glt")),
	map.entry(n.decimal(5.14), n.string("ggt")),
	map.entry(n.integer(6), n.string("concat")),
	map.entry(n.decimal(8.01), n.string("add")),
	map.entry(n.decimal(8.02), n.string("subtract")),
	map.entry(n.decimal(9.01), n.string("multiply")),
	map.entry(n.decimal(10.02), n.string("union")),
	map.entry(n.decimal(17.01), n.string("plus")),
	map.entry(n.decimal(17.02), n.string("minus")),
	map.entry(n.decimal(18), n.string("for-each")),
	map.entry(n.decimal(19.01), n.string("select")),
	map.entry(n.decimal(20.01), n.string("filter")),
	map.entry(n.decimal(20.03), n.string("lookup")),
	map.entry(n.decimal(20.04), n.string("array")),
	map.entry(n.decimal(27.01), n.string("pair"))
));
//x = map.merge(n.seq(x,map.entry("b",2)));
var ar = [];

for(let n=0;n<2600;n++){
	//var k = String.fromCharCode(n+97);
	var k = "";
	for(var i=0;i<6+Math.random() * 10;i++){
		k += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
	}
	if(ar.indexOf(k)==-1) {
		ar.push(k);
	} else {
		n--;
	}
	k = "";
}

const toObj = $m => $m.reduce((a,m) => {
	for(var kv of m.entries()) {
		a[kv[0]] = kv[1];
	}
	return a;
},{});

var m = map.default(map.entry("a",1),map.entry("b",2));
assertEq("map.get",map.get(m,"b"),2);
assertEq("map.put",toObj(map.put(m,"c",3)),{"a":1,"b":2,"c":3});
assertEq("map.put 2",toObj(map.put(m,"a",2)),{"a":2,"b":2});
assertEq("map.remove",toObj(map.remove(m,"a")),{"b":2});
assertEq("map.forEachEntry",map.forEachEntry(m,($k,$v) => n.concat($k,n.string($v))),n.seq("a1","b2"));
assertEq("map.keys",map.keys(m),n.seq("a","b"));
var m1 = map.default(map.entry("c",3),map.entry("d",4));
assertEq("map.merge",toObj(map.merge(n.seq(m,m1))),{"a":1,"b":2,"c":3,"d":4});
var m2 = map.default(map.entry("a",1),map.entry("a",2));
assertEq("map.merge 2",toObj(m2),{"a":2});

console.log("all tests passed");
*/
