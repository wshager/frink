const array = require("../lib/array");
const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

var x = array.array(["a","b","c"]);
assertEq("array.get",array.get(x,1),"a");
assertEq("array.flatten",array.flatten(x,1),n.seq("a","b","c"));
assertEq("array.append",array.append(x,"d"),n.seq("a","b","c","d"));
assertEq("array.insertBefore",array.insertBefore(x,2,"d"),["a","d","b","c"]);
assertEq("array.remove",array.remove(x,2),n.seq("a","c"));
assertEq("array.size",array.size(x),3);
assertEq("array.tail",array.tail(x),n.seq("b","c"));
assertEq("array.head",array.head(x),"a");
assertEq("array.subarray 1",array.subarray(x,2),n.seq("b","c"));
assertEq("array.subarray 2",array.subarray(x,1,2),n.seq("a","b"));
assertEq("array.subarray 3", array.subarray(x,2,1),"b");
assertEq("transform", n.transform(x,
	n.pipe(n.filter(_ => _ != "a"),n.forEach(_ => n.concat(_,".ok")))),n.seq("b.ok","c.ok"));
assertEq("array.reverse",array.reverse(x),n.seq("c","b","a"));
assertEq("array.foldLeft",array.foldLeft(x,"x",n.concat),"xabc");
assertEq("array.join",array.join(n.seq(x,x)),n.seq("a","b","c","a","b","c"));
assertThrows("not-list",() => array.head("a"));
console.log("all tests passed");
