"use strict";
const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map"),
	local = {};
// compiled from XQuery version 3.1
const a = {};
/*import module namespace console="http://exist-db.org/xquery/console";*/
a.put$3 = ($1, $2, $3) => {
	let $array, $position, $member;
	$array = /*array[1]*/ $1;
	$position = /*item[3]*/ $2;
	$member = /*item[3]*/ $3;
	if (n.boolean(n.gt( /*item[3]*/ $position, array.size( /*array[1]*/ $array)))) {
		return array.append( /*array[1]*/ $array, /*item[3]*/ $member)
	} else {
		return array.insertBefore(array.remove( /*array[1]*/ $array, /*item[3]*/ $position), /*item[3]*/ $position, /*item[3]*/ $member)
	}

};

a.foldLeft$3 = ($1, $2, $3) => {
	let $array, $zero, $function;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	return a.foldLeft( /*array[1]*/ $array, /*item[3]*/ $zero, /*item[3]*/ $function, array.size( /*array[1]*/ $array))

};

a.foldLeft$4 = ($1, $2, $3, $4) => {
	let $array, $zero, $function, $s;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	$s = /*item[3]*/ $4;
	if (n.boolean(n.eq( /*item[3]*/ $s, 0))) {
		return /*item[3]*/ $zero
	} else {
		return a.foldLeft(array.tail( /*array[1]*/ $array), /*item[3]*/ $function.call(null, /*item[3]*/ $zero, array.head( /*array[1]*/ $array), ), /*item[3]*/ $function, n.subtract( /*item[3]*/ $s, 1))
	}

};

a.foldLeftAt$3 = ($1, $2, $3) => {
	let $array, $zero, $function;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*function[1]*/ $3;
	return a.foldLeftAt( /*array[1]*/ $array, /*item[3]*/ $zero, /*function[1]*/ $function, 1)

};

a.foldLeftAt$4 = ($1, $2, $3, $4) => {
	let $array, $zero, $function, $at;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	$at = /*item[3]*/ $4;
	return a.foldLeftAt( /*array[1]*/ $array, /*item[3]*/ $zero, /*item[3]*/ $function, /*item[3]*/ $at, array.size( /*array[1]*/ $array))

};

a.foldLeftAt$5 = ($1, $2, $3, $4, $5) => {
	let $array, $zero, $function, $at, $s;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	$at = /*item[3]*/ $4;
	$s = /*item[3]*/ $5;
	if (n.boolean(n.eq( /*item[3]*/ $s, 0))) {
		return /*item[3]*/ $zero
	} else {
		return a.foldLeftAt(array.tail( /*array[1]*/ $array), /*item[3]*/ $function.call(null, /*item[3]*/ $zero, array.head( /*array[1]*/ $array), /*item[3]*/ $at, ), /*item[3]*/ $function, n.add( /*item[3]*/ $at, 1), n.subtract( /*item[3]*/ $s, 1))
	}

};

a.reduceAroundAt$2 = ($1, $2) => {
	let $array, $function, $head;
	$array = /*item[3]*/ $1;
	$function = /*item[3]*/ $2;
	$head = array.head( /*item[3]*/ $array);
	return a.reduceAroundAt(array.tail( /*item[3]*/ $array), /*item[3]*/ $function, /*item[1]*/ $head, /*item[1]*/ $head, n.seq(), 2)

};

a.reduceAroundAt$3 = ($1, $2, $3) => {
	let $array, $function, $zero;
	$array = /*item[3]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	return a.reduceAroundAt( /*item[3]*/ $array, /*item[3]*/ $function, /*item[3]*/ $zero, n.seq())

};

a.reduceAroundAt$4 = ($1, $2, $3, $4) => {
	let $array, $function, $zero, $lastSeed;
	$array = /*item[3]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	$lastSeed = /*item[3]*/ $4;
	return a.reduceAroundAt( /*item[3]*/ $array, /*item[3]*/ $function, /*item[3]*/ $zero, /*item[3]*/ $lastSeed, n.seq())

};

a.reduceAroundAt$5 = ($1, $2, $3, $4, $5) => {
	let $array, $function, $zero, $lastSeed, $nextSeed;
	$array = /*item[3]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	$lastSeed = /*item[3]*/ $4;
	$nextSeed = /*item[3]*/ $5;
	return a.reduceAroundAt( /*item[3]*/ $array, /*item[3]*/ $function, /*item[3]*/ $zero, /*item[3]*/ $lastSeed, /*item[3]*/ $nextSeed, 1)

};

