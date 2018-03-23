const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const xqc = {}; // http://raddle.org/xquery-compat;
const console = require("./console");
const a = require("../lib/array-util.js");
const dawg = require("../lib/dawg.js");
const Scheduler = require("rxjs/Scheduler").Scheduler;
/*
semicolon = 0
open = 1
close = 2
comma = 3
reserved = 4 (known operator)
var = 5 ($qname)
qname = 6
string = 7
number = 8
comment = 9
$ = 10
xml = 11
attrkey = 12
dot = 13
unknown = 14
 */
xqc.ncform = ("\\p{L}\\p{N}\\-_");
xqc.ncname = (n.concat("^[", xqc.ncform, "]"));
xqc.qform = (n.concat("[", xqc.ncform, ":]+"));
xqc.qname = (n.concat("^", xqc.qform, "(#\\p{N}+)?$"));
xqc.operators = n.typed(map.map(n.integer(), n.string()), map.map(n.pair(1, "("), n.pair(2, ")"), n.pair(3, "{"), n.pair(4, "}"), n.pair(5, ";"), n.pair(6, "\""), n.pair(7, "'"), n.pair(8, "."), n.pair(9, "$"), n.pair(14, "#"), n.pair(100, ","), n.pair(200, "satisfies"), n.pair(201, "some"), n.pair(202, "every"), n.pair(203, "switch"), n.pair(204, "typeswitch"), n.pair(205, "try"), n.pair(206, "if"), n.pair(207, "then"), n.pair(208, "else"), n.pair(209, "let"), n.pair(210, ":="), n.pair(211, "return"), n.pair(212, "case"), n.pair(213, "default"), n.pair(214, "xquery"), n.pair(215, "version"), n.pair(216, "module"), n.pair(217, "declare"), n.pair(218, "variable"), n.pair(219, "import"), n.pair(220, "at"), n.pair(221, "for"), n.pair(222, "in"), n.pair(223, "where"), n.pair(224, "order-by"), n.pair(225, "group-by"), n.pair(300, "or"), n.pair(400, "and") /* eq, ne, lt, le, gt, ge, =, !=, <, <=, >, >=, is, <<, >> */ , n.pair(501, ">>"), n.pair(502, "<<"), n.pair(503, "is"), n.pair(504, ">="), n.pair(505, ">"), n.pair(506, "<="), n.pair(507, "<"), n.pair(508, "!="), n.pair(509, "="), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "||"), n.pair(700, "to"), n.pair(801, "-"), n.pair(802, "+"), n.pair(901, "mod"), n.pair(902, "idiv"), n.pair(903, "div"), n.pair(904, "*"), n.pair(1001, "union"), n.pair(1002, "|"), n.pair(1101, "intersect"), n.pair(1102, "except"), n.pair(1200, "instance-of"), n.pair(1300, "treat-as"), n.pair(1400, "castable-as"), n.pair(1500, "cast-as"), n.pair(1600, "=>"), n.pair(1701, "+"), n.pair(1702, "-"), n.pair(1800, "!"), n.pair(1901, "/"), n.pair(1902, "//"), n.pair(2001, "["), n.pair(2002, "]"), n.pair(2003, "?"), n.pair(2101, "array"), n.pair(2102, "attribute"), n.pair(2103, "comment"), n.pair(2104, "document"), n.pair(2105, "element"), n.pair(2106, "function"), n.pair(2107, "map"), n.pair(2108, "namespace"), n.pair(2109, "processing-instruction"), n.pair(2110, "text"), n.pair(2201, "array"), n.pair(2202, "attribute"), n.pair(2203, "comment"), n.pair(2204, "document-node"), n.pair(2205, "element"), n.pair(2206, "empty-sequence"), n.pair(2207, "function"), n.pair(2208, "item"), n.pair(2209, "map"), n.pair(2210, "namespace-node"), n.pair(2211, "node"), n.pair(2212, "processing-instruction"), n.pair(2213, "schema-attribute"), n.pair(2214, "schema-element"), n.pair(2215, "text"), n.pair(2400, "as"), n.pair(2501, "(:"), n.pair(2502, ":)"), n.pair(2600, ":")));
xqc.constructors = (map.map(n.pair(2101, "l"), n.pair(2102, "a"), n.pair(2103, "c"), n.pair(2104, "d"), n.pair(2105, "e"), n.pair(2106, "q"), n.pair(2107, "m"), n.pair(2108, "s"), n.pair(2109, "p"), n.pair(2110, "x")));
xqc.occurrence = (map.map(n.pair(2003, "zero-or-one"), n.pair(904, "zero-or-more"), n.pair(802, "one-or-more")));
xqc.types = (n.seq("anyAtomicType", "untypedAtomic", "dateTime", "dateTimeStamp", "date", "time", "duration", "yearMonthDuration", "dayTimeDuration", "float", "double", "decimal", "integer", "nonPositiveInteger", "negativeInteger", "long", "int", "short", "byte", "nonNegativeInteger", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte", "positiveInteger", "gYearMonth", "gYear", "gMonthDay", "gDay", "gMonth", "string", "normalizedString", "token", "language", "NMTOKEN", "Name", "NCName", "ID", "IDREF", "ENTITY", "boolean", "base64Binary", "hexBinary", "anyURI", "QName", "NOTATION"));
xqc.operatorMap = n.typed(map.map(n.integer(), n.string()), map.map(n.pair(206, "if"), n.pair(209, "item"), n.pair(501, "precedes"), n.pair(502, "follows"), n.pair(503, "is"), n.pair(504, "gge"), n.pair(505, "ggt"), n.pair(506, "gle"), n.pair(507, "glt"), n.pair(508, "gne"), n.pair(509, "geq"), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "concat"), n.pair(801, "subtract"), n.pair(802, "add"), n.pair(904, "multiply"), n.pair(1002, "union"), n.pair(1701, "plus"), n.pair(1702, "minus"), n.pair(1800, "x-for-each"), n.pair(1901, "select"), n.pair(1902, "select-deep"), n.pair(2001, "x-filter"), n.pair(2003, "lookup"), n.pair(2004, "array:array"), n.pair(2600, "pair"), n.pair(2501, "comment"), n.pair(2107, "map:map")));
xqc.operatorTrie = (n.jsonDoc("./operator-trie.json"));
/* TODO detect these functions and fix them... */
xqc.cxf0 = (n.seq("base-uri", "data", "document-uri", "has-children", "last", "local-name", "name", "namespace-uri", "nilled", "node-name", "normalize-space", "number", "path", "position", "root", "string", "string-length", "generate-id"));
xqc.cxf1 = (n.seq("element-with-id", "id", "idref", "lang"));
xqc.uriChars = (map.map(n.pair("%3E", ">"), n.pair("%3C", "<"), n.pair("%2C", ","), n.pair("%3A", ":")));
xqc.detectCxf$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $sub = $[0];
	return a.foldLeftAt($sub, array.array(), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
		let $acc = $[0];
		let $x = $[1];
		let $at = $[2];
		return n.if(n.and(n.eq($x("t"), 6), n.geq($x("v"), xqc.cxf0)), (test) => {
			if (test) {
				let $dotless = n.and(n.eq($sub(n.add($at, 1))("t"), 1), n.eq($sub(n.add($at, 2))("t"), 2));
				let $dot = n.and(n.eq($dotless, n.false()), n.eq($sub(n.add($at, 2))("t"), 14));
				return n.if(n.or($dotless, $dot), (test) => {
					if (test) {
						return array.append($acc, map.map(n.pair("qname", $x("v")), n.pair("at", $at), n.pair("dotless", $dotless)));
					} else {
						return $acc;
					}
				});
			} else {
				return $acc;
			}
		});
	})));
}));
xqc.replaceDotless$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $r = $[0];
	let $offset = $[1];
	let $cxfs = $[2];
	return a.foldRightAt($cxfs, $r, n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
		let $r = $[0];
		let $cxf = $[1];
		let $at = $[2];
		return n.if(n.boolean($cxf("dotless")), (test) => {
			if (test) {
				let $i = n.add($cxf("at"), $offset);
				let $ref = $r($i);
				return array.insertBefore($r, n.add($i, 2), xqc.tpl(13, n.add($ref("d"), 1), "."));
			} else {
				return $r;
			}
		});
	})));
}));
xqc.isQname$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $b = $[0]; /*    every $s in $b satisfies matches($s,$xqc:qform)*/ /*    fold-left($b,true(),function($acc,$s) {*/ /*        $acc and matches($s,$xqc:qform)*/ /*    })*/
	return n.matches(n.stringJoin($b), xqc.qname);
}));
xqc.inspectBuf$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $s = $[0];
	return n.if(n.empty($s), (test) => {
		if (test) {
			return n.seq();
		} else {
			let $ret = dawg.traverse(xqc.operatorTrie, $s);
			console.log("$RET",$ret);
			return n.if(n.or(n.empty($ret), n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore())))), (test) => {
				if (test) {
					return n.if(xqc.isQname($s), (test) => {
						if (test) {
							return map.map(n.pair("t", 6), n.pair("v", n.stringJoin($s)));
						} else {
							return n.if(n.eq(n.xFilter($s, ((...$) => {
								return n.geq(n.position($[0]), 1);
							})), "$"), (test) => {
								if (test) {
									return map.map(n.pair("t", 5), n.pair("v", n.stringJoin($s)));
								} else {
									return n.if(n.eq(n.xFilter($s, ((...$) => {
										return n.geq(n.position($[0]), 1);
									})), "\""), (test) => {
										if (test) {
											return map.map(n.pair("t", 7), n.pair("v", n.stringJoin($s)));
										} else {
											return map.map(n.pair("t", 14), n.pair("v", $s));
										}
									});
								}
							});
						}
					});
				} else {
					return map.map(n.pair("t", 4), n.pair("v", $ret));
				}
			});
		}
	});
}));
xqc.incr$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $a = $[0];
	return array.forEach($a, n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
		let $entry = $[0];
		return map.put($entry, "d", n.add(map.get($entry, "d"), 1));
	})));
}));
xqc.tpl$3 = n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $t = $[0];
	let $d = $[1];
	let $v = $[2];
	return map.map(n.pair("t", $t), n.pair("d", $d), n.pair("v", $v));
}));
xqc.opName$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $v = $[0];
	return n.if(map.contains(xqc.operatorMap, $v), (test) => {
		if (test) {
			return xqc.operatorMap($v);
		} else {
			return xqc.operators($v);
		}
	});
}));
xqc.guardedGet$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $r = $[0];
	let $size = $[1];
	return n.if(n.gt($size, 0), (test) => {
		if (test) {
			let $last = $r($size);
			return n.if(n.empty($last), (test) => {
				if (test) {
					return map.map();
				} else {
					return n.if(n.and(n.eq($last("t"), 9), n.gt($size, 0)), (test) => {
						if (test) {
							return xqc.guardedGet($r, n.subtract($size, 1));
						} else {
							return $last;
						}
					});
				}
			});
		} else {
			return map.map();
		}
	});
}));
xqc.unwrap$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	global.console.trace();
	let $cur = $[0];
	let $tmp = $[1];
	console.log("tm",$tmp);
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p") /* TODO cleanup (e.g. separate is-close and is-op), apply for all cases */ ;
	let $osize = array.size($o);
	//console.log("osize",$osize);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	//console.log("ocur",$ocur);
	let $hasTypesig = n.and(n.eq($ocur("t"), 4), n.eq($ocur("v"), 2400));
	$o = n.if(n.boolean($hasTypesig), ($o, test) => {
		if (test) {
			return a.pop($o);
		} else {
			return $o;
		}
	}, $o);
	//console.log("cur",$cur);
	$osize = n.if(n.boolean($hasTypesig), ($osize, test) => {
		if (test) {
			return array.size($o);
		} else {
			return $osize;
		}
	}, $osize);

	$ocur = n.if(n.gt($osize, 0), ($ocur, test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	}, $ocur);
	let $size = array.size($r);
	let $ot = $ocur("t");
	let $ov = $ocur("v");
	let $hasOp = n.eq($ot, 4);
	let $t = $cur("t");
	let $v = $cur("v");
	//console.log("tv",$t,$v);

	let $type = n.if(n.eq($t, 1), ($ocur, test) => {
		if (test) {
			return n.if(n.eq($v, 1), (test) => {
				if (test) {
					return 1;
				} else {
					return n.if(n.eq($v, 3), (test) => {
						if (test) {
							return 3;
						} else {
							return n.if(n.eq($v, 2001), (test) => {
								if (test) {
									return 2001;
								} else {
									return n.seq();
								}
							});
						}
					});
				}
			});
		} else {
			return n.if(n.eq($t, 2), (test) => {
				if (test) {
					return n.if(n.eq($v, 2), (test) => {
						if (test) {
							return 2;
						} else {
							return n.if(n.eq($v, 4), (test) => {
								if (test) {
									return 4;
								} else {
									return n.if(n.eq($v, 2002), (test) => {
										if (test) {
											return 2002;
										} else {
											return n.seq();
										}
									});
								}
							});
						}
					});
				} else {
					return n.if(n.eq($t, 4), (test) => {
						if (test) {
							return $v;
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	}, $ocur);
	let $isClose = n.eq($t, 2);
	let $isLet = n.eq($type, 209);
	let $isBody = n.and(n.and(n.eq($type, 4), $hasOp), n.eq($ov, 3106));
	//console.log("ocur",$ocur);
	let $has = n.if(n.eq($ot, 1), ($ocur, test) => {
		if (test) {
			return n.if(n.eq($ov, 1), (test) => {
				if (test) {
					return 1;
				} else {
					return n.if(n.eq($ov, 3), (test) => {
						if (test) {
							return 3;
						} else {
							return n.if(n.eq($ov, 2001), (test) => {
								if (test) {
									return 2001;
								} else {
									return n.if(n.eq($ov, 2004), (test) => {
										if (test) {
											return 2004;
										} else {
											return n.seq();
										}
									});
								}
							});
						}
					});
				}
			});
		} else {
			return n.if(n.eq($ot, 11), (test) => {
				if (test) {
					return $ot; /* direct-elem-constr */
				} else {
					return n.if(n.boolean($hasOp), (test) => {
						if (test) {
							return n.if(n.eq($ov, 210), (test) => {
								if (test) {
									return n.if(n.geq($type, n.seq(209, 211)), (test) => {
										if (test) {
											return $ov;
										} else {
											return n.seq();
										}
									});
								} else {
									return n.if(n.and(n.gt($ov, 2100), n.lt($ov, 2200)), (test) => {
										if (test) {
											return 2100;
										} else {
											return n.if(n.and(n.eq($type, 4), n.seq(n.and(n.gt($ov, 3000), n.lt($ov, 3100)))), (test) => {
												if (test) {
													return 2200; /* some constructor */
												} else {
													return n.if(n.and(n.seq(n.or(n.eq($type, 2), n.eq($t, 3))), n.eq($ov, 3006)), (test) => {
														if (test) {
															return 3006; /* params */
														} else {
															return n.if(n.and(n.eq($type, 6), n.geq($ov, n.seq(2001, 2004))), (test) => {
																if (test) {
																	return 4000; /* array / filter */
																} else {
																	return n.if(n.eq($ov, 211), (test) => {
																		if (test) {
																			return n.if(n.eq($type, 209), (test) => {
																				if (test) {
																					return 211;
																				} else {
																					return 231; /* flwor return */
																				}
																			});
																		} else {
																			return n.if(n.geq($ov, n.seq(207, 208, 221, 222, 223, 224, 225, 1200, 2600, 2400)), (test) => {
																				if (test) {
																					/*
																					 * 207 = then
																					 * 208 = else
																					 * 221 = xfor
																					 * 2600 = tuple
																					 * 2400 = typesig
																					 */
																					return $ov;
																				} else {
																					return n.seq();
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						} else {
							return n.seq(); /* TODO only is let if at same depth! */
						}
					});
				}
			});
		}
	}, $ocur);
	//console.log("has",$has);
	let $isX = n.and($hasOp, n.geq($type, n.seq(222, 223, 224, 225)));
	let $closeParams = n.and(n.eq($type, 2), n.eq($has, 3006));
	let $hasAss = n.eq($has, 210);
	let $hasXfor = n.eq($has, 221);
	let $hasX = n.geq($has, n.seq(222, 223, 224, 225));
	let $isXlet = n.and($isLet, $hasX /* closing a constructor is always detected, because the opening bracket is never added to openers for constructors */ );
	let $hasConstr = n.eq($has, 2200);
	let $hasConstrType = n.eq($has, 2100 /* has-params means theres no type-sig to close */ );
	let $hasParam = n.and(n.eq($hasTypesig, n.false()), n.eq($has, 3006));
	let $hasXret = n.eq($has, 231);
	let $pass = n.and(n.eq($type, 209), n.seq(n.or(n.eq($has, 207), n.or(n.eq($hasOp, n.false()), n.or(n.eq($ov, 3106), n.eq($has, 211))))));
	$pass = n.or($pass, n.or(n.or(n.eq($type, 210), n.seq(n.and(n.eq($t, 3), n.eq($has, 1)))), n.eq($osize, 0)));
	let $hasAf = n.eq($has, 4000);
	let $hasXass = n.and($hasOp, n.and(n.eq($ov, 210), n.seq(n.or($isX, n.seq(n.and($hasAss, n.and(n.gt($osize, 1), n.and(n.eq($o(n.subtract($osize, 1))("t"), 4), n.geq($o(n.subtract($osize, 1))("v"), n.seq(222, 223, 224, 225))))))))));
	let $isXret = n.and(n.eq($type, 211), n.seq(n.or($hasX, $hasXass)) /* just some operators to close */ );
	let $hasTuple = n.and(n.eq($t, 3), n.geq($has, 2600));
	let $matching = n.seq(n.or(n.or(n.seq(n.and(n.eq($type, 4), n.eq($has, 3))), n.seq(n.and(n.eq($type, 2), n.eq($has, 1)))), n.seq(n.and(n.eq($type, 2002), n.geq($has, n.seq(2001, 2004))))));
	let $closeThen = n.and(n.eq($type, 208), n.eq($has, 207 /* else adds a closing bracket */ ));
	let $isLetInElse = n.and(n.eq($has, 208), n.and(n.eq($isLet, n.true()), n.eq(xqc.guardedGet($r, $size)("t"), 1)));
	$r = n.if(n.and(n.eq($has, 208), n.eq($isLetInElse, n.false())), ($r, test) => {
		if (test) {
			return array.append($r, xqc.tpl(2, $d, 4));
		} else {
			return n.if(n.and($matching, n.eq($has, 2001)), (test) => {
				if (test) {
					let $index = $i($d);
					let $sub = array.subarray($r, $index);
					let $cxfs = xqc.detectCxf($sub) /*            let $nu := console:log($cxfs)*/ ;
					let $flat = array.flatten(array.forEach($cxfs, n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
						let $x = $[0];
						return $x("qname");
					}))));
					let $hasCxf = n.and(n.exists($flat), n.not(n.and(n.geq($flat, "last"), n.eq(array.size($sub), 3))));
					return n.if(n.boolean($hasCxf), (test) => {
						if (test) {
							return xqc.replaceDotless($r, n.subtract($index, 1), $cxfs);
						} else {
							return array.join(n.seq(array.subarray($r, 1, n.subtract($index, 1)), array.array(xqc.tpl(4, $d, "geq"), xqc.tpl(1, $d, 1), xqc.tpl(6, $d, "position"), xqc.tpl(1, $d, 1), xqc.tpl(13, $d, "."), xqc.tpl(2, $d, 2), xqc.tpl(3, $d, ",")), xqc.replaceDotless(array.subarray($r, $index), 0, $cxfs), array.array(xqc.tpl(2, $d, 2))));
						}
					});
				} else {
					return $r;
				}
			});
		}
	}, $r);
	$d = n.if(n.and(n.eq($has, 208), $isLetInElse), ($d, test) => {
		if (test) {
			return n.subtract($d, 1);
		} else {
			return $d;
		}
	}, $d);
	//console.log("has",$has);
	//console.log("$isLetInElse",$isLetInElse);

	//console.log("r",$r);
	return n.if(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.eq($osize, 0), $pass), $hasAss), $isBody), $isLetInElse), $hasTypesig), $hasParam), $hasAf), $matching), $closeThen), $isXret), $hasXret), $isX), $hasX), $hasXfor), $hasConstr), $hasTuple), n.eq($has, 11)), (test) => {
		if (test) { /*            let $nu := console:log("stop")*/
			let $tpl = n.if(n.or($hasX, $hasXass), (test) => {
				if (test) {
					return n.seq(xqc.tpl(1, $d, 4), xqc.tpl(2, n.subtract($d, 1), 2), xqc.tpl(3, n.subtract($d, 2), ","));
				} else {
					return n.seq();
				}
			});
			let $d = n.if(n.or($hasX, $hasXass), (test) => {
				if (test) {
					return n.subtract($d, 2);
				} else {
					return $d;
				}
			});
			$tpl = n.if(n.boolean($hasTuple), ($tpl, test) => {
				if (test) {
					return xqc.tpl(2, $d, 2);
				} else {
					return n.if(n.boolean($hasParam), (test) => {
						if (test) {
							return n.seq(xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), $cur);
						} else {
							return n.if(n.or(n.or($isXret, $isX), $isXlet), (test) => {
								if (test) {
									$tpl = n.seq($tpl, xqc.tpl(4, $d, xqc.operators($v)), xqc.tpl(1, $d, 1), xqc.tpl(1, n.add($d, 1), 3));
									$d = n.add($d, 2);
									return n.if(n.eq($v, 222), (test) => {
										if (test) {
											return $tpl;
										} else {
											return a.foldLeftAt($p, $tpl, n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
												let $pre = $[0];
												let $cur = $[1];
												let $i = $[2];
												return n.seq($pre, xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl(4, n.add($d, 1), $cur), xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(4, n.add($d, 1), "$"), xqc.tpl(1, n.add($d, 1), 1), xqc.tpl(8, n.add($d, 2), $i), xqc.tpl(2, n.add($d, 1), 2), xqc.tpl(2, $d, 2), n.if(n.or($isLet, n.eq($type, 225)), (test) => {
													if (test) {
														return n.seq();
													} else {
														return xqc.tpl(3, $d, ",");
													}
												}));
											})));
										}
									});
								} else {
									return n.if(n.boolean($hasXret), (test) => {
										if (test) {
											return n.seq(xqc.tpl(2, $d, 4), xqc.tpl(2, n.subtract($d, 1), 2), xqc.tpl(2, n.subtract($d, 2), 2));
										} else {
											return n.if(n.and($isX, $hasX), (test) => {
												if (test) {
													return n.seq($tpl, xqc.tpl(3, $d, ","));
												} else {
													return n.if(n.and($matching, n.eq($ov, 2001)), (test) => {
														if (test) { /* TODO detect context-functions */
															return n.seq(xqc.tpl($t, $d, 4), xqc.tpl($t, n.subtract($d, 1), 2));
														} else {
															return n.if(n.or($isBody, $hasConstr), (test) => {
																if (test) {
																	return n.seq(xqc.tpl($t, $d, $v), xqc.tpl($t, n.subtract($d, 1), 2));
																} else {
																	return n.if(n.or($hasAf, $isClose), (test) => {
																		if (test) {
																			let $closeCurly = n.if(n.eq($has, 3), (test) => {
																				if (test) {
																					return n.if(n.gt($osize, 1), (test) => {
																						if (test) {
																							return n.ne($o(n.subtract($osize, 1))("t"), 4);
																						} else {
																							return n.true();
																						}
																					});
																				} else {
																					return n.false();
																				}
																			});
																			return xqc.tpl($t, $d, n.if(n.boolean($closeCurly), (test) => {
																				if (test) {
																					return $v;
																				} else {
																					return 2;
																				}
																			}));
																		} else {
																			return n.if(n.or(n.or($pass, $closeThen), $hasXfor), (test) => {
																				if (test) {
																					return n.seq();
																				} else {
																					return n.if(n.boolean($hasAss), (test) => {
																						if (test) {
																							return n.if(n.and($isLet, n.eq(xqc.guardedGet($r, $size)("t"), 3)), (test) => {
																								if (test) {
																									return n.seq();
																								} else {
																									return n.seq(xqc.tpl(2, $d, 2), xqc.tpl(3, n.subtract($d, 1), ","));
																								}
																							});
																						} else {
																							return n.if(n.boolean($isLet), (test) => {
																								if (test) {
																									return n.seq();
																								} else {
																									return xqc.tpl($t, $d, $v); /*            let $nu := if($is-let) then console:log($tpl) else ()*/
																								}
																							});
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			}, $tpl);
			let $o = n.if(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or($hasParam, $hasConstr), n.seq(n.and($hasAss, n.ne(xqc.guardedGet($r, $size)("t"), 3)))), $isBody), $hasAf), $matching), $closeThen), $isXret), $isX), $hasTuple), ($tpl, test) => {
				if (test) {
					return a.pop($o);
				} else {
					return $o;
				}
			}, $tpl);
			$o = n.if(n.boolean($closeParams), ($o, test) => {
				if (test) {
					return array.append($o, xqc.tpl(4, $d, 3106));
				} else {
					return n.if(n.or($isXret, $isX), (test) => {
						if (test) {
							return array.append($o, xqc.tpl($t, $d, $v));
						} else {
							return $o;
						}
					});
				}
			}, $o);
			let $tmp = map.put($tmp, "r", n.if(n.exists($tpl), (test) => {
				if (test) {
					return n.foldLeft($tpl, $r, array.append);
				} else {
					return $r;
				}
			}));
			$tmp = map.put($tmp, "d", n.if(n.or(n.or(n.or($isBody, $hasXret), $hasConstr), n.seq(n.and($matching, n.eq($ov, 2001)))), (test) => {
				if (test) {
					return n.subtract($d, 2);
				} else {
					return n.if(n.boolean($isXret), (test) => {
						if (test) {
							return n.add($d, 1);
						} else {
							return n.if(n.or($isX, $isXlet), (test) => {
								if (test) {
									return n.add($d, 2);
								} else {
									return n.if(n.or(n.or(n.or(n.or($hasAss, $hasParam), $hasAf), $matching), $hasTuple), (test) => {
										if (test) {
											return n.subtract($d, 1);
										} else {
											return $d;
										}
									});
								}
							});
						}
					});
				}
			}));
			$tmp = map.put($tmp, "o", $o);
			$tmp = map.put($tmp, "i", n.if(n.boolean($pass), (test) => {
				if (test) {
					return $i;
				} else {
					return map.put($i, $d, array.size($r));
				}
			}));
			return map.put($tmp, "p", n.if(n.boolean($hasXret), ($tmp, test) => {
				if (test) {
					return array.array();
				} else {
					return $p;
				}
			}, $tmp));
		} else {
			let $nu = console.log("auto",$hasOp);
			let $r = n.if(n.and($hasOp, n.seq(n.or(n.gt($ov, 3000), $hasConstrType))), (test) => {
				if (test) {
					return $r;
				} else {
					return array.append($r, xqc.tpl(2, $d, 2));
				}
			});
			$tmp = map.put($tmp, "r", $r);
			$tmp = map.put($tmp, "d", n.if(n.and($hasOp, n.seq(n.or(n.gt($ov, 3000), $hasConstrType))), (test) => {
				if (test) {
					return $d;
				} else {
					return n.subtract($d, 1);
				}
			}));
			$tmp = map.put($tmp, "o", a.pop($o));
			$tmp = map.put($tmp, "i", map.put($i, $d, array.size($r)));
			$tmp = map.put($tmp, "p", $p);
			console.log($tmp);
			//var ret = xqc.unwrap($cur, $tmp);
			return $tmp;
		}
	});
}));
xqc.rtp$6 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $tmp = $[0];
	let $r = $[1];
	let $d = $[2];
	let $o = $[3];
	let $i = $[4];
	let $p = $[5];
	return xqc.rtp($tmp, $r, $d, $o, $i, $p, n.seq());
}));
xqc.rtp$7 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $tmp = $[0];
	let $r = $[1];
	let $d = $[2];
	let $o = $[3];
	let $i = $[4];
	let $p = $[5];
	let $tpl = $[6];
	return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl, n.false());
}));
xqc.rtp$8 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $tmp = $[0];
	let $r = $[1];
	let $d = $[2];
	let $o = $[3];
	let $i = $[4];
	let $p = $[5];
	let $tpl = $[6];
	let $removeOp = $[7];
	return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl, $removeOp, n.seq());
}));
xqc.rtp$9 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $tmp = $[0];
	let $r = $[1];
	let $d = $[2];
	let $o = $[3];
	let $i = $[4];
	let $p = $[5];
	let $tpl = $[6];
	let $removeOp = $[7];
	let $newOp = $[8];
	return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl, $removeOp, $newOp, n.seq());
}));
xqc.rtp$10 = n.typed(n.function(n.seq(map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.integer(), n.array(n.occurs(n.item(), n.zeroOrMore())), map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.zeroOrMore()), n.occurs(n.boolean(), n.zeroOrOne()), n.occurs(map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), n.zeroOrOne()), n.occurs(n.string(), n.zeroOrOne())), n.item()), ((...$) => {
	let $tmp = $[0];
	let $r = $[1];
	let $d = $[2];
	let $o = $[3];
	let $i = $[4];
	let $p = $[5];
	let $tpl = $[6];
	let $removeOp = $[7];
	let $newOp = $[8];
	let $param = $[9];
	//console.log("TMP",$tmp);
	//console.log("$o",$o,n.empty($o));
	$o = n.if(n.boolean($removeOp), ($o, test) => {
		if (test) {
			return a.pop($o);
		} else {
			return $o;
		}
	}, $o);
	$tmp = map.put($tmp, "r", n.if(n.exists($tpl), (test) => {
		if (test) {
			return n.foldLeft($tpl, $r, array.append);
		} else {
			return $r;
		}
	}));
	//console.log("$r",$r);
	$tmp = map.put($tmp, "d", $d);
	$tmp = map.put($tmp, "o", n.if(n.exists($newOp), (test) => {
		if (test) {
			//console.log("$O",$o,n.empty($o));
			return array.append($o, $newOp);
		} else {
			return $o;
		}
	}));
	$tmp = map.put($tmp, "i", n.if(n.exists($tpl), (test) => {
		if (test) {
			var r = n.xFilter($tpl, ((...$) => {
				return n.geq(n.position($[0]), 1);
			}));
			return map.put($i, r("d"), n.add(array.size($r), 1));
		} else {
			return $i;
		}
	}));
	//console.log("RTP",$param);
	return map.put($tmp, "p", n.if(n.boolean($param), ($tmp, test) => {
		if (test) {
			return array.append($p, $param);
		} else {
			return $p;
		}
	}, $tmp));
}));
xqc.binOp$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $t = $[0];
	let $v = $[1];
	let $tmp = $[2];
	let $ocur = $[3];
	let $hasPreOp = $[4];
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p") /* preceding means the current operator has lower precedence (default is higher)... */ /* we make an exception when current is filter and preceding is select */ ;
	let $precedingOp = n.if(n.and($hasPreOp, $ocur("v")), (test) => {
		if (test) {
			return n.if(n.and(n.eq($ocur("v"), 1901), n.eq($v, 2001)), (test) => {
				if (test) {
					return n.true();
				} else {
					return n.ge($ocur("v"), $v);
				}
			});
		} else {
			return n.false(); /*    let $nu := console:log(("bin-op: ",$v,", ocur: ",$ocur,", prec: ",$preceding-op,", d: ",$d,", i: ", $i))*/ /* if preceding, lower depth, as to take the previous index */ /* furthermore, close directly and remove the operator */
		}
	});
	$d = n.if(n.boolean($precedingOp), ($d, test) => {
		if (test) {
			return n.subtract($d, 1);
		} else {
			return $d;
		}
	}, $d);
	let $split = n.if(map.contains($i, $d), ($d, test) => {
		if (test) {
			return $i($d);
		} else {
			return 1; /*  let $nu := console:log($split)*/ /*  let $split := if($r($split)("t") eq 1) then $split - 1 else $split*/
		}
	}, $d);
	let $left = /*      if($v eq 1901 and $has-op and $ocur("v") eq 1901) then*/ /*          []*/ /*      else */ n.if(n.boolean($precedingOp), ($d, test) => {
		if (test) {
			return array.append(xqc.incr(array.subarray($r, $split)), xqc.tpl(2, n.add($d, 1), 2));
		} else {
			return xqc.incr(array.subarray($r, $split));
		}
	}, $d);
	$o = n.if(n.boolean($precedingOp), ($o, test) => {
		if (test) {
			return array.remove($o, array.size($o));
		} else {
			return $o;
		}
	}, $o);
	$r = array.append(array.subarray($r, 1, n.subtract($split, 1)), xqc.tpl(4, $d, xqc.opName($v)));
	$i = n.if(n.boolean($precedingOp), ($i, test) => {
		if (test) {
			return map.put($i, $d, $split);
		} else {
			return map.put($i, $d, array.size($r)); /* up depth by 1 to leave $i updated */
		}
	}, $i);
	let $tpl = n.seq(xqc.tpl(1, n.add($d, 1), 1), array.flatten($left), xqc.tpl(3, n.add($d, 1), ","));
	return n.if(n.eq($v, 2001), (test) => {
		if (test) {
			return xqc.rtp($tmp, $r, n.add($d, 2), $o, $i, $p, n.seq($tpl, xqc.tpl(1, n.add($d, 1), 3)), n.seq(), xqc.tpl($t, $d, $v));
		} else {
			return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, $tpl, n.seq(), xqc.tpl($t, $d, $v));
		}
	});
}));
xqc.processOpen$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $v = $[0];
	let $tmp = $[1];
	let $t = 1;
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p");
	let $size = array.size($r);
	let $osize = array.size($o);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	let $hasOp = n.eq($ocur("t"), 4);
	let $hasPreOp = n.and($hasOp, n.and(n.gge($ocur("v"), 300), n.glt($ocur("v"), 2100)));
	return n.if(n.eq($v, 2001), (test) => {
		if (test) {
			let $cur = xqc.tpl($t, $d, $v) /* TODO pull in right-side if filter, except when select */ ;
			let $hasSelect = n.and($hasOp, n.eq($ocur("v"), 1901));
			let $it = n.if(n.or(n.eq($size, 0), n.seq(n.and(n.geq(xqc.guardedGet($r, $size)("t"), n.seq(1, 3, 6)), n.eq($hasSelect, n.false())))), (test) => {
				if (test) {
					return 2004;
				} else {
					return 2001;
				}
			});
			return n.if(n.eq($it, 2001), (test) => {
				if (test) {
					return xqc.binOp(1, $it, $tmp, $ocur, $hasPreOp);
				} else { /*                    let $tpl :=*/ /*                        if($it eq 2001) then*/ /*                            if($has-select) then*/ /*                                (xqc:tpl(3,$d,","),$cur,xqc:tpl(1,$d,1))*/ /*                            else*/ /*                                xqc:tpl(3,$d,",")*/ /*                        else*/
					return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, xqc.opName($it)), xqc.tpl(1, $d, 1)), n.false(), xqc.tpl(1, $d, $it));
				}
			});
		} else {
			return n.if(n.eq($v, 3), (test) => {
				if (test) {
					let $hasRettype = n.and($hasOp, n.geq($ocur("v"), 2400));
					let $o = n.if(n.boolean($hasRettype), (test) => {
						if (test) {
							return array.remove($o, $osize);
						} else {
							return $o;
						}
					});
					let $ocur = n.if(n.boolean($hasRettype), (test) => {
						if (test) {
							return $o(n.subtract($osize, 1));
						} else {
							return $ocur;
						}
					});
					let $hasParams = n.and($hasOp, n.eq($ocur("v"), 3106 /* dont treat function as constructor here */ ));
					let $hasConstrType = n.and(n.and(n.eq($hasParams, n.false()), $hasOp), n.and(n.gt($ocur("v"), 3000), n.lt($ocur("v"), 3100 /*                let $nu := console:log(($d,", has-params: ",$has-params,", has-rettype: ",$has-rettype))*/ )));
					let $cur = xqc.tpl($t, $d, $v);
					let $tpl = n.if(n.boolean($hasParams), (test) => {
						if (test) {
							$tpl = n.if(n.boolean($hasRettype), ($tpl, test) => {
								if (test) {
									return xqc.tpl(2, $d, 2);
								} else {
									return n.seq(xqc.tpl(3, $d, ","), xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), xqc.tpl(2, $d, 2));
								}
							}, $tpl);
							return a.foldLeftAt($p, n.seq($tpl, xqc.tpl(3, n.subtract($d, 1), ","), $cur), n.typed(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...$) => {
								let $pre = $[0];
								$cur = $[1];
								let $i = $[2];
								return n.seq($pre, xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl(5, n.add($d, 1), $cur), xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(10, n.add($d, 1), "$"), xqc.tpl(1, $d, 1), xqc.tpl(8, $d, n.string($i)), xqc.tpl(2, $d, 2), xqc.tpl(2, $d, 2), xqc.tpl(3, $d, ","));
							})));
						} else {
							return n.if(n.boolean($hasConstrType), (test) => {
								if (test) {
									return $cur;
								} else {
									return n.if(n.boolean($hasOp), (test) => {
										if (test) {
											return xqc.tpl($t, $d, 1);
										} else {
											return $cur;
										}
									});
								}
							});
						}
					}); /* remove constr type if not constr */
					return xqc.rtp($tmp, $r, n.if(n.boolean($hasParams), (test) => {
						if (test) {
							return $d;
						} else {
							return n.add($d, 1);
						}
					}), $o, $i, n.if(n.boolean($hasParams), (test) => {
						if (test) {
							return array.array();
						} else {
							return $p;
						}
					}), $tpl, $hasConstrType, n.if(n.boolean($hasParams), (test) => {
						if (test) {
							return n.seq();
						} else {
							return n.if(n.boolean($hasConstrType), (test) => {
								if (test) {
									return $ocur;
								} else {
									return $cur;
								}
							});
						}
					}));
				} else { /* detect first opening bracket after function declaration */ /* detect parameters, we need to change 2106 to something else at opening bracket here */
					let $hasFunc = n.and($hasOp, n.eq($ocur("v"), 2106));
					let $hasConstrType = n.and(n.and(n.eq($hasFunc, n.false()), $hasOp), n.and(n.gt($ocur("v"), 2100), n.lt($ocur("v"), 2200)));
					let $cur = xqc.tpl($t, n.add($d, 1), $v);
					let $last = xqc.guardedGet($r, $size);
					let $hasLambda = n.and($hasFunc, n.eq($last("t"), 4));
					$r = n.if(n.boolean($hasLambda), ($r,test) => {
						if (test) {
							return a.pop($r);
						} else {
							return $r;
						}
					},$r);
					let $tpl = n.if(n.boolean($hasFunc), (test) => {
						if (test) {
							$tpl = n.seq(xqc.tpl(4, $d, "function"), $cur, xqc.tpl(1, n.add($d, 1), 1));
							return n.if(n.boolean($hasLambda), (test) => {
								if (test) {
									return n.seq(xqc.tpl(4, $d, "typed"), $cur, $tpl);
								} else {
									return n.seq(xqc.tpl(3, $d, ","), $tpl);
								}
							});
						} else {
							return n.if(n.or(n.eq($size, 0), n.geq($last("t"), n.seq(1, 3))), (test) => {
								if (test) {
									return n.seq(xqc.tpl(4, $d, ""), $cur);
								} else {
									return $cur;
								}
							});
						}
					}); /* remove constr type if not constr */
					return xqc.rtp($tmp, $r, n.if(n.boolean($hasFunc), (test) => {
						if (test) {
							return n.add($d, 2);
						} else {
							return n.add($d, 1);
						}
					}), $o, $i, $p, $tpl, n.or($hasFunc, $hasConstrType), n.if(n.boolean($hasFunc), (test) => {
						if (test) {
							return xqc.tpl(4, $d, 3006);
						} else {
							return $cur;
						}
					}));
				}
			});
		}
	});
}));
xqc.processComma$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $tmp = $[0];
	/* some things to detect here:
	 * param
	 * assignment
	 */
	/*
	    if its a param, it means type wasnt set, so add item
	    */
	let $t = 3;
	let $v = ",";
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p");
	let $osize = array.size($o);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	let $hasOp = n.eq($ocur("t"), 4);
	return n.if(n.or(n.seq(n.and($hasOp, n.eq($ocur("v"), 3006))), n.seq(n.and(n.eq($ocur("t"), 1), n.eq($ocur("v"), 2004)))), (test) => {
		if (test) {
			let $cur = xqc.tpl($t, $d, $v);
			let $tpl = n.if(n.eq($ocur("v"), 3006), (test) => {
				if (test) {
					return n.seq(xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), $cur);
				} else {
					return $cur;
				}
			});
			return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl);
		} else {
			let $cur = xqc.tpl($t, $d, $v);
			let $hasAss = n.eq($ocur("v"), 210);
			let $tmp = xqc.unwrap(n.if(n.boolean($hasAss), (test) => {
				if (test) {
					return xqc.tpl(4, $d, 209);
				} else {
					return $cur;
				}
			}), $tmp);
			let $o = $tmp("o");
			let $osize = array.size($o);
			let $ocur = n.if(n.boolean($osize), (test) => {
				if (test) {
					return $o($osize);
				} else {
					return map.map();
				}
			});
			let $d = $tmp("d");
			let $hasTypesig = n.and($hasOp, n.eq($ocur("v"), 2400));
			let $tpl = n.if(n.boolean($hasAss), (test) => {
				if (test) {
					return n.seq(xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1));
				} else {
					return n.if(n.or($hasTypesig, n.seq(n.and($hasOp, n.geq($ocur("v"), n.seq(210, 700))))), (test) => {
						if (test) {
							return n.seq();
						} else {
							return xqc.tpl($t, $d, $v);
						}
					});
				}
			});
			return xqc.rtp($tmp, $tmp("r"), n.if(n.boolean($hasAss), (test) => {
				if (test) {
					return n.add($d, 1);
				} else {
					return $d;
				}
			}), $tmp("o"), $tmp("i"), $tmp("p"), $tpl, n.seq(), n.if(n.boolean($hasAss), (test) => {
				if (test) {
					return xqc.tpl(4, $d, 209);
				} else {
					return n.seq();
				}
			}));
		}
	});
}));
xqc.processOp$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $v = $[0];
	let $tmp = $[1];
	let $t = 4;
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p");
	let $size = array.size($r);
	let $osize = array.size($o);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	//console.log("ocurt",$ocur("t"));
	let $hasOp = n.eq($ocur("t"), 4);
	console.log("$v",$v);
	let $hasPreOp = n.and($hasOp, n.and(n.gge($ocur("v"), 300), n.glt($ocur("v"), 2100)));
	return n.if(n.eq($v, 217), (test) => {
		//console.log("testp4_217",test);
		if (test) {
			return xqc.rtp($tmp, $r, $d, $o, $i, $p, n.seq(), n.seq(), xqc.tpl($t, $d, $v));
		} else {
			return n.if(n.eq($v, 218), (test) => {
				if (test) { /* TODO check if o contains declare (would it not?) */
					return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(10, $d, "$>"), xqc.tpl(1, $d, 1)), n.and($hasOp, n.eq($ocur("v"), 217)), xqc.tpl($t, $d, $v));
				} else {
					return n.if(n.eq($v, 216), (test) => {
						if (test) {
							return n.if(n.and($hasOp, n.eq($ocur("v"), 219)), (test) => {
								if (test) {
									return xqc.rtp($tmp, a.pop($r), n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, "$<"), xqc.tpl(1, $d, 1)), n.true(), xqc.tpl($t, $d, $v));
								} else {
									return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, "$*"), xqc.tpl(1, $d, 1)), $hasPreOp);
								}
							});
						} else {
							return n.if(n.eq($v, 215), (test) => {
								if (test) {
									return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, "xq-version"), xqc.tpl(1, $d, 1)), $hasOp, xqc.tpl($t, $d, $v));
								} else {
									return n.if(n.geq($v, n.seq(214, 2108)), (test) => {
										if (test) {
											return xqc.rtp($tmp, $r, $d, $o, $i, $p, n.seq(), $hasOp, xqc.tpl($t, $d, $v));
										} else {
											return n.if(n.eq($v, 219), (test) => {
												if (test) {
													return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), $hasPreOp, xqc.tpl($t, $d, $v));
												} else {
													return n.if(n.eq($v, 2106), (test) => {
														if (test) { /* check if o contains declare, otherwise its anonymous */
															let $hasDecl = n.and($hasOp, n.eq($ocur("v"), 217));
															let $tpl = n.if(n.boolean($hasDecl), (test) => {
																if (test) {
																	return n.seq(xqc.tpl(10, $d, "$>"), xqc.tpl(1, $d, 1));
																} else {
																	return xqc.tpl($t, $d, $v);
																}
															});
															return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, $tpl, $hasDecl, xqc.tpl($t, $d, $v));
														} else {
															return n.if(n.eq($v, 2400), (test) => {
																if (test) {
																	let $hasParams = n.and($hasOp, n.eq($ocur("v"), 3006));
																	return xqc.rtp($tmp, $r, $d, $o, $i, $p, n.if(n.boolean($hasParams), (test) => {
																		if (test) {
																			return n.seq();
																		} else {
																			return xqc.tpl(3, $d, ",");
																		}
																	}), n.seq(), xqc.tpl($t, $d, $v));
																} else {
																	return n.if(n.eq($v, 207), (test) => {
																		if (test) {
																			return xqc.rtp($tmp, a.pop($r), n.add($d, 2), $o, $i, $p, n.seq(xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(1, n.add($d, 1), 3)), n.false(), xqc.tpl($t, $d, $v));
																		} else {
																			return n.if(n.eq($v, 208), (test) => {
																				if (test) {
																					let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
																					let $d = $tmp("d");
																					return xqc.rtp($tmp, $tmp("r"), $d, $tmp("o"), $tmp("i"), $tmp("p"), n.seq(xqc.tpl(2, $d, 4), xqc.tpl(3, n.subtract($d, 1), ","), xqc.tpl(1, n.subtract($d, 1), 3)), n.false(), xqc.tpl($t, $d, $v));
																				} else {
																					return n.if(n.eq($v, 209), (test) => {
																						if (test) { /* TODO check if o contains something that prevents creating a new let-ret-seq */ /* remove entry */
																							let $hasX = n.and($hasOp, n.geq($ocur("v"), n.seq(222, 223, 224, 225)));
																							let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
																							let $d = $tmp("d");
																							let $o = $tmp("o") /* wrap inner let */ ;
																							let $open = n.if(n.empty($ocur("t")), (test) => {
																								if (test) {
																									return xqc.tpl(1, $d, 1);
																								} else {
																									return n.seq();
																								}
																							});
																							$o = n.if(n.exists($open), ($o, test) => {
																								if (test) {
																									return array.append($o, xqc.tpl(1, $d, 1));
																								} else {
																									return $o;
																								}
																							}, $o);
																							return xqc.rtp($tmp, $tmp("r"), n.add($d, 2), $o, $tmp("i"), $tmp("p"), n.if(n.boolean($hasX), ($o, test) => {
																								if (test) {
																									return n.seq();
																								} else {
																									return n.seq($open, xqc.tpl(10, n.add($d, 1), "$"), xqc.tpl(1, n.add($d, 1), 1));
																								}
																							}, $o), n.seq(), xqc.tpl($t, $d, $v));
																						} else {
																							return n.if(n.eq($v, 210), (test) => {
																								if (test) { /* remove let, variable or comma from o */
																									let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
																									let $o = $tmp("o");
																									let $ocur = $o(array.size($o));
																									return xqc.rtp($tmp, $tmp("r"), $tmp("d"), $tmp("o"), $tmp("i"), $tmp("p"), xqc.tpl(3, $d, ","), n.and($hasOp, n.geq($ocur("v"), n.seq(218, 209))), xqc.tpl($t, $d, $v));
																								} else {
																									return n.if(n.eq($v, 211), (test) => {
																										if (test) { /* close anything that needs to be closed in $o*/
																											return xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
																										} else {
																											return n.if(n.eq($v, 220), (test) => {
																												if (test) { /* close anything that needs to be closed in $o*/
																													return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl(3, $d, ","));
																												} else {
																													return n.if(n.eq($v, 221), (test) => {
																														if (test) { /* start x-for, add var to params */
																															return n.if(n.and($hasOp, n.eq($ocur("v"), 222)), (test) => {
																																if (test) {
																																	return xqc.rtp($tmp, $r, $d, $o, $i, $p, n.seq(xqc.tpl(1, $d, 4), xqc.tpl(2, $d, 2), xqc.tpl(3, $d, ",")), n.seq(), xqc.tpl($t, $d, $v));
																																} else {
																																	return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, "for"), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																}
																															});
																														} else {
																															return n.if(n.geq($v, n.seq(222, 223, 224, 225)), (test) => {
																																if (test) { /* x-in/x-where/x-orderby/x-groupby, remove x-... from o */
																																	return xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
																																} else {
																																	//console.log("testP_222,233");
																																	return n.if(n.and(n.and(n.eq($v, 509), $hasOp), n.eq($ocur("v"), 2108)), (test) => {
																																		if (test) {
																																			return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl(3, $d, ","), n.true(), xqc.tpl($t, $d, $v));
																																		} else {
																																			return n.if(n.or(n.seq(n.and(n.ge($v, 300), n.lt($v, 2100))), n.eq($v, 2600)), (test) => {
																																				if (test) {
																																					return n.if(n.eq($size, 0), (test) => {
																																						if (test) { /* unary-op: insert op + parens */
																																							$v = n.add($v, 900);
																																							return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, xqc.opName($v)), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																						} else {
																																							let $prev = xqc.guardedGet($r, $size);
																																							let $isOcc = n.if(n.geq($v, n.seq(802, 904, 2003)), (test) => {
																																								if (test) {
																																									return n.if(n.and(n.eq($ocur("t"), 1), n.and(n.eq($ocur("v"), 1), n.gt($osize, 1))), (test) => {
																																										if (test) {
																																											let $oprev = xqc.guardedGet($o, n.subtract($osize, 1));
																																											return n.and(n.eq($oprev("t"), 4), n.geq($oprev("v"), n.seq(1200, 2400)));
																																										} else {
																																											return n.and($hasOp, n.eq($ocur("v"), 2400));
																																										}
																																									});
																																								} else {
																																									return n.false();
																																								}
																																							});
																																							return n.if(n.boolean($isOcc), (test) => {
																																								if (test) { /* these operators are occurrence indicators when the previous is an open paren or qname */ /* when the previous is a closed paren, it depends what the next will be */ /*                                if($has-op) then*/
																																									let $split = $i($d);
																																									let $left = array.subarray($r, 1, n.subtract($split, 1));
																																									let $right = array.subarray($r, $split);
																																									return xqc.rtp($tmp, $left, $d, $o, $i, $p, n.seq(xqc.tpl($t, $d, "occurs"), xqc.tpl(1, $d, 1), array.flatten(xqc.incr($right)), xqc.tpl(3, $d, ","), xqc.tpl($t, n.add($d, 1), xqc.occurrence($v)), xqc.tpl(1, n.add($d, 1), 1), xqc.tpl(2, n.add($d, 1), 2), xqc.tpl(2, $d, 2))); /*                                else*/ /*                                    xqc:rtp($tmp,$r,$d,$o,$i,$p,xqc:tpl(7,$d,$xqc:operators($v)))*/
																																								} else {
																																									return n.if(n.and(n.geq($v, n.seq(801, 802)), n.geq($prev("t"), n.seq(1, 3, 4))), (test) => {
																																										if (test) {
																																											let $v = n.add($v, 900);
																																											return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, xqc.opName($v)), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																										} else { /* bin-op: pull in left side, add parens */
																																											return xqc.binOp(4, $v, $tmp, $ocur, $hasPreOp);
																																										}
																																									});
																																								}
																																							});
																																						}
																																					});
																																				} else {
																																					return n.if(n.and(n.gt($v, 2100), n.lt($v, 2200)), (test) => {
																																						if (test) {
																																							return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), n.and($hasPreOp, n.ne($ocur("v"), 1200)), xqc.tpl($t, $d, $v));
																																						} else {
																																							return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), n.and($hasPreOp, n.ne($ocur("v"), 1200)));
																																						}
																																					});
																																				}
																																			});
																																		}
																																	});
																																}
																															});
																														}
																													});
																												}
																											});
																										}
																									});
																								}
																							});
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}));
xqc.processVar$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $v = $[0];
	let $tmp = $[1];
	let $t = 5;
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p");
	let $osize = array.size($o);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	let $hasOp = n.eq($ocur("t"), 4);
	let $isParam = n.and($hasOp, n.eq($ocur("v"), 3006));
	let $hasX = n.and($hasOp, n.geq($ocur("v"), n.seq(221, 225)));
	let $hasAss = n.and($hasOp, n.geq($ocur("v"), n.seq(218, 209)));
	let $hasXass = n.and($hasAss, n.and(n.gt($osize, 1), n.and(n.eq($o(n.subtract($osize, 1))("t"), 4), n.geq($o(n.subtract($osize, 1))("v"), n.seq(222, 223, 224, 225)))));
	$v = n.replace($v, "^\\$", "");
	let $tpl = n.if(n.or(n.or($isParam, $hasXass), $hasX), ($v, test) => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.boolean($hasAss), (test) => {
				if (test) {
					return xqc.tpl($t, $d, $v);
				} else {
					return n.if(n.eq($v, ""), (test) => {
						if (test) {
							return xqc.tpl(10, $d, "$");
						} else {
							return n.seq(xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl($t, n.add($d, 1), $v), xqc.tpl(2, $d, 2));
						}
					});
				}
			});
		}
	}, $v);
	return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl, n.seq(), n.seq(), n.if(n.or(n.or($isParam, $hasXass), $hasX), ($v, test) => {
		if (test) {
			return $v;
		} else {
			return n.seq();
		}
	}, $v));
}));
xqc.processQname$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $v = $[0];
	let $tmp = $[1];
	let $t = 6;
	let $r = $tmp("r");
	let $d = $tmp("d");
	let $o = $tmp("o");
	let $i = $tmp("i");
	let $p = $tmp("p");
	let $osize = array.size($o);
	let $ocur = n.if(n.gt($osize, 0), (test) => {
		if (test) {
			return $o($osize);
		} else {
			return map.map();
		}
	});
	let $hasOp = n.eq($ocur("t"), 4);
	return n.if(n.and($hasOp, n.geq($ocur("v"), n.seq(2102, 2105))), (test) => {
		if (test) { /*                let $nu := console:log(map {"auto-constr":$ocur,"i":$i}) return*/
			let $tmp = xqc.rtp($tmp, a.pop($r), n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $ocur("d"), xqc.constructors($ocur("v"))), xqc.tpl(1, $d, 1), xqc.tpl(1, n.add($d, 1), 3), xqc.tpl(7, n.add($d, 2), $v), xqc.tpl(2, n.add($d, 2), 4), xqc.tpl(3, n.add($d, 1), ",")), n.true(), xqc.tpl(4, $ocur("d"), n.add($ocur("v"), 900)));
			return map.put($tmp, "i", $i);
		} else {
			let $tpl = n.if(n.and($hasOp, n.eq($ocur("v"), 2108)), (test) => {
				if (test) {
					return xqc.tpl(7, $d, $v);
				} else {
					return n.if(n.matches($v, "^xs:"), (test) => {
						if (test) {
							let $hasTypesig = n.and($hasOp, n.geq($ocur("v"), n.seq(1200, 2400)));
							$hasTypesig = n.if(n.and(n.eq($hasTypesig, n.false()), n.and(n.eq($ocur("t"), 1), n.eq($ocur("v"), 1))), ($hasTypesig, test) => {
								if (test) {
									let $oprev = xqc.guardedGet($o, n.subtract($osize, 1));
									return n.and(n.eq($oprev("t"), 4), n.geq($oprev("v"), n.seq(1200, 2400)));
								} else {
									return $hasTypesig;
								}
							}, $hasTypesig);
							return n.if(n.boolean($hasTypesig), (test) => {
								if (test) {
									return n.seq(xqc.tpl(4, $d, n.replace($v, "^xs:", "")), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2));
								} else {
									return xqc.tpl($t, $d, $v);
								}
							});
						} else {
							return xqc.tpl($t, $d, $v);
						}
					});
				}
			});
			return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl);
		}
	});
}));
/*
 : Process:
 : - denote depth: increase/decrease for opener/closer
 : - never look ahead, only denote open operators
 : - only append what is processed!
 : - detect operator: binary or unary
 : - detect + transform namespace declarations: if *at* is found, stack it to o, remove last paren and write out comma
 : - transform operator to prefix notation
 */
