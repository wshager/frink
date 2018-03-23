const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const a = {}; // http://raddle.org/array-util;
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $position = $[1];
	let $member = $[2];
	return n.if(n.gt($position, array.size($array)), (test) => {
		if (test) {
			return array.append($array, $member);
		} else {
			return array.insertBefore(array.remove($array, $position), $position, $member);
		}
	});
}));
a.foldLeft$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	return a.foldLeft($array, $zero, $function, array.size($array));
}));
a.foldLeft$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	let $s = $[3];
	return n.if(n.eq($s, 0), (test) => {
		if (test) {
			return $zero;
		} else {
			return a.foldLeft(array.tail($array), $function($zero, array.head($array)), $function, n.subtract($s, 1));
		}
	});
}));
a.foldLeftAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	return a.foldLeftAt($array, $zero, $function, 1);
}));
a.foldLeftAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	let $at = $[3];
	return a.foldLeftAt($array, $zero, $function, $at, array.size($array));
}));
a.foldLeftAt$5 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	let $at = $[3];
	let $s = $[4];
	return n.if(n.eq($s, 0), (test) => {
		if (test) {
			return $zero;
		} else {
			return a.foldLeftAt(array.tail($array), $function($zero, array.head($array), $at), $function, n.add($at, 1), n.subtract($s, 1));
		}
	});
}));
a.reduceAroundAt$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $head = array.head($array);
	return a.reduceAroundAt(array.tail($array), $function, $head, $head, n.seq(), 2);
}));
a.reduceAroundAt$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	return a.reduceAroundAt($array, $function, $zero, n.seq());
}));
a.reduceAroundAt$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	let $lastSeed = $[3];
	return a.reduceAroundAt($array, $function, $zero, $lastSeed, n.seq());
}));
a.reduceAroundAt$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	let $lastSeed = $[3];
	let $nextSeed = $[4];
	return a.reduceAroundAt($array, $function, $zero, $lastSeed, $nextSeed, 1);
}));
a.reduceAroundAt$6 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	let $lastSeed = $[3];
	let $nextSeed = $[4];
	let $at = $[5];
	let $tmp = map.map(n.pair("out", $zero), n.pair("last", $lastSeed), n.pair("entry", array.head($array)), n.pair("at", $at));
	$tmp = a.foldLeft(array.tail($array), $tmp, n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
		$tmp = $[0];
		let $next = $[1];
		let $out = $function($tmp("out"), $tmp("entry"), $tmp("last"), $next, $tmp("at"));
		$tmp = map.put($tmp, "out", $out);
		$tmp = map.put($tmp, "last", $tmp("entry"));
		$tmp = map.put($tmp, "entry", $next);
		return map.put($tmp, "at", n.add($at, 1));
	})));
	return $function($tmp("out"), $tmp("entry"), $tmp("last"), $nextSeed, $tmp("at"));
}));
a.reduceAheadAt$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	return a.reduceAheadAt(array.tail($array), $function, array.head($array), n.seq(), 2);
}));
a.reduceAheadAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	return a.reduceAheadAt($array, $function, $zero, n.seq());
}));
a.reduceAheadAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	let $nextSeed = $[3];
	return a.reduceAheadAt($array, $function, $zero, $nextSeed, 1);
}));
a.reduceAheadAt$5 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $zero = $[2];
	let $nextSeed = $[3];
	let $at = $[4];
	let $tmp = map.map(n.pair("out", $zero), n.pair("entry", array.head($array)), n.pair("at", $at));
	$tmp = a.foldLeft(array.tail($array), $tmp, n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
		$tmp = $[0];
		let $next = $[1];
		let $out = $function($tmp("out"), $tmp("entry"), $next, $tmp("at"));
		$tmp = map.put($tmp, "out", $out);
		$tmp = map.put($tmp, "entry", $next);
		return map.put($tmp, "at", n.add($at, 1));
	})));
	return $function($tmp("out"), $tmp("entry"), $nextSeed, $tmp("at"));
}));
a.foldRight$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	return a.foldRight($array, $zero, $function, array.size($array));
}));
a.foldRight$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	let $s = $[3];
	return n.if(n.eq($s, 0), (test) => {
		if (test) {
			return $zero;
		} else {
			return a.foldRight(array.remove($array, $s), $function($zero, array.get($array, $s)), $function, n.subtract($s, 1));
		}
	});
}));
a.foldRightAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	return a.foldRightAt($array, $zero, $function, array.size($array));
}));
a.foldRightAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $zero = $[1];
	let $function = $[2];
	let $at = $[3];
	return n.if(n.eq($at, 0), (test) => {
		if (test) {
			return $zero;
		} else {
			return a.foldRightAt(array.remove($array, $at), $function($zero, array.get($array, $at), $at), $function, n.subtract($at, 1));
		}
	});
}));
a.forEach$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	return a.forEach($array, $function, array.array());
}));
a.forEach$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $ret = $[2];
	return n.if(n.eq(array.size($array), 0), (test) => {
		if (test) {
			return $ret;
		} else {
			return a.forEach(array.tail($array), $function, array.append($ret, $function(array.head($array))));
		}
	});
}));
a.forEachAt$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	return a.forEachAt($array, $function, array.array(), 1);
}));
a.forEachAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $array = $[0];
	let $function = $[1];
	let $ret = $[2];
	let $at = $[3];
	return n.if(n.eq(array.size($array), 0), (test) => {
		if (test) {
			return $ret;
		} else {
			return a.forEachAt(array.tail($array), $function, array.append($ret, $function(array.head($array), $at)), n.add($at, 1));
		}
	});
}));
a.last$1 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...$) => {
	let $array = $[0];
	return array.get($array, array.size($array));
}));
a.pop$1 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...$) => {
	let $array = $[0];
	return array.remove($array, array.size($array));
}));
a.firstIndexOf$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...$) => {
	let $array = $[0];
	let $lookup = $[1];
	return a.foldLeftAt($array, n.seq(), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
		let $pre = $[0];
		let $cur = $[1];
		let $at = $[2];
		return n.if(n.or(n.empty($pre), n.deepEqual($cur, $lookup)), (test) => {
			if (test) {
				return $at;
			} else {
				return $pre;
			}
		});
	})));
}));
a.lastIndexOf$2 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...$) => {
	let $array = $[0];
	let $lookup = $[1];
	return a.foldRightAt($array, 0, n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
		let $cur = $[0];
		let $pre = $[1];
		let $at = $[2];
		return n.if(n.and(n.eq($pre, 0), n.deepEqual($cur, $lookup)), (test) => {
			if (test) {
				return $at;
			} else {
				return $pre;
			}
		});
	})));
}));
a.put = (...$) => {
	const len = $.length;
	if (len == 3) return a.put$3.apply(null, $);
};
a.foldLeft = (...$) => {
	const len = $.length;
	if (len == 3) return a.foldLeft$3.apply(null, $);
	if (len == 4) return a.foldLeft$4.apply(null, $);
};
a.foldLeftAt = (...$) => {
	const len = $.length;
	if (len == 3) return a.foldLeftAt$3.apply(null, $);
	if (len == 4) return a.foldLeftAt$4.apply(null, $);
	if (len == 5) return a.foldLeftAt$5.apply(null, $);
};
a.reduceAroundAt = (...$) => {
	const len = $.length;
	if (len == 2) return a.reduceAroundAt$2.apply(null, $);
	if (len == 3) return a.reduceAroundAt$3.apply(null, $);
	if (len == 4) return a.reduceAroundAt$4.apply(null, $);
	if (len == 5) return a.reduceAroundAt$5.apply(null, $);
	if (len == 6) return a.reduceAroundAt$6.apply(null, $);
};
a.reduceAheadAt = (...$) => {
	const len = $.length;
	if (len == 2) return a.reduceAheadAt$2.apply(null, $);
	if (len == 3) return a.reduceAheadAt$3.apply(null, $);
	if (len == 4) return a.reduceAheadAt$4.apply(null, $);
	if (len == 5) return a.reduceAheadAt$5.apply(null, $);
};
a.foldRight = (...$) => {
	const len = $.length;
	if (len == 3) return a.foldRight$3.apply(null, $);
	if (len == 4) return a.foldRight$4.apply(null, $);
};
a.foldRightAt = (...$) => {
	const len = $.length;
	if (len == 3) return a.foldRightAt$3.apply(null, $);
	if (len == 4) return a.foldRightAt$4.apply(null, $);
};
a.forEach = (...$) => {
	const len = $.length;
	if (len == 2) return a.forEach$2.apply(null, $);
	if (len == 3) return a.forEach$3.apply(null, $);
};
a.forEachAt = (...$) => {
	const len = $.length;
	if (len == 2) return a.forEachAt$2.apply(null, $);
	if (len == 4) return a.forEachAt$4.apply(null, $);
};
a.last = (...$) => {
	const len = $.length;
	if (len == 1) return a.last$1.apply(null, $);
};
a.pop = (...$) => {
	const len = $.length;
	if (len == 1) return a.pop$1.apply(null, $);
};
a.firstIndexOf = (...$) => {
	const len = $.length;
	if (len == 2) return a.firstIndexOf$2.apply(null, $);
};
a.lastIndexOf = (...$) => {
	const len = $.length;
	if (len == 2) return a.lastIndexOf$2.apply(null, $);
};
module.exports = a;
