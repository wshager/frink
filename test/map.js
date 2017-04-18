const map = require("../lib/map");
const n = require("../lib/index");
const assert = require("assert");
const t = require("../lib/transducers");

function assertEq(a,b){
	assert.equal(JSON.stringify(toJS(a)),JSON.stringify(b));
}

function toJS(m){
	if(!map.isMap(m)) return m;
	var o = {};
	m.forEach(function(v,k){
		o[k] = v;
	});
	return o;
}

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
	map.entry(n.integer(18), n.string("for-each")),
	map.entry(n.decimal(19.01), n.string("select")),
	map.entry(n.decimal(20.01), n.string("filter")),
	map.entry(n.decimal(20.03), n.string("lookup")),
	map.entry(n.decimal(20.04), n.string("array")),
	map.entry(n.decimal(27.01), n.string("pair"))
));

var m = map.default(map.entry("a",1),map.entry("b",2));
assertEq(map.get(m,"b"),2);
assertEq(map.put(m,"c",3),{"a":1,"b":2,"c":3});
assertEq(map.forEachEntry(m,(k,v) => n.seq(k,v)).toArray(),["a",1,"b",2]);
assertEq(map.keys(m).toArray(),["a","b"]);
var m1 = map.default(map.entry("c",3),map.entry("d",4));
assertEq(map.merge(n.seq(m,m1)),{"a":1,"b":2,"c":3,"d":4});

console.log("all tests passed");

//console.log(map.keys(operatorMap).toArray());

console.log(map.get(operatorMap,n.decimal(8.01)))
