const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const dawg = {}; // http://lagua.nl/dawg;
//const console = require("console");
dawg.backtrack$2 = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $path = a[0];
	let $b = a[1];
	return n.forEach(n.gt(array.size($path), "0"), test => {
		if (test) {
			let $entry = array.head($path);
			return n.forEach(n.eq($entry("_k"), $b), test => {
				if (test) {
					return $entry("_v");
				} else {
					return dawg.backtrack(array.tail($path), $b);
				}
			});
		} else {
			return n.seq();
		}
	});
}));
dawg.traverse$2 = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $word = a[1];
	return dawg.traverse($ret, $word, "", n.array());
}));
dawg.traverse$4 = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $word = a[1];
	let $b = a[2];
	let $path = a[3];
	return n.forEach(n.or(n.empty($ret), n.seq(n.and(n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore()))), n.eq(array.size($ret), "0")))), test => {
		if (test) {
			return n.seq();
		} else {
			return n.forEach(n.exists($word), test => {
				if (test) {
					let $c = n.head($word);
					let $b = n.concat($b, $c);
					let $tmp = dawg.find($ret, $c, $b, $path);
					let $ret = $tmp(1);
					let $path = $tmp(2);
					return dawg.traverse($ret, n.tail($word), $b, $path);
				} else {
					let $ret = n.forEach(n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore()))), test => {
						if (test) {
							return n.forEach(n.gt(array.size($ret), "0"), test => {
								if (test) {
									return $ret(1);
								} else {
									return n.seq();
								}
							});
						} else {
							return $ret;
						}
					});
					return n.forEach(n.and(n.instanceOf($ret, n.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.eq($ret("_k"), $b)), test => {
						if (test) {
							return $ret("_v");
						} else {
							let $entry = dawg.backtrack($path, $b);
							return n.forEach(n.boolean($entry), test => {
								if (test) {
									return $entry;
								} else {
									return n.array($ret, $path);
								}
							});
						}
					});
				}
			});
		}
	});
}));
dawg.loop$6 = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $ret = a[1];
	let $cp = a[2];
	let $word = a[3];
	let $pos = a[4];
	let $path = a[5];
	return n.forEach(n.gt(array.size($entry), "0"), test => {
		if (test) {
			let $a = array.head($entry);
			let $isEntry = map.contains($a, "_v");
			return n.forEach(n.boolean($isEntry), test => {
				if (test) {
					let $has = n.forEach(n.boolean($isEntry), test => {
						if (test) {
							return dawg.matchPos($a, $pos, $cp);
						} else {
							return n.false();
						}
					});
					let $path = n.forEach(n.boolean($has), test => {
						if (test) {
							let $len = array.size($path);
							return n.forEach(n.or(n.eq($len, "0"), n.ne($path($len)("_v"), $a("_v"))), test => {
								if (test) {
									return array.append($path, $a);
								} else {
									return $path;
								}
							});
						} else {
							return $path;
						}
					});
					let $ret = n.forEach(n.boolean($has), test => {
						if (test) {
							return $a;
						} else {
							return array.filter($path, n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
								let $entry = a[0];
								return dawg.matchPos($entry, $pos, $cp);
							})));
						}
					});
					return dawg.loop(array.tail($entry), $ret, $cp, $word, $pos, $path);
				} else {
					return n.forEach(map.contains($a, $cp), test => {
						if (test) {
							return n.array($a($cp), $path);
						} else {
							return dawg.loop(array.tail($entry), $ret, $cp, $word, $pos, $path);
						}
					});
				}
			});
		} else {
			return n.array($ret, $path);
		}
	});
}));
dawg.matchPos$3 = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $pos = a[1];
	let $cp = a[2];
	return n.matches($entry("_k"), n.concat("^.{", $pos, "}[", n.replace($cp, "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1"), "]"));
}));
dawg.matchWord$2 = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $word = a[1];
	return n.matches($entry("_k"), n.concat("^", n.replace($word, "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1")));
}));
dawg.find$4 = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $cp = a[1];
	let $word = a[2];
	let $path = a[3];
	let $pos = n.minus(n.stringLength($word), 1);
	return n.forEach(n.instanceOf($entry, n.array(n.occurs(n.item(), n.zeroOrMore()))), test => {
		if (test) {
			return dawg.loop($entry, $entry, $cp, $word, $pos, $path);
		} else {
			return n.forEach(map.contains($entry, "_v"), test => {
				if (test) {
					return n.forEach(dawg.matchPos($entry, $pos, $cp), test => {
						if (test) {
							let $len = array.size($path);
							let $path = n.forEach(n.or(n.eq($len, "0"), n.ne($path($len)("_v"), $entry("_v"))), test => {
								if (test) {
									return array.append($path, $entry);
								} else {
									return $path;
								}
							});
							return n.array($entry, $path);
						} else {
							return n.array(array.filter($path, n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
								let $entry = a[0];
								return dawg.matchPos($entry, $pos, $cp);
							}))), n.array());
						}
					});
				} else {
					return n.array($entry($cp), $path);
				}
			});
		}
	});
}));
dawg.backtrack = (...a) => {
	const len = a.length;
	if (len == 2) return dawg.backtrack$2.apply(null, a);
};
dawg.traverse = (...a) => {
	const len = a.length;
	if (len == 2) return dawg.traverse$2.apply(null, a);
	if (len == 4) return dawg.traverse$4.apply(null, a);
};
dawg.loop = (...a) => {
	const len = a.length;
	if (len == 6) return dawg.loop$6.apply(null, a);
};
dawg.matchPos = (...a) => {
	const len = a.length;
	if (len == 3) return dawg.matchPos$3.apply(null, a);
};
dawg.matchWord = (...a) => {
	const len = a.length;
	if (len == 2) return dawg.matchWord$2.apply(null, a);
};
dawg.find = (...a) => {
	const len = a.length;
	if (len == 4) return dawg.find$4.apply(null, a);
};
module.exports = dawg;
