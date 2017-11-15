const n = require("../lib/index");
const shared = require("./shared");

const assertEq = shared.assertEq;
const assertThrows = shared.assertThrows;

console.log("testing string");

assertEq("stringJoin",n.stringJoin(
	n.e("root",[
		n.e("a",n.x("bla")),
		n.e("b",n.x("bli"))
	])
),n.seq("blabli"));

assertEq("concat",n.concat("a","b","c"),"abc");

assertEq("stringJoin",n.stringJoin(n.seq("a","b","c"),","),"a,b,c");

assertEq("stringToCodepoints",n.stringToCodepoints("abc"),n.seq(97,98,99));

assertEq("codepointsToString",n.codepointsToString(n.seq(97,98,99)),n.seq("abc"));

assertEq("matches",n.matches("bla","^bla$"),n.seq(true));

assertEq("replace",n.replace("bla","l","x"),n.seq("bxa"));

assertEq("upperCase",n.upperCase("bla"),n.seq("BLA"));

assertEq("substring",n.substring("blibla",4),n.seq("bla"));

assertEq("substring",n.substring("blibla",3,3),n.seq("ibl"));

assertEq("normalizeSpace",n.normalizeSpace(" bla     test   "),n.seq("bla test"));

assertEq("stringLength",n.stringLength("😴"),n.seq(1));

assertEq("tokenize",n.tokenize("a,b,c",","),n.seq("a","b","c"));

assertEq("normalizeUnicode",n.normalizeUnicode("￡","nfkc"),n.seq("£"));

assertEq("normalizeUnicode",n.normalizeUnicode("leçon","nfkd"),n.seq("leçon"));

assertEq("normalizeUnicode",n.normalizeUnicode("15 ㎗", "nfkc"),n.seq("15 dl"));

var x = n.analyzeString("1 + 2","(\\)[\\+\\*\\-\\?]?)|(=#\\p{N}+#?\\p{N}*=|,)?([\\+\\*\\-\\?\\p{L}\\p{N}\\-_\\.@\\$%/#@\\^:]*)(\\(?)");
//var ret = n.select(x,"fn:match","fn:group",n.string);
x.subscribe(x => console.log(x+""));
//console.log(ret);
//var h = n.head(ret);
//var t = n.tail(ret);
//console.log(n.concat(ret))
