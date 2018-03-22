const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const a = {}; // http://raddle.org/array-util;
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $position = a[1];
	let $member = a[2];
	return n.if(n.gt($position, array.size($array)), (test) => {
		if (test) {
			return array.append($array, $member)
		} else {
			return array.insertBefore(array.remove($array, $position), $position, $member)
		}
	})
}));
a.foldLeft$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeft($array, $zero, $function, array.size($array));
}));
a.foldLeft$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $s = a[3];
	return n.if(n.eq($s, 0), (test) => {
		if (test) {
			return $zero
		} else {
			return a.foldLeft(array.tail($array), $function($zero, array.head($array)), $function, n.subtract($s, 1))
		}
	})
}));
a.foldLeftAt$3 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeftAt($array, $zero, $function, 1);
}));
a.foldLeftAt$4 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	return a.foldLeftAt($array, $zero, $function, $at, array.size($array));
}));
a.foldLeftAt$5 = n.typed(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	let $s = a[4];
	return n.if(n.eq($s, 0), (test) => {
		if (test) {
			return $zero
		} else {
			return a.foldLeftAt(array.tail($array), $function($zero, array.head($array), $at), $function, n.add($at, 1), n.subtract($s, 1))
		}
	})
}));
a.reduceAroundAt$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $head = array.head($array);
	return a.reduceAroundAt(array.tail($array), $function, $head, $head, n.seq(), 2);
}));
a.reduceAroundAt$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $zero = a[2];
	return a.reduceAroundAt($array, $function, $zero, n.seq());
}));
a.reduceAroundAt$4 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $zero = a[2];
	let $lastSeed = a[3];
	return a.reduceAroundAt($array, $function, $zero, $lastSeed, n.seq());
}));
a.reduceAroundAt$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $zero = a[2];
	let $lastSeed = a[3];
	let $nextSeed = a[4];
	return a.reduceAroundAt($array, $function, $zero, $lastSeed, $nextSeed, 1);
}));
a.reduceAroundAt = (n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.typed(n.function(n.seq(n.multiply(n.item()), n.item(), n.occurs(n.item(), n.zeroOrMore()), n.multiply(n.item()), n.item(), n.multiply(n.item()), "xs:integer"), n.occurs(n.item(), n.zeroOrMore()), $zero, $lastSeed, $nextSeed, $at, n.integer())(((...a) => {
	let $tmp = map.map(n.pair("out", $zero), n.pair("last", $lastSeed), n.pair("entry", array.head($array)), n.pair("at", $at));
	$tmp = a.foldLeft(array.tail($array), $tmp, n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
		let $array = a[0];
		let $function = a[1];
		$tmp = a[2];
		let $next = a[3];
		let $out = $function($tmp("out"), $tmp("entry"), $tmp("last"), $next, $tmp("at"));
		$tmp = map.put($tmp, "out", $out);
		$tmp = map.put($tmp, "last", $tmp("entry"));
		$tmp = map.put($tmp, "entry", $next);
		return map.put($tmp, "at", n.add($at, 1));
	})));
	return $function($tmp("out"), $tmp("entry"), $tmp("last"), $nextSeed, $tmp("at"));
})
"a:reduce-ahead-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	return a.reduceAheadAt(array.tail($array), $function, array.head($array), n.seq(), 2);
})), "a:reduce-ahead-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
let $zero = a[2];
return a.reduceAheadAt($array, $function, $zero, n.seq());
})), "a:reduce-ahead-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
let $zero = a[2];
let $nextSeed = a[3];
return a.reduceAheadAt($array, $function, $zero, $nextSeed, 1);
})), "a:reduce-ahead-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.typed(n.function(n.seq(n.multiply(n.item()), n.item(), n.occurs(n.item(), n.zeroOrMore()), n.multiply(n.item()), n.item(), "xs:integer"), n.occurs(n.item(), n.zeroOrMore()), $zero, $nextSeed, $at, n.integer())(((...a) => {
	let $tmp = map.map(n.pair("out", $zero), n.pair("entry", array.head($array)), n.pair("at", $at));
	$tmp = a.foldLeft(array.tail($array), $tmp, n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
		let $array = a[0];
		let $function = a[1];
		$tmp = a[2];
		let $next = a[3];
		let $out = $function($tmp("out"), $tmp("entry"), $next, $tmp("at"));
		$tmp = map.put($tmp, "out", $out);
		$tmp = map.put($tmp, "entry", $next);
		return map.put($tmp, "at", n.add($at, 1));
	})));
	return $function($tmp("out"), $tmp("entry"), $nextSeed, $tmp("at"));
})
"a:fold-right", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldRight($array, $zero, $function, array.size($array));
})), "a:fold-right", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $zero = a[1];
let $function = a[2];
let $s = a[3];
return n.if(n.eq($s, 0), (test) => {
	if (test) {
		return $zero
	} else {
		return a.foldRight(array.remove($array, $s), $function($zero, array.get($array, $s)), $function, n.subtract($s, 1))
	}
})
})), "a:fold-right-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $zero = a[1];
let $function = a[2];
return a.foldRightAt($array, $zero, $function, array.size($array));
})), "a:fold-right-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $zero = a[1];
let $function = a[2];
let $at = a[3];
return n.if(n.eq($at, 0), (test) => {
	if (test) {
		return $zero
	} else {
		return a.foldRightAt(array.remove($array, $at), $function($zero, array.get($array, $at), $at), $function, n.subtract($at, 1))
	}
})
})), "a:for-each", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
return a.forEach($array, $function, array.array());
})), "a:for-each", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
let $ret = a[2];
return n.if(n.eq(array.size($array), 0), (test) => {
	if (test) {
		return $ret
	} else {
		return a.forEach(array.tail($array), $function, array.append($ret, $function(array.head($array))))
	}
})
})), "a:for-each-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
return a.forEachAt($array, $function, array.array(), 1);
})), "a:for-each-at", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
let $array = a[0];
let $function = a[1];
let $ret = a[2];
let $at = a[3];
return n.if(n.eq(array.size($array), 0), (test) => {
	if (test) {
		return $ret
	} else {
		return a.forEachAt(array.tail($array), $function, array.append($ret, $function(array.head($array), $at)), n.add($at, 1))
	}
})
})), "a:last", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
let $array = a[0];
return array.get($array, array.size($array));
})), "a:pop", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
let $array = a[0];
return array.remove($array, array.size($array));
})), "a:first-index-of", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
let $array = a[0];
let $lookup = a[1];
return a.foldLeftAt($array, n.seq(), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $pre = a[0];
	let $cur = a[1];
	let $at = a[2];
	return n.if(n.or(n.empty($pre), n.deepEqual($cur, $lookup)), (test) => {
		if (test) {
			return $at
		} else {
			return $pre
		}
	})
})));
})), "a:last-index-of", n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
let $array = a[0];
let $lookup = a[1];
return a.foldRightAt($array, 0, n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $cur = a[0];
	let $pre = a[1];
	let $at = a[2];
	return n.if(n.and(n.eq($pre, 0), n.deepEqual($cur, $lookup)), (test) => {
		if (test) {
			return $at
		} else {
			return $pre
		}
	})
})));
})) a.put = (...a) => {
	const len = a.length;
	if (len == 3) return a.put$3.apply(null, a);
};
a.foldLeft = (...a) => {
	const len = a.length;
	if (len == 3) return a.foldLeft$3.apply(null, a);
	if (len == 4) return a.foldLeft$4.apply(null, a);
};
a.foldLeftAt = (...a) => {
	const len = a.length;
	if (len == 3) return a.foldLeftAt$3.apply(null, a);
	if (len == 4) return a.foldLeftAt$4.apply(null, a);
	if (len == 5) return a.foldLeftAt$5.apply(null, a);
};
a.reduceAroundAt = (...a) => {
	const len = a.length;
	if (len == 2) return a.reduceAroundAt$2.apply(null, a);
	if (len == 3) return a.reduceAroundAt$3.apply(null, a);
	if (len == 4) return a.reduceAroundAt$4.apply(null, a);
	if (len == 5) return a.reduceAroundAt$5.apply(null, a);
};
module.exports = a