"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.numeric = exports.atomic = exports.opt = exports.item = exports.map = exports.array = exports.def = exports.single = exports.maybe = exports.many = exports.any = exports.occurrence = void 0;

var _seq = require("./seq");

var _card = require("./seq/card");

var _util = require("./util");

var _array = require("./array");

var _map = require("./map");

// TODO make configurable
const check = true; // we know typed will take a function and test it,
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

  return t;
};

const errorMessage = (a, name, i, pos, key) => {
  if ((0, _util.isUndef)(a) || (0, _util.isUndef)(name)) return "Invalid value\n";
  const noKey = (0, _util.isUndef)(key);
  if (noKey) key = "argument";
  const io = i < 0 ? "output" : key + " " + (typeof i == "string" ? `"${i}"` : i);
  const typePart = noKey ? `for function '${name}'\n    at ${pos[0]} (${pos[1]}:${pos[2]}:${pos[3]})` : `found in ${name}`;
  return "Invalid " + io + " *" + JSON.stringify(a) + "* " + typePart + "\n";
};

const occurrence = (test, occ) => f => {
  const t = (a, name, i, pos, key) => (0, _seq.forEach)(a, a => {
    try {
      return checked(f, test(a));
    } catch (err) {
      throw new Error(errorMessage(a, name, i, pos, key) + err);
    }
  });

  t.__occurrence = occ;
  return t;
};

exports.occurrence = occurrence;
const any = occurrence(_util.id, 1);
exports.any = any;
const many = occurrence(_card.oneOrMore, 2);
exports.many = many;
const maybe = occurrence(_card.zeroOrOne, 3);
exports.maybe = maybe;
const single = occurrence(_card.exactlyOne, 4);
exports.single = single;

function unwrap(fn, args, s, r, name, pos, l, i, o) {
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
        unwrap(fn.bind(null, value), args, s, r, name, pos, l, i + 1, o);
      }

    });
  };

  const unwrapSingle = o => a => a.subscribe({
    next(a) {
      unwrap(fn.bind(null, a), args, s, r, name, pos, l, i + 1, o);
    },

    error(err) {
      o.error(err);
    }

  });

  let f = s[i];
  const c = f.__occurrence;
  if ((0, _util.isUndef)(c)) f = single(f);
  const a = check ? f(args[i], name, i, pos) : args[i];

  if ((0, _seq.isSeq)(a)) {
    // when we unwrap we get back an Observable, not a function...
    if (c === 3) {
      if (!o) {
        return (0, _seq.create)(o => {
          unwrapMaybe(o)(a);
        });
      } else {
        return unwrapMaybe(o)(a);
      }
    } else if (c === 4) {
      if (!o) {
        return (0, _seq.create)(o => {
          unwrapSingle(o)(a);
        });
      } else {
        return unwrapSingle(o)(a);
      }
    }
  }

  return unwrap(fn.bind(null, a), args, s, r, name, pos, l, i + 1, o);
} // TODO use separate cross-browser package conditionally


function getStack() {
  var orig = Error.prepareStackTrace;

  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };

  var err = new Error();
  Error.captureStackTrace(err);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

function checkArgLength(name, s, al) {
  let sl = s.length;

  while (sl > al) {
    if (!s[--sl].__optional) break;
  }

  if (al !== sl) {
    throw new Error(`Invalid number of arguments for function ${name}. Expected ${sl} got ${al}`);
  }
}

const def = (name, s, r, pos) => fn => {
  if (typeof fn !== "function") throw new TypeError("Invalid argument for function 'def'\nExpected a Function, got a " + fn.constructor.name);

  if ((0, _util.isUndef)(pos)) {
    var st = getStack()[2];
    pos = [st.getFunctionName(), st.getFileName(), st.getLineNumber(), st.getColumnNumber()];
  }

  const f = (...args) => {
    const al = args.length;
    checkArgLength(name, s, al);
    const ret = unwrap(fn, args, s, r, name, pos, al, 0);
    return check ? r(ret, name, -1, pos) : ret;
  };

  f.__wraps = fn;
  return f;
};

exports.def = def;

const array = f => a => {
  if (!(0, _util.isList)(a)) return (0, _array.array)();
  let i = 0;

  for (let x of a) {
    f(x, "array", i++, [], "value at index");
  }

  return a;
};

exports.array = array;

const map = f => a => {
  if (!(0, _util.isMap)(a)) return (0, _map.map)();
  let i = 0;

  for (let x of a) {
    f(x, "map", i++, [], "value at key");
  }

  return a;
};

exports.map = map;

const item = () => _util.id;

exports.item = item;

const opt = arg => {
  arg.__optional = true;
  return arg;
};

exports.opt = opt;

const atomic = () => a => {
  // boolean / string / numeric
  let t = typeof a;
  if (t === "string" || t === "number" || t === "boolean") return a;
  const b = a.constructor;
  return isNumeric(a, b) ? a : new b();
};

exports.atomic = atomic;

const isNumeric = (a, b) => {
  switch (b.name) {
    case "Integer":
    case "Number":
    case "Float":
    case "Decimal":
      return true;

    default:
      return false;
  }
};

const numeric = () => a => {
  const b = a.constructor;
  return isNumeric(a, b) ? a : new b();
};

exports.numeric = numeric;
//# sourceMappingURL=typed.js.map