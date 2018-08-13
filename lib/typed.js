"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.typed = exports.single = exports.maybe = exports.many = exports.any = void 0;

var _seq = require("./seq");

var _util = require("./util");

//var _operators = require("rxjs/operators");

// we know typed will take a function and test it,
// so we can use the same function here to bind the subscriber
// we should run two tests:
// 1. the cardinality
// 2. the actual type
// furthermore, we should
// 3. unwrap Maybe (allowing nulls or preventing type tests) and Single
// 4. connect types for Flowable to subscriber
// wrap card + type, if isSeq, don't perform type test, but bind to subscriber:
const checked = (f, a) => {
	const t = f(a);

	if (typeof t == "function" && t.hasOwnProperty("__wraps")) {
		if (t.__wraps !== a) throw new Error("unknown function found");
	} else {
		if (a !== t) throw new TypeError("Incorrect type: expected " + t.constructor.name + ", got " + a.constructor.name);
	}

	return a;
};

const errorMessage = (a,name,i,key) => {
	const io = i < 0 ? "output" : key+" "+(typeof i == "string" ? `"${i}"` :  i);
	const typePart = key === "argument" ? `for function '${name}'` : `found in ${name}`;
	return "Invalid "+io+" "+JSON.stringify(a)+" "+typePart + "\n";
};

const boundObserver = (f,name,i,key) => a => (0, _seq.create)($o => {
	let last;
	a.subscribe({
		next(a) {
			last = a;
			$o.next(checked(f, a));
		},

		error(err) {
			$o.error(errorMessage(last,name,i,key)+err);
		},

		complete() {
			$o.complete();
		}

	});
});

const card = test => f => {
	const t = (a,name,i,key = "argument") => {
		if((0, _seq.isSeq)(a)) return boundObserver(f,name,i)(test(a));
		try {
			return checked(f, test(a));
		} catch(err) {
			throw new Error(errorMessage(a,name,i,key)+err);
		}
	};

	t.__card = test.name;
	return t;
};

const any = card(_util.id);
exports.any = any;
const many = card(_seq.oneOrMore);
exports.many = many;
const maybe = card(_seq.zeroOrOne);
exports.maybe = maybe;
const single = card(_seq.exactlyOne);
exports.single = single;

function unwrap(fn, args, s, r, name, l, i, o) {
	if (i === l) {
		const ret = fn();
		return o ? (0, _seq.seq)(ret).subscribe(o) : ret;
	}

	const unwrapMaybe = o => a => {
		let value = null;
		a.subscribe({
    		next(a) {
				value = a;
    		},

    		error(err) {
    			o.error(err);
    		},

    		complete() {
				unwrap(fn.bind(null, value), args, s, r, name, l, i + 1, o);
    		}
    	});
	};

	const unwrapSingle = o => a => a.subscribe({
		next(a) {
			unwrap(fn.bind(null, a), args, s, r, name, l, i + 1, o);
		},

		error(err) {
			o.error(err);
		}

	});

	const f = s[i];
	const c = f.__card;
	const a = f(args[i],name,i);

	if ((0, _seq.isSeq)(a)) {
		// when we unwrap we get back an Observable, not a function...
		if (c === "zeroOrOne") {
			if (!o) {
				return (0, _seq.create)(o => {
					unwrapMaybe(o)(a);
				});
			} else {
				return unwrapMaybe(o)(a);
			}
		} else if (c === "exactlyOne") {
			if (!o) {
				return (0, _seq.create)(o => {
					unwrapSingle(o)(a);
				});
			} else {
				return unwrapSingle(o)(a);
			}
		}
	}

	return unwrap(fn.bind(null, a), args, s, r, name, l, i + 1, o);
}

const typed = (name, s, r) => fn => {
	const f = (...args) => {
		return r(unwrap(fn, args, s, r, name, args.length, 0),name,-1);
	};

	f.__wraps = fn;
	return f;
};

exports.typed = typed;
//# sourceMappingURL=typed.js.map
