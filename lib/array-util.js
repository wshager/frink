const n = require("../lib/index"),
	array = require("../lib/array");
// transpiled from XQuery version 3.1
const a = {}; // http://raddle.org/array-util;
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
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
a.foldLeft = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeft($array, $zero, $function, array.size($array));
}));
a.foldLeft = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
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
a.foldLeftAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldLeftAt($array, $zero, $function, 1);
}));
a.foldLeftAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	return a.foldLeftAt($array, $zero, $function, $at, array.size($array));
}));
a.foldLeftAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
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
a.foldRight = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldRight($array, $zero, $function, array.size($array));
}));
a.foldRight = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $s = a[3];
	return n.forEach(n.eq($s, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldRight(array.remove($array, $s), $function(array.get($array, $s), $zero), $function, n.minus($s, 1));
		}
	});
}));
a.foldRightAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	return a.foldRightAt($array, $zero, $function, array.size($array));
}));
a.foldRightAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $zero = a[1];
	let $function = a[2];
	let $at = a[3];
	return n.forEach(n.eq($at, "0"), test => {
		if (test) {
			return $zero;
		} else {
			return a.foldRightAt(array.remove($array, $at), $function(array.get($array, $at), $zero, $at), $function, n.minus($at, 1));
		}
	});
}));
a.forEach = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	return a.forEach($array, $function, n.array());
}));
a.forEach = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item()), n.item()), ((...a) => {
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
a.forEachAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item()), n.item()), ((...a) => {
	let $array = a[0];
	let $function = a[1];
	return a.forEachAt($array, $function, n.array(), 1);
}));
a.forEachAt = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.item(), n.item(), n.item()), n.item()), ((...a) => {
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
a.last = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne()))), n.item()), ((...a) => {
	let $array = a[0];
	return array.get($array, array.size($array));
}));
a.pop = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne()))), n.item()), ((...a) => {
	let $array = a[0];
	return array.remove($array, array.size($array));
}));
a.firstIndexOf = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
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
a.lastIndexOf = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrOne())), n.occurs(n.item(), n.zeroOrOne())), n.item()), ((...a) => {
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
exports = a;