const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

console.log("testing operators");

assertEq("eq",n.op(n.seq("test"),"eq",n.seq("test")),true);

assertEq("geq",n.op(n.seq("test","test2"),"=",n.seq("test")),true);

assertEq("add",n.op(1,"+",2),3);

assertEq("cast",n.cast(n.seq(1,2),n.string()),n.seq("1","2"));

assertEq("boolean",n.boolean(n.seq()),false);

assertThrows("boolean",() => n.boolean(n.seq(true,false)));

assertEq("or",n.or(n.seq(true),false),true);

assertEq("and",n.and(n.seq(true),false),false);

assertEq("to",n.to(1,3),n.seq(1,2,3));

console.log("All tests passed");

//n.to(1,3).subscribe(console.log)
