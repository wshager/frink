"use strict";

const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const xqc = {}; // http://raddle.org/xquery-compat;
const console = require("./console");
const a = require("../lib/array-util.js");
const dawg = require("../lib/dawg.js");
/*
semicolon = 0
open = 1
close = 2
comma = 3
reserved = 4 (known operator)
var = 5 ($qname)
qname = 6
string = 7
number = 8
comment = 9
$ = 10
xml = 11
attrkey = 12
dot = 13
unknown = 14
 */
xqc.ncform = ("\\p{L}\\p{N}\\-_");
xqc.ncname = (n.concat("^[", (xqc.ncform), "]"));
xqc.qform = (n.concat("[", (xqc.ncform), ":]+"));
xqc.qname = (n.concat("^", (xqc.qform), "(#\\p{N}+)?$"));
xqc.chars = (map.map(n.pair("(", 1), n.pair(")", 2), n.pair("{", 3), n.pair("}", 4), n.pair("[", 2001), n.pair("]", 2002), n.pair(",", 100), n.pair(">", 505), n.pair("<", 507), n.pair("=", 509), n.pair(";", 5), n.pair(":", 2600), n.pair("/", 1901), n.pair("!", 1800), n.pair("?", 2003), n.pair("*", 904), n.pair(".", 8), n.pair("$", 9), n.pair("#", 14), n.pair("+", 802), n.pair("\"", 6), n.pair("'", 7)));
xqc.operators = n.typed(n.map(n.integer(), n.string()), map.map(n.pair(1, "("), n.pair(2, ")"), n.pair(3, "{"), n.pair(4, "}"), n.pair(5, ";"), n.pair(6, "\""), n.pair(7, "'"), n.pair(8, "."), n.pair(9, "$"), n.pair(14, "#"), n.pair(100, ","), n.pair(200, "satisfies"), n.pair(201, "some"), n.pair(202, "every"), n.pair(203, "switch"), n.pair(204, "typeswitch"), n.pair(205, "try"), n.pair(206, "if"), n.pair(207, "then"), n.pair(208, "else"), n.pair(209, "let"), n.pair(210, ":="), n.pair(211, "return"), n.pair(212, "case"), n.pair(213, "default"), n.pair(214, "xquery"), n.pair(215, "version"), n.pair(216, "module"), n.pair(217, "declare"), n.pair(218, "variable"), n.pair(219, "import"), n.pair(220, "at"), n.pair(221, "for"), n.pair(222, "in"), n.pair(223, "where"), n.pair(224, "order-by"), n.pair(225, "group-by"), n.pair(300, "or"), n.pair(400, "and") /* eq, ne, lt, le, gt, ge, =, !=, <, <=, >, >=, is, <<, >> */ , n.pair(501, ">>"), n.pair(502, "<<"), n.pair(503, "is"), n.pair(504, ">="), n.pair(505, ">"), n.pair(506, "<="), n.pair(507, "<"), n.pair(508, "!="), n.pair(509, "="), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "||"), n.pair(700, "to"), n.pair(801, "-"), n.pair(802, "+"), n.pair(901, "mod"), n.pair(902, "idiv"), n.pair(903, "div"), n.pair(904, "*"), n.pair(1001, "union"), n.pair(1002, "|"), n.pair(1101, "intersect"), n.pair(1102, "except"), n.pair(1200, "instance-of"), n.pair(1300, "treat-as"), n.pair(1400, "castable-as"), n.pair(1500, "cast-as"), n.pair(1600, "=>"), n.pair(1701, "+"), n.pair(1702, "-"), n.pair(1800, "!"), n.pair(1901, "/"), n.pair(1902, "//"), n.pair(2001, "["), n.pair(2002, "]"), n.pair(2003, "?"), n.pair(2101, "array"), n.pair(2102, "attribute"), n.pair(2103, "comment"), n.pair(2104, "document"), n.pair(2105, "element"), n.pair(2106, "function"), n.pair(2107, "map"), n.pair(2108, "namespace"), n.pair(2109, "processing-instruction"), n.pair(2110, "text"), n.pair(2201, "array"), n.pair(2202, "attribute"), n.pair(2203, "comment"), n.pair(2204, "document-node"), n.pair(2205, "element"), n.pair(2206, "function"), n.pair(2207, "map"), n.pair(2208, "namespace-node"), n.pair(2209, "processing-instruction"), n.pair(2210, "text"), n.pair(2211, "empty-sequence"), n.pair(2212, "item"), n.pair(2213, "node"), n.pair(2214, "schema-attribute"), n.pair(2215, "schema-element"), n.pair(2400, "as"), n.pair(2501, "(:"), n.pair(2502, ":)"), n.pair(2600, ":")));
xqc.constructors = (map.map(n.pair(2101, "l"), n.pair(2102, "a"), n.pair(2103, "c"), n.pair(2104, "d"), n.pair(2105, "e"), n.pair(2106, "q"), n.pair(2107, "m"), n.pair(2108, "s"), n.pair(2109, "p"), n.pair(2110, "x")));
xqc.occurrence = (map.map(n.pair(2003, "zero-or-one"), n.pair(904, "zero-or-more"), n.pair(802, "one-or-more")));
xqc.types = (n.seq("anyAtomicType", "untypedAtomic", "dateTime", "dateTimeStamp", "date", "time", "duration", "yearMonthDuration", "dayTimeDuration", "float", "double", "decimal", "integer", "nonPositiveInteger", "negativeInteger", "long", "int", "short", "byte", "nonNegativeInteger", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte", "positiveInteger", "gYearMonth", "gYear", "gMonthDay", "gDay", "gMonth", "string", "normalizedString", "token", "language", "NMTOKEN", "Name", "NCName", "ID", "IDREF", "ENTITY", "boolean", "base64Binary", "hexBinary", "anyURI", "QName", "NOTATION"));
xqc.operatorMap = n.typed(n.map(n.integer(), n.string()), map.map(n.pair(206, "if"), n.pair(209, "item"), n.pair(501, "precedes"), n.pair(502, "follows"), n.pair(503, "is"), n.pair(504, "gge"), n.pair(505, "ggt"), n.pair(506, "gle"), n.pair(507, "glt"), n.pair(508, "gne"), n.pair(509, "geq"), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "concat"), n.pair(801, "subtract"), n.pair(802, "add"), n.pair(904, "multiply"), n.pair(1002, "union"), n.pair(1701, "plus"), n.pair(1702, "minus"), n.pair(1800, "x-for-each"), n.pair(1901, "select"), n.pair(1902, "select-deep"), n.pair(2001, "x-filter"), n.pair(2003, "lookup"), n.pair(2004, "array:array"), n.pair(2600, "pair"), n.pair(2501, "comment"), n.pair(2107, "map:map")));
xqc.operatorTrie = (n.jsonDoc("./operator-trie.json"));
/* TODO detect these functions and fix them... */
xqc.cxf0 = (n.seq("base-uri", "data", "document-uri", "has-children", "last", "local-name", "name", "namespace-uri", "nilled", "node-name", "normalize-space", "number", "path", "position", "root", "string", "string-length", "generate-id"));
xqc.cxf1 = (n.seq("element-with-id", "id", "idref", "lang"));
xqc.uriChars = (map.map(n.pair("%3E", ">"), n.pair("%3C", "<"), n.pair("%2C", ","), n.pair("%3A", ":")));
xqc.detectCxf$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("sub", $(1)),
		a.foldLeftAt($("sub"), array.array(), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($, this);
			return $("acc", $(1)),
				$("x", $(2)),
				$("at", $(3)),
				(await n.when(n.eq($("x").call($, "t"), 6)) && await n.when(n.geq($("x").call($, "v"), (xqc.cxf0)))) ?
				($("dotless", await n.when(n.eq($("sub").call($, n.add($("at"), 1)).call($, "t"), 1)) && await n.when(n.eq($("sub").call($, n.add($("at"), 2)).call($, "t"), 2))),
					$("dot", await n.when(n.eq($("dotless"), n.false())) && await n.when(n.eq($("sub").call($, n.add($("at"), 2)).call($, "t"), 14))),
					(await n.when($("dotless")) || await n.when($("dot"))) ?
					(array.append($("acc"), map.map(n.pair("qname", $("x").call($, "v")), n.pair("at", $("at")), n.pair("dotless", $("dotless"))))) :
					($("acc"))) :
				($("acc"))
		}).bind($)))
}));
xqc.replaceDotless$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("r", $(1)),
		$("offset", $(2)),
		$("cxfs", $(3)),
		a.foldRightAt($("cxfs"), $("r"), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
			$ = n.frame($, this);
			return $("r", $(1)),
				$("cxf", $(2)),
				$("at", $(3)),
				await n.when(n.boolean($("cxf").call($, "dotless"))) ?
				($("i", n.add($("cxf").call($, "at"), $("offset"))),
					$("ref", $("r").call($, $("i"))),
					array.insertBefore($("r"), n.add($("i"), 2), xqc.tpl(13, n.add($("ref").call($, "d"), 1), "."))) :
				($("r"))
		}).bind($)))
}));
xqc.isQname$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("b", $(1)),
		/*    every $s in $b satisfies matches($s,$xqc:qform)*/
		/*    fold-left($b,true(),function($acc,$s) {*/ /*        $acc and matches($s,$xqc:qform)*/ /*    })*/ n.matches(n.stringJoin($("b")), (xqc.qname))
}));
xqc.inspectBuf$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("s", $(1)),
		$("type", $(2)),
		$("next", $(3)),
		await n.when(n.empty($("s"))) ?
		(n.seq()) :
		($("ret", dawg.traverse((xqc.operatorTrie), $("s"))),
			(await n.when(n.empty($("ret"))) || await n.when(n.instanceOf($("ret"), n.array(n.occurs(n.item(), n.zeroOrMore()))))) ?
			(await n.when(xqc.isQname($("s"))) ?
				(map.map(n.pair("t", 6), n.pair("v", n.stringJoin($("s"))))) :
				(await n.when(n.eq(n.xFilter($("s"), (async function(...$) {
						$ = n.frame($, this);
						return n.geq(n.position($(1)), 1)
					}).bind($)), "$")) ?
					(map.map(n.pair("t", 5), n.pair("v", n.stringJoin($("s"))))) :
					(await n.when(n.eq(n.xFilter($("s"), (async function(...$) {
							$ = n.frame($, this);
							return n.geq(n.position($(1)), 1)
						}).bind($)), "\"")) ?
						(map.map(n.pair("t", 7), n.pair("v", n.stringJoin($("s"))))) :
						(map.map(n.pair("t", 14), n.pair("v", $("s"))))))) :
			( /* FIXME a lot to fix here... next may be whitespace, anon detect is a hack  */ $("ret", (await n.when(n.gt($("ret"), 2100)) && await n.when(n.lt($("ret"), 2200))) ?
					((await n.when(n.eq($("type"), 1)) || await n.when(n.eq($("next"), "("))) ?
						((await n.when(n.eq($("ret"), 2106)) && await n.when(n.geq($("next"), n.seq(")", "$")))) ?
							($("ret")) :
							(n.add($("ret"), 100))) :
						($("ret"))) :
					($("ret"))),
				map.map(n.pair("t", 4), n.pair("v", $("ret")))))
}));
xqc.incr$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("a", $(1)),
		array.forEach($("a"), n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
			$ = n.frame($, this);
			return $("entry", $(1)),
				map.put($("entry"), "d", n.add(map.get($("entry"), "d"), 1))
		}).bind($)))
}));
xqc.tpl$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("t", $(1)),
		$("d", $(2)),
		$("v", $(3)),
		map.map(n.pair("t", $("t")), n.pair("d", $("d")), n.pair("v", $("v")))
}));
xqc.opName$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("v", $(1)),
		await n.when(map.contains((xqc.operatorMap), $("v"))) ?
		((xqc.operatorMap).call($, $("v"))) :
		((xqc.operators).call($, $("v")))
}));
xqc.guardedGet$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("r", $(1)),
		$("size", $(2)),
		await n.when(n.gt($("size"), 0)) ?
		($("last", $("r").call($, $("size"))),
			await n.when(n.empty($("last"))) ?
			(map.map()) :
			((await n.when(n.eq($("last").call($, "t"), 9)) && await n.when(n.gt($("size"), 0))) ?
				(xqc.guardedGet($("r"), n.subtract($("size"), 1))) :
				($("last")))) :
		(map.map())
}));
xqc.unwrap$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("cur", $(1)),
		$("tmp", $(2)),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p") /* TODO cleanup (e.g. separate is-close and is-op), apply for all cases */ ),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasTypesig", await n.when(n.eq($("ocur").call($, "t"), 4)) && await n.when(n.eq($("ocur").call($, "v"), 2400))),
		$("o", await n.when(n.boolean($("hasTypesig"))) ?
			(a.pop($("o"))) :
			($("o"))),
		$("osize", await n.when(n.boolean($("hasTypesig"))) ?
			(array.size($("o"))) :
			($("osize"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("size", array.size($("r"))),
		$("ot", $("ocur").call($, "t")),
		$("ov", $("ocur").call($, "v")),
		$("hasOp", n.eq($("ot"), 4)),
		$("t", $("cur").call($, "t")),
		$("v", $("cur").call($, "v")),
		$("type", await n.when(n.eq($("t"), 1)) ?
			(await n.when(n.eq($("v"), 1)) ?
				(1) :
				(await n.when(n.eq($("v"), 3)) ?
					(3) :
					(await n.when(n.eq($("v"), 2001)) ?
						(2001) :
						(n.seq())))) :
			(await n.when(n.eq($("t"), 2)) ?
				(await n.when(n.eq($("v"), 2)) ?
					(2) :
					(await n.when(n.eq($("v"), 4)) ?
						(4) :
						(await n.when(n.eq($("v"), 2002)) ?
							(2002) :
							(n.seq())))) :
				(await n.when(n.eq($("t"), 4)) ?
					($("v")) :
					(n.seq())))),
		$("isClose", n.eq($("t"), 2)),
		$("isLet", n.eq($("type"), 209)),
		$("isBody", await n.when(await n.when(n.eq($("type"), 4)) && await n.when($("hasOp"))) && await n.when(n.eq($("ov"), 3106))),
		$("has", await n.when(n.eq($("ot"), 1)) ?
			(await n.when(n.eq($("ov"), 1)) ?
				(1) :
				(await n.when(n.eq($("ov"), 3)) ?
					(3) :
					(await n.when(n.eq($("ov"), 2001)) ?
						(2001) :
						(await n.when(n.eq($("ov"), 2004)) ?
							(2004) :
							(n.seq()))))) :
			(await n.when(n.eq($("ot"), 11)) ?
				($("ot") /* direct-elem-constr */ ) :
				(await n.when(n.boolean($("hasOp"))) ?
					(await n.when(n.eq($("ov"), 210)) ?
						(await n.when(n.geq($("type"), n.seq(209, 211))) ?
							($("ov")) :
							(n.seq())) :
						((await n.when(n.gt($("ov"), 2100)) && await n.when(n.lt($("ov"), 2200))) ?
							(2100) :
							((await n.when(n.eq($("type"), 4)) && await n.when((await n.when(n.gt($("ov"), 3000)) && await n.when(n.lt($("ov"), 3100))))) ?
								(2200 /* some constructor */ ) :
								((await n.when((await n.when(n.eq($("type"), 2)) || await n.when(n.eq($("t"), 3)))) && await n.when(n.eq($("ov"), 3006))) ?
									(3006 /* params */ ) :
									((await n.when(n.eq($("type"), 6)) && await n.when(n.geq($("ov"), n.seq(2001, 2004)))) ?
										(4000 /* array / filter */ ) :
										(await n.when(n.eq($("ov"), 211)) ?
											(await n.when(n.eq($("type"), 209)) ?
												(211) :
												(231 /* flwor return */ )) :
											(await n.when(n.geq($("ov"), n.seq(207, 208, 221, 222, 223, 224, 225, 1200, 2600, 2400))) ?
												(
													/*
													 * 207 = then
													 * 208 = else
													 * 221 = xfor
													 * 2600 = tuple
													 * 2400 = typesig
													 */
													$("ov")) :
												(n.seq())))))))) :
					(n.seq() /* TODO only is let if at same depth! */ )))),
		$("isX", await n.when($("hasOp")) && await n.when(n.geq($("type"), n.seq(222, 223, 224, 225)))),
		$("closeParams", await n.when(n.eq($("type"), 2)) && await n.when(n.eq($("has"), 3006))),
		$("hasAss", n.eq($("has"), 210)),
		$("hasXfor", n.eq($("has"), 221)),
		$("hasX", n.geq($("has"), n.seq(222, 223, 224, 225))),
		$("isXlet", await n.when($("isLet")) && await n.when($("hasX") /* closing a constructor is always detected, because the opening bracket is never added to openers for constructors */ )),
		$("hasConstr", n.eq($("has"), 2200)),
		$("hasConstrType", n.eq($("has"), 2100 /* has-params means theres no type-sig to close */ )),
		$("hasParam", await n.when(n.eq($("hasTypesig"), n.false())) && await n.when(n.eq($("has"), 3006))),
		$("hasXret", n.eq($("has"), 231)),
		$("pass", await n.when(n.eq($("type"), 209)) && await n.when((await n.when(n.eq($("has"), 207)) || await n.when(await n.when(n.eq($("hasOp"), n.false())) || await n.when(await n.when(n.eq($("ov"), 3106)) || await n.when(n.eq($("has"), 211))))))),
		$("pass", await n.when($("pass")) || await n.when(await n.when(await n.when(n.eq($("type"), 210)) || await n.when((await n.when(n.eq($("t"), 3)) && await n.when(n.eq($("has"), 1))))) || await n.when(n.eq($("osize"), 0)))),
		$("hasAf", n.eq($("has"), 4000)),
		$("hasXass", await n.when($("hasOp")) && await n.when(await n.when(n.eq($("ov"), 210)) && await n.when((await n.when($("isX")) || await n.when((await n.when($("hasAss")) && await n.when(await n.when(n.gt($("osize"), 1)) && await n.when(await n.when(n.eq($("o").call($, n.subtract($("osize"), 1)).call($, "t"), 4)) && await n.when(n.geq($("o").call($, n.subtract($("osize"), 1)).call($, "v"), n.seq(222, 223, 224, 225))))))))))),
		$("isXret", await n.when(n.eq($("type"), 211)) && await n.when((await n.when($("hasX")) || await n.when($("hasXass"))) /* just some operators to close */ )),
		$("hasTuple", await n.when(n.eq($("t"), 3)) && await n.when(n.geq($("has"), 2600))),
		$("matching", (await n.when(await n.when((await n.when(n.eq($("type"), 4)) && await n.when(n.eq($("has"), 3)))) || await n.when((await n.when(n.eq($("type"), 2)) && await n.when(n.eq($("has"), 1))))) || await n.when((await n.when(n.eq($("type"), 2002)) && await n.when(n.geq($("has"), n.seq(2001, 2004))))))),
		$("closeThen", await n.when(n.eq($("type"), 208)) && await n.when(n.eq($("has"), 207 /* else adds a closing bracket */ ))),
		$("isLetInElse", await n.when(n.eq($("has"), 208)) && await n.when(await n.when(n.eq($("isLet"), n.true())) && await n.when(n.eq(xqc.guardedGet($("r"), $("size")).call($, "t"), 1)))),
		$("r", (await n.when(n.eq($("has"), 208)) && await n.when(n.eq($("isLetInElse"), n.false()))) ?
			(array.append($("r"), xqc.tpl(2, $("d"), 4))) :
			((await n.when($("matching")) && await n.when(n.eq($("has"), 2001))) ?
				($("index", $("i").call($, $("d"))),
					$("sub", array.subarray($("r"), $("index"))),
					$("cxfs", xqc.detectCxf($("sub")) /*            let $nu := console:log($cxfs)*/ ),
					$("flat", array.flatten(array.forEach($("cxfs"), n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
						$ = n.frame($, this);
						return $("x", $(1)),
							$("x").call($, "qname")
					}).bind($))))),
					$("hasCxf", await n.when(n.exists($("flat"))) && await n.when(n.not(await n.when(n.geq($("flat"), "last")) && await n.when(n.eq(array.size($("sub")), 3))))),
					await n.when(n.boolean($("hasCxf"))) ?
					(xqc.replaceDotless($("r"), n.subtract($("index"), 1), $("cxfs"))) :
					(array.join(n.seq(array.subarray($("r"), 1, n.subtract($("index"), 1)), array.array(xqc.tpl(4, $("d"), "geq"), xqc.tpl(1, $("d"), 1), xqc.tpl(6, $("d"), "position"), xqc.tpl(1, $("d"), 1), xqc.tpl(13, $("d"), "."), xqc.tpl(2, $("d"), 2), xqc.tpl(3, $("d"), ",")), xqc.replaceDotless(array.subarray($("r"), $("index")), 0, $("cxfs")), array.array(xqc.tpl(2, $("d"), 2)))))) :
				($("r")))),
		$("d", (await n.when(n.eq($("has"), 208)) && await n.when($("isLetInElse"))) ?
			(n.subtract($("d"), 1)) :
			($("d"))),
		(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(n.eq($("osize"), 0)) || await n.when($("pass"))) || await n.when($("hasAss"))) || await n.when($("isBody"))) || await n.when($("isLetInElse"))) || await n.when($("hasTypesig"))) || await n.when($("hasParam"))) || await n.when($("hasAf"))) || await n.when($("matching"))) || await n.when($("closeThen"))) || await n.when($("isXret"))) || await n.when($("hasXret"))) || await n.when($("isX"))) || await n.when($("hasX"))) || await n.when($("hasXfor"))) || await n.when($("hasConstr"))) || await n.when($("hasTuple"))) || await n.when(n.eq($("has"), 11))) ?
		( /*            let $nu := console:log("stop")*/ $("tpl", (await n.when($("hasX")) || await n.when($("hasXass"))) ?
				(n.seq(xqc.tpl(1, $("d"), 4), xqc.tpl(2, n.subtract($("d"), 1), 2), xqc.tpl(3, n.subtract($("d"), 2), ","))) :
				(n.seq())),
			$("d", (await n.when($("hasX")) || await n.when($("hasXass"))) ?
				(n.subtract($("d"), 2)) :
				($("d"))),
			$("tpl", await n.when(n.boolean($("hasTuple"))) ?
				(xqc.tpl(2, $("d"), 2)) :
				(await n.when(n.boolean($("hasParam"))) ?
					(n.seq(xqc.tpl(4, $("d"), "item"), xqc.tpl(1, $("d"), 1), xqc.tpl(2, $("d"), 2), $("cur"))) :
					((await n.when(await n.when($("isXret")) || await n.when($("isX"))) || await n.when($("isXlet"))) ?
						($("tpl", n.seq($("tpl"), xqc.tpl(4, $("d"), (xqc.operators).call($, $("v"))), xqc.tpl(1, $("d"), 1), xqc.tpl(1, n.add($("d"), 1), 3))),
							$("d", n.add($("d"), 2)),
							await n.when(n.eq($("v"), 222)) ?
							($("tpl")) :
							(a.foldLeftAt($("p"), $("tpl"), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
								$ = n.frame($, this);
								return $("pre", $(1)),
									$("cur", $(2)),
									$("i", $(3)),
									n.seq($("pre"), xqc.tpl(10, $("d"), "$"), xqc.tpl(1, $("d"), 1), xqc.tpl(4, n.add($("d"), 1), $("cur")), xqc.tpl(3, n.add($("d"), 1), ","), xqc.tpl(4, n.add($("d"), 1), "$"), xqc.tpl(1, n.add($("d"), 1), 1), xqc.tpl(8, n.add($("d"), 2), $("i")), xqc.tpl(2, n.add($("d"), 1), 2), xqc.tpl(2, $("d"), 2), (await n.when($("isLet")) || await n.when(n.eq($("type"), 225))) ?
										(n.seq()) :
										(xqc.tpl(3, $("d"), ",")))
							}).bind($))))) :
						(await n.when(n.boolean($("hasXret"))) ?
							(n.seq(xqc.tpl(2, $("d"), 4), xqc.tpl(2, n.subtract($("d"), 1), 2), xqc.tpl(2, n.subtract($("d"), 2), 2))) :
							((await n.when($("isX")) && await n.when($("hasX"))) ?
								(n.seq($("tpl"), xqc.tpl(3, $("d"), ","))) :
								((await n.when($("matching")) && await n.when(n.eq($("ov"), 2001))) ?
									( /* TODO detect context-functions */ n.seq(xqc.tpl($("t"), $("d"), 4), xqc.tpl($("t"), n.subtract($("d"), 1), 2))) :
									((await n.when($("isBody")) || await n.when($("hasConstr"))) ?
										(n.seq(xqc.tpl($("t"), $("d"), $("v")), xqc.tpl($("t"), n.subtract($("d"), 1), 2))) :
										((await n.when($("hasAf")) || await n.when($("isClose"))) ?
											($("closeCurly", await n.when(n.eq($("has"), 3)) ?
													(await n.when(n.gt($("osize"), 1)) ?
														(n.ne($("o").call($, n.subtract($("osize"), 1)).call($, "t"), 4)) :
														(n.true())) :
													(n.false())),
												xqc.tpl($("t"), $("d"), await n.when(n.boolean($("closeCurly"))) ?
													($("v")) :
													(2))) :
											((await n.when(await n.when($("pass")) || await n.when($("closeThen"))) || await n.when($("hasXfor"))) ?
												(n.seq()) :
												(await n.when(n.boolean($("hasAss"))) ?
													((await n.when($("isLet")) && await n.when(n.eq(xqc.guardedGet($("r"), $("size")).call($, "t"), 3))) ?
														(n.seq()) :
														(n.seq(xqc.tpl(2, $("d"), 2), xqc.tpl(3, n.subtract($("d"), 1), ",")))) :
													(await n.when(n.boolean($("isLet"))) ?
														(n.seq()) :
														(xqc.tpl($("t"), $("d"), $("v")) /*            let $nu := if($is-let) then console:log($tpl) else ()*/ )))))))))))),
			$("o", (await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when(await n.when($("hasParam")) || await n.when($("hasConstr"))) || await n.when((await n.when($("hasAss")) && await n.when(n.ne(xqc.guardedGet($("r"), $("size")).call($, "t"), 3))))) || await n.when($("isBody"))) || await n.when($("hasAf"))) || await n.when($("matching"))) || await n.when($("closeThen"))) || await n.when($("isXret"))) || await n.when($("isX"))) || await n.when($("hasTuple"))) ?
				(a.pop($("o"))) :
				($("o"))),
			$("o", await n.when(n.boolean($("closeParams"))) ?
				(array.append($("o"), xqc.tpl(4, $("d"), 3106))) :
				((await n.when($("isXret")) || await n.when($("isX"))) ?
					(array.append($("o"), xqc.tpl($("t"), $("d"), $("v")))) :
					($("o")))),
			$("tmp", map.put($("tmp"), "r", await n.when(n.exists($("tpl"))) ?
				(n.foldLeft($("tpl"), $("r"), array.append)) :
				($("r")))),
			$("tmp", map.put($("tmp"), "d", (await n.when(await n.when(await n.when($("isBody")) || await n.when($("hasXret"))) || await n.when($("hasConstr"))) || await n.when((await n.when($("matching")) && await n.when(n.eq($("ov"), 2001))))) ?
				(n.subtract($("d"), 2)) :
				(await n.when(n.boolean($("isXret"))) ?
					(n.add($("d"), 1)) :
					((await n.when($("isX")) || await n.when($("isXlet"))) ?
						(n.add($("d"), 2)) :
						((await n.when(await n.when(await n.when(await n.when($("hasAss")) || await n.when($("hasParam"))) || await n.when($("hasAf"))) || await n.when($("matching"))) || await n.when($("hasTuple"))) ?
							(n.subtract($("d"), 1)) :
							($("d"))))))),
			$("tmp", map.put($("tmp"), "o", $("o"))),
			$("tmp", map.put($("tmp"), "i", await n.when(n.boolean($("pass"))) ?
				($("i")) :
				(map.put($("i"), $("d"), array.size($("r")))))),
			map.put($("tmp"), "p", await n.when(n.boolean($("hasXret"))) ?
				(array.array()) :
				($("p")))) :
		( /*            let $nu := console:log("auto")*/ $("r", (await n.when($("hasOp")) && await n.when((await n.when(n.gt($("ov"), 3000)) || await n.when($("hasConstrType"))))) ?
				($("r")) :
				(array.append($("r"), xqc.tpl(2, $("d"), 2)))),
			$("tmp", map.put($("tmp"), "r", $("r"))),
			$("tmp", map.put($("tmp"), "d", (await n.when($("hasOp")) && await n.when((await n.when(n.gt($("ov"), 3000)) || await n.when($("hasConstrType"))))) ?
				($("d")) :
				(n.subtract($("d"), 1)))),
			$("tmp", map.put($("tmp"), "o", a.pop($("o")))),
			$("tmp", map.put($("tmp"), "i", map.put($("i"), $("d"), array.size($("r"))))),
			$("tmp", map.put($("tmp"), "p", $("p"))),
			xqc.unwrap($("cur"), $("tmp")))
}));
xqc.rtp$6 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		$("r", $(2)),
		$("d", $(3)),
		$("o", $(4)),
		$("i", $(5)),
		$("p", $(6)),
		xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), n.seq())
}));
xqc.rtp$7 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		$("r", $(2)),
		$("d", $(3)),
		$("o", $(4)),
		$("i", $(5)),
		$("p", $(6)),
		$("tpl", $(7)),
		xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"), n.false())
}));
xqc.rtp$8 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		$("r", $(2)),
		$("d", $(3)),
		$("o", $(4)),
		$("i", $(5)),
		$("p", $(6)),
		$("tpl", $(7)),
		$("removeOp", $(8)),
		xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"), $("removeOp"), n.seq())
}));
xqc.rtp$9 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		$("r", $(2)),
		$("d", $(3)),
		$("o", $(4)),
		$("i", $(5)),
		$("p", $(6)),
		$("tpl", $(7)),
		$("removeOp", $(8)),
		$("newOp", $(9)),
		xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"), $("removeOp"), $("newOp"), n.seq())
}));
xqc.rtp$10 = n.typed(n.function(n.seq(n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.integer(), n.array(n.occurs(n.item(), n.zeroOrMore())), n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.zeroOrMore()), n.occurs(n.boolean(), n.zeroOrOne()), n.occurs(n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.zeroOrOne()), n.occurs(n.string(), n.zeroOrOne())), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		$("r", $(2)),
		$("d", $(3)),
		$("o", $(4)),
		$("i", $(5)),
		$("p", $(6)),
		$("tpl", $(7)),
		$("removeOp", $(8)),
		$("newOp", $(9)),
		$("param", $(10)),
		$("o", await n.when(n.boolean($("removeOp"))) ?
			(a.pop($("o"))) :
			($("o"))),
		$("tmp", map.put($("tmp"), "r", await n.when(n.exists($("tpl"))) ?
			(n.foldLeft($("tpl"), $("r"), array.append)) :
			($("r")))),
		$("tmp", map.put($("tmp"), "d", $("d"))),
		$("tmp", map.put($("tmp"), "o", await n.when(n.exists($("newOp"))) ?
			(array.append($("o"), $("newOp"))) :
			($("o")))),
		$("tmp", map.put($("tmp"), "i", await n.when(n.exists($("tpl"))) ?
			(map.put($("i"), n.xFilter($("tpl"), (async function(...$) {
				$ = n.frame($, this);
				return n.geq(n.position($(1)), 1)
			}).bind($)).call($, "d"), n.add(array.size($("r")), 1))) :
			($("i")))),
		map.put($("tmp"), "p", await n.when(n.boolean($("param"))) ?
			(array.append($("p"), $("param"))) :
			($("p")))
}));
xqc.binOp$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("t", $(1)),
		$("v", $(2)),
		$("tmp", $(3)),
		$("ocur", $(4)),
		$("hasPreOp", $(5)),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p") /* preceding means the current operator has lower precedence (default is higher)... */ /* we make an exception when current is filter and preceding is select */ ),
		$("precedingOp", (await n.when($("hasPreOp")) && await n.when($("ocur").call($, "v"))) ?
			((await n.when(n.eq($("ocur").call($, "v"), 1901)) && await n.when(n.eq($("v"), 2001))) ?
				(n.true()) :
				(n.ge($("ocur").call($, "v"), $("v")))) :
			(n.false() /*    let $nu := console:log(("bin-op: ",$v,", ocur: ",$ocur,", prec: ",$preceding-op,", d: ",$d,", i: ", $i))*/ /* if preceding, lower depth, as to take the previous index */ /* furthermore, close directly and remove the operator */ )),
		$("d", await n.when(n.boolean($("precedingOp"))) ?
			(n.subtract($("d"), 1)) :
			($("d"))),
		$("split", await n.when(map.contains($("i"), $("d"))) ?
			($("i").call($, $("d"))) :
			(1 /*  let $nu := console:log($split)*/ /*  let $split := if($r($split)("t") eq 1) then $split - 1 else $split*/ )),
		$("left" /*      if($v eq 1901 and $has-op and $ocur("v") eq 1901) then*/ /*          []*/ /*      else */ , await n.when(n.boolean($("precedingOp"))) ?
			(array.append(xqc.incr(array.subarray($("r"), $("split"))), xqc.tpl(2, n.add($("d"), 1), 2))) :
			(xqc.incr(array.subarray($("r"), $("split"))))),
		$("o", await n.when(n.boolean($("precedingOp"))) ?
			(array.remove($("o"), array.size($("o")))) :
			($("o"))),
		$("size", array.size($("r"))),
		$("r", array.append(array.subarray($("r"), 1, n.subtract($("split"), 1)), xqc.tpl(4, $("d"), xqc.opName($("v"))))),
		$("i", await n.when(n.boolean($("precedingOp"))) ?
			(map.put($("i"), $("d"), $("split"))) :
			(map.put($("i"), $("d"), array.size($("r"))) /* up depth by 1 to leave $i updated */ )),
		$("tpl", n.seq(xqc.tpl(1, n.add($("d"), 1), 1), array.flatten($("left")), xqc.tpl(3, n.add($("d"), 1), ","))),
		await n.when(n.eq($("v"), 2001)) ?
		(xqc.rtp($("tmp"), $("r"), n.add($("d"), 2), $("o"), $("i"), $("p"), n.seq($("tpl"), xqc.tpl(1, n.add($("d"), 1), 3)), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
		(xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), $("tpl"), n.seq(), xqc.tpl($("t"), $("d"), $("v"))))
}));
xqc.processOpen$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("v", $(1)),
		$("tmp", $(2)),
		$("t", 1),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p")),
		$("size", array.size($("r"))),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasOp", n.eq($("ocur").call($, "t"), 4)),
		$("hasPreOp", await n.when($("hasOp")) && await n.when(await n.when(n.gge($("ocur").call($, "v"), 300)) && await n.when(n.glt($("ocur").call($, "v"), 2100)))),
		await n.when(n.eq($("v"), 2001)) ?
		($("cur", xqc.tpl($("t"), $("d"), $("v")) /* TODO pull in right-side if filter, except when select */ ),
			$("hasSelect", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 1901))),
			$("it", (await n.when(n.eq($("size"), 0)) || await n.when((await n.when(n.geq(xqc.guardedGet($("r"), $("size")).call($, "t"), n.seq(1, 3, 6))) && await n.when(n.eq($("hasSelect"), n.false()))))) ?
				(2004) :
				(2001)),
			await n.when(n.eq($("it"), 2001)) ?
			(xqc.binOp(1, $("it"), $("tmp"), $("ocur"), $("hasPreOp"))) :
			( /*                    let $tpl :=*/ /*                        if($it eq 2001) then*/ /*                            if($has-select) then*/ /*                                (xqc:tpl(3,$d,","),$cur,xqc:tpl(1,$d,1))*/ /*                            else*/ /*                                xqc:tpl(3,$d,",")*/ /*                        else*/ xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl(4, $("d"), xqc.opName($("it"))), xqc.tpl(1, $("d"), 1)), n.false(), xqc.tpl(1, $("d"), $("it"))))) :
		(await n.when(n.eq($("v"), 3)) ?
			($("hasRettype", await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), 2400))),
				$("o", await n.when(n.boolean($("hasRettype"))) ?
					(array.remove($("o"), $("osize"))) :
					($("o"))),
				$("ocur", await n.when(n.boolean($("hasRettype"))) ?
					($("o").call($, n.subtract($("osize"), 1))) :
					($("ocur"))),
				$("hasParams", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 3106 /* dont treat function as constructor here */ ))),
				$("hasConstrType", await n.when(await n.when(n.eq($("hasParams"), n.false())) && await n.when($("hasOp"))) && await n.when(await n.when(n.gt($("ocur").call($, "v"), 3000)) && await n.when(n.lt($("ocur").call($, "v"), 3100 /*                let $nu := console:log(($d,", has-params: ",$has-params,", has-rettype: ",$has-rettype))*/ )))),
				$("cur", xqc.tpl($("t"), $("d"), $("v"))),
				$("tpl", await n.when(n.boolean($("hasParams"))) ?
					($("tpl", await n.when(n.boolean($("hasRettype"))) ?
							(xqc.tpl(2, $("d"), 2)) :
							(n.seq(xqc.tpl(3, $("d"), ","), xqc.tpl(4, $("d"), "item"), xqc.tpl(1, $("d"), 1), xqc.tpl(2, $("d"), 2), xqc.tpl(2, $("d"), 2)))),
						a.foldLeftAt($("p"), n.seq($("tpl"), xqc.tpl(3, n.subtract($("d"), 1), ","), $("cur")), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), (async function(...$) {
							$ = n.frame($, this);
							return $("pre", $(1)),
								$("cur", $(2)),
								$("i", $(3)),
								n.seq($("pre"), xqc.tpl(10, $("d"), "$"), xqc.tpl(1, $("d"), 1), xqc.tpl(5, n.add($("d"), 1), $("cur")), xqc.tpl(3, n.add($("d"), 1), ","), xqc.tpl(10, n.add($("d"), 1), "$"), xqc.tpl(1, $("d"), 1), xqc.tpl(8, $("d"), n.string($("i"))), xqc.tpl(2, $("d"), 2), xqc.tpl(2, $("d"), 2), xqc.tpl(3, $("d"), ","))
						}).bind($)))) :
					(await n.when(n.boolean($("hasConstrType"))) ?
						($("cur")) :
						(await n.when(n.boolean($("hasOp"))) ?
							(xqc.tpl($("t"), $("d"), 1)) :
							($("cur"))))),
				/* remove constr type if not constr */
				xqc.rtp($("tmp"), $("r"), await n.when(n.boolean($("hasParams"))) ?
					($("d")) :
					(n.add($("d"), 1)), $("o"), $("i"), await n.when(n.boolean($("hasParams"))) ?
					(array.array()) :
					($("p")), $("tpl"), $("hasConstrType"), await n.when(n.boolean($("hasParams"))) ?
					(n.seq()) :
					(await n.when(n.boolean($("hasConstrType"))) ?
						($("ocur")) :
						($("cur"))))) :
			( /* detect first opening bracket after function declaration */ /* detect parameters, we need to change 2106 to something else at opening bracket here */ $("hasFunc", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 2106))),
				$("hasConstrType", await n.when(await n.when(n.eq($("hasFunc"), n.false())) && await n.when($("hasOp"))) && await n.when(await n.when(n.gt($("ocur").call($, "v"), 2100)) && await n.when(n.lt($("ocur").call($, "v"), 2200)))),
				$("cur", xqc.tpl($("t"), n.add($("d"), 1), $("v"))),
				$("last", xqc.guardedGet($("r"), $("size"))),
				$("hasLambda", await n.when($("hasFunc")) && await n.when(n.eq($("last").call($, "t"), 4))),
				$("r", await n.when(n.boolean($("hasLambda"))) ?
					(a.pop($("r"))) :
					($("r"))),
				$("tpl", await n.when(n.boolean($("hasFunc"))) ?
					($("tpl", n.seq(xqc.tpl(4, $("d"), "function"), $("cur"), xqc.tpl(1, n.add($("d"), 1), 1))),
						await n.when(n.boolean($("hasLambda"))) ?
						(n.seq(xqc.tpl(4, $("d"), "typed"), $("cur"), $("tpl"))) :
						(n.seq(xqc.tpl(3, $("d"), ","), $("tpl")))) :
					((await n.when(n.eq($("size"), 0)) || await n.when(n.geq($("last").call($, "t"), n.seq(1, 3)))) ?
						(n.seq(xqc.tpl(4, $("d"), ""), $("cur"))) :
						($("cur")))),
				/* remove constr type if not constr */
				xqc.rtp($("tmp"), $("r"), await n.when(n.boolean($("hasFunc"))) ?
					(n.add($("d"), 2)) :
					(n.add($("d"), 1)), $("o"), $("i"), $("p"), $("tpl"), await n.when($("hasFunc")) || await n.when($("hasConstrType")), await n.when(n.boolean($("hasFunc"))) ?
					(xqc.tpl(4, $("d"), 3006)) :
					($("cur")))))
}));
xqc.processComma$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("tmp", $(1)),
		/* some things to detect here:
		 * param
		 * assignment
		 */
		/*
		    if its a param, it means type wasnt set, so add item
		    */
		$("t", 3),
		$("v", ","),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p")),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasOp", n.eq($("ocur").call($, "t"), 4)),
		(await n.when((await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 3006)))) || await n.when((await n.when(n.eq($("ocur").call($, "t"), 1)) && await n.when(n.eq($("ocur").call($, "v"), 2004))))) ?
		($("cur", xqc.tpl($("t"), $("d"), $("v"))),
			$("tpl", await n.when(n.eq($("ocur").call($, "v"), 3006)) ?
				(n.seq(xqc.tpl(4, $("d"), "item"), xqc.tpl(1, $("d"), 1), xqc.tpl(2, $("d"), 2), $("cur"))) :
				($("cur"))),
			xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"))) :
		($("cur", xqc.tpl($("t"), $("d"), $("v"))),
			$("hasAss", n.eq($("ocur").call($, "v"), 210)),
			$("tmp", xqc.unwrap(await n.when(n.boolean($("hasAss"))) ?
				(xqc.tpl(4, $("d"), 209)) :
				($("cur")), $("tmp"))),
			$("o", $("tmp").call($, "o")),
			$("osize", array.size($("o"))),
			$("ocur", await n.when(n.boolean($("osize"))) ?
				($("o").call($, $("osize"))) :
				(map.map())),
			$("d", $("tmp").call($, "d")),
			$("hasTypesig", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 2400))),
			$("tpl", await n.when(n.boolean($("hasAss"))) ?
				(n.seq(xqc.tpl(10, $("d"), "$"), xqc.tpl(1, $("d"), 1))) :
				((await n.when($("hasTypesig")) || await n.when((await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(210, 700)))))) ?
					(n.seq()) :
					(xqc.tpl($("t"), $("d"), $("v"))))),
			xqc.rtp($("tmp"), $("tmp").call($, "r"), await n.when(n.boolean($("hasAss"))) ?
				(n.add($("d"), 1)) :
				($("d")), $("tmp").call($, "o"), $("tmp").call($, "i"), $("tmp").call($, "p"), $("tpl"), n.seq(), await n.when(n.boolean($("hasAss"))) ?
				(xqc.tpl(4, $("d"), 209)) :
				(n.seq())))
}));
xqc.processOp$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("v", $(1)),
		$("tmp", $(2)),
		$("t", 4),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p")),
		$("size", array.size($("r"))),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasOp", n.eq($("ocur").call($, "t"), 4)),
		$("hasPreOp", await n.when($("hasOp")) && await n.when(await n.when(n.gge($("ocur").call($, "v"), 300)) && await n.when(n.glt($("ocur").call($, "v"), 2100)))),
		await n.when(n.eq($("v"), 217)) ?
		(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), n.seq(), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
		(await n.when(n.eq($("v"), 218)) ?
			( /* TODO check if o contains declare (would it not?) */ xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl(10, $("d"), "$>"), xqc.tpl(1, $("d"), 1)), await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 217)), xqc.tpl($("t"), $("d"), $("v")))) :
			(await n.when(n.eq($("v"), 216)) ?
				((await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 219))) ?
					(xqc.rtp($("tmp"), a.pop($("r")), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl($("t"), $("d"), "$<"), xqc.tpl(1, $("d"), 1)), n.true(), xqc.tpl($("t"), $("d"), $("v")))) :
					(xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl($("t"), $("d"), "$*"), xqc.tpl(1, $("d"), 1)), $("hasPreOp")))) :
				(await n.when(n.eq($("v"), 215)) ?
					(xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl(4, $("d"), "xq-version"), xqc.tpl(1, $("d"), 1)), $("hasOp"), xqc.tpl($("t"), $("d"), $("v")))) :
					(await n.when(n.geq($("v"), n.seq(214, 2108))) ?
						(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), n.seq(), $("hasOp"), xqc.tpl($("t"), $("d"), $("v")))) :
						(await n.when(n.eq($("v"), 219)) ?
							(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl($("t"), $("d"), xqc.opName($("v"))), $("hasPreOp"), xqc.tpl($("t"), $("d"), $("v")))) :
							(await n.when(n.eq($("v"), 2106)) ?
								( /* check if o contains declare, otherwise its anonymous */ $("hasDecl", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 217))),
									$("tpl", await n.when(n.boolean($("hasDecl"))) ?
										(n.seq(xqc.tpl(10, $("d"), "$>"), xqc.tpl(1, $("d"), 1))) :
										(xqc.tpl($("t"), $("d"), $("v")))),
									xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), $("tpl"), $("hasDecl"), xqc.tpl($("t"), $("d"), $("v")))) :
								(await n.when(n.eq($("v"), 2400)) ?
									($("hasParams", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 3006))),
										xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), await n.when(n.boolean($("hasParams"))) ?
											(n.seq()) :
											(xqc.tpl(3, $("d"), ",")), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
									(await n.when(n.eq($("v"), 207)) ?
										(xqc.rtp($("tmp"), a.pop($("r")), n.add($("d"), 2), $("o"), $("i"), $("p"), n.seq(xqc.tpl(3, n.add($("d"), 1), ","), xqc.tpl(1, n.add($("d"), 1), 3)), n.false(), xqc.tpl($("t"), $("d"), $("v")))) :
										(await n.when(n.eq($("v"), 208)) ?
											($("tmp", xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))),
												$("d", $("tmp").call($, "d")),
												xqc.rtp($("tmp"), $("tmp").call($, "r"), $("d"), $("tmp").call($, "o"), $("tmp").call($, "i"), $("tmp").call($, "p"), n.seq(xqc.tpl(2, $("d"), 4), xqc.tpl(3, n.subtract($("d"), 1), ","), xqc.tpl(1, n.subtract($("d"), 1), 3)), n.false(), xqc.tpl($("t"), $("d"), $("v")))) :
											(await n.when(n.eq($("v"), 209)) ?
												( /* TODO check if o contains something that prevents creating a new let-ret-seq */ /* remove entry */ $("hasX", await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(222, 223, 224, 225)))),
													$("tmp", xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))),
													$("d", $("tmp").call($, "d")),
													$("o", $("tmp").call($, "o") /* wrap inner let */ ),
													$("open", await n.when(n.empty($("ocur").call($, "t"))) ?
														(xqc.tpl(1, $("d"), 1)) :
														(n.seq())),
													$("o", await n.when(n.exists($("open"))) ?
														(array.append($("o"), xqc.tpl(1, $("d"), 1))) :
														($("o"))),
													xqc.rtp($("tmp"), $("tmp").call($, "r"), n.add($("d"), 2), $("o"), $("tmp").call($, "i"), $("tmp").call($, "p"), await n.when(n.boolean($("hasX"))) ?
														(n.seq()) :
														(n.seq($("open"), xqc.tpl(10, n.add($("d"), 1), "$"), xqc.tpl(1, n.add($("d"), 1), 1))), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
												(await n.when(n.eq($("v"), 210)) ?
													( /* remove let, variable or comma from o */ $("tmp", xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))),
														$("o", $("tmp").call($, "o")),
														$("ocur", $("o").call($, array.size($("o")))),
														xqc.rtp($("tmp"), $("tmp").call($, "r"), $("tmp").call($, "d"), $("tmp").call($, "o"), $("tmp").call($, "i"), $("tmp").call($, "p"), xqc.tpl(3, $("d"), ","), await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(218, 209))), xqc.tpl($("t"), $("d"), $("v")))) :
													(await n.when(n.eq($("v"), 211)) ?
														( /* close anything that needs to be closed in $o*/ xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))) :
														(await n.when(n.eq($("v"), 220)) ?
															( /* close anything that needs to be closed in $o*/ xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl(3, $("d"), ","))) :
															(await n.when(n.eq($("v"), 221)) ?
																( /* start x-for, add var to params */ (await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 222))) ?
																	(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), n.seq(xqc.tpl(1, $("d"), 4), xqc.tpl(2, $("d"), 2), xqc.tpl(3, $("d"), ",")), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
																	(xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl(4, $("d"), "for"), xqc.tpl(1, $("d"), 1)), n.seq(), xqc.tpl($("t"), $("d"), $("v"))))) :
																(await n.when(n.geq($("v"), n.seq(222, 223, 224, 225))) ?
																	( /* x-in/x-where/x-orderby/x-groupby, remove x-... from o */ xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))) :
																	((await n.when(await n.when(n.eq($("v"), 509)) && await n.when($("hasOp"))) && await n.when(n.eq($("ocur").call($, "v"), 2108))) ?
																		(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl(3, $("d"), ","), n.true(), xqc.tpl($("t"), $("d"), $("v")))) :
																		((await n.when((await n.when(n.ge($("v"), 300)) && await n.when(n.lt($("v"), 2100)))) || await n.when(n.eq($("v"), 2600))) ?
																			(await n.when(n.eq($("size"), 0)) ?
																				( /* unary-op: insert op + parens */ $("v", n.add($("v"), 900)),
																					xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl($("t"), $("d"), xqc.opName($("v"))), xqc.tpl(1, $("d"), 1)), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
																				($("prev", xqc.guardedGet($("r"), $("size"))),
																					$("isOcc", await n.when(n.geq($("v"), n.seq(802, 904, 2003))) ?
																						((await n.when(n.eq($("ocur").call($, "t"), 1)) && await n.when(await n.when(n.eq($("ocur").call($, "v"), 1)) && await n.when(n.gt($("osize"), 1)))) ?
																							($("oprev", xqc.guardedGet($("o"), n.subtract($("osize"), 1))),
																								await n.when(n.eq($("oprev").call($, "t"), 4)) && await n.when(n.geq($("oprev").call($, "v"), n.seq(1200, 2400)))) :
																							(await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 2400)))) :
																						(n.false())),
																					await n.when(n.boolean($("isOcc"))) ?
																					( /* these operators are occurrence indicators when the previous is an open paren or qname */ /* when the previous is a closed paren, it depends what the next will be */ /*                                if($has-op) then*/ $("split", $("i").call($, $("d"))),
																						$("left", array.subarray($("r"), 1, n.subtract($("split"), 1))),
																						$("right", array.subarray($("r"), $("split"))),
																						xqc.rtp($("tmp"), $("left"), $("d"), $("o"), $("i"), $("p"), n.seq(xqc.tpl($("t"), $("d"), "occurs"), xqc.tpl(1, $("d"), 1), array.flatten(xqc.incr($("right"))), xqc.tpl(3, $("d"), ","), xqc.tpl($("t"), n.add($("d"), 1), (xqc.occurrence).call($, $("v"))), xqc.tpl(1, n.add($("d"), 1), 1), xqc.tpl(2, n.add($("d"), 1), 2), xqc.tpl(2, $("d"), 2))) /*                                else*/ /*                                    xqc:rtp($tmp,$r,$d,$o,$i,$p,xqc:tpl(7,$d,$xqc:operators($v)))*/ ) :
																					((await n.when(n.geq($("v"), n.seq(801, 802))) && await n.when(n.geq($("prev").call($, "t"), n.seq(1, 3, 4)))) ?
																						($("v", n.add($("v"), 900)),
																							xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl($("t"), $("d"), xqc.opName($("v"))), xqc.tpl(1, $("d"), 1)), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
																						( /* bin-op: pull in left side, add parens */ xqc.binOp(4, $("v"), $("tmp"), $("ocur"), $("hasPreOp")))))) :
																			((await n.when(n.gt($("v"), 2100)) && await n.when(n.lt($("v"), 2200))) ?
																				(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl($("t"), $("d"), xqc.opName($("v"))), await n.when($("hasPreOp")) && await n.when(n.ne($("ocur").call($, "v"), 1200)), xqc.tpl($("t"), $("d"), $("v")))) :
																				(xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl($("t"), $("d"), xqc.opName($("v"))), await n.when($("hasPreOp")) && await n.when(n.ne($("ocur").call($, "v"), 1200))))))))))))))))))))))
}));
xqc.processVar$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("v", $(1)),
		$("tmp", $(2)),
		$("t", 5),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p")),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasOp", n.eq($("ocur").call($, "t"), 4)),
		$("isParam", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 3006))),
		$("hasX", await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(221, 225)))),
		$("hasAss", await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(218, 209)))),
		$("hasXass", await n.when($("hasAss")) && await n.when(await n.when(n.gt($("osize"), 1)) && await n.when(await n.when(n.eq($("o").call($, n.subtract($("osize"), 1)).call($, "t"), 4)) && await n.when(n.geq($("o").call($, n.subtract($("osize"), 1)).call($, "v"), n.seq(222, 223, 224, 225)))))),
		$("v", n.replace($("v"), "^\\$", "")),
		$("tpl", (await n.when(await n.when($("isParam")) || await n.when($("hasXass"))) || await n.when($("hasX"))) ?
			(n.seq()) :
			(await n.when(n.boolean($("hasAss"))) ?
				(xqc.tpl($("t"), $("d"), $("v"))) :
				(await n.when(n.eq($("v"), "")) ?
					(xqc.tpl(10, $("d"), "$")) :
					(n.seq(xqc.tpl(10, $("d"), "$"), xqc.tpl(1, $("d"), 1), xqc.tpl($("t"), n.add($("d"), 1), $("v")), xqc.tpl(2, $("d"), 2)))))),
		xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"), n.seq(), n.seq(), (await n.when(await n.when($("isParam")) || await n.when($("hasXass"))) || await n.when($("hasX"))) ?
			($("v")) :
			(n.seq()))
}));
xqc.processQname$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("v", $(1)),
		$("tmp", $(2)),
		$("t", 6),
		$("r", $("tmp").call($, "r")),
		$("d", $("tmp").call($, "d")),
		$("o", $("tmp").call($, "o")),
		$("i", $("tmp").call($, "i")),
		$("p", $("tmp").call($, "p")),
		$("osize", array.size($("o"))),
		$("ocur", await n.when(n.gt($("osize"), 0)) ?
			($("o").call($, $("osize"))) :
			(map.map())),
		$("hasOp", n.eq($("ocur").call($, "t"), 4)),
		(await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(2102, 2105)))) ?
		( /*                let $nu := console:log(map {"auto-constr":$ocur,"i":$i}) return*/ $("tmp", xqc.rtp($("tmp"), a.pop($("r")), n.add($("d"), 1), $("o"), $("i"), $("p"), n.seq(xqc.tpl(4, $("ocur").call($, "d"), (xqc.constructors).call($, $("ocur").call($, "v"))), xqc.tpl(1, $("d"), 1), xqc.tpl(1, n.add($("d"), 1), 3), xqc.tpl(7, n.add($("d"), 2), $("v")), xqc.tpl(2, n.add($("d"), 2), 4), xqc.tpl(3, n.add($("d"), 1), ",")), n.true(), xqc.tpl(4, $("ocur").call($, "d"), n.add($("ocur").call($, "v"), 900)))),
			map.put($("tmp"), "i", $("i"))) :
		($("tpl", (await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 2108))) ?
				(xqc.tpl(7, $("d"), $("v"))) :
				(await n.when(n.matches($("v"), "^xs:")) ?
					($("hasTypesig", await n.when($("hasOp")) && await n.when(n.geq($("ocur").call($, "v"), n.seq(1200, 2400)))),
						$("hasTypesig", (await n.when(n.eq($("hasTypesig"), n.false())) && await n.when(await n.when(n.eq($("ocur").call($, "t"), 1)) && await n.when(n.eq($("ocur").call($, "v"), 1)))) ?
							($("oprev", xqc.guardedGet($("o"), n.subtract($("osize"), 1))),
								await n.when(n.eq($("oprev").call($, "t"), 4)) && await n.when(n.geq($("oprev").call($, "v"), n.seq(1200, 2400)))) :
							($("hasTypesig"))),
						await n.when(n.boolean($("hasTypesig"))) ?
						(n.seq(xqc.tpl(4, $("d"), n.replace($("v"), "^xs:", "")), xqc.tpl(1, $("d"), 1), xqc.tpl(2, $("d"), 2))) :
						(xqc.tpl($("t"), $("d"), $("v")))) :
					(xqc.tpl($("t"), $("d"), $("v"))))),
			xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl")))
}));
/*
 : Process:
 : - denote depth: increase/decrease for opener/closer
 : - never look ahead, only denote open operators
 : - only append what is processed!
 : - detect operator: binary or unary
 : - detect + transform namespace declarations: if *at* is found, stack it to o, remove last paren and write out comma
 : - transform operator to prefix notation
 */
