const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

let s = n.seq(1,2,3);

assertEq("subseq",n.subsequence(s,2), n.seq(2,3));
assertEq("subseq",n.subsequence(s,1,2), n.seq(1,2));
assertThrows("subseq",() => n.subsequence(s));
assertEq("head",n.head(s), n.seq(1));
assertEq("tail",n.tail(s), n.seq(2,3));
assertEq("remove",n.remove(s,1), n.seq(2,3));
assertEq("remove",n.remove(s,0), n.seq(1,2,3));
assertThrows("remove",() => n.remove(s));
assertEq("reverse",n.reverse(s), n.seq(3,2,1));

console.log("All tests passed");
