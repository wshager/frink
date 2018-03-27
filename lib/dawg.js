const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const dawg = {}; // http://lagua.nl/dawg;
const console = require("console");
dawg.backtrack$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("path", $(1));
	$("b", $(2));
	return n.if(n.gt(array.size($("path")), 0), ($, test) => {
		if (test) {
			$("entry", array.head($("path")));
			return n.if(n.eq($("entry").call($, "_k"), $("b")), ($, test) => {
				if (test) {
					return $("entry").call($, "_v");
				} else {
					return dawg.backtrack(array.tail($("path")), $("b"))
				}
			}, $)
		} else {
			return n.seq()
		}
	}, $)
}));
dawg.traverse$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("ret", $(1));
	$("word", $(2));
	return dawg.traverse($("ret"), $("word"), "", array.array());
}));
dawg.traverse$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("ret", $(1));
	$("word", $(2));
	$("b", $(3));
	$("path", $(4));
	return n.if(n.or(n.empty($("ret")), n.seq(n.and(n.instanceOf($("ret"), n.array(n.occurs(n.item(), n.zeroOrMore()))), n.eq(array.size($("ret")), 0)))), ($, test) => {
		if (test) {
			return n.seq()
		} else {
			return n.if(n.exists($("word")), ($, test) => {
				if (test) {
					$("c", n.head($("word")));
					$("b", n.concat($("b"), $("c")));
					$("tmp", dawg.find($("ret"), $("c"), $("b"), $("path")));
					$("ret", $("tmp").call($, 1));
					$("path", $("tmp").call($, 2));
					return dawg.traverse($("ret"), n.tail($("word")), $("b"), $("path"));
				} else {
					$("ret", n.if(n.instanceOf($("ret"), n.array(n.occurs(n.item(), n.zeroOrMore()))), ($, test) => {
						if (test) {
							return n.if(n.gt(array.size($("ret")), 0), ($, test) => {
								if (test) {
									return $("ret").call($, 1);
								} else {
									return n.seq()
								}
							}, $)
						} else {
							return $("ret")
						}
					}, $));
					return n.if(n.and(n.instanceOf($("ret"), map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.eq($("ret").call($, "_k"), $("b"))), ($, test) => {
						if (test) {
							return $("ret").call($, "_v");
						} else {
							$("entry", dawg.backtrack($("path"), $("b")));
							return n.if(n.boolean($("entry")), ($, test) => {
								if (test) {
									return $("entry")
								} else {
									return array.array($("ret"), $("path"))
								}
							}, $)
						}
					}, $)
				}
			}, $)
		}
	}, $)
}));
dawg.loop$6 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("entry", $(1));
	$("ret", $(2));
	$("cp", $(3));
	$("word", $(4));
	$("pos", $(5));
	$("path", $(6));
	return n.if(n.gt(array.size($("entry")), 0), ($, test) => {
		if (test) {
			$("a", array.head($("entry")));
			$("isEntry", map.contains($("a"), "_v"));
			return n.if(n.boolean($("isEntry")), ($, test) => {
				if (test) {
					$("has", n.if(n.boolean($("isEntry")), ($, test) => {
						if (test) {
							return dawg.matchPos($("a"), $("pos"), $("cp"))
						} else {
							return n.false()
						}
					}, $));
					$("path", n.if(n.boolean($("has")), ($, test) => {
						if (test) {
							$("len", array.size($("path")));
							return n.if(n.or(n.eq($("len"), 0), n.ne($("path").call($, $("len")).call($, "_v"), $("a").call($, "_v"))), ($, test) => {
								if (test) {
									return array.append($("path"), $("a"))
								} else {
									return $("path")
								}
							}, $)
						} else {
							return $("path")
						}
					}, $));
					$("ret", n.if(n.boolean($("has")), ($, test) => {
						if (test) {
							return $("a")
						} else {
							return array.filter($("path"), n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
								$ = n.frame($);
								$("entry", $(1));
								return dawg.matchPos($("entry"), $("pos"), $("cp"));
							})))
						}
					}, $));
					return dawg.loop(array.tail($("entry")), $("ret"), $("cp"), $("word"), $("pos"), $("path"));
				} else {
					return n.if(map.contains($("a"), $("cp")), ($, test) => {
						if (test) {
							return array.array($("a").call($, $("cp")), $("path"))
						} else {
							return dawg.loop(array.tail($("entry")), $("ret"), $("cp"), $("word"), $("pos"), $("path"))
						}
					}, $)
				}
			}, $)
		} else {
			return array.array($("ret"), $("path"))
		}
	}, $)
}));
dawg.matchPos$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("entry", $(1));
	$("pos", $(2));
	$("cp", $(3));
	return n.matches($("entry").call($, "_k"), n.concat("^.{", $("pos"), "}[", n.replace($("cp"), "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1"), "]"));
}));
dawg.matchWord$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("entry", $(1));
	$("word", $(2));
	return n.matches($("entry").call($, "_k"), n.concat("^", n.replace($("word"), "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1")));
}));
dawg.find$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	$ = n.frame($);
	$("entry", $(1));
	$("cp", $(2));
	$("word", $(3));
	$("path", $(4));
	$("pos", n.subtract(n.stringLength($("word")), 1));
	return n.if(n.instanceOf($("entry"), n.array(n.occurs(n.item(), n.zeroOrMore()))), ($, test) => {
		if (test) {
			return dawg.loop($("entry"), $("entry"), $("cp"), $("word"), $("pos"), $("path"))
		} else {
			return n.if(map.contains($("entry"), "_v"), ($, test) => {
				if (test) {
					return n.if(dawg.matchPos($("entry"), $("pos"), $("cp")), ($, test) => {
						if (test) {
							$("len", array.size($("path")));
							$("path", n.if(n.or(n.eq($("len"), 0), n.ne($("path").call($, $("len")).call($, "_v"), $("entry").call($, "_v"))), ($, test) => {
								if (test) {
									return array.append($("path"), $("entry"))
								} else {
									return $("path")
								}
							}, $));
							return array.array($("entry"), $("path"));
						} else {
							return array.array(array.filter($("path"), n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
								$ = n.frame($);
								$("entry", $(1));
								return dawg.matchPos($("entry"), $("pos"), $("cp"));
							}))), array.array())
						}
					}, $)
				} else {
					return array.array($("entry").call($, $("cp")), $("path"))
				}
			}, $)
		}
	}, $)
}));
dawg.backtrack = (...$) => {
	const $len = $.length;
	if ($len == 2) return dawg.backtrack$2.apply(null, $);
};
dawg.traverse = (...$) => {
	const $len = $.length;
	if ($len == 2) return dawg.traverse$2.apply(null, $);
	if ($len == 4) return dawg.traverse$4.apply(null, $);
};
dawg.loop = (...$) => {
	const $len = $.length;
	if ($len == 6) return dawg.loop$6.apply(null, $);
};
dawg.matchPos = (...$) => {
	const $len = $.length;
	if ($len == 3) return dawg.matchPos$3.apply(null, $);
};
dawg.matchWord = (...$) => {
	const $len = $.length;
	if ($len == 2) return dawg.matchWord$2.apply(null, $);
};
dawg.find = (...$) => {
	const $len = $.length;
	if ($len == 4) return dawg.find$4.apply(null, $);
};
module.exports = dawg