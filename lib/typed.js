"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.item = exports.array = exports.def = exports.single = exports.maybe = exports.many = exports.any = exports.occurrence = void 0;

var _seq = require("./seq");

var _card = require("./seq/card");

var _util = require("./util");

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
  const typePart = noKey ? `for function '${name}' (in ${pos[0]} at line ${pos[1]}, column ${pos[2]})` : `found in ${name}`;
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

  const f = s[i];
  const c = f.__occurrence;
  const a = check ? f(args[i], name, i, pos) : a;

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

const def = (name, s, r, pos) => fn => {
  if (typeof fn !== "function") throw new TypeError("Invalid argument for function 'def'\nExpected a Function, got a " + fn.constructor.name);

  if ((0, _util.isUndef)(pos)) {
    var st = getStack()[2];
    pos = [st.getFileName(), st.getLineNumber(), st.getColumnNumber()];
  }

  const f = (...args) => {
    const ret = unwrap(fn, args, s, r, name, pos, args.length, 0);
    return check ? r(ret, -1, name) : ret;
  };

  f.__wraps = fn;
  return f;
};

exports.def = def;

const array = f => a => {
  if (!Array.isArray(a)) return [];
  a.forEach((a, i) => {
    f(a, "array", i, [], "value at index");
  });
  return a;
};

exports.array = array;
const item = _util.id;
exports.item = item;
//# sourceMappingURL=typed.js.map