"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.double = exports.generalOperatorMap = exports.operatorMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.decimal = decimal;
exports.integer = integer;
exports.string = string;
exports.number = number;
exports.float = float;
exports.boolean = boolean;
exports.cast = cast;
exports.to = to;
exports.indexOf = indexOf;
exports.call = call;
exports.and = and;
exports.or = or;
exports.not = not;
exports.op = op;
exports.data = data;
exports.instanceOf = instanceOf;
exports.minus = minus;
exports.round = round;
exports.floor = floor;

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

var _error = require("./error");

var _seq = require("./seq");

var _access = require("./access");

var _array = require("./array");

var _map = require("./map");

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
var operatorMap = exports.operatorMap = {
	"+": "plus",
	"-": "minus",
	"*": "times",
	"div": "div",
	"/": "div",
	"idiv": "div",
	"eq": "eq",
	"ne": "eq",
	"gt": "gt",
	"lt": "lt",
	"ge": "gte",
	"le": "gte",
	"&&": "and",
	"||": "or",
	"!": "not"
};

var generalOperatorMap = exports.generalOperatorMap = {
	">": "gt",
	"<": "lt",
	">=": "gte",
	"<=": "lte",
	"=": "eq",
	"!=": "eq"
};

var UntypedAtomic = function (_String) {
	_inherits(UntypedAtomic, _String);

	function UntypedAtomic(a) {
		_classCallCheck(this, UntypedAtomic);

		var _this = _possibleConstructorReturn(this, (UntypedAtomic.__proto__ || Object.getPrototypeOf(UntypedAtomic)).call(this, a));

		_this._value = a;
		return _this;
	}
	//cast(other) {
	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is an instance of a numeric type,
	//then the xdt:untypedAtomic value is cast to the type xs:double.

	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is an instance of xdt:untypedAtomic or xs:string,
	//then the xdt:untypedAtomic value is cast to the type xs:string.

	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is not an instance of xs:string, xdt:untypedAtomic, or any numeric type,
	//then the xdt:untypedAtomic value is cast to the dynamic type of the other value.

	// NO-OP, moved elsewhere
	//}


	_createClass(UntypedAtomic, [{
		key: "toString",
		value: function toString() {
			return this._value.toString();
		}
	}, {
		key: "valueOf",
		value: function valueOf() {
			return this._value.valueOf();
		}
	}]);

	return UntypedAtomic;
}(String);

var Integer = function (_Decimal) {
	_inherits(Integer, _Decimal);

	function Integer(a) {
		_classCallCheck(this, Integer);

		var _this2 = _possibleConstructorReturn(this, (Integer.__proto__ || Object.getPrototypeOf(Integer)).call(this, a));

		_this2.constructor = Integer;
		return _this2;
	}

	return Integer;
}(_big2.default);

var Float = function (_Number) {
	_inherits(Float, _Number);

	function Float(a) {
		_classCallCheck(this, Float);

		var temp = new Float32Array(1);
		temp[0] = +a;

		var _this3 = _possibleConstructorReturn(this, (Float.__proto__ || Object.getPrototypeOf(Float)).call(this, temp[0]));

		_this3._f = temp[0];
		_this3._d = a;
		return _this3;
	}

	_createClass(Float, [{
		key: "toString",
		value: function toString() {
			var temp = new Float64Array(1);
			temp[0] = +this._d;
			return temp[0].toString();
		}
	}, {
		key: "valueOf",
		value: function valueOf() {
			return this._f;
		}
	}]);

	return Float;
}(Number);

var compProto = {
	eq: function eq(other) {
		return this.valueOf() === other.valueOf();
	},
	gt: function gt(other) {
		return this.valueOf() > other.valueOf();
	},
	lt: function lt(other) {
		return this.valueOf() < other.valueOf();
	},
	gte: function gte(other) {
		return this.valueOf() >= other.valueOf();
	},
	lte: function lte(other) {
		return this.valueOf() <= other.valueOf();
	}
};

var opProto = {
	plus: function plus(other) {
		return this + other;
	},
	minus: function minus(other) {
		return this - other;
	},
	times: function times(other) {
		return this * other;
	},
	div: function div(other) {
		return this / other;
	}
};

// mixin comparators
Object.assign(String.prototype, compProto);

Object.assign(Float.prototype, compProto, opProto);

Object.assign(Number.prototype, compProto, opProto);

Object.assign(Boolean.prototype, compProto);