xqc.process$2 = n.typed(n.function(n.seq(map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore())), map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...$) => {
	let $cur = $[0];
	let $tmp = $[1];
	let $t = $cur("t");
	let $v = $cur("v");
	let $d = $tmp("d");
	//console.log("$t",$t);
	return n.if(n.eq($t, 0), (test) => {
		//console.log("ptest0",test);
		if (test) {
			$tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
			////console.log($tmp);
			$d = $tmp("d");
			return map.put($tmp, "r", array.append($tmp("r"), xqc.tpl($t, $d, $v)));
		} else {
			return n.if(n.eq($t, 1), (test) => {
				//console.log("ptest1",test);
				if (test) {
					return xqc.processOpen($v, $tmp);
				} else {
					return n.if(n.eq($t, 2), (test) => {
						//console.log("ptest2",test);
						if (test) {
							return $tmp;
							return xqc.unwrap(xqc.tpl($t, $d, $v), $tmp);
						} else {
							return n.if(n.eq($t, 3), (test) => {
								//console.log("ptest3",test);
								if (test) {
									return xqc.processComma($tmp);
								} else {
									return n.if(n.eq($t, 4), (test) => {
										//console.log("ptest4",test);
										if (test) {
											return xqc.processOp($v, $tmp);
										} else {
											return n.if(n.eq($t, 5), (test) => {
												if (test) {
													return xqc.processVar($v, $tmp);
												} else {
													return n.if(n.eq($t, 6), (test) => {
														if (test) {
															return xqc.processQname($v, $tmp);
														} else {
															return n.if(n.eq($t, 10), (test) => {
																if (test) {
																	let $r = $tmp("r");
																	let $d = $tmp("d");
																	let $o = $tmp("o");
																	let $i = $tmp("i");
																	let $p = $tmp("p");
																	let $osize = array.size($o);
																	let $ocur = n.if(n.gt($osize, 0), (test) => {
																		if (test) {
																			return $o($osize);
																		} else {
																			return map.map();
																		}
																	});
																	let $hasOp = n.eq($ocur("t"), 4);
																	let $isFor = n.and($hasOp, n.eq($ocur("v"), 221));
																	let $tpl = n.if(n.boolean($isFor), (test) => {
																		if (test) {
																			return n.seq();
																		} else {
																			return xqc.tpl($t, $d, $v);
																		}
																	});
																	return xqc.rtp($tmp, $r, $d, $o, $i, $p, $tpl);
																} else {
																	return n.if(n.eq($t, 11), (test) => {
																		if (test) {
																			let $r = $tmp("r");
																			let $d = $tmp("d");
																			let $o = $tmp("o");
																			let $i = $tmp("i");
																			let $p = $tmp("p");
																			return xqc.rtp($tmp, $r, n.add($d, 1), $o, $i, $p, xqc.tpl(11, $d, $v), n.seq(), xqc.tpl($t, $d, $v));
																		} else {
																			let $r = $tmp("r");
																			let $d = $tmp("d");
																			let $o = $tmp("o");
																			let $i = $tmp("i");
																			let $p = $tmp("p");
																			return xqc.rtp($tmp, $r, $d, $o, $i, $p, xqc.tpl($t, $d, $v));
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}));
xqc.toL3$5 = n.typed(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...$) => {
	let $pre = $[0];
	let $entry = $[1];
	let $last = $[2];
	let $next = $[3];
	let $at = $[4];
	let $t = $entry("t");
	let $v = $entry("v");
	let $s = n.if(n.geq($t, 1), (test) => {
		if (test) {
			return n.if(n.eq($v, 3), (test) => {
				if (test) {
					return 15;
				} else {
					return n.if(n.eq($v, 1), (test) => {
						if (test) { /* TODO check for last operator */
							return n.if(n.geq($last("t"), n.seq(4, 6, 10)), (test) => {
								if (test) {
									return n.seq();
								} else {
									return n.if(n.eq($last("t"), 2), (test) => {
										if (test) {
											return n.seq();
										} else {
											return n.seq(14, "");
										}
									});
								}
							});
						} else {
							return n.seq();
						}
					});
				}
			});
		} else {
			return n.if(n.eq($t, 2), (test) => {
				if (test) { /*            let $nu := console:log($next)*/
					return n.if(n.eq($next("t"), 1), (test) => {
						if (test) {
							return 18;
						} else {
							return 17;
						}
					});
				} else {
					return n.if(n.eq($t, 7), (test) => {
						if (test) {
							return n.seq(3, $v);
						} else {
							return n.if(n.eq($t, 8), (test) => {
								if (test) {
									return n.seq(12, $v);
								} else {
									return n.if(n.eq($t, 6), (test) => {
										if (test) {
											return n.if(n.matches($v, "#\\p{N}$"), (test) => {
												if (test) {
													return n.seq(4, $v);
												} else {
													return n.if(n.eq($next("t"), 1), (test) => {
														if (test) {
															return n.seq(14, $v);
														} else {
															return n.seq(3, $v);
														}
													});
												}
											});
										} else {
											return n.if(n.geq($t, n.seq(4, 10)), (test) => {
												if (test) {
													return n.seq(14, $v);
												} else {
													return n.if(n.eq($t, 5), (test) => {
														if (test) {
															return n.seq(3, $v);
														} else {
															return n.if(n.eq($t, 9), (test) => {
																if (test) {
																	return n.seq(8, $v);
																} else {
																	return n.if(n.eq($t, 11), (test) => {
																		if (test) {
																			return n.seq(1, $v);
																		} else {
																			return n.if(n.eq($t, 12), (test) => {
																				if (test) {
																					return n.seq(2, $v);
																				} else {
																					return n.if(n.eq($t, 13), (test) => {
																						if (test) {
																							return n.seq(14, "$", 12, "1", 17);
																						} else {
																							return n.seq();
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
	return n.seq($pre, $s);
}));
xqc.toBuffer$1 = n.typed(n.function(n.seq(n.string()), n.item()), ((...$) => {
	let $query = $[0];
	return n.xForEach(n.stringToCodepoints($query), n.codepointsToString($[0], "."));
}));
xqc.normalizeQuery$2 = n.typed(n.function(n.seq(n.string(), map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...$) => {
	let $query = $[0];
	let $params = $[1]; /* FIXME properly handle cases in replace below */
	$query = n.replace($query, "function\\(\\*\\)", "function(()*,item()*)");
	$query = n.replace($query, "map\\(\\*\\)", "map(xs:anyAtomicType,item()*)");
	$query = n.replace($query, "array\\(\\*\\)", "array(item()*)");
	return xqc.normalizeQueryB(xqc.toBuffer($query), $params);
}));
xqc.toRdl$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $pre = $[0];
	let $entry = $[1];
	let $t = $entry("t");
	let $v = $entry("v");
	return n.concat($pre, n.if(n.geq($t, n.seq(1, 2)), (test) => {
		if (test) {
			return xqc.operators($v);
		} else {
			return n.if(n.eq($t, 7), (test) => {
				if (test) {
					return n.concat("\"", $v, "\"");
				} else {
					return n.if(n.eq($t, 9), (test) => {
						if (test) {
							return n.concat("(:", $v, ":)");
						} else {
							return n.if(n.eq($t, 11), (test) => {
								if (test) {
									return n.concat("n:e(", $v, ",");
								} else {
									return n.if(n.boolean($v), (test) => {
										if (test) {
											return $v;
										} else {
											return "";
										}
									});
								}
							});
						}
					});
				}
			});
		}
	}));
}));
xqc.normalizeQueryB$2 = n.typed(n.function(n.seq(n.occurs(n.string(), n.zeroOrMore()), map.map(n.anyAtomicType(), n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...$) => {
	let $buffer = $[0];
	let $params = $[1];
	return xqc.analyzeChars($buffer, $params);
}));
/*
ws = 0
open paren = 1
close paren = 2
open curly = 3
close curly = 4
open square = 5
close square = 6
lt = 7
gt = 8
comma = 9
semicolon = 10
colon = 11
quot = 12
apos = 13
slash = 14
eq = 15

reserved = 4 (known operator)
var = 5 ($qname)
qname = 6
string = 7
number = 8
comment = 9
xml = 10
attrkey = 11
attrval = 12
enclosed expr = 13

string (type wont change):
    open=1 -> not(string, comment) and quot or apos
    clos=2 -> string and quot or apos
comment:
    open=3 -> not(string, xml) old = open paren and cur = colon
    clos=4 -> comment and old = colon and cur = close paren
opening-tag:
    open=5 -> cur=qname and old=lt
    clos=6 -> opening-tag and cur=gt
closing-tag:
    open=7 -> xml and old=lt and cur=slash
    clos=8 -> xml and cur=gt
xml:
    open -> opening-tag
    close -> closing-tag and count=0
attrkey:
    open=9 -> xml and cur=qname and old=ws
    clos=10 -> attrkey and eq
attrval:
enclosed expr (cancel on cur=old):
    open=11 -> xml and old=open-curly and cur!=open-curly
    clos=12 -> enc-exp and old=close-curly and cur!=close-curly
*/
/* blocking chars */
xqc.analyzeChar$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $char = $[0];
	return n.if(n.eq($char, "("), (test) => {
		if (test) {
			return 1;
		} else {
			return n.if(n.eq($char, ")"), (test) => {
				if (test) {
					return 2;
				} else {
					return n.if(n.eq($char, "{"), (test) => {
						if (test) {
							return 3;
						} else {
							return n.if(n.eq($char, "}"), (test) => {
								if (test) {
									return 4;
								} else {
									return n.if(n.eq($char, "["), (test) => {
										if (test) {
											return 2001;
										} else {
											return n.if(n.eq($char, "]"), (test) => {
												if (test) {
													return 2002;
												} else {
													return n.if(n.eq($char, ","), (test) => {
														if (test) {
															return 100;
														} else {
															return n.if(n.eq($char, ">"), (test) => {
																if (test) {
																	return 505;
																} else {
																	return n.if(n.eq($char, "<"), (test) => {
																		if (test) {
																			return 507;
																		} else {
																			return n.if(n.eq($char, "="), (test) => {
																				if (test) {
																					return 509;
																				} else {
																					return n.if(n.eq($char, ";"), (test) => {
																						if (test) {
																							return 5;
																						} else {
																							return n.if(n.eq($char, ":"), (test) => {
																								if (test) {
																									return 2600;
																								} else {
																									return n.if(n.eq($char, "+"), (test) => {
																										if (test) {
																											return 802;
																										} else {
																											return n.if(n.eq($char, "/"), (test) => {
																												if (test) {
																													return 1901;
																												} else {
																													return n.if(n.eq($char, "!"), (test) => {
																														if (test) {
																															return 1800;
																														} else {
																															return n.if(n.eq($char, "?"), (test) => {
																																if (test) {
																																	return 2003;
																																} else {
																																	return n.if(n.eq($char, "*"), (test) => {
																																		if (test) {
																																			return 904;
																																		} else {
																																			return n.if(n.eq($char, "."), (test) => {
																																				if (test) {
																																					return 8;
																																				} else {
																																					return n.if(n.eq($char, "$"), (test) => {
																																						if (test) {
																																							return 9;
																																						} else {
																																							return n.if(n.eq($char, "#"), (test) => {
																																								if (test) {
																																									return 14;
																																								} else {
																																									return n.if(n.eq($char, "\""), (test) => {
																																										if (test) {
																																											return 6;
																																										} else {
																																											return n.if(n.eq($char, "'"), (test) => {
																																												if (test) {
																																													return 7;
																																												} else {
																																													return n.if(n.matches($char, "\\s"), (test) => {
																																														if (test) {
																																															return 10;
																																														} else {
																																															return n.if(n.matches($char, "\\p{N}"), (test) => {
																																																if (test) {
																																																	return 11;
																																																} else {
																																																	return n.if(n.matches($char, "\\p{L}"), (test) => {
																																																		if (test) {
																																																			return 12;
																																																		} else {
																																																			return 0;
																																																		}
																																																	});
																																																}
																																															});
																																														}
																																													});
																																												}
																																											});
																																										}
																																									});
																																								}
																																							});
																																						}
																																					});
																																				}
																																			});
																																		}
																																	});
																																}
																															});
																														}
																													});
																												}
																											});
																										}
																									});
																								}
																							});
																						}
																					});
																				}
																			});
																		}
																	});
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}));
xqc.flagToExpr$1 = n.typed(n.function(n.seq(n.item()), n.item()), ((...$) => {
	let $flag = $[0];
	return n.if(n.eq($flag, 2), (test) => {
		if (test) {
			return 7;
		} else {
			return n.if(n.eq($flag, 4), (test) => {
				if (test) {
					return 9;
				} else {
					return n.if(n.geq($flag, n.seq(6, 9)), (test) => {
						if (test) {
							return 11;
						} else {
							return n.if(n.eq($flag, 10), (test) => {
								if (test) {
									return 12;
								} else {
									return n.if(n.eq($flag, 8), (test) => {
										if (test) {
											return 2;
										} else {
											return 14;
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}));
xqc.inspectTokens$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $char = $[0];
	let $type = $[1];
	return n.if(n.geq($type, n.seq(1, 3, 2001)), (test) => {
		if (test) {
			return map.map(n.pair("t", 1), n.pair("v", $type));
		} else {
			return n.if(n.geq($type, n.seq(2, 4, 2002)), (test) => {
				if (test) {
					return map.map(n.pair("t", 2), n.pair("v", $type));
				} else {
					return n.if(n.eq($type, 100), (test) => {
						if (test) {
							return map.map(n.pair("t", 3), n.pair("v", $char));
						} else {
							return n.if(n.eq($type, 5), (test) => {
								if (test) {
									return map.map(n.pair("t", 0), n.pair("v", $char));
								} else {
									return n.if(n.eq($type, 9), (test) => {
										if (test) {
											return map.map(n.pair("t", 10), n.pair("v", $char));
										} else {
											return n.if(n.eq($type, 8), (test) => {
												if (test) {
													return map.map(n.pair("t", 7), n.pair("v", $char));
												} else {
													return n.if(n.geq($type, n.seq(505, 507, 509, 802, 904, 1800, 1901, 2003, 2600)), (test) => {
														if (test) {
															return map.map(n.pair("t", 4), n.pair("v", $type));
														} else {
															return n.seq();
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
}));
xqc.charReducer$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $flags = $[0];
	let $next = $[1];
	let $xqCompat = $flags("xq-compat");
	let $char = $flags("char");
	let $oldType = $flags("type");
	let $buffer = $flags("buffer");
	let $string = $flags("string");
	let $wasVar = $flags("var");
	let $wasWs = $flags("ws");
	let $wasNumber = $flags("number");
	let $comment = $flags("comment");
	let $opentag = $flags("opentag");
	let $closetag = $flags("closetag");
	let $attrkey = $flags("attrkey");
	let $attrval = $flags("attrval");
	let $encExpr = $flags("enc-expr");
	let $hasQuot = $flags("has-quot");
	let $opencount = $flags("opencount");
	//console.log("flags",$flags);
	let $type = n.if(n.ne($string, 0), (test) => {
		if (test) { /* skip anything but closers */
			return n.if(n.and(n.eq($string, 6), n.and(n.eq($char, "\""), n.or(n.ne($next, "\""),n.empty($next)))), (test) => {
				if (test) {
					return 6;
				} else {
					return n.if(n.and(n.eq($string, 7), n.eq($char, "'")), (test) => {
						if (test) {
							return 7;
						} else {
							return 0;
						}
					});
				}
			});
		} else {
			return n.if(n.boolean($comment), (test) => {
				if (test) {
					return n.if(n.eq($char, ":"), (test) => {
						if (test) {
							return n.if(n.eq($next, ")"), (test) => {
								if (test) {
									return 2502;
								} else {
									return 2600;
								}
							});
						} else {
							return 0;
						}
					});
				} else {
					return n.if(n.boolean($opentag), (test) => {
						if (test) {
							return n.if(n.eq($char, ">"), (test) => {
								if (test) {
									return 505;
								} else {
									return n.if(n.eq($char, "/"), (test) => {
										if (test) {
											return 1901; /* TODO direct close */
										} else {
											return n.if(n.matches($char, "[\\p{L}\\p{N}\\-_:]"), (test) => {
												if (test) {
													return 0;
												} else {
													return n.if(n.geq($char, n.seq("=", "\"")), (test) => {
														if (test) {
															return xqc.analyzeChar($char);
														} else { /* TODO stop opentag, analyze the char */
															return n.seq();
														}
													});
												}
											});
										}
									});
								}
							});
						} else {
							return xqc.analyzeChar($char);
						}
					});
				}
			});
		}
	});
	//console.log("type",$type);
	let $zero = n.if(n.geq(n.seq($comment, $opentag, $closetag, $attrkey), n.true()), (test) => {
		if (test) {
			return n.false();
		} else {
			return n.eq($string, 0);
		}
	});
	let $var = n.and($zero, n.seq(n.or(n.seq(n.and(n.eq($wasVar, n.false()), n.eq($char, "$"))), n.seq(n.and($wasVar, n.matches($char, "[\\p{L}\\p{N}\\-_:]"))))));
	let $number = n.and(n.and(n.eq($var, n.false()), $zero), n.and(n.eq($type, 11), n.seq(n.or(n.seq(n.and(n.ne($oldType, 12), n.ne($oldType, 14))), $wasWs))));
	let $flag = n.if(n.boolean($number), (test) => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.boolean($zero), (test) => {
				if (test) {
					return n.if(n.geq($type, n.seq(6, 7)), (test) => {
						if (test) {
							return 1; /* open string */
						} else {
							return n.if(n.and(n.eq($type, 1), n.eq($next, ":")), (test) => {
								if (test) {
									return 3; /* open comment */
								} else {
									return n.if(n.eq($type, 507), (test) => {
										if (test) {
											return n.if(n.matches($next, "\\p{L}"), (test) => {
												if (test) {
													return 5; /* open opentag */
												} else {
													return n.if(n.and(n.eq($next, "/"), n.gt(n.head($opencount), 0)), (test) => {
														if (test) {
															return 7; /* open closetag */
														} else {
															return n.seq();
														}
													});
												}
											});
										} else {
											return n.if(n.and(n.eq($type, 3), n.and(n.ne($oldType, 3), n.and(n.ne($next, "{"), n.gt(n.head($opencount), 0)))), (test) => {
												if (test) {
													return 11; /* open enc-expr */
												} else {
													return n.if(n.and($encExpr, n.and(n.eq($type, 4), n.and(n.eq($hasQuot, 0), n.ne($next, "}")))), (test) => {
														if (test) {
															return 12; /* close enc-expr */
														} else {
															return n.seq();
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				} else {
					return n.if(n.and($string, n.geq($type, n.seq(6, 7))), (test) => {
						if (test) {
							return 2; /* close string */
						} else {
							return n.if(n.and($comment, n.eq($type, 2502)), (test) => {
								if (test) {
									return 4; /* close comment */
								} else {
									return n.if(n.and($opentag, n.eq($type, 505)), (test) => {
										if (test) {
											return 6; /* close opentag */
										} else {
											return n.if(n.and($closetag, n.eq($type, 505)), (test) => {
												if (test) {
													return 8; /* close closetag */
												} else {
													return n.if(n.and(n.and(n.eq($attrkey, n.false()), n.empty($type)), n.gt(n.head($opencount), 0)), (test) => {
														if (test) {
															return 9;
														} else {
															return n.if(n.and($attrkey, n.and(n.eq($type, 509), n.gt(n.head($opencount), 0))), (test) => {
																if (test) {
																	return 10;
																} else {
																	return n.seq();
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
	//console.log("flag",$flag);

	$hasQuot = n.if(n.empty($flag), ($hasQuot, test) => {
		if (test) {
			return n.if(n.eq($type, 3), (test) => {
				if (test) {
					return n.add($hasQuot, 1);
				} else {
					return n.if(n.eq($type, 4), (test) => {
						if (test) {
							return n.subtract($hasQuot, 1);
						} else {
							return $hasQuot;
						}
					});
				}
			});
		} else {
			return $hasQuot;
		}
	}, $hasQuot);

	$opencount = n.if(n.eq($flag, 5), ($opencount, test) => {
		if (test) {
			return n.seq(n.add(n.head($opencount), 1), n.tail($opencount));
		} else {
			return n.if(n.eq($flag, 7), (test) => {
				if (test) {
					return n.seq(n.subtract(n.head($opencount), 1), n.tail($opencount));
				} else {
					return $opencount; /* closers van string, comment, opentag, closetag moeten worden vervangen */
				}
			});
		}
	}, $opencount);
	let $emitBuffer = n.if(n.boolean($flag), ($opencount, test) => {
		if (test) {
			return n.if(n.exists($buffer), (test) => {
				if (test) {
					return n.if(n.or(n.geq($flag, n.seq(2, 4)), n.eq(n.matches($buffer, "^\\s*$"), n.false())), (test) => {
						if (test) {
							return n.stringJoin($buffer);
						} else {
							return n.seq();
						}
					});
				} else {
					return n.seq();
				}
			});
		} else {
			return n.if(n.boolean($zero), (test) => {
				if (test) {
					return n.if(n.boolean($wasVar), (test) => {
						if (test) {
							return n.if(n.boolean($var), (test) => {
								if (test) {
									return n.seq();
								} else {
									return n.stringJoin($buffer);
								}
							});
						} else {
							return n.if(n.boolean($wasNumber), (test) => {
								if (test) {
									return n.if(n.boolean($number), (test) => {
										if (test) {
											return n.seq();
										} else {
											return n.stringJoin($buffer);
										}
									});
								} else {
									return n.if(n.and(n.eq($type, 2600), n.and(n.geq($oldType, n.seq(6, 7, 11)), n.ne($next, "="))), (test) => {
										if (test) {
											return $char;
										} else {
											return n.if(n.eq($type, 10), (test) => {
												if (test) {
													return n.if(n.and(n.exists($buffer), n.matches(n.stringJoin($buffer), "^(group|instance|treat|cast|castable|order)$")), (test) => {
														if (test) {
															return n.seq();
														} else {
															return $char;
														}
													});
												} else {
													return n.if(n.and(n.ne($type, 505), n.and(n.ne($type, 2600), n.and(n.ne($type, 509), n.and(n.ne($type, 9), n.and(n.ne($type, 11), n.and(n.ne($type, 12), n.and(n.ne($type, 14), n.ne($type, 0)))))))), (test) => {
														if (test) { /* these arent blocks, unless theyre paired */
															return $char;
														} else {
															return n.if(n.and(n.eq($type, 509), n.not(n.geq($buffer, n.seq(":", ">", "<", "!")))), (test) => {
																if (test) {
																	return $char;
																} else {
																	return n.seq();
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
				} else {
					return n.seq();
				}
			});
		}
	}, $opencount);
	let $tpl = n.if(n.or(n.or(n.geq($flag, n.seq(2, 4, 6, 7, 8, 9, 10)), $wasNumber), $wasVar), ($opencount, test) => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.and(n.and($emitBuffer, n.exists($buffer)), $xqCompat), (test) => {
				if (test) {
					return xqc.inspectBuf($buffer);
				} else {
					return n.seq();
				}
			});
		}
	}, $opencount);
	console.log("tpl",$tpl);
	let $fixQuot = n.seq(n.and(n.exists($tpl), n.and(n.eq($tpl("t"), 7), n.eq($type, 6))));
	$flag = n.if(n.boolean($fixQuot), ($flag, test) => {
		if (test) {
			return n.seq();
		} else {
			return $flag;
		}
	}, $flag);
	let $fixQuotAnd = n.and($fixQuot, n.eq($next, "\""));
	$emitBuffer = n.if(n.boolean($fixQuotAnd), ($emitBuffer, test) => {
		if (test) {
			return n.seq();
		} else {
			return $emitBuffer;
		}
	}, $emitBuffer);
	$tpl = n.if(n.boolean($fixQuotAnd), ($tpl,test) => {
		if (test) {
			return n.seq();
		} else {
			return $tpl;
		}
	},$tpl);

	$flags = n.if(n.exists($tpl), ($flags, $tpl, test) => {
		if (test) {
			return xqc.process($tpl, $flags);
		} else {
			return $flags;
		}
	}, $flags,$tpl);
	$tpl = n.if(n.eq($flag, 2), ($tpl, test) => {
		if (test) {
			return map.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.if(n.empty($emitBuffer), (test) => {
				if (test) {
					return "";
				} else {
					return $emitBuffer;
				}
			})));
		} else {
			return n.if(n.geq($flag, n.seq(4, 6, 8, 9, 10)), (test) => {
				if (test) {
					return n.if(n.boolean($emitBuffer), (test) => {
						if (test) {
							return map.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.if(n.eq($flag, 8), (test) => {
								if (test) {
									return 2;
								} else {
									return $emitBuffer;
								}
							})));
						} else {
							return n.seq();
						}
					});
				} else {
					return n.if(n.boolean($emitBuffer), (test) => {
						if (test) {
							return n.if(n.eq($type, 8), (test) => {
								if (test) {
									return map.map(n.pair("t", 13), n.pair("v", $char));
								} else {
									return n.if(n.and(n.eq($type, 10), n.empty($buffer)), (test) => {
										if (test) {
											return n.seq();
										} else {
											return n.if(n.or(n.geq($flag, n.seq(7, 11)), n.gt(n.head($opencount), 0)), (test) => {
												if (test) {
													return map.map(n.pair("t", 7), n.pair("v", $emitBuffer));
												} else {
													return n.if(n.boolean($wasVar), (test) => {
														if (test) {
															return map.map(n.pair("t", 5), n.pair("v", $emitBuffer));
														} else {
															return n.if(n.boolean($wasNumber), (test) => {
																if (test) {
																	return map.map(n.pair("t", 8), n.pair("v", $emitBuffer));
																} else {
																	return n.seq();
																}
															});
														}
													});
												}
											});
										}
									});
								}
							});
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	}, $tpl);
	let $fromBuf = n.if(n.and(n.and(n.empty($flag), $emitBuffer), $zero), ($tpl, test) => {
		if (test) {
			return xqc.inspectTokens($char, $type);
		} else {
			return n.seq();
		}
	}, $tpl);

	$flags = n.if(n.exists($tpl), ($flags,$tpl, test) => {
		if (test) {
			return xqc.process($tpl, $flags);
		} else {
			return $flags;
		}
	}, $flags,$tpl);

	$flags = n.if(n.exists($fromBuf), ($flags, test) => {
		if (test) {
			return xqc.process($fromBuf, $flags);
		} else {
			return $flags;
		}
	}, $flags);

	$flags = map.put($flags, "char", n.if(n.eq($flag, 4), (test) => {
		if (test) {
			return " ";
		} else {
			return $next;
		}
	}));

	$flags = n.if(n.or(n.eq($type, 5), n.empty($next)), ($flags, test) => {
		console.log("test",test);
		if (test) { /* move to out*/
			let $output = $flags("$transpile");
			console.log("ot",array.size($flags("o")));
			$flags = n.if(array.size($flags("o")), ($flags, test) => {
				if (test) {
					return xqc.unwrap(map.map(n.pair("t", 0)), $flags);
				} else {
					return $flags;
				}
			}, $flags);
			let $r = $flags("r");
			let $s = array.size($r);
			$flags = n.if(n.boolean($s), ($flags, test) => {
				if (test) {
					$r = n.if(n.eq($output, "l3"), ($r, test) => {
						if (test) {
							return a.reduceAroundAt($r, xqc.toL3, n.seq(), map.map(), map.map());
						} else {
							return n.if(n.eq($output, "rdl"), (test) => {
								if (test) {
									return a.foldLeft($r, n.seq(), xqc.toRdl);
								} else {
									return $r;
								}
							});
						}
					}, $r);
					return map.put($flags, "out", n.seq($flags("out"), $r));
				} else {
					return $flags;
				}
			}, $flags);
			$flags = map.put($flags, "i", map.map());
			return map.put($flags, "r", array.array());
		} else {
			return $flags;
		}
	}, $flags);
	$flags = n.if(n.eq($type, 10), ($flags, test) => {
		if (test) {
			return $flags;
		} else {
			return map.put($flags, "type", $type);
		}
	}, $flags);
	$flags = map.put($flags, "buffer", n.if(n.or(n.or($emitBuffer, $attrval), n.geq($flag, n.seq(2, 6, 9))), (test) => {
		if (test) { /* TODO never buffer for some flags */
			return n.seq();
		} else {
			return n.if(n.and($comment, n.eq($type, 2600)), (test) => {
				if (test) { /* prevent buffering colons in comments */
					return n.if(n.empty($buffer), (test) => {
						if (test) {
							return n.seq();
						} else {
							return n.if(n.eq($next, ")"), (test) => {
								if (test) {
									return $buffer;
								} else {
									return n.seq($buffer, $char);
								}
							});
						}
					});
				} else {
					return n.if(n.and($zero, $flag), (test) => {
						if (test) {
							return $buffer;
						} else {
							return n.seq($buffer, $char);
						}
					});
				}
			});
		}
	}));
	$flags = map.put($flags, "string", n.if(n.or($fixQuotAnd, $attrval), (test) => {
		if (test) {
			return $type;
		} else {
			return n.if(n.eq($flag, 1), (test) => {
				if (test) {
					return $type;
				} else {
					return n.if(n.eq($flag, 2), (test) => {
						if (test) {
							return 0;
						} else {
							return $string;
						}
					});
				}
			});
		}
	}));
	$flags = map.put($flags, "var", $var);
	$flags = map.put($flags, "ws", n.eq($type, 10));
	$flags = map.put($flags, "number", $number);
	$flags = map.put($flags, "comment", n.if(n.eq($flag, 3), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.eq($flag, 4), (test) => {
				if (test) {
					return n.false();
				} else {
					return $comment;
				}
			});
		}
	}));
	$flags = map.put($flags, "opentag", n.if(n.eq($flag, 5), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.eq($flag, 6), (test) => {
				if (test) {
					return n.false();
				} else {
					return $opentag;
				}
			});
		}
	}));
	$flags = map.put($flags, "closetag", n.if(n.eq($flag, 7), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.eq($flag, 8), (test) => {
				if (test) {
					return n.false();
				} else {
					return $closetag;
				}
			});
		}
	}));
	$flags = map.put($flags, "attrkey", n.if(n.eq($flag, 9), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.eq($flag, 10), (test) => {
				if (test) {
					return n.false();
				} else {
					return $attrkey;
				}
			});
		}
	}));
	$flags = map.put($flags, "attrval", n.if(n.eq($flag, 10), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.and($attrval, n.eq($type, 6)), (test) => {
				if (test) {
					return n.false();
				} else {
					return $attrval;
				}
			});
		}
	}));
	$flags = map.put($flags, "enc-expr", n.if(n.eq($flag, 11), (test) => {
		if (test) {
			return n.true();
		} else {
			return n.if(n.eq($flag, 12), (test) => {
				if (test) {
					return n.false();
				} else {
					return $encExpr;
				}
			});
		}
	}));
	$flags = map.put($flags, "has-quot", $hasQuot);
	$flags = map.put($flags, "opencount", n.if(n.eq($flag, 11), (test) => {
		if (test) {
			return n.seq(0, $opencount);
		} else {
			return n.if(n.eq($flag, 12), (test) => {
				if (test) {
					return n.tail($opencount);
				} else {
					return $opencount;
				}
			});
		}
	}));
	return $flags;
}));
xqc.analyzeChars$2 = n.typed(n.function(n.seq(n.item(), n.item()), n.item()), ((...$) => {
	let $chars = $[0];
	let $params = $[1]; /* if the type changes, flush the buffer */
	/* TODO:
	 * WS for XML
	 * type 10 instead of 0 for enclosed expression
	 * revert to pair checking, tokenize all chars here
	 */
	let $flags = map.merge(n.seq($params, map.map(n.pair("xq-compat", n.eq($params("$compat"), "xquery")), n.pair("char", n.head($chars)), n.pair("type", 0), n.pair("buffer", n.seq()), n.pair("string", 0), n.pair("var", n.false()), n.pair("ws", n.false()), n.pair("number", n.false()), n.pair("comment", n.false()), n.pair("opentag", n.false()), n.pair("closetag", n.false()), n.pair("attrkey", n.false()), n.pair("attrval", n.false()), n.pair("enc-expr", n.false()), n.pair("has-quot", 0), n.pair("opencount", 0), n.pair("r", array.array()), n.pair("d", 1), n.pair("o", array.array()), n.pair("i", map.map()), n.pair("p", array.array()), n.pair("out", n.seq()))));
	//console.log("$flags",$flags);
	return xqc.charReducer(n.foldLeft(n.tail($chars), $flags, xqc.charReducer), n.seq())("out");
}));
xqc.detectCxf = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.detectCxf$1.apply(null, $);
};
xqc.replaceDotless = (...$) => {
	const len = $.length;
	if (len == 3) return xqc.replaceDotless$3.apply(null, $);
};
xqc.isQname = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.isQname$1.apply(null, $);
};
xqc.inspectBuf = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.inspectBuf$1.apply(null, $);
};
xqc.incr = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.incr$1.apply(null, $);
};
xqc.tpl = (...$) => {
	const len = $.length;
	if (len == 3) return xqc.tpl$3.apply(null, $);
};
xqc.opName = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.opName$1.apply(null, $);
};
xqc.guardedGet = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.guardedGet$2.apply(null, $);
};
xqc.unwrap = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.unwrap$2.apply(null, $);
};
xqc.rtp = (...$) => {
	const len = $.length;
	if (len == 6) return xqc.rtp$6.apply(null, $);
	if (len == 7) return xqc.rtp$7.apply(null, $);
	if (len == 8) return xqc.rtp$8.apply(null, $);
	if (len == 9) return xqc.rtp$9.apply(null, $);
	if (len == 10) return xqc.rtp$10.apply(null, $);
};
xqc.binOp = (...$) => {
	const len = $.length;
	if (len == 5) return xqc.binOp$5.apply(null, $);
};
xqc.processOpen = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.processOpen$2.apply(null, $);
};
xqc.processComma = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.processComma$1.apply(null, $);
};
xqc.processOp = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.processOp$2.apply(null, $);
};
xqc.processVar = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.processVar$2.apply(null, $);
};
xqc.processQname = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.processQname$2.apply(null, $);
};
xqc.process = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.process$2.apply(null, $);
};
xqc.toL3 = (...$) => {
	const len = $.length;
	if (len == 5) return xqc.toL3$5.apply(null, $);
};
xqc.toBuffer = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.toBuffer$1.apply(null, $);
};
xqc.normalizeQuery = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.normalizeQuery$2.apply(null, $);
};
xqc.toRdl = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.toRdl$2.apply(null, $);
};
xqc.normalizeQueryB = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.normalizeQueryB$2.apply(null, $);
};
xqc.analyzeChar = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.analyzeChar$1.apply(null, $);
};
xqc.flagToExpr = (...$) => {
	const len = $.length;
	if (len == 1) return xqc.flagToExpr$1.apply(null, $);
};
xqc.inspectTokens = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.inspectTokens$2.apply(null, $);
};
xqc.charReducer = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.charReducer$2.apply(null, $);
};
xqc.analyzeChars = (...$) => {
	const len = $.length;
	if (len == 2) return xqc.analyzeChars$2.apply(null, $);
};
module.exports = xqc;