a.reduceAroundAt$6 = ($1, $2, $3, $4, $5, $6) => {
	let $array, $function, $zero, $lastSeed, $nextSeed, $at, $tmp;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	$lastSeed = /*item[3]*/ $4;
	$nextSeed = /*item[3]*/ $5;
	$at = /*item[3]*/ $6;
	$tmp = map.map(map.entry("out", /*item[3]*/ $zero), map.entry("last", /*item[3]*/ $lastSeed), map.entry("entry", array.head( /*array[1]*/ $array)), map.entry("at", /*item[3]*/ $at));
	$tmp = a.foldLeft(array.tail( /*array[1]*/ $array), /*map[1]*/ $tmp, ($1, $2) => {
		let $tmp, $next, $out;
		$tmp = /*item[3]*/ $1;
		$next = /*item[3]*/ $2;
		$out = /*item[3]*/ $function.call(null, /*item[3]*/ $tmp.call(null, "out"), /*item[3]*/ $tmp.call(null, "entry"), /*item[3]*/ $tmp.call(null, "last"), /*item[3]*/ $next, /*item[3]*/ $tmp.call(null, "at"), );
		$tmp = map.put( /*item[3]*/ $tmp, "out", /*item[3]*/ $out);
		$tmp = map.put( /*map[1]*/ $tmp, "last", /*item[3]*/ $tmp.call(null, "entry"));
		$tmp = map.put( /*map[1]*/ $tmp, "entry", /*item[3]*/ $next);
		return map.put( /*map[1]*/ $tmp, "at", n.add( /*item[3]*/ $at, 1))

	});
	return /*item[3]*/ $function.call(null, /*item[3]*/ $tmp.call(null, "out"), /*item[3]*/ $tmp.call(null, "entry"), /*item[3]*/ $tmp.call(null, "last"), /*item[3]*/ $nextSeed, /*item[3]*/ $tmp.call(null, "at"), )

};

a.reduceAheadAt$2 = ($1, $2) => {
	let $array, $function;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	return a.reduceAheadAt(array.tail( /*array[1]*/ $array), /*item[3]*/ $function, array.head( /*array[1]*/ $array), n.seq(), 2)

};

a.reduceAheadAt$3 = ($1, $2, $3) => {
	let $array, $function, $zero;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	return a.reduceAheadAt( /*array[1]*/ $array, /*item[3]*/ $function, /*item[3]*/ $zero, n.seq())

};

a.reduceAheadAt$4 = ($1, $2, $3, $4) => {
	let $array, $function, $zero, $nextSeed;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	$nextSeed = /*item[3]*/ $4;
	return a.reduceAheadAt( /*array[1]*/ $array, /*item[3]*/ $function, /*item[3]*/ $zero, /*item[3]*/ $nextSeed, 1)

};

a.reduceAheadAt$5 = ($1, $2, $3, $4, $5) => {
	let $array, $function, $zero, $nextSeed, $at, $tmp;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$zero = /*item[3]*/ $3;
	$nextSeed = /*item[3]*/ $4;
	$at = /*item[3]*/ $5;
	$tmp = map.map(map.entry("out", /*item[3]*/ $zero), map.entry("entry", array.head( /*array[1]*/ $array)), map.entry("at", /*item[3]*/ $at));
	$tmp = a.foldLeft(array.tail( /*array[1]*/ $array), /*map[1]*/ $tmp, ($1, $2) => {
		let $tmp, $next, $out;
		$tmp = /*item[3]*/ $1;
		$next = /*item[3]*/ $2;
		$out = /*item[3]*/ $function.call(null, /*item[3]*/ $tmp.call(null, "out"), /*item[3]*/ $tmp.call(null, "entry"), /*item[3]*/ $next, /*item[3]*/ $tmp.call(null, "at"), );
		$tmp = map.put( /*item[3]*/ $tmp, "out", /*item[3]*/ $out);
		$tmp = map.put( /*map[1]*/ $tmp, "entry", /*item[3]*/ $next);
		return map.put( /*map[1]*/ $tmp, "at", n.add( /*item[3]*/ $at, 1))

	});
	return /*item[3]*/ $function.call(null, /*item[3]*/ $tmp.call(null, "out"), /*item[3]*/ $tmp.call(null, "entry"), /*item[3]*/ $nextSeed, /*item[3]*/ $tmp.call(null, "at"), )

};

a.foldRight$3 = ($1, $2, $3) => {
	let $array, $zero, $function;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	return a.foldRight( /*array[1]*/ $array, /*item[3]*/ $zero, /*item[3]*/ $function, array.size( /*array[1]*/ $array))

};