// TODO decimal opt-in/out
var zeroInt = function zeroInt() {
	return new _big2.default(0);
};
var zero = function zero() {
	return Number(0);
};
var emptyString = function emptyString() {
	return String();
};
var emptyUntypedAtomic = function emptyUntypedAtomic() {
	return new UntypedAtomic("");
};

// TODO create from Type classes
function decimal($a) {
	// type test
	return (0, _seq.seq)($a).concatMap(function (a) {
		return cast(a, _big2.default, zeroInt);
	});
}

function integer($a) {
	return (0, _seq.seq)($a).concatMap(function (a) {
		return cast(Math.floor(a), Integer, zeroInt);
	});
}

function string($a) {
	var card = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _seq.zeroOrOne;

	// type test
	var cc = String;
	if ((0, _util.isUndef)($a)) return (0, _seq.seq)(cc);
	//if(empty($a)) return seq(emptyString());
	// NOTE allow overriding cardinality
	return _seq.forEach(_seq.seq($a),function (a) {
		return (0, _access.isVNode)(a) ? data(a, cc, emptyString) : cast(a, cc, emptyString);
	},"string");
}

function number($a) {
	// type test
	var cc = Number;
	if ((0, _util.isUndef)($a)) return (0, _seq.seq)(cc);
	return (0, _seq.zeroOrOne)($a).concatMap(function (a) {
		return cast(a, cc, zero);
	});
}

function float($a) {
	// type test
	var cc = Number;
	if ((0, _util.isUndef)($a)) return (0, _seq.seq)(cc);
	return (0, _seq.zeroOrOne)($a).concatMap(function (a) {
		return cast(a, cc, zero);
	});
}

var double = exports.double = number;

var hasZeroOrOne = function hasZeroOrOne($a) {
	return $a.skip(1).isEmpty();
};

function boolean($a) {
	// type test
	return _seq.create($o => {
		var i = 0, done = false;
		if(!_seq.isSeq($a)) {
			$o.next(!!$a.valueOf());
			$o.complete();
			return;
		}
		$a.takeWhile(() => !done).subscribe({
			next: a => {
				const isVNode = (0, _access.isVNode)(a);
				if(i > 0) {
					if(!isVNode) {
						$o.error("err:FORG0006", "Item " + (i + 1) + " is not a node");
						done = true;
						return;
					}
				} else {
					if(!isVNode) {
						$o.next(!!a.valueOf());
					}
				}
				i++;
			},
			complete:() => {
				if(i === 0) $o.next(false);
				if(i > 1) $o.next(true);
				$o.complete();
			},
			error: err => {
				$o.error(err);
			}
		});
	}).publishReplay(1).refCount();
}

function cast($a, $b) {
	var emptyType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	$a = (0, _seq.seq)($a);
	$b = (0, _seq.exactlyOne)($b);
	return (0, _seq.empty)($a).concatMap(function (test) {
		return test ? emptyType ? (0, _seq.seq)(emptyType()) : (0, _seq.seq)() : op($a, _cast, $b);
	});
}

function _cast(a, b) {
	var emptyType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	if ((0, _util.isUndefOrNull)(a) && emptyType) return emptyType();
	if (a.constructor !== b) a = new b(a.toString());
	return a;
}

function to($a, $b) {
	return (0, _seq.range)($b, $a);
}

function indexOf($a, $b) {
	return (0, _seq.zeroOrOne)($b).concatMap(function (b) {
		return $a.map(function (x, i) {
			return b === x ? i + 1 : 0;
		}).filter(function (x) {
			return x;
		});
	});
}

function call() {
	var _this4 = this;

	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	(0, _seq.seq)(a[0]).concatMap(function (f) {
		if ((0, _array.isArray)(f)) {
			return (0, _array.get)(f, a[1]);
		} else if ((0, _map.isMap)(f)) {
			return (0, _map.get)(f, a[1]);
		} else {
			return f.apply(_this4, a.slice(1));
		}
	});
}

function numbertest(a) {
	var c = a.constructor;
	if (c == String || c == Boolean) return;
	return true;
}

function _op(op, invert, a, b) {
	var ret;
	if (a !== undefined) {
		if (typeof a[op] == "function") {
			if (!numbertest(a)) return (0, _error.error)("err:XPTY0004", a.constructor.name + "(" + a + ") can not be operand for " + op);
			if (!numbertest(b)) return (0, _error.error)("err:XPTY0004", b.constructor.name + "(" + b + ") can not be operand for " + op);
			var ab = _promote(a, b);
			if (ab instanceof Error) {
				return ab;
			}
			a = ab[0];
			b = ab[1];
			ret = a[op](b);
		} else {
			throw new Error("Operator " + op + " not implemented");
		}
	}
	return invert ? !ret : ret;
}

