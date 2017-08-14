const t = require("../lib/transducers");

// try transforming an Object
var o = {"a":1,"b":2,"c":3};
o[Symbol.iterator] = function* () {
    for (let key in this) {
    	yield [key, this[key]] // yield [key, value] pair
    }
};
//console.log(o.values())
console.log(t.foldLeft(t.into(o,t.compose(t.filter(kv => kv[1] > 1),t.forEach(kv => {
    console.log("process",kv)
    return kv[1]+1;
})),[]),0,(a,x) => a + x));
//for(var x of o) console.log(x)