xqc.process$2 = n.typed(n.function(n.seq(n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("cur", $(1)),
		$("tmp", $(2)),
		$("t", $("cur").call($, "t")),
		$("v", $("cur").call($, "v")),
		$("d", $("tmp").call($, "d")),
		await n.when(n.eq($("t"), 0)) ?
		($("tmp", xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))),
			$("d", $("tmp").call($, "d")),
			map.put($("tmp"), "r", array.append($("tmp").call($, "r"), xqc.tpl($("t"), $("d"), $("v"))))) :
		(await n.when(n.eq($("t"), 1)) ?
			(xqc.processOpen($("v"), $("tmp"))) :
			(await n.when(n.eq($("t"), 2)) ?
				(xqc.unwrap(xqc.tpl($("t"), $("d"), $("v")), $("tmp"))) :
				(await n.when(n.eq($("t"), 3)) ?
					(xqc.processComma($("tmp"))) :
					(await n.when(n.eq($("t"), 4)) ?
						(xqc.processOp($("v"), $("tmp"))) :
						(await n.when(n.eq($("t"), 5)) ?
							(xqc.processVar($("v"), $("tmp"))) :
							(await n.when(n.eq($("t"), 6)) ?
								(xqc.processQname($("v"), $("tmp"))) :
								(await n.when(n.eq($("t"), 10)) ?
									($("r", $("tmp").call($, "r")),
										$("d", $("tmp").call($, "d")),
										$("o", $("tmp").call($, "o")),
										$("i", $("tmp").call($, "i")),
										$("p", $("tmp").call($, "p")),
										$("osize", array.size($("o"))),
										$("ocur", await n.when(n.gt($("osize"), 0)) ?
											($("o").call($, $("osize"))) :
											(map.map())),
										$("hasOp", n.eq($("ocur").call($, "t"), 4)),
										$("isFor", await n.when($("hasOp")) && await n.when(n.eq($("ocur").call($, "v"), 221))),
										$("tpl", await n.when(n.boolean($("isFor"))) ?
											(n.seq()) :
											(xqc.tpl($("t"), $("d"), $("v")))),
										xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), $("tpl"))) :
									(await n.when(n.eq($("t"), 11)) ?
										($("r", $("tmp").call($, "r")),
											$("d", $("tmp").call($, "d")),
											$("o", $("tmp").call($, "o")),
											$("i", $("tmp").call($, "i")),
											$("p", $("tmp").call($, "p")),
											xqc.rtp($("tmp"), $("r"), n.add($("d"), 1), $("o"), $("i"), $("p"), xqc.tpl(11, $("d"), $("v")), n.seq(), xqc.tpl($("t"), $("d"), $("v")))) :
										($("r", $("tmp").call($, "r")),
											$("d", $("tmp").call($, "d")),
											$("o", $("tmp").call($, "o")),
											$("i", $("tmp").call($, "i")),
											$("p", $("tmp").call($, "p")),
											xqc.rtp($("tmp"), $("r"), $("d"), $("o"), $("i"), $("p"), xqc.tpl($("t"), $("d"), $("v"))))))))))))
}));
xqc.toL3$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("pre", $(1)),
		$("entry", $(2)),
		$("last", $(3)),
		$("next", $(4)),
		$("at", $(5)),
		$("t", $("entry").call($, "t")),
		$("v", $("entry").call($, "v")),
		$("s", await n.when(n.geq($("t"), 1)) ?
			(await n.when(n.eq($("v"), 3)) ?
				(15) :
				(await n.when(n.eq($("v"), 1)) ?
					( /* TODO check for last operator */ await n.when(n.geq($("last").call($, "t"), n.seq(4, 6, 10))) ?
						(n.seq()) :
						(await n.when(n.eq($("last").call($, "t"), 2)) ?
							(n.seq()) :
							(n.seq(14, "")))) :
					(n.seq()))) :
			(await n.when(n.eq($("t"), 2)) ?
				( /*            let $nu := console:log($next)*/ await n.when(n.eq($("next").call($, "t"), 1)) ?
					(18) :
					(17)) :
				(await n.when(n.eq($("t"), 7)) ?
					(n.seq(3, $("v"))) :
					(await n.when(n.eq($("t"), 8)) ?
						(n.seq(12, $("v"))) :
						(await n.when(n.eq($("t"), 6)) ?
							(await n.when(n.matches($("v"), "#\\p{N}$")) ?
								(n.seq(4, $("v"))) :
								(await n.when(n.eq($("next").call($, "t"), 1)) ?
									(n.seq(14, $("v"))) :
									(n.seq(3, $("v"))))) :
							(await n.when(n.geq($("t"), n.seq(4, 10))) ?
								(n.seq(14, $("v"))) :
								(await n.when(n.eq($("t"), 5)) ?
									(n.seq(3, $("v"))) :
									(await n.when(n.eq($("t"), 9)) ?
										(n.seq(8, $("v"))) :
										(await n.when(n.eq($("t"), 11)) ?
											(n.seq(1, $("v"))) :
											(await n.when(n.eq($("t"), 12)) ?
												(n.seq(2, $("v"))) :
												(await n.when(n.eq($("t"), 13)) ?
													(n.seq(14, "$", 12, "1", 17)) :
													(n.seq())))))))))))),
		n.seq($("pre"), $("s"))
}));
xqc.toBuffer$1 = n.typed(n.function(n.seq(n.string()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("query", $(1)),
		n.xForEach(n.stringToCodepoints($("query")), n.codepointsToString($(1), "."))
}));
xqc.normalizeQuery$2 = n.typed(n.function(n.seq(n.string(), n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("query", $(1)),
		$("params", $(2)),
		/* FIXME properly handle cases in replace below */
		$("query", n.replace($("query"), "function\\(\\*\\)", "function(()*,item()*)")),
		$("query", n.replace($("query"), "map\\(\\*\\)", "map(xs:anyAtomicType,item()*)")),
		$("query", n.replace($("query"), "array\\(\\*\\)", "array(item()*)")),
		xqc.analyzeChars(xqc.toBuffer($("query")), $("params"))
}));
xqc.toRdl$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("pre", $(1)),
		$("entry", $(2)),
		$("t", $("entry").call($, "t")),
		$("v", $("entry").call($, "v")),
		n.concat($("pre"), await n.when(n.geq($("t"), n.seq(1, 2))) ?
			((xqc.operators).call($, $("v"))) :
			(await n.when(n.eq($("t"), 7)) ?
				(n.concat("\"", $("v"), "\"")) :
				(await n.when(n.eq($("t"), 9)) ?
					(n.concat("(:", $("v"), ":)")) :
					(await n.when(n.eq($("t"), 11)) ?
						(n.concat("n:e(", $("v"), ",")) :
						(await n.when(n.boolean($("v"))) ?
							($("v")) :
							(""))))))
}));
/*
ws = 0
open paren = 1
close paren = 2
open curly = 3
close curly = 4
open square = 5
close square = 6
lt = 7
gt = 8
comma = 9
semicolon = 10
colon = 11
quot = 12
apos = 13
slash = 14
eq = 15

reserved = 4 (known operator)
var = 5 ($qname)
qname = 6
string = 7
number = 8
comment = 9
xml = 10
attrkey = 11
attrval = 12
enclosed expr = 13

string (type wont change):
    open=1 -> not(string, comment) and quot or apos
    clos=2 -> string and quot or apos
comment:
    open=3 -> not(string, xml) old = open paren and cur = colon
    clos=4 -> comment and old = colon and cur = close paren
opening-tag:
    open=5 -> cur=qname and old=lt
    clos=6 -> opening-tag and cur=gt
closing-tag:
    open=7 -> xml and old=lt and cur=slash
    clos=8 -> xml and cur=gt
xml:
    open -> opening-tag
    close -> closing-tag and count=0
attrkey:
    open=9 -> xml and cur=qname and old=ws
    clos=10 -> attrkey and eq
attrval:
enclosed expr (cancel on cur=old):
    open=11 -> xml and old=open-curly and cur!=open-curly
    clos=12 -> enc-exp and old=close-curly and cur!=close-curly
*/
/* blocking chars */
xqc.analyzeChar$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("char", $(1)),
		await n.when(map.contains((xqc.chars), $("char"))) ?
		((xqc.chars).call($, $("char"))) :
		(await n.when(n.matches($("char"), "\\s")) ?
			(10) :
			(await n.when(n.matches($("char"), "\\p{N}")) ?
				(11) :
				(await n.when(n.matches($("char"), "\\p{L}")) ?
					(12) :
					(0))))
}));
xqc.flagToExpr$1 = n.typed(n.function(n.seq(n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("flag", $(1)),
		await n.when(n.eq($("flag"), 2)) ?
		(7) :
		(await n.when(n.eq($("flag"), 4)) ?
			(9) :
			(await n.when(n.geq($("flag"), n.seq(6, 9))) ?
				(11) :
				(await n.when(n.eq($("flag"), 10)) ?
					(12) :
					(await n.when(n.eq($("flag"), 8)) ?
						(2) :
						(14)))))
}));
xqc.inspectTokens$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("char", $(1)),
		$("type", $(2)),
		await n.when(n.geq($("type"), n.seq(1, 3, 2001))) ?
		(map.map(n.pair("t", 1), n.pair("v", $("type")))) :
		(await n.when(n.geq($("type"), n.seq(2, 4, 2002))) ?
			(map.map(n.pair("t", 2), n.pair("v", $("type")))) :
			(await n.when(n.eq($("type"), 100)) ?
				(map.map(n.pair("t", 3), n.pair("v", $("char")))) :
				(await n.when(n.eq($("type"), 5)) ?
					(map.map(n.pair("t", 0), n.pair("v", $("char")))) :
					(await n.when(n.eq($("type"), 9)) ?
						(map.map(n.pair("t", 10), n.pair("v", $("char")))) :
						(await n.when(n.eq($("type"), 8)) ?
							(map.map(n.pair("t", 7), n.pair("v", $("char")))) :
							(await n.when(n.geq($("type"), n.seq(505, 507, 509, 802, 904, 1800, 1901, 2003, 2600))) ?
								(map.map(n.pair("t", 4), n.pair("v", $("type")))) :
								(n.seq())))))))
}));
xqc.charReducer$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("flags", $(1)),
		$("next", $(2)),
		$("xqCompat", $("flags").call($, "xq-compat")),
		$("char", $("flags").call($, "char")),
		$("oldType", $("flags").call($, "type")),
		$("buffer", $("flags").call($, "buffer")),
		$("string", $("flags").call($, "string")),
		$("wasVar", $("flags").call($, "var")),
		$("wasWs", $("flags").call($, "ws")),
		$("wasNumber", $("flags").call($, "number")),
		$("comment", $("flags").call($, "comment")),
		$("opentag", $("flags").call($, "opentag")),
		$("closetag", $("flags").call($, "closetag")),
		$("attrkey", $("flags").call($, "attrkey")),
		$("attrval", $("flags").call($, "attrval")),
		$("encExpr", $("flags").call($, "enc-expr")),
		$("hasQuot", $("flags").call($, "has-quot")),
		$("opencount", $("flags").call($, "opencount")),
		$("type", await n.when(n.ne($("string"), 0)) ?
			( /* skip anything but closers */ (await n.when(n.eq($("string"), 6)) && await n.when(await n.when(n.eq($("char"), "\"")) && await n.when(n.ne($("next"), "\"")))) ?
				(6) :
				((await n.when(n.eq($("string"), 7)) && await n.when(n.eq($("char"), "'"))) ?
					(7) :
					(0))) :
			(await n.when(n.boolean($("comment"))) ?
				(await n.when(n.eq($("char"), ":")) ?
					(await n.when(n.eq($("next"), ")")) ?
						(2502) :
						(2600)) :
					(0)) :
				(await n.when(n.boolean($("opentag"))) ?
					(await n.when(n.eq($("char"), ">")) ?
						(505) :
						(await n.when(n.eq($("char"), "/")) ?
							(1901 /* TODO direct close */ ) :
							(await n.when(n.matches($("char"), "[\\p{L}\\p{N}\\-_:]")) ?
								(0) :
								(await n.when(n.geq($("char"), n.seq("=", "\""))) ?
									(xqc.analyzeChar($("char"))) :
									( /* TODO stop opentag, analyze the char */ n.seq()))))) :
					(xqc.analyzeChar($("char")))))),
		$("zero", await n.when(n.geq(n.seq($("comment"), $("opentag"), $("closetag"), $("attrkey")), n.true())) ?
			(n.false()) :
			(n.eq($("string"), 0))),
		$("var", await n.when($("zero")) && await n.when((await n.when((await n.when(n.eq($("wasVar"), n.false())) && await n.when(n.eq($("char"), "$")))) || await n.when((await n.when($("wasVar")) && await n.when(n.matches($("char"), "[\\p{L}\\p{N}\\-_:]"))))))),
		$("number", await n.when(await n.when(n.eq($("var"), n.false())) && await n.when($("zero"))) && await n.when(await n.when(n.eq($("type"), 11)) && await n.when((await n.when((await n.when(n.ne($("oldType"), 12)) && await n.when(n.ne($("oldType"), 14)))) || await n.when($("wasWs")))))),
		$("flag", await n.when(n.boolean($("number"))) ?
			(n.seq()) :
			(await n.when(n.boolean($("zero"))) ?
				(await n.when(n.geq($("type"), n.seq(6, 7))) ?
					(1 /* open string */ ) :
					((await n.when(n.eq($("type"), 1)) && await n.when(n.eq($("next"), ":"))) ?
						(3 /* open comment */ ) :
						(await n.when(n.eq($("type"), 507)) ?
							(await n.when(n.matches($("next"), "\\p{L}")) ?
								(5 /* open opentag */ ) :
								((await n.when(n.eq($("next"), "/")) && await n.when(n.gt(n.head($("opencount")), 0))) ?
									(7 /* open closetag */ ) :
									(n.seq()))) :
							((await n.when(n.eq($("type"), 3)) && await n.when(await n.when(n.ne($("oldType"), 3)) && await n.when(await n.when(n.ne($("next"), "{")) && await n.when(n.gt(n.head($("opencount")), 0))))) ?
								(11 /* open enc-expr */ ) :
								((await n.when($("encExpr")) && await n.when(await n.when(n.eq($("type"), 4)) && await n.when(await n.when(n.eq($("hasQuot"), 0)) && await n.when(n.ne($("next"), "}"))))) ?
									(12 /* close enc-expr */ ) :
									(n.seq())))))) :
				((await n.when($("string")) && await n.when(n.geq($("type"), n.seq(6, 7)))) ?
					(2 /* close string */ ) :
					((await n.when($("comment")) && await n.when(n.eq($("type"), 2502))) ?
						(4 /* close comment */ ) :
						((await n.when($("opentag")) && await n.when(n.eq($("type"), 505))) ?
							(6 /* close opentag */ ) :
							((await n.when($("closetag")) && await n.when(n.eq($("type"), 505))) ?
								(8 /* close closetag */ ) :
								((await n.when(await n.when(n.eq($("attrkey"), n.false())) && await n.when(n.empty($("type")))) && await n.when(n.gt(n.head($("opencount")), 0))) ?
									(9) :
									((await n.when($("attrkey")) && await n.when(await n.when(n.eq($("type"), 509)) && await n.when(n.gt(n.head($("opencount")), 0)))) ?
										(10) :
										(n.seq()))))))))),
		$("hasQuot", await n.when(n.empty($("flag"))) ?
			(await n.when(n.eq($("type"), 3)) ?
				(n.add($("hasQuot"), 1)) :
				(await n.when(n.eq($("type"), 4)) ?
					(n.subtract($("hasQuot"), 1)) :
					($("hasQuot")))) :
			($("hasQuot"))),
		$("opencount", await n.when(n.eq($("flag"), 5)) ?
			(n.seq(n.add(n.head($("opencount")), 1), n.tail($("opencount")))) :
			(await n.when(n.eq($("flag"), 7)) ?
				(n.seq(n.subtract(n.head($("opencount")), 1), n.tail($("opencount")))) :
				($("opencount") /* closers van string, comment, opentag, closetag moeten worden vervangen */ ))),
		$("emitBuffer", await n.when(n.boolean($("flag"))) ?
			(await n.when(n.exists($("buffer"))) ?
				((await n.when(n.geq($("flag"), n.seq(2, 4))) || await n.when(n.eq(n.matches($("buffer"), "^\\s*$"), n.false()))) ?
					(n.stringJoin($("buffer"))) :
					(n.seq())) :
				(n.seq())) :
			(await n.when(n.boolean($("zero"))) ?
				(await n.when(n.boolean($("wasVar"))) ?
					(await n.when(n.boolean($("var"))) ?
						(n.seq()) :
						(n.stringJoin($("buffer")))) :
					(await n.when(n.boolean($("wasNumber"))) ?
						(await n.when(n.boolean($("number"))) ?
							(n.seq()) :
							(n.stringJoin($("buffer")))) :
						((await n.when(n.eq($("type"), 2600)) && await n.when(await n.when(n.geq($("oldType"), n.seq(6, 7, 11))) && await n.when(n.ne($("next"), "=")))) ?
							($("char")) :
							(await n.when(n.eq($("type"), 10)) ?
								((await n.when(n.exists($("buffer"))) && await n.when(n.matches(n.stringJoin($("buffer")), "^(group|instance|treat|cast|castable|order)$"))) ?
									(n.seq()) :
									($("char"))) :
								((await n.when(n.ne($("type"), 505)) && await n.when(await n.when(n.ne($("type"), 2600)) && await n.when(await n.when(n.ne($("type"), 509)) && await n.when(await n.when(n.ne($("type"), 9)) && await n.when(await n.when(n.ne($("type"), 11)) && await n.when(await n.when(n.ne($("type"), 12)) && await n.when(await n.when(n.ne($("type"), 14)) && await n.when(n.ne($("type"), 0))))))))) ?
									( /* these arent blocks, unless theyre paired */ $("char")) :
									((await n.when(n.eq($("type"), 509)) && await n.when(n.not(n.geq($("buffer"), n.seq(":", ">", "<", "!"))))) ?
										($("char")) :
										(n.seq()))))))) :
				(n.seq()))),
		$("tpl", (await n.when(await n.when(n.geq($("flag"), n.seq(2, 4, 6, 7, 8, 9, 10))) || await n.when($("wasNumber"))) || await n.when($("wasVar"))) ?
			(n.seq()) :
			((await n.when(await n.when($("emitBuffer")) && await n.when(n.exists($("buffer")))) && await n.when($("xqCompat"))) ?
				(xqc.inspectBuf($("buffer"), $("type"), $("next"))) :
				(n.seq()))),
		$("fixQuot", (await n.when(n.exists($("tpl"))) && await n.when(await n.when(n.eq($("tpl").call($, "t"), 7)) && await n.when(n.eq($("type"), 6))))),
		$("flag", await n.when(n.boolean($("fixQuot"))) ?
			(n.seq()) :
			($("flag"))),
		$("fixQuotAnd", await n.when($("fixQuot")) && await n.when(n.eq($("next"), "\""))),
		$("emitBuffer", await n.when(n.boolean($("fixQuotAnd"))) ?
			(n.seq()) :
			($("emitBuffer"))),
		$("tpl", await n.when(n.boolean($("fixQuotAnd"))) ?
			(n.seq()) :
			($("tpl"))),
		$("flags", await n.when(n.exists($("tpl"))) ?
			(xqc.process($("tpl"), $("flags"))) :
			($("flags"))),
		$("tpl", await n.when(n.eq($("flag"), 2)) ?
			(map.map(n.pair("t", xqc.flagToExpr($("flag"))), n.pair("v", await n.when(n.empty($("emitBuffer"))) ?
				("") :
				($("emitBuffer"))))) :
			(await n.when(n.geq($("flag"), n.seq(4, 6, 8, 9, 10))) ?
				(await n.when(n.boolean($("emitBuffer"))) ?
					(map.map(n.pair("t", xqc.flagToExpr($("flag"))), n.pair("v", await n.when(n.eq($("flag"), 8)) ?
						(2) :
						($("emitBuffer"))))) :
					(n.seq())) :
				(await n.when(n.boolean($("emitBuffer"))) ?
					(await n.when(n.eq($("type"), 8)) ?
						(map.map(n.pair("t", 13), n.pair("v", $("char")))) :
						((await n.when(n.eq($("type"), 10)) && await n.when(n.empty($("buffer")))) ?
							(n.seq()) :
							((await n.when(n.geq($("flag"), n.seq(7, 11))) || await n.when(n.gt(n.head($("opencount")), 0))) ?
								(map.map(n.pair("t", 7), n.pair("v", $("emitBuffer")))) :
								(await n.when(n.boolean($("wasVar"))) ?
									(map.map(n.pair("t", 5), n.pair("v", $("emitBuffer")))) :
									(await n.when(n.boolean($("wasNumber"))) ?
										(map.map(n.pair("t", 8), n.pair("v", $("emitBuffer")))) :
										(n.seq())))))) :
					(n.seq())))),
		$("fromBuf", (await n.when(await n.when(n.empty($("flag"))) && await n.when($("emitBuffer"))) && await n.when($("zero"))) ?
			(xqc.inspectTokens($("char"), $("type"))) :
			(n.seq())),
		$("flags", await n.when(n.exists($("tpl"))) ?
			(xqc.process($("tpl"), $("flags"))) :
			($("flags"))),
		$("flags", await n.when(n.exists($("fromBuf"))) ?
			(xqc.process($("fromBuf"), $("flags"))) :
			($("flags"))),
		$("flags", map.put($("flags"), "char", await n.when(n.eq($("flag"), 4)) ?
			(" ") :
			($("next")))),
		$("flags", (await n.when(n.eq($("type"), 5)) || await n.when(n.empty($("next")))) ?
			( /* move to out*/ $("output", $("flags").call($, "$transpile")),
				$("flags", await n.when(array.size($("flags").call($, "o"))) ?
					(xqc.unwrap(map.map(n.pair("t", 0)), $("flags"))) :
					($("flags"))),
				$("r", $("flags").call($, "r")),
				$("s", array.size($("r"))),
				$("flags", await n.when(n.boolean($("s"))) ?
					($("r", await n.when(n.eq($("output"), "l3")) ?
							(a.reduceAroundAt($("r"), xqc.toL3, n.seq(), map.map(), map.map())) :
							(await n.when(n.eq($("output"), "rdl")) ?
								(a.foldLeft($("r"), n.seq(), xqc.toRdl)) :
								($("r")))),
						map.put($("flags"), "out", n.seq($("flags").call($, "out"), $("r")))) :
					($("flags"))),
				$("flags", map.put($("flags"), "i", map.map())),
				$("flags", map.put($("flags"), "d", 1)),
				map.put($("flags"), "r", array.array())) :
			($("flags"))),
		$("flags", await n.when(n.eq($("type"), 10)) ?
			($("flags")) :
			(map.put($("flags"), "type", $("type")))),
		$("flags", map.put($("flags"), "buffer", (await n.when(await n.when($("emitBuffer")) || await n.when($("attrval"))) || await n.when(n.geq($("flag"), n.seq(2, 6, 9)))) ?
			( /* TODO never buffer for some flags */ n.seq()) :
			((await n.when($("comment")) && await n.when(n.eq($("type"), 2600))) ?
				( /* prevent buffering colons in comments */ await n.when(n.empty($("buffer"))) ?
					(n.seq()) :
					(await n.when(n.eq($("next"), ")")) ?
						($("buffer")) :
						(n.seq($("buffer"), $("char"))))) :
				((await n.when($("zero")) && await n.when($("flag"))) ?
					($("buffer")) :
					(n.seq($("buffer"), $("char"))))))),
		$("flags", map.put($("flags"), "string", (await n.when($("fixQuotAnd")) || await n.when($("attrval"))) ?
			($("type")) :
			(await n.when(n.eq($("flag"), 1)) ?
				($("type")) :
				(await n.when(n.eq($("flag"), 2)) ?
					(0) :
					($("string")))))),
		$("flags", map.put($("flags"), "var", $("var"))),
		$("flags", map.put($("flags"), "ws", n.eq($("type"), 10))),
		$("flags", map.put($("flags"), "number", $("number"))),
		$("flags", map.put($("flags"), "comment", await n.when(n.eq($("flag"), 3)) ?
			(n.true()) :
			(await n.when(n.eq($("flag"), 4)) ?
				(n.false()) :
				($("comment"))))),
		$("flags", map.put($("flags"), "opentag", await n.when(n.eq($("flag"), 5)) ?
			(n.true()) :
			(await n.when(n.eq($("flag"), 6)) ?
				(n.false()) :
				($("opentag"))))),
		$("flags", map.put($("flags"), "closetag", await n.when(n.eq($("flag"), 7)) ?
			(n.true()) :
			(await n.when(n.eq($("flag"), 8)) ?
				(n.false()) :
				($("closetag"))))),
		$("flags", map.put($("flags"), "attrkey", await n.when(n.eq($("flag"), 9)) ?
			(n.true()) :
			(await n.when(n.eq($("flag"), 10)) ?
				(n.false()) :
				($("attrkey"))))),
		$("flags", map.put($("flags"), "attrval", await n.when(n.eq($("flag"), 10)) ?
			(n.true()) :
			((await n.when($("attrval")) && await n.when(n.eq($("type"), 6))) ?
				(n.false()) :
				($("attrval"))))),
		$("flags", map.put($("flags"), "enc-expr", await n.when(n.eq($("flag"), 11)) ?
			(n.true()) :
			(await n.when(n.eq($("flag"), 12)) ?
				(n.false()) :
				($("encExpr"))))),
		$("flags", map.put($("flags"), "has-quot", $("hasQuot"))),
		$("flags", map.put($("flags"), "opencount", await n.when(n.eq($("flag"), 11)) ?
			(n.seq(0, $("opencount"))) :
			(await n.when(n.eq($("flag"), 12)) ?
				(n.tail($("opencount"))) :
				($("opencount"))))),
		$("flags")
}));
xqc.analyzeChars$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), (async function(...$) {
	$ = n.frame($);
	return $("chars", $(1)),
		$("params", $(2)),
		/* if the type changes, flush the buffer */
		/* TODO:
		 * WS for XML
		 * type 10 instead of 0 for enclosed expression
		 * revert to pair checking, tokenize all chars here
		 */
		$("flags", map.merge(n.seq($("params"), map.map(n.pair("xq-compat", n.eq($("params").call($, "$compat"), "xquery")), n.pair("char", n.head($("chars"))), n.pair("type", 0), n.pair("buffer", n.seq()), n.pair("string", 0), n.pair("var", n.false()), n.pair("ws", n.false()), n.pair("number", n.false()), n.pair("comment", n.false()), n.pair("opentag", n.false()), n.pair("closetag", n.false()), n.pair("attrkey", n.false()), n.pair("attrval", n.false()), n.pair("enc-expr", n.false()), n.pair("has-quot", 0), n.pair("opencount", 0), n.pair("r", array.array()), n.pair("d", 1), n.pair("o", array.array()), n.pair("i", map.map()), n.pair("p", array.array()), n.pair("out", n.seq()))))),
		xqc.charReducer(n.foldLeft(n.tail($("chars")), $("flags"), xqc.charReducer), n.seq()).call($, "out")
}));
xqc.detectCxf = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.detectCxf", $len);
	if ($len == 1) return n.fromPromise(xqc.detectCxf$1.apply(null, $));
};
xqc.replaceDotless = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.replaceDotless", $len);
	if ($len == 3) return n.fromPromise(xqc.replaceDotless$3.apply(null, $));
};
xqc.isQname = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.isQname", $len);
	if ($len == 1) return n.fromPromise(xqc.isQname$1.apply(null, $));
};
xqc.inspectBuf = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.inspectBuf", $len);
	if ($len == 3) return n.fromPromise(xqc.inspectBuf$3.apply(null, $));
};
xqc.incr = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.incr", $len);
	if ($len == 1) return n.fromPromise(xqc.incr$1.apply(null, $));
};
xqc.tpl = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.tpl", $len);
	if ($len == 3) return n.fromPromise(xqc.tpl$3.apply(null, $));
};
xqc.opName = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.opName", $len);
	if ($len == 1) return n.fromPromise(xqc.opName$1.apply(null, $));
};
xqc.guardedGet = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.guardedGet", $len);
	if ($len == 2) return n.fromPromise(xqc.guardedGet$2.apply(null, $));
};
xqc.unwrap = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.unwrap", $len);
	if ($len == 2) return n.fromPromise(xqc.unwrap$2.apply(null, $));
};
xqc.rtp = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.rtp", $len);
	if ($len == 6) return n.fromPromise(xqc.rtp$6.apply(null, $));
	if(process.env.debug) global.console.log("xqc.rtp", $len);
	if ($len == 7) return n.fromPromise(xqc.rtp$7.apply(null, $));
	if(process.env.debug) global.console.log("xqc.rtp", $len);
	if ($len == 8) return n.fromPromise(xqc.rtp$8.apply(null, $));
	if(process.env.debug) global.console.log("xqc.rtp", $len);
	if ($len == 9) return n.fromPromise(xqc.rtp$9.apply(null, $));
	if(process.env.debug) global.console.log("xqc.rtp", $len);
	if ($len == 10) return n.fromPromise(xqc.rtp$10.apply(null, $));
};
xqc.binOp = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.binOp", $len);
	if ($len == 5) return n.fromPromise(xqc.binOp$5.apply(null, $));
};
xqc.processOpen = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.processOpen", $len);
	if ($len == 2) return n.fromPromise(xqc.processOpen$2.apply(null, $));
};
xqc.processComma = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.processComma", $len);
	if ($len == 1) return n.fromPromise(xqc.processComma$1.apply(null, $));
};
xqc.processOp = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.processOp", $len);
	if ($len == 2) return n.fromPromise(xqc.processOp$2.apply(null, $));
};
xqc.processVar = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.processVar", $len);
	if ($len == 2) return n.fromPromise(xqc.processVar$2.apply(null, $));
};
xqc.processQname = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.processQname", $len);
	if ($len == 2) return n.fromPromise(xqc.processQname$2.apply(null, $));
};
xqc.process = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.process", $len);
	if ($len == 2) return n.fromPromise(xqc.process$2.apply(null, $));
};
xqc.toL3 = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.toL3", $len);
	if ($len == 5) return n.fromPromise(xqc.toL3$5.apply(null, $));
};
xqc.toBuffer = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.toBuffer", $len);
	if ($len == 1) return n.fromPromise(xqc.toBuffer$1.apply(null, $));
};
xqc.normalizeQuery = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.normalizeQuery", $len);
	if ($len == 2) return n.fromPromise(xqc.normalizeQuery$2.apply(null, $));
};
xqc.toRdl = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.toRdl", $len);
	if ($len == 2) return n.fromPromise(xqc.toRdl$2.apply(null, $));
};
xqc.analyzeChar = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.analyzeChar", $len);
	if ($len == 1) return n.fromPromise(xqc.analyzeChar$1.apply(null, $));
};
xqc.flagToExpr = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.flagToExpr", $len);
	if ($len == 1) return n.fromPromise(xqc.flagToExpr$1.apply(null, $));
};
xqc.inspectTokens = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.inspectTokens", $len);
	if ($len == 2) return n.fromPromise(xqc.inspectTokens$2.apply(null, $));
};
xqc.charReducer = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.charReducer", $len);
	if ($len == 2) return n.fromPromise(xqc.charReducer$2.apply(null, $));
};
xqc.analyzeChars = (...$) => {
	const $len = $.length;
	if(process.env.debug) global.console.log("xqc.analyzeChars", $len);
	if ($len == 2) return n.fromPromise(xqc.analyzeChars$2.apply(null, $));
};
module.exports = xqc