a.foldRight$4 = ($1, $2, $3, $4) => {
	let $array, $zero, $function, $s;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	$s = /*item[3]*/ $4;
	if (n.boolean(n.eq( /*item[3]*/ $s, 0))) {
		return /*item[3]*/ $zero
	} else {
		return a.foldRight(array.remove( /*array[1]*/ $array, /*item[3]*/ $s), /*item[3]*/ $function.call(null, /*item[3]*/ $zero, array.get( /*array[1]*/ $array, /*item[3]*/ $s), ), /*item[3]*/ $function, n.subtract( /*item[3]*/ $s, 1))
	}

};

a.foldRightAt$3 = ($1, $2, $3) => {
	let $array, $zero, $function;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	return a.foldRightAt( /*array[1]*/ $array, /*item[3]*/ $zero, /*item[3]*/ $function, array.size( /*array[1]*/ $array))

};

a.foldRightAt$4 = ($1, $2, $3, $4) => {
	let $array, $zero, $function, $at;
	$array = /*array[1]*/ $1;
	$zero = /*item[3]*/ $2;
	$function = /*item[3]*/ $3;
	$at = /*item[3]*/ $4;
	if (n.boolean(n.eq( /*item[3]*/ $at, 0))) {
		return /*item[3]*/ $zero
	} else {
		return a.foldRightAt(array.remove( /*array[1]*/ $array, /*item[3]*/ $at), /*item[3]*/ $function.call(null, /*item[3]*/ $zero, array.get( /*array[1]*/ $array, /*item[3]*/ $at), /*item[3]*/ $at, ), /*item[3]*/ $function, n.subtract( /*item[3]*/ $at, 1))
	}

};

a.forEach$2 = ($1, $2) => {
	let $array, $function;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	return a.forEach( /*array[1]*/ $array, /*item[3]*/ $function, array.array())

};

a.forEach$3 = ($1, $2, $3) => {
	let $array, $function, $ret;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$ret = /*item[3]*/ $3;
	if (n.boolean(n.eq(array.size( /*array[1]*/ $array), 0))) {
		return /*item[3]*/ $ret
	} else {
		return a.forEach(array.tail( /*array[1]*/ $array), /*item[3]*/ $function, array.append( /*item[3]*/ $ret, /*item[3]*/ $function.call(null, array.head( /*array[1]*/ $array))))
	}

};

a.forEachAt$2 = ($1, $2) => {
	let $array, $function;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	return a.forEachAt( /*array[1]*/ $array, /*item[3]*/ $function, array.array(), 1)

};

a.forEachAt$4 = ($1, $2, $3, $4) => {
	let $array, $function, $ret, $at;
	$array = /*array[1]*/ $1;
	$function = /*item[3]*/ $2;
	$ret = /*item[3]*/ $3;
	$at = /*item[3]*/ $4;
	if (n.boolean(n.eq(array.size( /*array[1]*/ $array), 0))) {
		return /*item[3]*/ $ret
	} else {
		return a.forEachAt(array.tail( /*array[1]*/ $array), /*item[3]*/ $function, array.append( /*item[3]*/ $ret, /*item[3]*/ $function.call(null, array.head( /*array[1]*/ $array), /*item[3]*/ $at, )), n.add( /*item[3]*/ $at, 1))
	}

};

a.last$1 = ($1) => {
	let $array;
	$array = /*array[1]*/ $1;
	return array.get( /*array[1]*/ $array, array.size( /*array[1]*/ $array))

};

a.pop$1 = ($1) => {
	let $array;
	$array = /*array[1]*/ $1;
	return array.remove( /*array[1]*/ $array, array.size( /*array[1]*/ $array))

};

a.firstIndexOf$2 = ($1, $2) => {
	let $array, $lookup;
	$array = /*array[1]*/ $1;
	$lookup = /*item[2]*/ $2;
	return a.foldLeftAt( /*array[1]*/ $array, n.seq(), ($1, $2, $3) => {
		let $pre, $cur, $at;
		$pre = /*item[3]*/ $1;
		$cur = /*item[3]*/ $2;
		$at = /*item[3]*/ $3;
		if (n.boolean(n.empty( /*item[3]*/ $pre)) || n.boolean(n.deepEqual( /*item[3]*/ $cur, /*item[2]*/ $lookup))) {
			return /*item[3]*/ $at
		} else {
			return /*item[3]*/ $pre
		}

	})

};

a.lastIndexOf$2 = ($1, $2) => {
	let $array, $lookup;
	$array = /*array[1]*/ $1;
	$lookup = /*item[2]*/ $2;
	return a.foldRightAt( /*array[1]*/ $array, 0, ($1, $2, $3) => {
		let $cur, $pre, $at;
		$cur = /*item[3]*/ $1;
		$pre = /*item[3]*/ $2;
		$at = /*item[3]*/ $3;
		if (n.boolean(n.eq( /*item[3]*/ $pre, 0)) && n.boolean(n.deepEqual( /*item[3]*/ $cur, /*item[2]*/ $lookup))) {
			return /*item[3]*/ $at
		} else {
			return /*item[3]*/ $pre
		}

	})

};