function _comp(op, invert, a, b) {
	var ret;
	if (a !== undefined) {
		if (typeof a[op] == "function") {
			//console.log(a,b);
			var ab = _promote(a, b);
			if (ab instanceof Error) {
				return ab;
			}
			a = ab[0];
			b = ab[1];
			ret = a[op](b);
		} else {
			throw new Error("XPST0017: Operator " + op + " not implemented for " + a + " (" + a.constructor.name + ")");
			//return (0, _error.error)("XPST0017", "Operator " + op + " not implemented for " + a + " (" + a.constructor.name + ")");
		}
	}
	return invert ? !ret : ret;
}

function _promote(a, b) {
	// TODO FIXME use JS type casting! 1 == "1"
	//If each operand is an instance of one of the types xs:string or xs:anyURI, then both operands are cast to type xs:string.
	//If each operand is an instance of one of the types xs:decimal or xs:float, then both operands are cast to type xs:float.
	//If each operand is an instance of one of the types xs:decimal, xs:float, or xs:double, then both operands are cast to type xs:double.
	var c = a.constructor,
	    d = b.constructor;
	if (c == Number || d == Number) {
		if (c == Integer || c == _big2.default || c == Float || c == UntypedAtomic) {
			a = +a.toString();
			c = Number;
		}
		if (d == Integer || d == _big2.default || d == Float || d == UntypedAtomic) {
			b = +b.toString();
			d = Number;
		}
	}
	if (c == Integer || d == Integer) {
		if (c == _big2.default || c == UntypedAtomic) {
			a = c == UntypedAtomic ? new Integer(a.toString()) : a;
			c = Integer;
		}
		if (d == _big2.default || d == UntypedAtomic) {
			b = d == UntypedAtomic ? new Integer(b.toString()) : b;
			d = Integer;
		}
	}
	if (c == String || d == String) {
		if (c == UntypedAtomic) {
			a = a.toString();
			c = String;
		}
		if (d == UntypedAtomic) {
			b = a.toString();
			d = String;
		}
	}
	if (c != d) {
		throw new Error("Cannot compare operands: " + c.name + " and " + d.name);
		return (0, _error.error)("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
	}
	return [a, b];
}

function _opReducer($a, opfn, $b, general,operator) {
	if (general) {
		return _seq.create($o => {
			var val = false;
			$a.takeWhile(() => !val).subscribe({
				next: a => {
					//console.log(operator,"a",a,id);
					$b.takeWhile(() => !val).subscribe({
						next: b => {
							//console.log(operator,"b",b,id);
							val = opfn(a,b);
							if(val) {
								$o.next(val);
								$o.complete();
							}
						},
						complete:() => {
							//console.log("b done",i);
						},
						error:err => {
							$o.error(err);
						}
					});
				},
				complete:() => {
					//console.log("a done",i);
					$o.next(val);
					$o.complete();
				},
				error:err => {
					$o.error(err);
				}
			});
		});
	} else {
		return _seq.create($o => {
			var i = 1;
			var val = [];
			var complete = () => {
				for(var v of val) {
					$o.next(v);
				}
				//console.log("op complete",operator);
				$o.complete();
			};
			var _handle = a => {
				if(_seq.isSeq($b)) {
					$b.subscribe({
						next: b => {
							//console.log("b",b,id);
							var ret = opfn(a,b);
							//console.log(ret);
							val.push(ret);
						},
						complete:() => {
							i--;
							//console.log("b done",i);
							if(i == 0) {
								complete();
							}
						},
						error:err => {
							$o.error(err);
						}
					});
				} else {
					var ret = opfn(a,$b);
					val.push(ret);
					i--;
					if(i == 0) complete();
					//console.log(ret);
				}
			};
			if(!_seq.isSeq($a)) {
				i++;
				_handle($a);
			} else {
				$a.subscribe({
					next: a => {
						//console.log("a",a,id);
						i++;
						_handle(a);
					},
					complete:() => {
						i--;
						//console.log("a done",i);
						if(i == 0) complete();
					},
					error:err => {
						$o.error(err);
					}
				});
			}
		});
	}
}

function and($a, $b) {
	//if(!_seq.isSeq($a) && !_seq.isSeq($b)) return $a && $b;
	$a = boolean($a);
	$b = boolean($b);
	// FIXME when a is false,
	// cancel subscription to b...
	return _seq.create($o => {
		var val = false;
		$a.subscribe({
			next: a => {
				//console.log("and a",op,a);
				if(a) {
					$b.subscribe({
						next: b => {
							val = b;
						},
						error: err => {
							$o.error(err);
						}
					});
				} else {
					val = a;
				}
			},
			complete: () => {
				$o.next(val);
				$o.complete();
			},
			error: err => {
				$o.error(err);
			}
		});
	}).publishReplay(1).refCount();
}

function or($a, $b) {
	$a = boolean($a);
	$b = boolean($b);
	// FIXME when a is true,
	// cancel subscription to b...
	return _seq.create($o => {
		var val = false;
		$a.subscribe({
			next: a => {
				//console.log("or a",op,a);
				if(!a) {
					$b.subscribe({
						next:b => {
							//console.log("or b",op,b);
							val = b;
						},
						error: err => {
							$o.error(err);
						}
					});
				} else {
					val = a;
				}
			},
			complete: () => {
				$o.next(val);
				$o.complete();
			},
			error: err => {
				$o.error(err);
			}
		});
	}).publishReplay(1).refCount();
}

function not($a) {
	return boolean($a).map(function (a) {
		return !a;
	});
}

var logic = {
	and: and,
	or: or,
	not: not
};

var opinv = {
	ne: true,
	"!=": true
};
function op($a, operator, $b) {
	var invert = false,
	    comp = false,
	    general = false,
	    hasOp = false,
	    operatorName;
	var opfn;
	if (typeof operator == "string") {
		invert = opinv[operator];
		hasOp = operator in operatorMap;
		if (!hasOp) {
			general = operator in generalOperatorMap;
			if (!general) return (0, _error.error)("xxx", "No such operator");
			operatorName = generalOperatorMap[operator];
		} else {
			operatorName = operatorMap[operator];
		}
		if (logic[operatorName]) {
			return logic[operatorName]($a, $b);
		} else {
			comp = compProto.hasOwnProperty(operatorName);
			opfn = comp ? _comp.bind(null, operatorName, invert) : _op.bind(null, operatorName, invert);
		}
		if (comp) {
			$a = data($a);
			$b = data($b);
		}
		if (!general) {
			// FIXME NOT! allow arithmetic on sequences (why not?)...
			// FIXME reduce when comp result is seq of booleans
			//$a = (0, _seq.seq)($a);
			//$b = (0, _seq.seq)($b);
		}
	} else if (typeof operator == "function") {
		opfn = operator;
	} else {
		return (0, _error.error)("XPST0017", "Unknown operator: " + operator);
	}
	return _opReducer($a, opfn, $b, general,operator);
}

function data($a) {
	var castToType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : UntypedAtomic;
	var emptyType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : emptyUntypedAtomic;
	if(!_seq.isSeq($a)) return dataImpl($a, castToType, emptyType);
	return $a.concatMap(function (a) {
		return dataImpl(a, castToType, emptyType);
	});
}

function dataImpl(node, castToType, emptyType) {
	if ((0, _access.isEmptyNode)(node)) return (0, _seq.seq)();
	if (!(0, _access.isVNode)(node)) return (0, _seq.seq)(node);
	return (0, _access.vdoc)(node).concatMap(function (node) {
		var type = node.type;
		// type 2 will only appear in vdoc when node is an attr
		if (type == 2 || type == 3) {
			var val = node.value;
			// if string, cast
			if (typeof val == "string" && castToType != String) {
				val = !val ? undefined : _cast(val, castToType, emptyType);
			}
			return (0, _seq.seq)(val);
		}
		return (0, _seq.seq)();
	});
}

function instanceOf($a, $b) {
	var card = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	if (!card) card = _seq.seq;
	return _opReducer($a,(a,b) => a.constructor == b,$b);
}

function minus($a) {
	var a = (0, _seq.first)($a);
	if (typeof a.neg == "function") return a.neg();
	return -a;
}

function round($a) {
	var a = (0, _seq.first)($a);
	if (!a) return integer(0);
	return integer(typeof a.round == "function" ? a.round() : Math.round(a));
}

function floor($a) {
	var a = (0, _seq.first)($a);
	if (!a) return integer(0);
	return integer(typeof a.floor == "function" ? a.floor() : Math.floor(a));
}
