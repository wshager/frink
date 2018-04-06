const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const a = {}; // http://raddle.org/array-util;
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("position", $(2)),
		$("member", $(3)),
		await n.when(n.gt($("position"), array.size($("array")))) ?
		(array.append($("array"), $("member"))) :
		(array.insertBefore(array.remove($("array"), $("position")), $("position"), $("member")))
}));
a.foldLeft$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		a.foldLeft($("array"), $("zero"), $("function"), array.size($("array")))
}));
a.foldLeft$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		$("s", $(4)),
		await n.when(n.eq($("s"), 0)) ?
		($("zero")) :
		(a.foldLeft(array.tail($("array")), $("function").call($, $("zero"), array.head($("array"))), $("function"), n.subtract($("s"), 1)))
}));
a.foldLeftAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		a.foldLeftAt($("array"), $("zero"), $("function"), 1)
}));
a.foldLeftAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		$("at", $(4)),
		a.foldLeftAt($("array"), $("zero"), $("function"), $("at"), array.size($("array")))
}));
a.foldLeftAt$5 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		$("at", $(4)),
		$("s", $(5)),
		await n.when(n.eq($("s"), 0)) ?
		($("zero")) :
		(a.foldLeftAt(array.tail($("array")), $("function").call($, $("zero"), array.head($("array")), $("at")), $("function"), n.add($("at"), 1), n.subtract($("s"), 1)))
}));
a.reduceAroundAt$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("head", array.head($("array"))),
		a.reduceAroundAt(array.tail($("array")), $("function"), $("head"), $("head"), n.seq(), 2)
}));
a.reduceAroundAt$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		a.reduceAroundAt($("array"), $("function"), $("zero"), n.seq())
}));
a.reduceAroundAt$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		$("lastSeed", $(4)),
		a.reduceAroundAt($("array"), $("function"), $("zero"), $("lastSeed"), n.seq())
}));
a.reduceAroundAt$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		$("lastSeed", $(4)),
		$("nextSeed", $(5)),
		a.reduceAroundAt($("array"), $("function"), $("zero"), $("lastSeed"), $("nextSeed"), 1)
}));
a.reduceAroundAt$6 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		$("lastSeed", $(4)),
		$("nextSeed", $(5)),
		$("at", $(6)),
		$("tmp", map.map(n.pair("out", $("zero")), n.pair("last", $("lastSeed")), n.pair("entry", array.head($("array"))), n.pair("at", $("at")))),
		$("tmp", a.foldLeft(array.tail($("array")), $("tmp"), n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($);
			return $("tmp", $(1)),
				$("next", $(2)),
				$("out", $("function").call($, $("tmp").call($, "out"), $("tmp").call($, "entry"), $("tmp").call($, "last"), $("next"), $("tmp").call($, "at"))),
				$("tmp", map.put($("tmp"), "out", $("out"))),
				$("tmp", map.put($("tmp"), "last", $("tmp").call($, "entry"))),
				$("tmp", map.put($("tmp"), "entry", $("next"))),
				map.put($("tmp"), "at", n.add($("at"), 1))
		})))),
		$("function").call($, $("tmp").call($, "out"), $("tmp").call($, "entry"), $("tmp").call($, "last"), $("nextSeed"), $("tmp").call($, "at"))
}));
a.reduceAheadAt$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		a.reduceAheadAt(array.tail($("array")), $("function"), array.head($("array")), n.seq(), 2)
}));
a.reduceAheadAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		a.reduceAheadAt($("array"), $("function"), $("zero"), n.seq())
}));
a.reduceAheadAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		$("nextSeed", $(4)),
		a.reduceAheadAt($("array"), $("function"), $("zero"), $("nextSeed"), 1)
}));
a.reduceAheadAt$5 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("zero", $(3)),
		$("nextSeed", $(4)),
		$("at", $(5)),
		$("tmp", map.map(n.pair("out", $("zero")), n.pair("entry", array.head($("array"))), n.pair("at", $("at")))),
		$("tmp", a.foldLeft(array.tail($("array")), $("tmp"), n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($);
			return $("tmp", $(1)),
				$("next", $(2)),
				$("out", $("function").call($, $("tmp").call($, "out"), $("tmp").call($, "entry"), $("next"), $("tmp").call($, "at"))),
				$("tmp", map.put($("tmp"), "out", $("out"))),
				$("tmp", map.put($("tmp"), "entry", $("next"))),
				map.put($("tmp"), "at", n.add($("at"), 1))
		})))),
		$("function").call($, $("tmp").call($, "out"), $("tmp").call($, "entry"), $("nextSeed"), $("tmp").call($, "at"))
}));
a.foldRight$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		a.foldRight($("array"), $("zero"), $("function"), array.size($("array")))
}));
a.foldRight$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		$("s", $(4)),
		await n.when(n.eq($("s"), 0)) ?
		($("zero")) :
		(a.foldRight(array.remove($("array"), $("s")), $("function").call($, $("zero"), array.get($("array"), $("s"))), $("function"), n.subtract($("s"), 1)))
}));
a.foldRightAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		a.foldRightAt($("array"), $("zero"), $("function"), array.size($("array")))
}));
a.foldRightAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("zero", $(2)),
		$("function", $(3)),
		$("at", $(4)),
		await n.when(n.eq($("at"), 0)) ?
		($("zero")) :
		(a.foldRightAt(array.remove($("array"), $("at")), $("function").call($, $("zero"), array.get($("array"), $("at")), $("at")), $("function"), n.subtract($("at"), 1)))
}));
a.forEach$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		a.forEach($("array"), $("function"), array.array())
}));
a.forEach$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("ret", $(3)),
		await n.when(n.eq(array.size($("array")), 0)) ?
		($("ret")) :
		(a.forEach(array.tail($("array")), $("function"), array.append($("ret"), $("function").call($, array.head($("array"))))))
}));
a.forEachAt$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		a.forEachAt($("array"), $("function"), array.array(), 1)
}));
a.forEachAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("function", $(2)),
		$("ret", $(3)),
		$("at", $(4)),
		await n.when(n.eq(array.size($("array")), 0)) ?
		($("ret")) :
		(a.forEachAt(array.tail($("array")), $("function"), array.append($("ret"), $("function").call($, array.head($("array")), $("at"))), n.add($("at"), 1)))
}));
a.last$1 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		array.get($("array"), array.size($("array")))
}));
a.pop$1 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		array.remove($("array"), array.size($("array")))
}));
a.firstIndexOf$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("lookup", $(2)),
		a.foldLeftAt($("array"), n.seq(), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($);
			return $("pre", $(1)),
				$("cur", $(2)),
				$("at", $(3)),
				await n.when(await n.when(n.empty($("pre"))) || await n.when(n.deepEqual($("cur"), $("lookup")))) ?
				($("at")) :
				($("pre"))
		})))
}));
a.lastIndexOf$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("array", $(1)),
		$("lookup", $(2)),
		a.foldRightAt($("array"), 0, n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($);
			return $("cur", $(1)),
				$("pre", $(2)),
				$("at", $(3)),
				await n.when(await n.when(n.eq($("pre"), 0)) && await n.when(n.deepEqual($("cur"), $("lookup")))) ?
				($("at")) :
				($("pre"))
		})))
}));
a.put = (...$) => {
	const $len = $.length;
	if ($len == 3) return n.fromPromise(a.put$3.apply(null, $));
};
a.foldLeft = (...$) => {
	const $len = $.length;
	if ($len == 3) return n.fromPromise(a.foldLeft$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.foldLeft$4.apply(null, $));
};
a.foldLeftAt = (...$) => {
	const $len = $.length;
	if ($len == 3) return n.fromPromise(a.foldLeftAt$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.foldLeftAt$4.apply(null, $));
	if ($len == 5) return n.fromPromise(a.foldLeftAt$5.apply(null, $));
};
a.reduceAroundAt = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.reduceAroundAt$2.apply(null, $));
	if ($len == 3) return n.fromPromise(a.reduceAroundAt$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.reduceAroundAt$4.apply(null, $));
	if ($len == 5) return n.fromPromise(a.reduceAroundAt$5.apply(null, $));
	if ($len == 6) return n.fromPromise(a.reduceAroundAt$6.apply(null, $));
};
a.reduceAheadAt = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.reduceAheadAt$2.apply(null, $));
	if ($len == 3) return n.fromPromise(a.reduceAheadAt$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.reduceAheadAt$4.apply(null, $));
	if ($len == 5) return n.fromPromise(a.reduceAheadAt$5.apply(null, $));
};
a.foldRight = (...$) => {
	const $len = $.length;
	if ($len == 3) return n.fromPromise(a.foldRight$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.foldRight$4.apply(null, $));
};
a.foldRightAt = (...$) => {
	const $len = $.length;
	if ($len == 3) return n.fromPromise(a.foldRightAt$3.apply(null, $));
	if ($len == 4) return n.fromPromise(a.foldRightAt$4.apply(null, $));
};
a.forEach = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.forEach$2.apply(null, $));
	if ($len == 3) return n.fromPromise(a.forEach$3.apply(null, $));
};
a.forEachAt = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.forEachAt$2.apply(null, $));
	if ($len == 4) return n.fromPromise(a.forEachAt$4.apply(null, $));
};
a.last = (...$) => {
	const $len = $.length;
	if ($len == 1) return n.fromPromise(a.last$1.apply(null, $));
};
a.pop = (...$) => {
	const $len = $.length;
	if ($len == 1) return n.fromPromise(a.pop$1.apply(null, $));
};
a.firstIndexOf = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.firstIndexOf$2.apply(null, $));
};
a.lastIndexOf = (...$) => {
	const $len = $.length;
	if ($len == 2) return n.fromPromise(a.lastIndexOf$2.apply(null, $));
};
module.exports = a