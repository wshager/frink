const array = require("../lib/array");
const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

const arrayType = n.single(n.array(n.single(n.item())));
const get = n.def("array:get",[arrayType,n.single(n.number())],n.single(n.item()))(array.get);
const flatten = n.def("array:flatten",[arrayType],n.any(n.item()))(array.flatten);
const append = n.def("array:append",[arrayType,n.single(n.item())],arrayType)(array.append);
const insertBefore = n.def("array:insert-before",[arrayType,n.single(n.number()),n.single(n.item())],arrayType)(array.insertBefore);
const remove = n.def("array:remove",[arrayType,n.single(n.number())],arrayType)(array.remove);
const size = n.def("array:size",[arrayType],n.single(n.number()))(array.size);
const tail = n.def("array:tail",[arrayType],arrayType)(array.tail);
const head = n.def("array:head",[arrayType],n.single(n.item()))(array.head);
const subarray = n.def("array:subarray",[arrayType,n.single(n.number()),n.opt(n.single(n.number()))],arrayType)(array.subarray);
const reverse = n.def("array:reverse",[arrayType],arrayType)(array.reverse);
const foldLeft = n.def("array:fold-left",[arrayType,n.any(n.item()),n.single(n.def("",[n.any(n.item()),n.single(n.item())],n.any(n.item())))],n.any(n.item()))(array.foldLeft);
const join = n.def("array:join",[n.any(n.array(n.single(n.item())))],arrayType)(array.join);

var x = array.array(["a","b","c"]);

assertEq("array:get",get(x,1),"a");
assertEq("array:flatten",flatten(x),n.seq("a","b","c"));
assertEq("array:append",append(x,"d"),array.array("a","b","c","d"));
assertEq("array:insert-before",insertBefore(x,2,"d"),["a","d","b","c"]);
assertEq("array:remove",remove(x,2),["a","c"]);
assertEq("array:size",size(x),3);
assertEq("array:tail",tail(x),["b","c"]);
assertEq("array:head",head(x),"a");
assertEq("array:subarray 1",subarray(x,2),["b","c"]);
assertEq("array:subarray 2",subarray(x,1,2),["a","b"]);
assertEq("array:subarray 3", subarray(x,2,1),["b"]);
assertEq("array:reverse",reverse(x),["c","b","a"]);
assertEq("array:fold-left",foldLeft(x,"x",n.concat),"xabc");
assertEq("array:join",join(n.seq(x,x)),["a","b","c","a","b","c"]);

assertThrows("not-list",() => array.head("a"));
