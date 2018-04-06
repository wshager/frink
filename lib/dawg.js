"use strict";

const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const dawg = {}; // http://lagua.nl/dawg;
//const console = require("console");
dawg.backtrack$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("path", $(1)),
	$("b", $(2)),
	await n.when(n.gt(array.size($("path")), 0)) ?
		($("entry", array.head($("path"))),
		await n.when(n.eq($("entry").call($, "_k"), $("b"))) ?
			($("entry").call($, "_v")) :
			(dawg.backtrack(array.tail($("path")), $("b")))) :
		(n.seq());
}));
dawg.traverse$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("ret", $(1)),
	$("word", $(2)),
	dawg.traverse($("ret"), $("word"), "", array.array());
}));
dawg.traverse$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("ret", $(1)),
	$("word", $(2)),
	$("b", $(3)),
	$("path", $(4)),
	(await n.when(n.empty($("ret"))) || await n.when((await n.when(n.instanceOf($("ret"), n.array(n.occurs(n.item(), n.zeroOrMore())))) && await n.when(n.eq(array.size($("ret")), 0))))) ?
		(n.seq()) :
		(await n.when(n.exists($("word"))) ?
			($("c", n.head($("word"))),
			$("b", n.concat($("b"), $("c"))),
			$("tmp", dawg.find($("ret"), $("c"), $("b"), $("path"))),
			$("ret", $("tmp").call($, 1)),
			$("path", $("tmp").call($, 2)),
			dawg.traverse($("ret"), n.tail($("word")), $("b"), $("path"))) :
			($("ret", await n.when(n.instanceOf($("ret"), n.array(n.occurs(n.item(), n.zeroOrMore())))) ?
				(await n.when(n.gt(array.size($("ret")), 0)) ?
					($("ret").call($, 1)) :
					(n.seq())) :
				($("ret"))),
			(await n.when(n.instanceOf($("ret"), n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())))) && await n.when(n.eq($("ret").call($, "_k"), $("b")))) ?
				($("ret").call($, "_v")) :
				($("entry", dawg.backtrack($("path"), $("b"))),
				await n.when(n.boolean($("entry"))) ?
					($("entry")) :
					(array.array($("ret"), $("path"))))));
}));
dawg.loop$6 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("entry", $(1)),
	$("ret", $(2)),
	$("cp", $(3)),
	$("word", $(4)),
	$("pos", $(5)),
	$("path", $(6)),
	await n.when(n.gt(array.size($("entry")), 0)) ?
		($("a", array.head($("entry"))),
		$("isEntry", map.contains($("a"), "_v")),
		await n.when(n.boolean($("isEntry"))) ?
			($("has", await n.when(n.boolean($("isEntry"))) ?
				(dawg.matchPos($("a"), $("pos"), $("cp"))) :
				(n.false())),
			$("path", await n.when(n.boolean($("has"))) ?
				($("len", array.size($("path"))),
				(await n.when(n.eq($("len"), 0)) || await n.when(n.ne($("path").call($, $("len")).call($, "_v"), $("a").call($, "_v")))) ?
					(array.append($("path"), $("a"))) :
					($("path"))) :
				($("path"))),
			$("ret", await n.when(n.boolean($("has"))) ?
				($("a")) :
				(array.filter($("path"), n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
					$ = n.frame($, this);
					return $("entry", $(1)),
					dawg.matchPos($("entry"), $("pos"), $("cp"));
				}).bind($))))),
			dawg.loop(array.tail($("entry")), $("ret"), $("cp"), $("word"), $("pos"), $("path"))) :
			(await n.when(map.contains($("a"), $("cp"))) ?
				(array.array($("a").call($, $("cp")), $("path"))) :
				(dawg.loop(array.tail($("entry")), $("ret"), $("cp"), $("word"), $("pos"), $("path"))))) :
		(array.array($("ret"), $("path")));
}));
dawg.matchPos$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("entry", $(1)),
	$("pos", $(2)),
	$("cp", $(3)),
	n.matches($("entry").call($, "_k"), n.concat("^.{", $("pos"), "}[", n.replace($("cp"), "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1"), "]"));
}));
dawg.matchWord$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("entry", $(1)),
	$("word", $(2)),
	n.matches($("entry").call($, "_k"), n.concat("^", n.replace($("word"), "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1")));
}));
dawg.find$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("entry", $(1)),
	$("cp", $(2)),
	$("word", $(3)),
	$("path", $(4)),
	$("pos", n.subtract(n.stringLength($("word")), 1)),
	await n.when(n.instanceOf($("entry"), n.array(n.occurs(n.item(), n.zeroOrMore())))) ?
		(dawg.loop($("entry"), $("entry"), $("cp"), $("word"), $("pos"), $("path"))) :
		(await n.when(map.contains($("entry"), "_v")) ?
			(await n.when(dawg.matchPos($("entry"), $("pos"), $("cp"))) ?
				($("len", array.size($("path"))),
				$("path", (await n.when(n.eq($("len"), 0)) || await n.when(n.ne($("path").call($, $("len")).call($, "_v"), $("entry").call($, "_v")))) ?
					(array.append($("path"), $("entry"))) :
					($("path"))),
				array.array($("entry"), $("path"))) :
				(array.array(array.filter($("path"), n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
					$ = n.frame($, this);
					return $("entry", $(1)),
					dawg.matchPos($("entry"), $("pos"), $("cp"));
				}).bind($))), array.array()))) :
			(array.array($("entry").call($, $("cp")), $("path"))));
}));
dawg.backtrack = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.backtrack", $len);
	if ($len == 2) return n.fromPromise(dawg.backtrack$2.apply(null, $));
};
dawg.traverse = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.traverse", $len);
	if ($len == 2) return n.fromPromise(dawg.traverse$2.apply(null, $));
	if(process.env.debug) global.console.log("dawg.traverse", $len);
	if ($len == 4) return n.fromPromise(dawg.traverse$4.apply(null, $));
};
dawg.loop = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.loop", $len);
	if ($len == 6) return n.fromPromise(dawg.loop$6.apply(null, $));
};
dawg.matchPos = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.matchPos", $len);
	if ($len == 3) return n.fromPromise(dawg.matchPos$3.apply(null, $));
};
dawg.matchWord = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.matchWord", $len);
	if ($len == 2) return n.fromPromise(dawg.matchWord$2.apply(null, $));
};
dawg.find = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("dawg.find", $len);
	if ($len == 4) return n.fromPromise(dawg.find$4.apply(null, $));
};
module.exports = dawg;
