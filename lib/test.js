const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const xqc = {}; // http://raddle.org/xquery-compat;
xqc.test$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	n.frame($);
	$("a", $(1));
	$("x", $(2));
	$("x", n.if(n.boolean($("a")), ($, test) => {
		if (test) {
			return 1;
		} else {
			return $("x");
		}
	}, $));
	return $("x");
}));
xqc.test = (...a) => {
	const len = a.length;
	if (len == 2) return xqc.test$2.apply(null, a);
};
module.exports = xqc;
