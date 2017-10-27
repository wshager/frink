const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;
let s = n.seq(1,2,3);

//assertEq(n.head(s), n.seq(1));
//assertEq(n.tail(s), n.seq(2,3));
assertEq("insertBefore",n.insertBefore(s,2,5), n.seq(1,5,2,3));
//assertEq(n.reverse(s), n.seq(3,2,1));
assertEq(n.filter(s,_ => _ > 1),n.seq(2,3));
assertEq(n.forEach(s,_ => _ + 1),n.seq(2,3,4));
assertEq(n.foldLeft(s,1,(a,_) => a + _),n.seq(7));

assertThrows("exactlyOne",$ => n.exactlyOne(s));
assertThrows("zeroOrOne",$ => n.zeroOrOne(s));

console.log("All tests passed");
