import { seq, isSeq, create, forEach } from "./seq";

import { exactlyOne, zeroOrOne, oneOrMore } from "./seq/card";

import { id, isUndef, isList, isMap } from "./util";

import { array as makeArray } from "./array";

import { map as makeMap } from "./map";

// TODO make configurable
const check = true;

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
	const typePart = noKey ? `for function '${name}'\n    at ${pos[0]} (${pos[1]}:${pos[2]}:${pos[3]})` : `found in ${name}`;
	return "Invalid "+io+" *"+JSON.stringify(a)+"* "+typePart + "\n";
};

export const occurrence = (test,occ) => f => {
	const t = (a,name,i,pos,key) => forEach(a,a => {
		try {
			return checked(f, test(a));
		} catch(err) {
			throw new Error(errorMessage(a,name,i,pos,key)+err);
		}
	});
	t.__occurrence = occ;
	return t;
};
export const any = occurrence(id,1);
export const many = occurrence(oneOrMore,2);
export const maybe = occurrence(zeroOrOne,3);
export const single = occurrence(exactlyOne,4);

function unwrap(fn,args,s,r,name,pos,sl,al,hasRestParam,i,o) {
	if(i === al) {
		if(hasRestParam) sl--;
		if(sl > i) {
			throw argLengthError(name,sl,al,hasRestParam);
		}
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
				unwrap(fn.bind(null,value),args,s,r,name,pos,sl,al,hasRestParam,i+1,o);
			}
		});
	};
	const unwrapSingle = o => a => a.subscribe({
		next(a) {
			unwrap(fn.bind(null,a),args,s,r,name,pos,sl,al,hasRestParam,i+1,o);
		},
		error(err) {
			o.error(err);
		}
	});
	let f = s[i];
	// TODO check optional and adapt length
	if(isUndef(f) || f.__rest_param) {
		// try last
		if(hasRestParam) {
			f = sl > 1 ? s[sl - 2] : any(item());
		} else {
			throw argLengthError(name,sl,al,hasRestParam);
		}
	}
	const c = f.__occurrence;
	if(isUndef(c)) f = single(f);
	const a = check ? f(args[i],name,i,pos) : args[i];
	if(isSeq(a)) {
		// when we unwrap we get back an Observable, not a function...
		if(c === 3) {
			if(!o) {
				return create(o => {
					unwrapMaybe(o)(a);
				});
			} else {
				return unwrapMaybe(o)(a);
			}
		} else if(c === 4) {
			if(!o) {
				return create(o => {
					unwrapSingle(o)(a);
				});
			} else {
				return unwrapSingle(o)(a);
			}
		}
	}
	return unwrap(fn.bind(null,a),args,s,r,name,pos,sl,al,hasRestParam,i+1,o);
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

function argLengthError(name,sl,al,hasRestParam) {
	return new Error(`Invalid number of arguments for function ${name}. Expected ${hasRestParam ? "at least" : ""} ${sl} got ${al}`);
}

export const def = (name,s,r,pos) => {
	const sl = s ? s.length : -1;
	if(r) {
		const c = r.__occurrence;
		if(isUndef(c)) r = single(r);
	}
	const hasRestParam = sl > 0 && s[sl - 1].__rest_param;
	const f = fn => {
		if(typeof fn !== "function") throw new TypeError("Invalid argument for function 'def'\nExpected a Function, got a "+fn.constructor.name);
		if(isUndef(pos)) {
			var st = getStack()[2];
			pos = [st.getFunctionName(),st.getFileName(),st.getLineNumber(),st.getColumnNumber()];
		}
		const f = (...args) => {
			const al = args.length;
			const ret = unwrap(fn,args,s,r,name,pos,sl,al,hasRestParam,0);
			return check ? forEach(ret, a => r(a,name,-1,pos)) : ret;
		};
		f.__wraps = fn;
		return f;
	};
	f.__length = hasRestParam ? -1 : sl;
	return f;
};

export const array = f => a => {
	if(!isList(a)) return makeArray();
	let i = 0;
	for(let x of a) {
		f(x,"array",i++,[],"value at index");
	}
	return a;
};

export const map = f => a => {
	if(!isMap(a)) return makeMap();
	let i = 0;
	for(let x of a) {
		f(x,"map",i++,[],"value at key");
	}
	return a;
};

export const item = () => id;

export const atomic = () => a => {
	// boolean / string / numeric
	let t = typeof a;
	if(t === "string" || t === "number" || t === "boolean") return a;
	const b = a.constructor;
	return isNumeric(a,b) ? a : new b();
};

const isNumeric = (a,b) => {
	switch(b.name) {
	case "Integer":
	case "Number":
	case "Float":
	case "Decimal":
		return true;
	default:
		return false;
	}
};

export const numeric = () => a => {
	const b = a.constructor;
	return isNumeric(a,b) ? a : new b();
};

export const restParams = () => {
	return {__rest_param:true};
};
