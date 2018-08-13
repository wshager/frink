import { seq, isSeq, create, exactlyOne, zeroOrOne, oneOrMore } from "./seq";

import { id, isUndef } from "./util";

// we know typed will take a function and test it,
// so we can use the same function here to bind the subscriber
// we should run two tests:
// 1. the cardinality
// 2. the actual type
// furthermore, we should
// 3. unwrap Maybe (allowing nulls or preventing type tests) and Single
// 4. connect types for Flowable to subscriber

// wrap card + type, if isSeq, don't perform type test, but bind to subscriber:

const checked = (f,a) => {
	const t = f(a);
	if(typeof t == "function" && t.hasOwnProperty("__wraps")) {
		if(t.__wraps !== a) throw new Error("unknown function found");
	} else {
		if(a !== t) throw new TypeError("Incorrect type: expected "+t.constructor.name+", got "+a.constructor.name);
	}
	return t;
};


const errorMessage = (a,name,i,pos,key) => {
	if(isUndef(a) || isUndef(name)) return "Invalid value\n";
	const noKey = isUndef(key);
	if(noKey) key = "argument";
	const io = i < 0 ? "output" : key+" "+(typeof i == "string" ? `"${i}"` :  i);
	const typePart = noKey ? `for function '${name}' (in ${pos[0]} at line ${pos[1]}, column ${pos[2]})` : `found in ${name}`;
	return "Invalid "+io+" *"+JSON.stringify(a)+"* "+typePart + "\n";
};

const boundObserver = (f,name,i,pos,key) => a => create($o => {
	let last;
	a.subscribe({
		next(a) {
			last = a;
			$o.next(checked(f,a));
		},
		error(err) {
			$o.error(errorMessage(last,name,i,pos,key)+err);
		},
		complete(){
			$o.complete();
		}
	});
});

const card = test => f => {
	const t = (a,name,i,pos,key) => {
		if(isSeq(a)) return boundObserver(f,name,i,pos,key)(test(a));
		try {
			return checked(f, test(a));
		} catch(err) {
			throw new Error(errorMessage(a,name,i,pos,key)+err);
		}
	};
	t.__card = test.name;
	return t;
};
export const any = card(id);
export const many = card(oneOrMore);
export const maybe = card(zeroOrOne);
export const single = card(exactlyOne);

function unwrap(fn,args,s,r,name,pos,l,i,o) {
	if(i === l) {
		const ret = fn();
		return o ? seq(ret).subscribe(o) : ret;
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
				unwrap(fn.bind(null,value),args,s,r,name,pos,l,i+1,o);
			}
		});
	};
	const unwrapSingle = o => a => a.subscribe({
		next(a) {
			unwrap(fn.bind(null,a),args,s,r,name,pos,l,i+1,o);
		},
		error(err) {
			o.error(err);
		}
	});
	const f = s[i];
	const c = f.__card;
	const a = f(args[i],name,i,pos);
	if(isSeq(a)) {
		// when we unwrap we get back an Observable, not a function...
		if(c === "zeroOrOne") {
			if(!o) {
				return create(o => {
					unwrapMaybe(o)(a);
				});
			} else {
				return unwrapMaybe(o)(a);
			}
		} else if(c === "exactlyOne") {
			if(!o) {
				return create(o => {
					unwrapSingle(o)(a);
				});
			} else {
				return unwrapSingle(o)(a);
			}
		}
	}
	return unwrap(fn.bind(null,a),args,s,r,name,pos,l,i+1,o);
}

// TODO use separate cross-browser package conditionally
function getStack(){
	var orig = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack) {
		return stack;
	};
	var err = new Error;
	Error.captureStackTrace(err);
	var stack = err.stack;
	Error.prepareStackTrace = orig;
	return stack;
}

export const def = (name,s,r,pos) => fn => {
	if(typeof fn !== "function") throw new TypeError("Invalid argument for function 'def'\nExpected a Function, got a "+fn.constructor.name);
	if(isUndef(pos)) {
		var st = getStack()[2];
		pos = [st.getFileName(),st.getLineNumber(), st.getColumnNumber()];
	}
	const f = (...args) => r(unwrap(fn,args,s,r,name,pos,args.length,0),-1,name);
	f.__wraps = fn;
	return f;
};

export const array = f => a => {
	if(!Array.isArray(a)) return [];
	a.forEach((a,i) => {
		f(a,"array",i,[],"value at index");
	});
	return a;
};

export const item = id;
