const t = require("../lib/transducers");

// try transforming an Object
var o = {"a":1,"b":2};
o[Symbol.iterator] = function* () {
    for (let key in this) {
    	yield [key, this[key]] // yield [key, value] pair
    }
};
//console.log(o.values())
console.log(t.into(o,t.forEach(kv => kv[1]+1),[]));
//for(var x of o) console.log(x)
