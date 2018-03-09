const n = require("../lib/index"),
	array = require("../lib/array");
// transpiled from XQuery version 3.1
const a = {}; // http://raddle.org/array-util;
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $position = a[1];
	let $member = a[2];
	return n.forEach(n.gt($position, array.size($array)), test => {
		if (test) {
			return array.append($array, $member);
		} else {
			return array.insertBefore(array.remove($array, $position), $position, $member);
		}
	});
}));
a.foldLeft$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeft($array, $zero, $function, array.size($array));
}));
a.foldLeft$4 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $s = a[3];
	return n.forEach(n.eq($s, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldLeft(array.tail($array), $function($zero, array.head($array)), $function, n.minus($s, 1));
		}
	});
}));
a.foldLeftAt$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeftAt($array, $zero, $function, 1);
}));
a.foldLeftAt$4 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	return a.foldLeftAt($array, $zero, $function, $at, array.size($array));
}));
a.foldLeftAt$5 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	let $s = a[4];
	return n.forEach(n.eq($s, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldLeftAt(array.tail($array), $function($zero, array.head($array), $at), $function, n.add($at, 1), n.minus($s, 1));
		}
	});
}));
a.foldRight$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldRight($array, $zero, $function, array.size($array));
}));
a.foldRight$4 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $s = a[3];
	return n.forEach(n.eq($s, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldRight(array.remove($array, $s), $function($zero, array.get($array, $s)), $function, n.minus($s, 1));
		}
	});
}));
a.foldRightAt$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldRightAt($array, $zero, $function, array.size($array));
}));
a.foldRightAt$4 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	return n.forEach(n.eq($at, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldRightAt(array.remove($array, $at), $function($zero, array.get($array, $at), $at), $function, n.minus($at, 1));
		}
	});
}));
a.forEach$2 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	return a.forEach($array, $function, n.array());
}));
a.forEach$3 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $ret = a[2];
	return n.forEach(n.eq(array.size($array), "0"), test => {
		if (test) {
			return $ret;
		} else {
			return a.forEach(array.tail($array), $function, array.append($ret, $function(array.head($array))));
		}
	});
}));
a.forEachAt$2 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	return a.forEachAt($array, $function, n.array(), 1);
}));
a.forEachAt$4 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	let $ret = a[2];
	let $at = a[3];
	return n.forEach(n.eq(array.size($array), "0"), test => {
		if (test) {
			return $ret;
		} else {
			return a.forEachAt(array.tail($array), $function, array.append($ret, $function(array.head($array), $at)), n.add($at, 1));
		}
	});
}));
a.last$1 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $array = a[0];
	return array.get($array, array.size($array));
}));
a.pop$1 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $array = a[0];
	return array.remove($array, array.size($array));
}));
a.firstIndexOf$2 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
	let $array = a[0];
	let $lookup = a[1];
	return a.foldLeftAt($array, n.seq(), n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
		let $pre = a[0];
		let $cur = a[1];
		let $at = a[2];
		return n.forEach(n.or(n.empty($pre), n.deepEqual($cur, $lookup)), test => {
			if (test) {
				return $at;
			} else {
				return $pre;
			}
		});
	})));
}));
a.lastIndexOf$2 = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
	let $array = a[0];
	let $lookup = a[1];
	return a.foldRightAt($array, 0, n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
		let $cur = a[0];
		let $pre = a[1];
		let $at = a[2];
		return n.forEach(n.and(n.eq($pre, "0"), n.deepEqual($cur, $lookup)), test => {
			if (test) {
				return $at;
			} else {
				return $pre;
			}
		});
	})));
}));
a.put = (...a) => {
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
a.foldRight = (...a) => {
	const len = a.length;
	if (len == 3) return a.foldRight$3.apply(null, a);
	if (len == 4) return a.foldRight$4.apply(null, a);
};
a.foldRightAt = (...a) => {
	const len = a.length;
	if (len == 3) return a.foldRightAt$3.apply(null, a);
	if (len == 4) return a.foldRightAt$4.apply(null, a);
};
a.forEach = (...a) => {
	const len = a.length;
	if (len == 2) return a.forEach$2.apply(null, a);
	if (len == 3) return a.forEach$3.apply(null, a);
};
a.forEachAt = (...a) => {
	const len = a.length;
	if (len == 2) return a.forEachAt$2.apply(null, a);
	if (len == 4) return a.forEachAt$4.apply(null, a);
};
a.last = (...a) => {
	const len = a.length;
	if (len == 1) return a.last$1.apply(null, a);
};
a.pop = (...a) => {
	const len = a.length;
	if (len == 1) return a.pop$1.apply(null, a);
};
a.firstIndexOf = (...a) => {
	const len = a.length;
	if (len == 2) return a.firstIndexOf$2.apply(null, a);
};
a.lastIndexOf = (...a) => {
	const len = a.length;
	if (len == 2) return a.lastIndexOf$2.apply(null, a);
};
module.exports = a;
