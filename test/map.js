const map = require("../lib/map");
const s = require("../lib/seq");
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

var m = map.default(map.entry("a",1),map.entry("b",2));
assertEq(map.get(m,"b"),2);
assertEq(map.put(m,"c",3),{"a":1,"b":2,"c":3});
assertEq(map.forEachEntry(m,(k,v) => s.seq(k,v)).toArray(),["a",1,"b",2]);
assertEq(map.keys(m).toArray(),["a","b"]);
var m1 = map.default(map.entry("c",3),map.entry("d",4));
assertEq(map.merge(s.seq(m,m1)),{"a":1,"b":2,"c":3,"d":4});

console.log("all tests passed");
