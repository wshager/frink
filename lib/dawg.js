const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const dawg = {}; // http://lagua.nl/dawg;
const console = require("./console");
dawg.backtrack$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $path = a[0];
	let $b = a[1];
	return n.if(n.gt(array.size($path), 0), (test) => {
		if (test) {
			let $entry = array.head($path);
			return n.if(n.eq($entry("_k"), $b), (test) => {
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
dawg.traverse$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $word = a[1];
	return dawg.traverse($ret, $word, "", array.array());
}));
dawg.traverse$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $word = a[1];
	let $b = a[2];
	let $path = a[3];
	console.log("w",$word);
	return n.if(n.or(n.empty($ret), n.seq(n.and(n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore()))), n.eq(array.size($ret), 0)))), (test) => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.exists($word), (test) => {
				if (test) {
					let $c = n.head($word);
					$b = n.concat($b, $c);
					let $tmp = dawg.find($ret, $c, $b, $path);
					console.log("$tmp",$tmp);
					$ret = $tmp(1);
					$path = $tmp(2);
					return dawg.traverse($ret, n.tail($word), $b, $path);
				} else {
					$ret = n.if(n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore()))), ($ret,test) => {
						if (test) {
							return n.if(n.gt(array.size($ret), 0), (test) => {
								if (test) {
									return $ret(1);
								} else {
									return n.seq();
								}
							});
						} else {
							return $ret;
						}
					},$ret);
					return n.if(n.and(n.instanceOf($ret, map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.eq($ret("_k"), $b)), (test) => {
						if (test) {
							return $ret("_v");
						} else {
							let $entry = dawg.backtrack($path, $b);
							return n.if(n.boolean($entry), (test) => {
								if (test) {
									return $entry;
								} else {
									var ret = array.array($ret, $path);
									return ret;
								}
							});
						}
					});
				}
			});
		}
	});
}));
dawg.loop$6 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $ret = a[1];
	let $cp = a[2];
	let $word = a[3];
	let $pos = a[4];
	let $path = a[5];
	console.log("entry",$entry);
	return n.if(n.gt(array.size($entry), 0), (test) => {
		if (test) {
			let $a = array.head($entry);
			let $isEntry = map.contains($a, "_v");
			console.log("$isEntry",$isEntry);
			return n.if(n.boolean($isEntry), (test) => {
				if (test) {
					let $has = n.if(n.boolean($isEntry), (test) => {
						if (test) {
							return dawg.matchPos($a, $pos, $cp);
						} else {
							return n.false();
						}
					});
					$path = n.if(n.boolean($has), ($path,test) => {
						if (test) {
							let $len = array.size($path);
							return n.if(n.or(n.eq($len, 0), n.ne($path($len)("_v"), $a("_v"))), (test) => {
								if (test) {
									console.log("appendPath",$path);
									return array.append($path, $a);
								} else {
									return $path;
								}
							});
						} else {
							return $path;
						}
					},$path);
					$ret = n.if(n.boolean($has), ($ret,test) => {
						if (test) {
							return $a;
						} else {
							return array.filter($path, n.typed(n.function(n.seq(n.item()), n.item()), ((...a) => {
								let $entry = a[0];
								return dawg.matchPos($entry, $pos, $cp);
							})));
						}
					},$ret);
					return dawg.loop(array.tail($entry), $ret, $cp, $word, $pos, $path);
				} else {
					return n.if(map.contains($a, $cp), (test) => {
						if (test) {
							return array.array($a($cp), $path);
						} else {
							return dawg.loop(array.tail($entry), $ret, $cp, $word, $pos, $path);
						}
					});
				}
			});
		} else {
			return array.array($ret, $path);
		}
	});
}));
dawg.matchPos$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $pos = a[1];
	let $cp = a[2];
	return n.matches($entry("_k"), n.concat("^.{", $pos, "}[", n.replace($cp, "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1"), "]"));
}));
dawg.matchWord$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $word = a[1];
	return n.matches($entry("_k"), n.concat("^", n.replace($word, "([\\-\\[\\]\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|])", "\\\\$1")));
}));
dawg.find$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $entry = a[0];
	let $cp = a[1];
	let $word = a[2];
	let $path = a[3];
	console.log("$path",$path);
	let $pos = n.subtract(n.stringLength($word), 1);
	return n.if(n.instanceOf($entry, n.array(n.occurs(n.item(), n.zeroOrMore()))), (test) => {
		console.log("test1",test);
		if (test) {
			return dawg.loop($entry, $entry, $cp, $word, $pos, $path);
		} else {
			return n.if(map.contains($entry, "_v"), (test) => {
				console.log("test2",test);
				if (test) {
					return n.if(dawg.matchPos($entry, $pos, $cp), (test) => {
						console.log("test3",test);
						if (test) {
							let $len = array.size($path);
							$path = n.if(n.or(n.eq($len, 0), n.ne($path($len)("_v"), $entry("_v"))), ($path,test) => {
								if (test) {
									console.log("appendPath2",$path);
									return array.append($path, $entry);
								} else {
									return $path;
								}
							},$path);
							return array.array($entry, $path);
						} else {
							return array.array(array.filter($path, n.typed(n.function(n.seq(n.item()), n.item()), ((...a) => {
								let $entry = a[0];
								console.log("entry",$entry,$pos,$cp);
								var mp = dawg.matchPos($entry, $pos, $cp);
								console.log("MP",mp);
								return mp;
							}))), array.array());
						}
					});
				} else {
					let ret = array.array($entry($cp), $path);
					return ret;
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