a.put = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.put", $len);
	if ($len == 3) return n.fromPromise(a.put$3.apply(null, $));
};
a.foldLeft = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.foldLeft", $len);
	if ($len == 3) return n.fromPromise(a.foldLeft$3.apply(null, $));
	if (process.env.debug) console.log("a.foldLeft", $len);
	if ($len == 4) return n.fromPromise(a.foldLeft$4.apply(null, $));
};
a.foldLeftAt = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.foldLeftAt", $len);
	if ($len == 3) return n.fromPromise(a.foldLeftAt$3.apply(null, $));
	if (process.env.debug) console.log("a.foldLeftAt", $len);
	if ($len == 4) return n.fromPromise(a.foldLeftAt$4.apply(null, $));
	if (process.env.debug) console.log("a.foldLeftAt", $len);
	if ($len == 5) return n.fromPromise(a.foldLeftAt$5.apply(null, $));
};
a.reduceAroundAt = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.reduceAroundAt", $len);
	if ($len == 2) return n.fromPromise(a.reduceAroundAt$2.apply(null, $));
	if (process.env.debug) console.log("a.reduceAroundAt", $len);
	if ($len == 3) return n.fromPromise(a.reduceAroundAt$3.apply(null, $));
	if (process.env.debug) console.log("a.reduceAroundAt", $len);
	if ($len == 4) return n.fromPromise(a.reduceAroundAt$4.apply(null, $));
	if (process.env.debug) console.log("a.reduceAroundAt", $len);
	if ($len == 5) return n.fromPromise(a.reduceAroundAt$5.apply(null, $));
	if (process.env.debug) console.log("a.reduceAroundAt", $len);
	if ($len == 6) return n.fromPromise(a.reduceAroundAt$6.apply(null, $));
};
a.reduceAheadAt = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.reduceAheadAt", $len);
	if ($len == 2) return n.fromPromise(a.reduceAheadAt$2.apply(null, $));
	if (process.env.debug) console.log("a.reduceAheadAt", $len);
	if ($len == 3) return n.fromPromise(a.reduceAheadAt$3.apply(null, $));
	if (process.env.debug) console.log("a.reduceAheadAt", $len);
	if ($len == 4) return n.fromPromise(a.reduceAheadAt$4.apply(null, $));
	if (process.env.debug) console.log("a.reduceAheadAt", $len);
	if ($len == 5) return n.fromPromise(a.reduceAheadAt$5.apply(null, $));
};
a.foldRight = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.foldRight", $len);
	if ($len == 3) return n.fromPromise(a.foldRight$3.apply(null, $));
	if (process.env.debug) console.log("a.foldRight", $len);
	if ($len == 4) return n.fromPromise(a.foldRight$4.apply(null, $));
};
a.foldRightAt = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.foldRightAt", $len);
	if ($len == 3) return n.fromPromise(a.foldRightAt$3.apply(null, $));
	if (process.env.debug) console.log("a.foldRightAt", $len);
	if ($len == 4) return n.fromPromise(a.foldRightAt$4.apply(null, $));
};
a.forEach = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.forEach", $len);
	if ($len == 2) return n.fromPromise(a.forEach$2.apply(null, $));
	if (process.env.debug) console.log("a.forEach", $len);
	if ($len == 3) return n.fromPromise(a.forEach$3.apply(null, $));
};
a.forEachAt = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.forEachAt", $len);
	if ($len == 2) return n.fromPromise(a.forEachAt$2.apply(null, $));
	if (process.env.debug) console.log("a.forEachAt", $len);
	if ($len == 4) return n.fromPromise(a.forEachAt$4.apply(null, $));
};
a.last = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.last", $len);
	if ($len == 1) return n.fromPromise(a.last$1.apply(null, $));
};
a.pop = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.pop", $len);
	if ($len == 1) return n.fromPromise(a.pop$1.apply(null, $));
};
a.firstIndexOf = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.firstIndexOf", $len);
	if ($len == 2) return n.fromPromise(a.firstIndexOf$2.apply(null, $));
};
a.lastIndexOf = (...$) => {
	const $len = $.length;
	if (process.env.debug) console.log("a.lastIndexOf", $len);
	if ($len == 2) return n.fromPromise(a.lastIndexOf$2.apply(null, $));
};
module.exports = a