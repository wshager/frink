const n = require("../lib/index"),
	array = require("../lib/array"),
	map = require("../lib/map");
// transpiled from XQuery version 3.1
const xqc = {}; // http://raddle.org/xquery-compat;
const console = require("console");
const a = require("../lib/array-util.js");
console.log(a);
const dawg = require("../lib/dawg.js");
xqc.ncform = n.quoteTyped("\\p{L}\\p{N}\\-_");
xqc.ncname = n.quoteTyped(n.concat("^[", xqc.ncform, "]"));
xqc.qform = n.quoteTyped(n.concat("[", xqc.ncform, ":]+"));
xqc.qname = n.quoteTyped(n.concat("^", xqc.qform, "(#\\p{N}+)?$"));
xqc.varQname = n.quoteTyped(n.concat("^\\$", xqc.qform, "$"));
xqc.operatorRegexp = n.quoteTyped("=#\\p{N}+=");
xqc.operators = n.quoteTyped(n.map("xs:integer", "xs:string"), n.map(n.pair(1, "("), n.pair(2, ")"), n.pair(3, "{"), n.pair(4, "}"), n.pair(5, ";"), n.pair(6, "&quot;"), n.pair(7, "&apos;"), n.pair(8, "."), n.pair(9, "$"), n.pair(100, ","), n.pair(200, "satisfies"), n.pair(201, "some"), n.pair(202, "every"), n.pair(203, "switch"), n.pair(204, "typeswitch"), n.pair(205, "try"), n.pair(206, "if"), n.pair(207, "then"), n.pair(208, "else"), n.pair(209, "let"), n.pair(210, ":="), n.pair(211, "return"), n.pair(212, "case"), n.pair(213, "default"), n.pair(214, "xquery"), n.pair(215, "version"), n.pair(216, "module"), n.pair(217, "declare"), n.pair(218, "variable"), n.pair(219, "import"), n.pair(220, "at"), n.pair(221, "for"), n.pair(222, "in"), n.pair(223, "where"), n.pair(224, "order-by"), n.pair(225, "group-by"), n.pair(300, "or"), n.pair(400, "and"), n.pair(501, ">>"), n.pair(502, "<<"), n.pair(503, "is"), n.pair(504, ">="), n.pair(505, ">"), n.pair(506, "<="), n.pair(507, "<"), n.pair(508, "!="), n.pair(509, "="), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "||"), n.pair(700, "to"), n.pair(801, "-"), n.pair(802, "+"), n.pair(901, "mod"), n.pair(902, "idiv"), n.pair(903, "div"), n.pair(904, "*"), n.pair(1001, "union"), n.pair(1002, "|"), n.pair(1101, "intersect"), n.pair(1102, "except"), n.pair(1200, "instance-of"), n.pair(1300, "treat-as"), n.pair(1400, "castable-as"), n.pair(1500, "cast-as"), n.pair(1600, "=>"), n.pair(1701, "+"), n.pair(1702, "-"), n.pair(1800, "!"), n.pair(1901, "/"), n.pair(1902, "//"), n.pair(2001, "["), n.pair(2002, "]"), n.pair(2003, "?"), n.pair(2101, "array"), n.pair(2102, "attribute"), n.pair(2103, "comment"), n.pair(2104, "document"), n.pair(2105, "element"), n.pair(2106, "function"), n.pair(2107, "map"), n.pair(2108, "namespace"), n.pair(2109, "processing-instruction"), n.pair(2110, "text"), n.pair(2201, "array"), n.pair(2202, "attribute"), n.pair(2203, "comment"), n.pair(2204, "document-node"), n.pair(2205, "element"), n.pair(2206, "empty-sequence"), n.pair(2207, "function"), n.pair(2208, "item"), n.pair(2209, "map"), n.pair(2210, "namespace-node"), n.pair(2211, "node"), n.pair(2212, "processing-instruction"), n.pair(2213, "schema-attribute"), n.pair(2214, "schema-element"), n.pair(2215, "text"), n.pair(2400, "as"), n.pair(2501, "(:"), n.pair(2502, ":)"), n.pair(2600, ":")));
xqc.constructors = n.quoteTyped(n.map(n.pair(2101, "l"), n.pair(2102, "a"), n.pair(2103, "c"), n.pair(2104, "d"), n.pair(2105, "e"), n.pair(2106, "q"), n.pair(2107, "m"), n.pair(2108, "s"), n.pair(2109, "p"), n.pair(2110, "x")));
xqc.occurrence = n.quoteTyped(n.map(n.pair(2003, "zero-or-one"), n.pair(904, "zero-or-more"), n.pair(802, "one-or-more")));
xqc.types = n.quoteTyped(n.seq("untypedAtomic", "dateTime", "dateTimeStamp", "date", "time", "duration", "yearMonthDuration", "dayTimeDuration", "float", "double", "decimal", "integer", "nonPositiveInteger", "negativeInteger", "long", "int", "short", "byte", "nonNegativeInteger", "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte", "positiveInteger", "gYearMonth", "gYear", "gMonthDay", "gDay", "gMonth", "string", "normalizedString", "token", "language", "NMTOKEN", "Name", "NCName", "ID", "IDREF", "ENTITY", "boolean", "base64Binary", "hexBinary", "anyURI", "QName", "NOTATION"));
xqc.operatorMap = n.quoteTyped(n.map("xs:integer", "xs:string"), n.map(n.pair(206, "if"), n.pair(209, "item"), n.pair(501, "precedes"), n.pair(502, "follows"), n.pair(503, "is"), n.pair(504, "gge"), n.pair(505, "ggt"), n.pair(506, "gle"), n.pair(507, "glt"), n.pair(508, "gne"), n.pair(509, "geq"), n.pair(510, "ge"), n.pair(511, "gt"), n.pair(512, "le"), n.pair(513, "lt"), n.pair(514, "ne"), n.pair(515, "eq"), n.pair(600, "concat"), n.pair(801, "subtract"), n.pair(802, "add"), n.pair(904, "multiply"), n.pair(1002, "union"), n.pair(1701, "plus"), n.pair(1702, "minus"), n.pair(1800, "x-for-each"), n.pair(1901, "select"), n.pair(1902, "select-deep"), n.pair(2001, "x-filter"), n.pair(2003, "lookup"), n.pair(2004, "array"), n.pair(2600, "pair"), n.pair(2501, "comment")));
xqc.operatorTrie = n.quoteTyped(n.jsonDoc("/db/apps/raddle.xq/operator-trie.json"));
xqc.uriChars = n.quoteTyped(n.map(n.pair("%3E", ">"), n.pair("%3C", "<"), n.pair("%2C", ","), n.pair("%3A", ":")));
xqc.isQname = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $b = a[0];
	return n.matches(n.stringJoin($b), xqc.qform);
}));
xqc.inspectBuf = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $s = a[0];
	return n.forEach(n.empty($s), test => {
		if (test) {
			return n.seq();
		} else {
			let $ret = dawg.traverse(xqc.operatorTrie, $s);
			return n.forEach(n.or(n.empty($ret), n.instanceOf($ret, n.array(n.occurs(n.item(), n.zeroOrMore())))), test => {
				if (test) {
					return n.forEach(xqc.isQname($s), test => {
						if (test) {
							return n.map(n.pair("t", 6), n.pair("v", n.stringJoin($s)));
						} else {
							return n.forEach(n.eq(n.xFilter($s, (() => {
								return 1;
							})), "$"), test => {
								if (test) {
									return n.map(n.pair("t", 5), n.pair("v", n.stringJoin($s)));
								} else {
									return n.forEach(n.eq(n.xFilter($s, (() => {
										return 1;
									})), "&quot;"), test => {
										if (test) {
											return n.map(n.pair("t", 7), n.pair("v", n.stringJoin($s)));
										} else {
											return n.map(n.pair("t", 13), n.pair("v", $s));
										}
									});
								}
							});
						}
					});
				} else {
					return n.map(n.pair("t", 4), n.pair("v", $ret));
				}
			});
		}
	});
}));
xqc.incr = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $a = a[0];
	return array.forEach($a, n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
		let $entry = a[0];
		return map.put($entry, "d", n.add(map.get($entry, "d"), 1));
	})));
}));
xqc.tpl = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $t = a[0];
	let $d = a[1];
	let $v = a[2];
	return n.map(n.pair("t", $t), n.pair("d", $d), n.pair("v", $v));
}));
xqc.opName = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $v = a[0];
	return n.forEach(map.contains(xqc.operatorMap, $v), test => {
		if (test) {
			return xqc.operatorMap($v);
		} else {
			return xqc.operators($v);
		}
	});
}));
xqc.last = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $r = a[0];
	let $size = a[1];
	let $last = $r($size);
	return n.forEach(n.empty($last), test => {
		if (test) {
			return n.map();
		} else {
			return n.forEach(n.and(n.eq($last("t"), "9"), n.gt($size, "0")), test => {
				if (test) {
					return xqc.last($r, n.minus($size, 1));
				} else {
					return $last;
				}
			});
		}
	});
}));
xqc.unwrap = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $cur = a[0];
	let $r = a[1];
	let $d = a[2];
	let $o = a[3];
	let $i = a[4];
	let $p = a[5];
	let $osize = array.size($o);
	let $ocur = n.forEach(n.gt($osize, "0"), test => {
		if (test) {
			return $o($osize);
		} else {
			return n.map();
		}
	});
	let $hasTypesig = n.and(n.eq($ocur("t"), "4"), n.eq($ocur("v"), 2400));
	$o = n.forEach(n.boolean($hasTypesig), test => {
		if (test) {
			return a.pop($o);
		} else {
			return $o;
		}
	});
	$osize = n.forEach(n.boolean($hasTypesig), test => {
		if (test) {
			return array.size($o);
		} else {
			return $osize;
		}
	});
	$ocur = n.forEach(n.gt($osize, "0"), test => {
		if (test) {
			return $o($osize);
		} else {
			return n.map();
		}
	});
	let $size = array.size($r);
	let $ot = $ocur("t");
	let $ov = $ocur("v");
	let $hasOp = n.eq($ot, "4");
	let $t = $cur("t");
	let $v = $cur("v");
	let $type = n.forEach(n.eq($t, "1"), test => {
		if (test) {
			return n.forEach(n.eq($v, "1"), test => {
				if (test) {
					return "1";
				} else {
					return n.forEach(n.eq($v, "3"), test => {
						if (test) {
							return "3";
						} else {
							return n.forEach(n.eq($v, 2001), test => {
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
			return n.forEach(n.eq($t, "2"), test => {
				if (test) {
					return n.forEach(n.eq($v, "2"), test => {
						if (test) {
							return "2";
						} else {
							return n.forEach(n.eq($v, "4"), test => {
								if (test) {
									return "4";
								} else {
									return n.forEach(n.eq($v, 2002), test => {
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
					return n.forEach(n.eq($t, "4"), test => {
						if (test) {
							return $v;
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	});
	let $isClose = n.eq($t, "2");
	let $isLet = n.eq($type, 209);
	let $isBody = n.and(n.and(n.eq($type, "4"), $hasOp), n.eq($ov, 3106));
	let $has = n.forEach(n.eq($ot, "1"), test => {
		if (test) {
			return n.forEach(n.eq($ov, "1"), test => {
				if (test) {
					return "1";
				} else {
					return n.forEach(n.eq($ov, "3"), test => {
						if (test) {
							return "3";
						} else {
							return n.forEach(n.eq($ov, 2001), test => {
								if (test) {
									return 2001;
								} else {
									return n.forEach(n.eq($ov, 2004), test => {
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
			return n.forEach(n.eq($ot, 11), test => {
				if (test) {
					return $ot;
				} else {
					return n.forEach(n.boolean($hasOp), test => {
						if (test) {
							return n.forEach(n.eq($ov, 210), test => {
								if (test) {
									return n.forEach(n.geq($type, n.seq(209, 211)), test => {
										if (test) {
											return $ov;
										} else {
											return n.seq();
										}
									});
								} else {
									return n.forEach(n.seq(n.and(n.gt($ov, 2100), n.lt($ov, 2200))), test => {
										if (test) {
											return 2100;
										} else {
											return n.forEach(n.and(n.eq($type, "4"), n.seq(n.and(n.gt($ov, 3000), n.lt($ov, 3100)))), test => {
												if (test) {
													return 2200;
												} else {
													return n.forEach(n.and(n.seq(n.or(n.eq($type, "2"), n.eq($t, "3"))), n.eq($ov, 3006)), test => {
														if (test) {
															return 3006;
														} else {
															return n.forEach(n.and(n.eq($type, "6"), n.geq($ov, n.seq(2001, 2004))), test => {
																if (test) {
																	return 4000;
																} else {
																	return n.forEach(n.eq($ov, 211), test => {
																		if (test) {
																			return n.forEach(n.eq($type, 209), test => {
																				if (test) {
																					return 211;
																				} else {
																					return 231;
																				}
																			});
																		} else {
																			return n.forEach(n.geq($ov, n.seq(207, 208, 221, 222, 223, 224, 225, 1200, 2600, 2400)), test => {
																				if (test) {
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
							return n.seq();
						}
					});
				}
			});
		}
	});
	let $isX = n.and($hasOp, n.geq($type, n.seq(222, 223, 224, 225)));
	let $closeParams = n.and(n.eq($type, "2"), n.eq($has, 3006));
	let $hasAss = n.eq($has, 210);
	let $hasXfor = n.eq($has, 221);
	let $hasX = n.geq($has, n.seq(222, 223, 224, 225));
	let $isXlet = n.and($isLet, $hasX);
	let $hasConstr = n.eq($has, 2200);
	let $hasConstrType = n.eq($has, 2100);
	let $hasParam = n.and(n.eq($hasTypesig, n.false()), n.eq($has, 3006));
	let $hasXret = n.eq($has, 231);
	let $pass = n.and(n.eq($type, 209), n.seq(n.or(n.eq($has, 207), n.or(n.eq($hasOp, n.false()), n.or(n.eq($ov, 3106), n.eq($has, 211)))))); $pass = n.or($pass, n.or(n.or(n.eq($type, 210), n.seq(n.and(n.eq($t, "3"), n.eq($has, "1")))), n.eq($osize, "0")));
	let $hasAf = n.eq($has, 4000);
	let $hasXass = n.and($hasOp, n.and(n.eq($ov, 210), n.seq(n.or($isX, n.seq(n.and($hasAss, n.and(n.gt($osize, "1"), n.and(n.eq($o(n.minus($osize, 1))("t"), "4"), n.geq($o(n.minus($osize, 1))("v"), n.seq(222, 223, 224, 225))))))))));
	let $isXret = n.and(n.eq($type, 211), n.seq(n.or($hasX, $hasXass)));
	let $hasTuple = n.and(n.eq($t, "3"), n.geq($has, 2600));
	let $matching = n.seq(n.or(n.or(n.seq(n.and(n.eq($type, "4"), n.eq($has, "3"))), n.seq(n.and(n.eq($type, "2"), n.eq($has, "1")))), n.seq(n.and(n.eq($type, 2002), n.geq($has, n.seq(2001, 2004))))));
	let $closeThen = n.and(n.eq($type, 208), n.eq($has, 207));
	//let $nu = console.log(n.map(n.pair("t", $t), n.pair("v", $v), n.pair("d", $d), n.pair("has", $has), n.pair("has-tuple", $hasTuple), n.pair("matching", $matching), n.pair("ocur", $ocur), n.pair("has-typesig", $hasTypesig), n.pair("pass", $pass), n.pair("ret", $r)));
	let $isLetInElse = n.and(n.eq($has, 208), n.and(n.eq($isLet, n.true()), n.eq(xqc.last($r, $size)("t"), "1"))); $r = n.forEach(n.and(n.eq($has, 208), n.eq($isLetInElse, n.false())), test => {
		if (test) {
			return array.append($r, xqc.tpl(2, $d, 4));
		} else {
			return $r;
		}
	}); $d = n.forEach(n.and(n.eq($has, 208), $isLetInElse), test => {
		if (test) {
			return n.minus($d, 1);
		} else {
			return $d;
		}
	});
	return n.forEach(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.eq($osize, "0"), $pass), $hasAss), $isBody), $isLetInElse), $hasTypesig), $hasParam), $hasAf), $matching), $closeThen), $isXret), $hasXret), $isX), $hasX), $hasXfor), $hasConstr), $hasTuple), n.eq($has, 11)), test => {
		if (test) {
			let $tpl = n.forEach(n.or($hasX, $hasXass), test => {
				if (test) {
					return n.seq(xqc.tpl(1, $d, 4), xqc.tpl(2, n.minus($d, 1), 2), xqc.tpl(3, n.minus($d, 2), ","));
				} else {
					return n.seq();
				}
			});
			let $d = n.forEach(n.or($hasX, $hasXass), test => {
				if (test) {
					return n.minus($d, 2);
				} else {
					return $d;
				}
			});
			$tpl = n.forEach(n.boolean($hasTuple), test => {
				if (test) {
					return xqc.tpl(2, $d, 2);
				} else {
					return n.forEach(n.boolean($hasParam), test => {
						if (test) {
							return n.seq(xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), $cur);
						} else {
							return n.forEach(n.or(n.or($isXret, $isX), $isXlet), test => {
								if (test) {
									let $tpl = n.seq($tpl, xqc.tpl(4, $d, xqc.operators($v)), xqc.tpl(1, $d, 1), xqc.tpl(1, n.add($d, 1), 3));
									let $d = n.add($d, 2);
									return n.forEach(n.eq($v, 222), test => {
										if (test) {
											return $tpl;
										} else {
											return a.foldLeftAt($p, $tpl, n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
												let $pre = a[0];
												let $cur = a[1];
												let $i = a[2];
												return n.seq($pre, xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl(4, n.add($d, 1), $cur), xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(4, n.add($d, 1), "$"), xqc.tpl(1, n.add($d, 1), 1), xqc.tpl(8, n.add($d, 2), $i), xqc.tpl(2, n.add($d, 1), 2), xqc.tpl(2, $d, 2), n.forEach(n.or($isLet, n.eq($type, 225)), test => {
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
									return n.forEach(n.boolean($hasXret), test => {
										if (test) {
											return n.seq(xqc.tpl(2, $d, 4), xqc.tpl(2, n.minus($d, 1), 2), xqc.tpl(2, n.minus($d, 2), 2));
										} else {
											return n.forEach(n.and($isX, $hasX), test => {
												if (test) {
													return n.seq($tpl, xqc.tpl(3, $d, ","));
												} else {
													return n.forEach(n.and($matching, n.eq($ov, 2001)), test => {
														if (test) {
															return n.seq(xqc.tpl($t, $d, 4), xqc.tpl($t, n.minus($d, 1), 2));
														} else {
															return n.forEach(n.or($isBody, $hasConstr), test => {
																if (test) {
																	return n.seq(xqc.tpl($t, $d, $v), xqc.tpl($t, n.minus($d, 1), 2));
																} else {
																	return n.forEach(n.or($hasAf, $isClose), test => {
																		if (test) {
																			let $closeCurly = n.forEach(n.eq($has, "3"), test => {
																				if (test) {
																					return n.forEach(n.gt($osize, "1"), test => {
																						if (test) {
																							return n.ne($o(n.minus($osize, 1))("t"), "4");
																						} else {
																							return n.true();
																						}
																					});
																				} else {
																					return n.false();
																				}
																			});
																			return xqc.tpl($t, $d, n.forEach(n.boolean($closeCurly), test => {
																				if (test) {
																					return $v;
																				} else {
																					return "2";
																				}
																			}));
																		} else {
																			return n.forEach(n.or(n.or($pass, $closeThen), $hasXfor), test => {
																				if (test) {
																					return n.seq();
																				} else {
																					return n.forEach(n.boolean($hasAss), test => {
																						if (test) {
																							return n.forEach(n.and($isLet, n.eq(xqc.last($r, $size)("t"), "3")), test => {
																								if (test) {
																									return n.seq();
																								} else {
																									return n.seq(xqc.tpl(2, $d, 2), xqc.tpl(3, n.minus($d, 1), ","));
																								}
																							});
																						} else {
																							return n.forEach(n.boolean($isLet), test => {
																								if (test) {
																									return n.seq();
																								} else {
																									return xqc.tpl($t, $d, $v);
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
			let $o = n.forEach(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or(n.or($hasParam, $hasConstr), n.seq(n.and($hasAss, n.ne(xqc.last($r, $size)("t"), "3")))), $isBody), $hasAf), $matching), $closeThen), $isXret), $isX), $hasTuple), test => {
				if (test) {
					return a.pop($o);
				} else {
					return $o;
				}
			});
			$o = n.forEach(n.boolean($closeParams), test => {
				if (test) {
					return array.append($o, xqc.tpl(4, $d, 3106));
				} else {
					return n.forEach(n.or($isXret, $isX), test => {
						if (test) {
							return array.append($o, xqc.tpl($t, $d, $v));
						} else {
							return $o;
						}
					});
				}
			});
			return n.map(n.pair("r", n.forEach(n.exists($tpl), test => {
				if (test) {
					return n.foldLeft($tpl, $r, array.append);
				} else {
					return $r;
				}
			})), n.pair("d", n.forEach(n.or(n.or(n.or($isBody, $hasXret), $hasConstr), n.seq(n.and($matching, n.eq($ov, 2001)))), test => {
				if (test) {
					return n.minus($d, 2);
				} else {
					return n.forEach(n.boolean($isXret), test => {
						if (test) {
							return n.add($d, 1);
						} else {
							return n.forEach(n.or($isX, $isXlet), test => {
								if (test) {
									return n.add($d, 2);
								} else {
									return n.forEach(n.or(n.or(n.or(n.or($hasAss, $hasParam), $hasAf), $matching), $hasTuple), test => {
										if (test) {
											return n.minus($d, 1);
										} else {
											return $d;
										}
									});
								}
							});
						}
					});
				}
			})), n.pair("o", $o), n.pair("i", n.forEach(n.boolean($pass), test => {
				if (test) {
					return $i;
				} else {
					return map.put($i, $d, array.size($r));
				}
			})), n.pair("p", n.forEach(n.boolean($hasXret), test => {
				if (test) {
					return n.array();
				} else {
					return $p;
				}
			})));
		} else {
			//let $nu = console.log("auto");
			let $r = n.forEach(n.and($hasOp, n.seq(n.or(n.gt($ov, 3000), $hasConstrType))), test => {
				if (test) {
					return $r;
				} else {
					return array.append($r, xqc.tpl(2, $d, 2));
				}
			});
			return xqc.unwrap($cur, $r, n.forEach(n.and($hasOp, n.seq(n.or(n.gt($ov, 3000), $hasConstrType))), test => {
				if (test) {
					return $d;
				} else {
					return n.minus($d, 1);
				}
			}), a.pop($o), map.put($i, $d, array.size($r)), $p);
		}
	});
}));
xqc.rtp = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $r = a[0];
	let $d = a[1];
	let $o = a[2];
	let $i = a[3];
	let $p = a[4];
	return xqc.rtp($r, $d, $o, $i, $p, n.seq());
}));
xqc.rtp = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $r = a[0];
	let $d = a[1];
	let $o = a[2];
	let $i = a[3];
	let $p = a[4];
	let $tpl = a[5];
	return xqc.rtp($r, $d, $o, $i, $p, $tpl, n.false());
}));
xqc.rtp = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $r = a[0];
	let $d = a[1];
	let $o = a[2];
	let $i = a[3];
	let $p = a[4];
	let $tpl = a[5];
	let $removeOp = a[6];
	return xqc.rtp($r, $d, $o, $i, $p, $tpl, $removeOp, n.seq());
}));
xqc.rtp = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $r = a[0];
	let $d = a[1];
	let $o = a[2];
	let $i = a[3];
	let $p = a[4];
	let $tpl = a[5];
	let $removeOp = a[6];
	let $newOp = a[7];
	return xqc.rtp($r, $d, $o, $i, $p, $tpl, $removeOp, $newOp, n.seq());
}));
xqc.rtp = n.quoteTyped(n.function(n.seq(n.array(n.occurs(n.item(), n.zeroOrMore())), n.integer(), n.array(n.occurs(n.item(), n.zeroOrMore())), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.occurs(n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.zeroOrMore()), n.occurs(n.boolean(), n.zeroOrOne()), n.occurs(n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.zeroOrOne()), n.occurs(n.string(), n.zeroOrOne())), n.item()), ((...a) => {
	let $r = a[0];
	let $d = a[1];
	let $o = a[2];
	let $i = a[3];
	let $p = a[4];
	let $tpl = a[5];
	let $removeOp = a[6];
	let $newOp = a[7];
	let $param = a[8];
	return n.forEach(n.boolean($removeOp), test => {
		if (test) {
			let $o = a.pop($o);
			return n.map(n.pair("d", $d), n.pair("o", n.forEach(n.exists($newOp), test => {
				if (test) {
					return array.append($o, $newOp);
				} else {
					return $o;
				}
			})), n.pair("i", n.forEach(n.exists($tpl), test => {
				if (test) {
					return map.put($i, n.xFilter($tpl, (() => {
						return 1;
					}))("d"), n.add(array.size($r), 1));
				} else {
					return $i;
				}
			})), n.pair("r", n.forEach(n.exists($tpl), test => {
				if (test) {
					return n.foldLeft($tpl, $r, array.append);
				} else {
					return $r;
				}
			})), n.pair("p", n.forEach(n.boolean($param), test => {
				if (test) {
					return array.append($p, $param);
				} else {
					return $p;
				}
			})));
		} else {
			return n.map(n.pair("d", $d), n.pair("o", n.forEach(n.exists($newOp), test => {
				if (test) {
					return array.append($o, $newOp);
				} else {
					return $o;
				}
			})), n.pair("i", n.forEach(n.exists($tpl), test => {
				if (test) {
					return map.put($i, n.xFilter($tpl, (() => {
						return 1;
					}))("d"), n.add(array.size($r), 1));
				} else {
					return $i;
				}
			})), n.pair("r", n.forEach(n.exists($tpl), test => {
				if (test) {
					return n.foldLeft($tpl, $r, array.append);
				} else {
					return $r;
				}
			})), n.pair("p", n.forEach(n.boolean($param), test => {
				if (test) {
					return array.append($p, $param);
				} else {
					return $p;
				}
			})));
		}
	});
}));
xqc.binOp = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $t = a[1];
	let $v = a[2];
	let $d = a[3];
	let $o = a[4];
	let $i = a[5];
	let $p = a[6];
	let $ocur = a[7];
	let $hasPreOp = a[8];
	let $precedingOp = n.forEach(n.and($hasPreOp, $ocur("v")), test => {
		if (test) {
			return n.forEach(n.and(n.eq($ocur("v"), 1901), n.eq($v, 2001)), test => {
				if (test) {
					return n.true();
				} else {
					return n.ge($ocur("v"), $v);
				}
			});
		} else {
			return n.false();
		}
	});
	//let $nu = console.log(n.seq("bin-op: ", $v, ", ocur: ", $ocur, ", prec: ", $precedingOp, ", d: ", $d, ", i: ", $i));
	$d = n.forEach(n.boolean($precedingOp), test => {
		if (test) {
			return n.minus($d, 1);
		} else {
			return $d;
		}
	});
	let $split = n.forEach(map.contains($i, $d), test => {
		if (test) {
			return $i($d);
		} else {
			return "1";
		}
	});
	let $left = n.forEach(n.boolean($precedingOp), test => {
		if (test) {
			return array.append(xqc.incr(array.subarray($ret, $split)), xqc.tpl(2, n.add($d, 1), 2));
		} else {
			return xqc.incr(array.subarray($ret, $split));
		}
	});
	$o = n.forEach(n.boolean($precedingOp), test => {
		if (test) {
			return array.remove($o, array.size($o));
		} else {
			return $o;
		}
	});
	$ret = array.append(array.subarray($ret, 1, n.minus($split, 1)), xqc.tpl(4, $d, xqc.opName($v)));
	$i = n.forEach(n.boolean($precedingOp), test => {
		if (test) {
			return map.put($i, $d, $split);
		} else {
			return map.put($i, $d, array.size($ret));
		}
	});
	let $tpl = n.seq(xqc.tpl(1, n.add($d, 1), 1), array.flatten($left), xqc.tpl(3, n.add($d, 1), ","));
	return n.forEach(n.eq($v, 2001), test => {
		if (test) {
			return xqc.rtp($ret, n.add($d, 2), $o, $i, $p, n.seq($tpl, xqc.tpl(1, n.add($d, 1), 3)), n.seq(), xqc.tpl($t, $d, $v));
		} else {
			return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, $tpl, n.seq(), xqc.tpl($t, $d, $v));
		}
	});
}));
xqc.process = n.quoteTyped(n.function(n.seq(n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.integer(), n.array(n.occurs(n.item(), n.zeroOrMore())), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $cur = a[0];
	let $ret = a[1];
	let $d = a[2];
	let $o = a[3];
	let $i = a[4];
	let $p = a[5];
	//let $nu = console.log(n.seq("cur: ", $cur));
	let $size = array.size($ret);
	let $t = $cur("t");
	let $v = $cur("v");
	let $osize = array.size($o);
	let $ocur = n.forEach(n.gt($osize, "0"), test => {
		if (test) {
			return $o($osize);
		} else {
			return n.map();
		}
	});
	let $hasOp = n.eq($ocur("t"), "4");
	let $hasPreOp = n.and($hasOp, n.and(n.gge($ocur("v"), 300), n.glt($ocur("v"), 2100)));
	return n.forEach(n.and($hasOp, n.eq($ocur("v"), 2501)), test => {
		if (test) {
			return n.forEach(n.and(n.eq($t, "4"), n.eq($v, 2502)), test => {
				if (test) {
					return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl(2, $d, 2), n.true());
				} else {
					let $tpl = xqc.last($ret, $size);
					return xqc.rtp(a.put($ret, $size, xqc.tpl(7, $tpl("d"), n.concat($tpl("v"), " ", $v))), $d, $o, $i, $p);
				}
			});
		} else {
			return n.forEach(n.eq($t, "0"), test => {
				if (test) {
					let $cur = xqc.tpl($t, $d, $v);
					let $tmp = xqc.unwrap($cur, $ret, $d, $o, $i, $p);
					let $d = $tmp("d");
					return map.put($tmp, "r", array.append($tmp("r"), xqc.tpl($t, $d, $v)));
				} else {
					return n.forEach(n.eq($t, "1"), test => {
						if (test) {
							return n.forEach(n.eq($v, 2001), test => {
								if (test) {
									//let $cur = xqc.tpl($t, $d, $v);
									let $hasSelect = n.and($hasOp, n.eq($ocur("v"), 1901));
									let $it = n.forEach(n.or(n.eq($size, "0"), n.seq(n.and(n.geq(xqc.last($ret, $size)("t"), n.seq(1, 3, 6)), n.eq($hasSelect, n.false())))), test => {
										if (test) {
											return 2004;
										} else {
											return 2001;
										}
									});
									return n.forEach(n.eq($it, 2001), test => {
										if (test) {
											return xqc.binOp($ret, 1, $it, $d, $o, $i, $p, $ocur, $hasPreOp);
										} else {
											return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, xqc.opName($it)), xqc.tpl(1, $d, 1)), n.false(), xqc.tpl(1, $d, $it));
										}
									});
								} else {
									return n.forEach(n.eq($v, "3"), test => {
										if (test) {
											let $hasRettype = n.and($hasOp, n.geq($ocur("v"), 2400));
											let $o = n.forEach(n.boolean($hasRettype), test => {
												if (test) {
													return array.remove($o, $osize);
												} else {
													return $o;
												}
											});
											let $ocur = n.forEach(n.boolean($hasRettype), test => {
												if (test) {
													return $o(n.minus($osize, 1));
												} else {
													return $ocur;
												}
											});
											let $hasParams = n.and($hasOp, n.eq($ocur("v"), 3106));
											let $hasConstrType = n.and(n.and(n.eq($hasParams, n.false()), $hasOp), n.and(n.gt($ocur("v"), 3000), n.lt($ocur("v"), 3100)));
											let $cur = xqc.tpl($t, $d, $v);
											let $tpl = n.forEach(n.boolean($hasParams), test => {
												if (test) {
													let $tpl = n.forEach(n.boolean($hasRettype), test => {
														if (test) {
															return xqc.tpl(2, $d, 2);
														} else {
															return n.seq(xqc.tpl(3, $d, ","), xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), xqc.tpl(2, $d, 2));
														}
													});
													return a.foldLeftAt($p, n.seq($tpl, xqc.tpl(3, n.minus($d, 1), ","), $cur), n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
														let $pre = a[0];
														let $cur = a[1];
														let $i = a[2];
														return n.seq($pre, xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl(5, n.add($d, 1), $cur), xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(10, n.add($d, 1), "$"), xqc.tpl(1, $d, 1), xqc.tpl(8, $d, n.string($i)), xqc.tpl(2, $d, 2), xqc.tpl(2, $d, 2), xqc.tpl(3, $d, ","));
													})));
												} else {
													return n.forEach(n.boolean($hasConstrType), test => {
														if (test) {
															return $cur;
														} else {
															return n.forEach(n.boolean($hasOp), test => {
																if (test) {
																	return xqc.tpl($t, $d, 1);
																} else {
																	return $cur;
																}
															});
														}
													});
												}
											});
											return xqc.rtp($ret, n.forEach(n.boolean($hasParams), test => {
												if (test) {
													return $d;
												} else {
													return n.add($d, 1);
												}
											}), $o, $i, n.forEach(n.boolean($hasParams), test => {
												if (test) {
													return n.array();
												} else {
													return $p;
												}
											}), $tpl, $hasConstrType, n.forEach(n.boolean($hasParams), test => {
												if (test) {
													return n.seq();
												} else {
													return n.forEach(n.boolean($hasConstrType), test => {
														if (test) {
															return $ocur;
														} else {
															return $cur;
														}
													});
												}
											}));
										} else {
											let $hasFunc = n.and($hasOp, n.eq($ocur("v"), 2106));
											let $hasConstrType = n.and(n.and(n.eq($hasFunc, n.false()), $hasOp), n.and(n.gt($ocur("v"), 2100), n.lt($ocur("v"), 2200)));
											let $cur = xqc.tpl($t, n.add($d, 1), $v);
											let $last = n.forEach(n.boolean($size), test => {
												if (test) {
													return xqc.last($ret, $size);
												} else {
													return n.map();
												}
											});
											let $hasLambda = n.and($hasFunc, n.eq($last("t"), "4"));
											let $ret = n.forEach(n.boolean($hasLambda), test => {
												if (test) {
													return a.pop($ret);
												} else {
													return $ret;
												}
											});
											let $tpl = n.forEach(n.boolean($hasFunc), test => {
												if (test) {
													let $tpl = n.seq(xqc.tpl(4, $d, "function"), $cur, xqc.tpl(1, n.add($d, 1), 1));
													return n.forEach(n.boolean($hasLambda), test => {
														if (test) {
															return n.seq(xqc.tpl(4, $d, "quote-typed"), $cur, $tpl);
														} else {
															return n.seq(xqc.tpl(3, $d, ","), $tpl);
														}
													});
												} else {
													return n.forEach(n.or(n.eq($size, "0"), n.geq(xqc.last($ret, $size)("t"), n.seq(1, 3))), test => {
														if (test) {
															return n.seq(xqc.tpl(4, $d, ""), $cur);
														} else {
															return $cur;
														}
													});
												}
											});
											return xqc.rtp($ret, n.forEach(n.boolean($hasFunc), test => {
												if (test) {
													return n.add($d, 2);
												} else {
													return n.add($d, 1);
												}
											}), $o, $i, $p, $tpl, n.or($hasFunc, $hasConstrType), n.forEach(n.boolean($hasFunc), test => {
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
						} else {
							return n.forEach(n.eq($t, "2"), test => {
								if (test) {
									return xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
								} else {
									return n.forEach(n.eq($t, "3"), test => {
										if (test) {
											return n.forEach(n.or(n.seq(n.and($hasOp, n.eq($ocur("v"), 3006))), n.seq(n.and(n.eq($ocur("t"), "1"), n.eq($ocur("v"), 2004)))), test => {
												if (test) {
													let $cur = xqc.tpl($t, $d, $v);
													let $tpl = n.forEach(n.eq($ocur("v"), 3006), test => {
														if (test) {
															return n.seq(xqc.tpl(4, $d, "item"), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2), $cur);
														} else {
															return $cur;
														}
													});
													return xqc.rtp($ret, $d, $o, $i, $p, $tpl);
												} else {
													let $cur = xqc.tpl($t, $d, $v);
													let $hasAss = n.eq($ocur("v"), 210);
													let $tmp = xqc.unwrap(n.forEach(n.boolean($hasAss), test => {
														if (test) {
															return xqc.tpl(4, $d, 209);
														} else {
															return $cur;
														}
													}), $ret, $d, $o, $i, $p);
													let $o = $tmp("o");
													let $ocur = $o(array.size($o));
													let $d = $tmp("d");
													let $hasTypesig = n.and($hasOp, n.eq($ocur("v"), 2400));
													let $tpl = n.forEach(n.boolean($hasAss), test => {
														if (test) {
															return n.seq(xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1));
														} else {
															return n.forEach(n.or($hasTypesig, n.seq(n.and($hasOp, n.geq($ocur("v"), n.seq(210, 700))))), test => {
																if (test) {
																	return n.seq();
																} else {
																	return xqc.tpl($t, $d, $v);
																}
															});
														}
													});
													return xqc.rtp($tmp("r"), n.forEach(n.boolean($hasAss), test => {
														if (test) {
															return n.add($d, 1);
														} else {
															return $d;
														}
													}), $tmp("o"), $tmp("i"), $tmp("p"), $tpl, n.seq(), n.forEach(n.boolean($hasAss), test => {
														if (test) {
															return xqc.tpl(4, $d, 209);
														} else {
															return n.seq();
														}
													}));
												}
											});
										} else {
											return n.forEach(n.eq($t, "4"), test => {
												if (test) {
													return n.forEach(n.eq($v, 217), test => {
														if (test) {
															return xqc.rtp($ret, $d, $o, $i, $p, n.seq(), n.seq(), xqc.tpl($t, $d, $v));
														} else {
															return n.forEach(n.eq($v, 218), test => {
																if (test) {
																	return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(10, $d, "$>"), xqc.tpl(1, $d, 1)), n.and($hasOp, n.eq($ocur("v"), 217)), xqc.tpl($t, $d, $v));
																} else {
																	return n.forEach(n.eq($v, 216), test => {
																		if (test) {
																			return n.forEach(n.and($hasOp, n.eq($ocur("v"), 219)), test => {
																				if (test) {
																					return xqc.rtp(a.pop($ret), n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, "$<"), xqc.tpl(1, $d, 1)), n.true(), xqc.tpl($t, $d, $v));
																				} else {
																					return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, "$*"), xqc.tpl(1, $d, 1)), $hasPreOp);
																				}
																			});
																		} else {
																			return n.forEach(n.eq($v, 215), test => {
																				if (test) {
																					return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, "xq-version"), xqc.tpl(1, $d, 1)), $hasOp, xqc.tpl($t, $d, $v));
																				} else {
																					return n.forEach(n.geq($v, n.seq(214, 2108)), test => {
																						if (test) {
																							return xqc.rtp($ret, $d, $o, $i, $p, n.seq(), $hasOp, xqc.tpl($t, $d, $v));
																						} else {
																							return n.forEach(n.eq($v, 219), test => {
																								if (test) {
																									return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), $hasPreOp, xqc.tpl($t, $d, $v));
																								} else {
																									return n.forEach(n.eq($v, 2106), test => {
																										if (test) {
																											let $hasDecl = n.and($hasOp, n.eq($ocur("v"), 217));
																											let $tpl = n.forEach(n.boolean($hasDecl), test => {
																												if (test) {
																													return n.seq(xqc.tpl(10, $d, "$>"), xqc.tpl(1, $d, 1));
																												} else {
																													return xqc.tpl($t, $d, $v);
																												}
																											});
																											return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, $tpl, $hasDecl, xqc.tpl($t, $d, $v));
																										} else {
																											return n.forEach(n.eq($v, 2400), test => {
																												if (test) {
																													let $hasParams = n.and($hasOp, n.eq($ocur("v"), 3006));
																													return xqc.rtp($ret, $d, $o, $i, $p, n.forEach(n.boolean($hasParams), test => {
																														if (test) {
																															return n.seq();
																														} else {
																															return xqc.tpl(3, $d, ",");
																														}
																													}), n.seq(), xqc.tpl($t, $d, $v));
																												} else {
																													return n.forEach(n.eq($v, 207), test => {
																														if (test) {
																															return xqc.rtp(a.pop($ret), n.add($d, 2), $o, $i, $p, n.seq(xqc.tpl(3, n.add($d, 1), ","), xqc.tpl(1, n.add($d, 1), 3)), n.false(), xqc.tpl($t, $d, $v));
																														} else {
																															return n.forEach(n.eq($v, 208), test => {
																																if (test) {
																																	let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
																																	let $d = $tmp("d");
																																	return xqc.rtp($tmp("r"), $d, $tmp("o"), $tmp("i"), $tmp("p"), n.seq(xqc.tpl(2, $d, 4), xqc.tpl(3, n.minus($d, 1), ","), xqc.tpl(1, n.minus($d, 1), 3)), n.false(), xqc.tpl($t, $d, $v));
																																} else {
																																	return n.forEach(n.eq($v, 209), test => {
																																		if (test) {
																																			let $hasX = n.and($hasOp, n.geq($ocur("v"), n.seq(222, 223, 224, 225)));
																																			let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
																																			let $d = $tmp("d");
																																			let $o = $tmp("o");
																																			let $open = n.forEach(n.empty($ocur("t")), test => {
																																				if (test) {
																																					return xqc.tpl(1, $d, 1);
																																				} else {
																																					return n.seq();
																																				}
																																			});
																																			$o = n.forEach(n.exists($open), test => {
																																				if (test) {
																																					return array.append($o, xqc.tpl(1, $d, 1));
																																				} else {
																																					return $o;
																																				}
																																			});
																																			return xqc.rtp($tmp("r"), n.add($d, 2), $o, $tmp("i"), $tmp("p"), n.forEach(n.boolean($hasX), test => {
																																				if (test) {
																																					return n.seq();
																																				} else {
																																					return n.seq($open, xqc.tpl(10, n.add($d, 1), "$"), xqc.tpl(1, n.add($d, 1), 1));
																																				}
																																			}), n.seq(), xqc.tpl($t, $d, $v));
																																		} else {
																																			return n.forEach(n.eq($v, 210), test => {
																																				if (test) {
																																					let $tmp = xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
																																					let $o = $tmp("o");
																																					let $ocur = $o(array.size($o));
																																					return xqc.rtp($tmp("r"), $tmp("d"), $tmp("o"), $tmp("i"), $tmp("p"), xqc.tpl(3, $d, ","), n.and($hasOp, n.geq($ocur("v"), n.seq(218, 209))), xqc.tpl($t, $d, $v));
																																				} else {
																																					return n.forEach(n.eq($v, 211), test => {
																																						if (test) {
																																							return xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
																																						} else {
																																							return n.forEach(n.eq($v, 220), test => {
																																								if (test) {
																																									return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl(3, $d, ","));
																																								} else {
																																									return n.forEach(n.eq($v, 221), test => {
																																										if (test) {
																																											return n.forEach(n.and($hasOp, n.eq($ocur("v"), 222)), test => {
																																												if (test) {
																																													return xqc.rtp($ret, $d, $o, $i, $p, n.seq(xqc.tpl(1, $d, 4), xqc.tpl(2, $d, 2), xqc.tpl(3, $d, ",")), n.seq(), xqc.tpl($t, $d, $v));
																																												} else {
																																													return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $d, "for"), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																												}
																																											});
																																										} else {
																																											return n.forEach(n.geq($v, n.seq(222, 223, 224, 225)), test => {
																																												if (test) {
																																													return xqc.unwrap(xqc.tpl($t, $d, $v), $ret, $d, $o, $i, $p);
																																												} else {
																																													return n.forEach(n.and(n.and(n.eq($v, 509), $hasOp), n.eq($ocur("v"), 2108)), test => {
																																														if (test) {
																																															return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl(3, $d, ","), n.true(), xqc.tpl($t, $d, $v));
																																														} else {
																																															return n.forEach(n.or(n.seq(n.and(n.ge($v, 300), n.lt($v, 2100))), n.eq($v, 2600)), test => {
																																																if (test) {
																																																	return n.forEach(n.eq($size, "0"), test => {
																																																		if (test) {
																																																			let $v = n.add($v, 900);
																																																			return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, xqc.opName($v)), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																																		} else {
																																																			let $prev = xqc.last($ret, $size);
																																																			let $isOcc = n.forEach(n.geq($v, n.seq(802, 904, 2003)), test => {
																																																				if (test) {
																																																					//let $nu = console.log($o);
																																																					return n.forEach(n.and(n.eq($ocur("t"), "1"), n.and(n.eq($ocur("v"), "1"), n.gt($osize, "1"))), test => {
																																																						if (test) {
																																																							let $olast = $o(n.minus($osize, 1));
																																																							return n.and(n.eq($olast("t"), "4"), n.geq($olast("v"), n.seq(1200, 2400)));
																																																						} else {
																																																							return n.and($hasOp, n.eq($ocur("v"), 2400));
																																																						}
																																																					});
																																																				} else {
																																																					return n.false();
																																																				}
																																																			});
																																																			return n.forEach(n.boolean($isOcc), test => {
																																																				if (test) {
																																																					let $split = $i($d);
																																																					let $left = array.subarray($ret, 1, n.minus($split, 1));
																																																					let $right = array.subarray($ret, $split);
																																																					return xqc.rtp($left, $d, $o, $i, $p, n.seq(xqc.tpl($t, $d, "occurs"), xqc.tpl(1, $d, 1), array.flatten(xqc.incr($right)), xqc.tpl(3, $d, ","), xqc.tpl($t, n.add($d, 1), xqc.occurrence($v)), xqc.tpl(1, n.add($d, 1), 1), xqc.tpl(2, n.add($d, 1), 2), xqc.tpl(2, $d, 2)));
																																																				} else {
																																																					return n.forEach(n.and(n.geq($v, n.seq(801, 802)), n.geq($prev("t"), n.seq(1, 3, 4))), test => {
																																																						if (test) {
																																																							let $v = n.add($v, 900);
																																																							return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl($t, $d, xqc.opName($v)), xqc.tpl(1, $d, 1)), n.seq(), xqc.tpl($t, $d, $v));
																																																						} else {
																																																							return xqc.binOp($ret, 4, $v, $d, $o, $i, $p, $ocur, $hasPreOp);
																																																						}
																																																					});
																																																				}
																																																			});
																																																		}
																																																	});
																																																} else {
																																																	return n.forEach(n.and(n.gt($v, 2100), n.lt($v, 2200)), test => {
																																																		if (test) {
																																																			//let $nu = console.log($o);
																																																			return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), n.and($hasPreOp, n.ne($ocur("v"), 1200)), xqc.tpl($t, $d, $v));
																																																		} else {
																																																			return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl($t, $d, xqc.opName($v)), n.and($hasPreOp, n.ne($ocur("v"), 1200)));
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
												} else {
													return n.forEach(n.eq($t, "5"), test => {
														if (test) {
															let $isParam = n.and($hasOp, n.eq($ocur("v"), 3006));
															let $hasX = n.and($hasOp, n.geq($ocur("v"), n.seq(221, 225)));
															let $hasAss = n.and($hasOp, n.geq($ocur("v"), n.seq(218, 209)));
															let $hasXass = n.and($hasAss, n.and(n.gt($osize, "1"), n.and(n.eq($o(n.minus($osize, 1))("t"), "4"), n.geq($o(n.minus($osize, 1))("v"), n.seq(222, 223, 224, 225)))));
															let $v = n.replace($v, "^\\$", "");
															let $tpl = n.forEach(n.or(n.or($isParam, $hasXass), $hasX), test => {
																if (test) {
																	return n.seq();
																} else {
																	return n.forEach(n.boolean($hasAss), test => {
																		if (test) {
																			return xqc.tpl($t, $d, $v);
																		} else {
																			return n.forEach(n.eq($v, ""), test => {
																				if (test) {
																					return xqc.tpl(10, $d, "$");
																				} else {
																					return n.seq(xqc.tpl(10, $d, "$"), xqc.tpl(1, $d, 1), xqc.tpl($t, n.add($d, 1), $v), xqc.tpl(2, $d, 2));
																				}
																			});
																		}
																	});
																}
															});
															return xqc.rtp($ret, $d, $o, $i, $p, $tpl, n.seq(), n.seq(), n.forEach(n.or(n.or($isParam, $hasXass), $hasX), test => {
																if (test) {
																	return $v;
																} else {
																	return n.seq();
																}
															}));
														} else {
															return n.forEach(n.eq($t, "6"), test => {
																if (test) {
																	return n.forEach(n.and($hasOp, n.geq($ocur("v"), n.seq(2102, 2105))), test => {
																		if (test) {
																			let $tmp = xqc.rtp(a.pop($ret), n.add($d, 1), $o, $i, $p, n.seq(xqc.tpl(4, $ocur("d"), xqc.constructors($ocur("v"))), xqc.tpl(1, $d, 1), xqc.tpl(1, n.add($d, 1), 3), xqc.tpl(7, n.add($d, 2), $v), xqc.tpl(2, n.add($d, 2), 4), xqc.tpl(3, n.add($d, 1), ",")), n.true(), xqc.tpl(4, $ocur("d"), n.add($ocur("v"), 900)));
																			return map.put($tmp, "i", $i);
																		} else {
																			let $tpl = n.forEach(n.and($hasOp, n.eq($ocur("v"), 2108)), test => {
																				if (test) {
																					return xqc.tpl(7, $d, $v);
																				} else {
																					return n.forEach(n.and($hasOp, n.and(n.eq($ocur("v"), 2400), n.matches($v, "^xs:"))), test => {
																						if (test) {
																							return n.seq(xqc.tpl(4, $d, n.replace($v, "^xs:", "")), xqc.tpl(1, $d, 1), xqc.tpl(2, $d, 2));
																						} else {
																							return xqc.tpl($t, $d, $v);
																						}
																					});
																				}
																			});
																			return xqc.rtp($ret, $d, $o, $i, $p, $tpl);
																		}
																	});
																} else {
																	return n.forEach(n.eq($t, 11), test => {
																		if (test) {
																			return xqc.rtp($ret, n.add($d, 1), $o, $i, $p, xqc.tpl(11, $d, $v), n.seq(), xqc.tpl($t, $d, $v));
																		} else {
																			return n.forEach(n.eq($t, 10), test => {
																				if (test) {
																					let $isFor = n.and($hasOp, n.eq($ocur("v"), 221));
																					let $tpl = n.forEach(n.boolean($isFor), test => {
																						if (test) {
																							return n.seq();
																						} else {
																							return xqc.tpl($t, $d, $v);
																						}
																					});
																					return xqc.rtp($ret, $d, $o, $i, $p, $tpl);
																				} else {
																					return xqc.rtp($ret, $d, $o, $i, $p, xqc.tpl($t, $d, $v));
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
xqc.wrapDepth = n.quoteTyped(n.function(n.seq(n.occurs(n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.zeroOrMore()), n.array(n.occurs(n.item(), n.zeroOrMore())), n.integer(), n.array(n.occurs(n.item(), n.zeroOrMore())), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore())), n.array(n.occurs(n.item(), n.zeroOrMore())), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $parts = a[0];
	let $ret = a[1];
	let $depth = a[2];
	let $o = a[3];
	let $i = a[4];
	let $p = a[5];
	let $params = a[6];
	return n.forEach(n.empty($parts), test => {
		if (test) {
			return n.forEach(n.ne($ret(array.size($ret))("t"), "0"), test => {
				if (test) {
					return xqc.unwrap(n.map(n.pair("t", 0)), $ret, $depth, $o, $i, $p)("r");
				} else {
					return $ret;
				}
			});
		} else {
			let $out = n.forEach(n.exists($parts), test => {
				if (test) {
					return n.head($parts);
				} else {
					return n.seq();
				}
			});
			let $tmp = n.foldLeft($out, n.map(n.pair("r", $ret), n.pair("d", $depth), n.pair("o", $o), n.pair("i", $i), n.pair("p", $p)), n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
				let $pre = a[0];
				let $cur = a[1];
				return n.forEach(n.exists($cur), test => {
					if (test) {
						let $tmp = xqc.process($cur, $pre("r"), $pre("d"), $pre("o"), $pre("i"), $pre("p"));
						return $tmp;
					} else {
						return $pre;
					}
				});
			})));
			return xqc.wrapDepth(n.tail($parts), $tmp("r"), $tmp("d"), $tmp("o"), $tmp("i"), $tmp("p"), $params);
		}
	});
}));
xqc.toL3 = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $pre = a[0];
	let $entry = a[1];
	let $at = a[2];
	let $normalform = a[3];
	let $size = a[4];
	//let $Nu = console.log($entry);
	let $t = $entry("t");
	let $v = $entry("v");
	let $s = n.forEach(n.geq($t, 1), test => {
		if (test) {
			return n.forEach(n.eq($v, "3"), test => {
				if (test) {
					return 15;
				} else {
					return n.forEach(n.eq($v, "1"), test => {
						if (test) {
							let $last = n.forEach(n.gt($at, "1"), test => {
								if (test) {
									return $normalform(n.minus($at, 1));
								} else {
									return n.seq();
								}
							});
							return n.forEach(n.and(n.exists($last), n.geq($last("t"), n.seq(4, 6, 10))), test => {
								if (test) {
									return n.seq();
								} else {
									return n.forEach(n.and(n.exists($last), n.eq($last("t"), "2")), test => {
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
			return n.forEach(n.eq($t, "2"), test => {
				if (test) {
					let $next = n.forEach(n.lt($at, $size), test => {
						if (test) {
							return $normalform(n.add($at, 1));
						} else {
							return n.seq();
						}
					});
					return n.forEach(n.and(n.exists($next), n.eq($next("t"), "1")), test => {
						if (test) {
							return 18;
						} else {
							return 17;
						}
					});
				} else {
					return n.forEach(n.eq($t, "7"), test => {
						if (test) {
							return n.seq(3, $v);
						} else {
							return n.forEach(n.eq($t, "8"), test => {
								if (test) {
									return n.seq(12, $v);
								} else {
									return n.forEach(n.eq($t, "6"), test => {
										if (test) {
											return n.forEach(n.matches($v, "#\\p{N}$"), test => {
												if (test) {
													return n.seq(4, $v);
												} else {
													let $next = n.forEach(n.lt($at, $size), test => {
														if (test) {
															return $normalform(n.add($at, 1));
														} else {
															return n.seq();
														}
													});
													return n.forEach(n.and(n.exists($next), n.eq($next("t"), "1")), test => {
														if (test) {
															return n.seq(14, $v);
														} else {
															return n.seq(3, $v);
														}
													});
												}
											});
										} else {
											return n.forEach(n.geq($t, n.seq(4, 10)), test => {
												if (test) {
													return n.seq(14, $v);
												} else {
													return n.forEach(n.eq($t, "5"), test => {
														if (test) {
															return n.seq(3, $v);
														} else {
															return n.forEach(n.eq($t, "9"), test => {
																if (test) {
																	return n.seq(8, $v);
																} else {
																	return n.forEach(n.eq($t, 11), test => {
																		if (test) {
																			return n.seq(1, $v);
																		} else {
																			return n.forEach(n.eq($t, 12), test => {
																				if (test) {
																					return n.seq(2, $v);
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
	return n.seq($pre, $s);
}));
xqc.toBuffer = n.quoteTyped(n.function(n.seq(n.string()), n.item()), ((...a) => {
	let $query = a[0];
	return n.xForEach(n.stringToCodepoints($query), n.codepointsToString("."));
}));
xqc.normalizeQuery = n.quoteTyped(n.function(n.seq(n.string(), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $query = a[0];
	let $params = a[1];
	$query = n.replace($query, "function\\(\\*\\)", "function(()*,item()*)");
	$query = n.replace($query, "map\\(\\*\\)", "map(xs:anyAtomicType,item()*)");
	$query = n.replace($query, "array\\(\\*\\)", "array(item()*)");
	return xqc.normalizeQueryB(xqc.toBuffer($query), $params);
}));
xqc.normalizeQueryB = n.quoteTyped(n.function(n.seq(n.occurs(n.string(), n.zeroOrMore()), n.map("xs:anyAtomicType", n.occurs(n.item(), n.zeroOrMore()))), n.item()), ((...a) => {
	let $buffer = a[0];
	let $params = a[1];
	let $preparedBuffer = xqc.analyzeChars($buffer, n.eq($params("$compat"), "xquery"));
	let $normalform = xqc.wrapDepth($preparedBuffer, n.array(), 1, n.array(), n.map(), n.array(), $params);
	let $output = $params("$transpile");
	return n.forEach(n.eq($output, "rdl"), test => {
		if (test) {
			return a.foldLeft($normalform, "", n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
				let $pre = a[0];
				let $entry = a[1];
				let $t = $entry("t");
				let $v = $entry("v");
				return n.concat($pre, n.forEach(n.geq($t, n.seq(1, 2)), test => {
					if (test) {
						return xqc.operators($v);
					} else {
						return n.forEach(n.eq($t, "7"), test => {
							if (test) {
								return n.concat("&quot;", $v, "&quot;");
							} else {
								return n.forEach(n.eq($t, "9"), test => {
									if (test) {
										return n.concat("(:", $v, ":)");
									} else {
										return n.forEach(n.eq($t, 11), test => {
											if (test) {
												return n.concat("n:e(", $v, ",");
											} else {
												return n.forEach(n.boolean($v), test => {
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
			})));
		} else {
			return n.forEach(n.eq($output, "l3"), test => {
				if (test) {
					return a.foldLeftAt($normalform, n.seq(), n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item()), n.item()), ((...a) => {
						let $pre = a[0];
						let $entry = a[1];
						let $at = a[2];
						return xqc.toL3($pre, $entry, $at, $normalform, array.size($normalform));
					})));
				} else {
					return $normalform;
				}
			});
		}
	});
}));
xqc.analyzeChar = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $char = a[0];
	return n.forEach(n.eq($char, "("), test => {
		if (test) {
			return "1";
		} else {
			return n.forEach(n.eq($char, ")"), test => {
				if (test) {
					return "2";
				} else {
					return n.forEach(n.eq($char, "{"), test => {
						if (test) {
							return "3";
						} else {
							return n.forEach(n.eq($char, "}"), test => {
								if (test) {
									return "4";
								} else {
									return n.forEach(n.eq($char, "["), test => {
										if (test) {
											return 2001;
										} else {
											return n.forEach(n.eq($char, "]"), test => {
												if (test) {
													return 2002;
												} else {
													return n.forEach(n.eq($char, ","), test => {
														if (test) {
															return 100;
														} else {
															return n.forEach(n.eq($char, ">"), test => {
																if (test) {
																	return 505;
																} else {
																	return n.forEach(n.eq($char, "<"), test => {
																		if (test) {
																			return 507;
																		} else {
																			return n.forEach(n.eq($char, "="), test => {
																				if (test) {
																					return 509;
																				} else {
																					return n.forEach(n.eq($char, ";"), test => {
																						if (test) {
																							return "5";
																						} else {
																							return n.forEach(n.eq($char, ":"), test => {
																								if (test) {
																									return 2600;
																								} else {
																									return n.forEach(n.eq($char, "+"), test => {
																										if (test) {
																											return 802;
																										} else {
																											return n.forEach(n.eq($char, "/"), test => {
																												if (test) {
																													return 1901;
																												} else {
																													return n.forEach(n.eq($char, "!"), test => {
																														if (test) {
																															return 1800;
																														} else {
																															return n.forEach(n.eq($char, "?"), test => {
																																if (test) {
																																	return 2003;
																																} else {
																																	return n.forEach(n.eq($char, "*"), test => {
																																		if (test) {
																																			return 904;
																																		} else {
																																			return n.forEach(n.eq($char, "."), test => {
																																				if (test) {
																																					return "8";
																																				} else {
																																					return n.forEach(n.eq($char, "$"), test => {
																																						if (test) {
																																							return "9";
																																						} else {
																																							return n.forEach(n.eq($char, "&quot;"), test => {
																																								if (test) {
																																									return "6";
																																								} else {
																																									return n.forEach(n.eq($char, "&apos;"), test => {
																																										if (test) {
																																											return "7";
																																										} else {
																																											return n.forEach(n.matches($char, "\\s"), test => {
																																												if (test) {
																																													return 10;
																																												} else {
																																													return n.forEach(n.matches($char, "\\p{N}"), test => {
																																														if (test) {
																																															return 11;
																																														} else {
																																															return n.forEach(n.matches($char, "\\p{L}"), test => {
																																																if (test) {
																																																	return 12;
																																																} else {
																																																	return "0";
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
xqc.flagToExpr = n.quoteTyped(n.function(n.seq(n.item()), n.item()), ((...a) => {
	let $flag = a[0];
	return n.forEach(n.eq($flag, "2"), test => {
		if (test) {
			return "7";
		} else {
			return n.forEach(n.eq($flag, "4"), test => {
				if (test) {
					return "9";
				} else {
					return n.forEach(n.geq($flag, n.seq(6, 9)), test => {
						if (test) {
							return 11;
						} else {
							return n.forEach(n.eq($flag, 10), test => {
								if (test) {
									return 12;
								} else {
									return n.forEach(n.eq($flag, "8"), test => {
										if (test) {
											return "2";
										} else {
											return 13;
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
xqc.inspectTokens = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $char = a[0];
	let $type = a[1];
	return n.forEach(n.geq($type, n.seq(1, 3, 2001)), test => {
		if (test) {
			return n.map(n.pair("t", 1), n.pair("v", $type));
		} else {
			return n.forEach(n.geq($type, n.seq(2, 4, 2002)), test => {
				if (test) {
					return n.map(n.pair("t", 2), n.pair("v", $type));
				} else {
					return n.forEach(n.eq($type, 100), test => {
						if (test) {
							return n.map(n.pair("t", 3), n.pair("v", $char));
						} else {
							return n.forEach(n.eq($type, "5"), test => {
								if (test) {
									return n.map(n.pair("t", 0), n.pair("v", $char));
								} else {
									return n.forEach(n.eq($type, "9"), test => {
										if (test) {
											return n.map(n.pair("t", 10), n.pair("v", $char));
										} else {
											return n.forEach(n.eq($type, "8"), test => {
												if (test) {
													return n.map(n.pair("t", 7), n.pair("v", $char));
												} else {
													return n.forEach(n.geq($type, n.seq(505, 507, 509, 802, 904, 1800, 1901, 2003, 2600)), test => {
														if (test) {
															return n.map(n.pair("t", 4), n.pair("v", $type));
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
xqc.analyzeChars = n.quoteTyped(n.function(n.seq(n.item(), n.item()), n.item()), ((...a) => {
	let $chars = a[0];
	let $xqCompat = a[1];
	return xqc.analyzeChars(n.seq(), n.tail($chars), $xqCompat, n.head($chars), 0, n.seq(), 0, n.seq(), n.false(), n.false(), n.false(), n.false(), n.false(), n.false(), n.false(), n.false(), 0, 0);
}));
xqc.analyzeChars = n.quoteTyped(n.function(n.seq(n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item(), n.item()), n.item()), ((...a) => {
	let $ret = a[0];
	let $chars = a[1];
	let $xqCompat = a[2];
	let $char = a[3];
	let $oldType = a[4];
	let $buffer = a[5];
	let $string = a[6];
	let $wasVar = a[7];
	let $wasQname = a[8];
	let $wasNumber = a[9];
	let $comment = a[10];
	let $opentag = a[11];
	let $closetag = a[12];
	let $attrkey = a[13];
	let $attrval = a[14];
	let $encExpr = a[15];
	let $hasQuot = a[16];
	let $opencount = a[17];
	let $next = n.head($chars);
	let $type = n.forEach(n.ne($string, "0"), test => {
		if (test) {
			return n.forEach(n.and(n.eq($string, "6"), n.and(n.eq($char, "&quot;"), n.ne($next, "&quot;"))), test => {
				if (test) {
					return "6";
				} else {
					return n.forEach(n.and(n.eq($string, "7"), n.eq($char, "&apos;")), test => {
						if (test) {
							return "7";
						} else {
							return "0";
						}
					});
				}
			});
		} else {
			return n.forEach(n.boolean($comment), test => {
				if (test) {
					return n.forEach(n.eq($char, ":"), test => {
						if (test) {
							return n.forEach(n.eq($next, ")"), test => {
								if (test) {
									return 2502;
								} else {
									return 2600;
								}
							});
						} else {
							return "0";
						}
					});
				} else {
					return n.forEach(n.boolean($opentag), test => {
						if (test) {
							return n.forEach(n.eq($char, ">"), test => {
								if (test) {
									return 505;
								} else {
									return n.forEach(n.eq($char, "/"), test => {
										if (test) {
											return 1901;
										} else {
											return n.forEach(n.matches($char, "[\\p{L}\\p{N}\\-_:]"), test => {
												if (test) {
													return "0";
												} else {
													return n.forEach(n.geq($char, n.seq("=", "&quot;")), test => {
														if (test) {
															return xqc.analyzeChar($char);
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
							return xqc.analyzeChar($char);
						}
					});
				}
			});
		}
	});
	let $zero = n.forEach(n.geq(n.seq($comment, $opentag, $closetag, $attrkey), n.true()), test => {
		if (test) {
			return n.false();
		} else {
			return n.eq($string, "0");
		}
	});
	let $var = n.and($zero, n.seq(n.or(n.seq(n.and(n.eq($wasVar, n.false()), n.eq($char, "$"))), n.seq(n.and($wasVar, n.matches($char, "[\\p{L}\\p{N}\\-_:]"))))));
	let $number = n.and(n.and(n.eq($var, n.false()), $zero), n.and(n.eq($type, 11), n.ne($oldType, 12)));
	let $stop = n.empty($chars);
	let $flag = n.forEach(n.boolean($number), test => {
		if (test) {
			return n.seq();
		} else {
			return n.forEach(n.boolean($zero), test => {
				if (test) {
					return n.forEach(n.geq($type, n.seq(6, 7)), test => {
						if (test) {
							return "1";
						} else {
							return n.forEach(n.and(n.eq($type, "1"), n.eq($next, ":")), test => {
								if (test) {
									return "3";
								} else {
									return n.forEach(n.eq($type, 507), test => {
										if (test) {
											return n.forEach(n.matches($next, "\\p{L}"), test => {
												if (test) {
													return "5";
												} else {
													return n.forEach(n.and(n.eq($next, "/"), n.gt(n.head($opencount), "0")), test => {
														if (test) {
															return "7";
														} else {
															return n.seq();
														}
													});
												}
											});
										} else {
											return n.forEach(n.and(n.eq($type, "3"), n.and(n.ne($oldType, "3"), n.and(n.ne($next, "{"), n.gt(n.head($opencount), "0")))), test => {
												if (test) {
													return 11;
												} else {
													return n.forEach(n.and($encExpr, n.and(n.eq($type, "4"), n.and(n.eq($hasQuot, "0"), n.ne($next, "}")))), test => {
														if (test) {
															return 12;
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
					return n.forEach(n.and($string, n.geq($type, n.seq(6, 7))), test => {
						if (test) {
							return "2";
						} else {
							return n.forEach(n.and($comment, n.eq($type, 2502)), test => {
								if (test) {
									return "4";
								} else {
									return n.forEach(n.and($opentag, n.eq($type, 505)), test => {
										if (test) {
											return "6";
										} else {
											return n.forEach(n.and($closetag, n.eq($type, 505)), test => {
												if (test) {
													return "8";
												} else {
													return n.forEach(n.and(n.and(n.eq($attrkey, n.false()), n.empty($type)), n.gt(n.head($opencount), "0")), test => {
														if (test) {
															return "9";
														} else {
															return n.forEach(n.and($attrkey, n.and(n.eq($type, 509), n.gt(n.head($opencount), "0"))), test => {
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
	$hasQuot = n.forEach(n.empty($flag), test => {
		if (test) {
			return n.forEach(n.eq($type, "3"), test => {
				if (test) {
					return n.add($hasQuot, 1);
				} else {
					return n.forEach(n.eq($type, "4"), test => {
						if (test) {
							return n.minus($hasQuot, 1);
						} else {
							return $hasQuot;
						}
					});
				}
			});
		} else {
			return $hasQuot;
		}
	});
	$opencount = n.forEach(n.eq($flag, "5"), test => {
		if (test) {
			return n.seq(n.add(n.head($opencount), 1), n.tail($opencount));
		} else {
			return n.forEach(n.eq($flag, "7"), test => {
				if (test) {
					return n.seq(n.minus(n.head($opencount), 1), n.tail($opencount));
				} else {
					return $opencount;
				}
			});
		}
	});
	let $emitBuffer = n.forEach(n.boolean($flag), test => {
		if (test) {
			return n.forEach(n.exists($buffer), test => {
				if (test) {
					return n.forEach(n.or(n.or($stop, n.exists(n.tail($buffer))), n.or(n.eq($flag, "2"), n.eq(n.matches($buffer, "^\\s*$"), n.false()))), test => {
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
			return n.forEach(n.boolean($zero), test => {
				if (test) {
					return n.forEach(n.boolean($wasVar), test => {
						if (test) {
							return n.forEach(n.boolean($var), test => {
								if (test) {
									return n.forEach(n.boolean($stop), test => {
										if (test) {
											return n.stringJoin(n.seq($buffer, $char));
										} else {
											return n.seq();
										}
									});
								} else {
									return n.stringJoin($buffer);
								}
							});
						} else {
							return n.forEach(n.boolean($wasNumber), test => {
								if (test) {
									return n.forEach(n.boolean($number), test => {
										if (test) {
											return n.forEach(n.boolean($stop), test => {
												if (test) {
													return n.stringJoin(n.seq($buffer, $char));
												} else {
													return n.seq();
												}
											});
										} else {
											return n.stringJoin($buffer);
										}
									});
								} else {
									return n.forEach(n.and(n.eq($type, 2600), n.matches($next, "[$\\p{N}&quot;&apos;]")), test => {
										if (test) {
											return $char;
										} else {
											return n.forEach(n.eq($type, 10), test => {
												if (test) {
													return n.forEach(n.and(n.and(n.exists($chars), n.exists($buffer)), n.matches(n.stringJoin($buffer), "^(group|instance|treat|cast|castable|order)$")), test => {
														if (test) {
															return n.seq();
														} else {
															return $char;
														}
													});
												} else {
													return n.forEach(n.and(n.ne($type, 505), n.and(n.ne($type, 2600), n.and(n.ne($type, 509), n.and(n.ne($type, "9"), n.and(n.ne($type, 11), n.and(n.ne($type, 12), n.ne($type, "0"))))))), test => {
														if (test) {
															return $char;
														} else {
															return n.forEach(n.and(n.eq($type, 509), n.not(n.geq($buffer, n.seq(":", ">", "<", "!")))), test => {
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
					return n.forEach(n.boolean($stop), test => {
						if (test) {
							return n.stringJoin(n.seq($buffer, $char));
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	});
	let $tpl = n.forEach(n.or(n.or(n.geq($flag, n.seq(2, 4, 6, 7, 8, 9, 10)), $wasNumber), $wasVar), test => {
		if (test) {
			return n.seq();
		} else {
			return n.forEach(n.and(n.and($emitBuffer, n.exists($buffer)), $xqCompat), test => {
				if (test) {
					return xqc.inspectBuf($buffer);
				} else {
					return n.seq();
				}
			});
		}
	});
	let $fixQuot = n.seq(n.and(n.exists($tpl), n.and(n.eq($tpl("t"), "7"), n.eq($type, "6"))));
	$flag = n.forEach(n.boolean($fixQuot), test => {
		if (test) {
			return n.seq();
		} else {
			return $flag;
		}
	});
	let $fixQuotAnd = n.and($fixQuot, n.eq($next, "&quot;"));
	$emitBuffer = n.forEach(n.boolean($fixQuotAnd), test => {
		if (test) {
			return n.seq();
		} else {
			return $emitBuffer;
		}
	});
	$tpl = n.forEach(n.boolean($fixQuotAnd), test => {
		if (test) {
			return n.seq();
		} else {
			return $tpl;
		}
	});
	$ret = n.seq($ret, $tpl, n.forEach(n.eq($flag, "2"), test => {
		if (test) {
			return n.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.forEach(n.empty($emitBuffer), test => {
				if (test) {
					return "";
				} else {
					return $emitBuffer;
				}
			})));
		} else {
			return n.forEach(n.geq($flag, n.seq(4, 6, 8, 9, 10)), test => {
				if (test) {
					return n.forEach(n.boolean($emitBuffer), test => {
						if (test) {
							return n.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.forEach(n.eq($flag, "8"), test => {
								if (test) {
									return "2";
								} else {
									return $emitBuffer;
								}
							})));
						} else {
							return n.seq();
						}
					});
				} else {
					return n.forEach(n.boolean($emitBuffer), test => {
						if (test) {
							return n.forEach(n.and(n.eq($type, 10), n.empty($buffer)), test => {
								if (test) {
									return n.seq();
								} else {
									return n.forEach(n.or(n.geq($flag, n.seq(7, 11)), n.gt(n.head($opencount), "0")), test => {
										if (test) {
											return n.map(n.pair("t", 7), n.pair("v", $emitBuffer));
										} else {
											return n.seq(n.forEach(n.or($wasVar, n.seq(n.and($var, $stop))), test => {
												if (test) {
													return n.map(n.pair("t", 5), n.pair("v", $emitBuffer));
												} else {
													return n.forEach(n.or($wasNumber, n.seq(n.and($number, $stop))), test => {
														if (test) {
															return n.map(n.pair("t", 8), n.pair("v", $emitBuffer));
														} else {
															return n.seq();
														}
													});
												}
											}), n.forEach(n.boolean($zero), test => {
												if (test) {
													return xqc.inspectTokens($char, $type);
												} else {
													return n.seq();
												}
											}));
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
	}));
	return n.forEach(n.boolean($stop), test => {
		if (test) {
			return $ret;
		} else {
			let $rest = n.tail($chars);
			return xqc.analyzeChars($ret, n.forEach(n.eq($flag, "4"), test => {
				if (test) {
					return n.tail($rest);
				} else {
					return $rest;
				}
			}), $xqCompat, n.forEach(n.eq($flag, "4"), test => {
				if (test) {
					return n.head($rest);
				} else {
					return $next;
				}
			}), n.forEach(n.eq($type, 10), test => {
				if (test) {
					return $oldType;
				} else {
					return $type;
				}
			}), n.forEach(n.or(n.or($emitBuffer, $attrval), n.geq($flag, n.seq(2, 6, 9))), test => {
				if (test) {
					return n.seq();
				} else {
					return n.forEach(n.and($comment, n.eq($type, 2600)), test => {
						if (test) {
							return n.forEach(n.empty($buffer), test => {
								if (test) {
									return n.seq();
								} else {
									return n.forEach(n.eq($next, ")"), test => {
										if (test) {
											return $buffer;
										} else {
											return n.seq($buffer, $char);
										}
									});
								}
							});
						} else {
							return n.forEach(n.and($zero, $flag), test => {
								if (test) {
									return $buffer;
								} else {
									return n.seq($buffer, $char);
								}
							});
						}
					});
				}
			}), n.forEach(n.or($fixQuotAnd, $attrval), test => {
				if (test) {
					return $type;
				} else {
					return n.forEach(n.eq($flag, "1"), test => {
						if (test) {
							return $type;
						} else {
							return n.forEach(n.eq($flag, "2"), test => {
								if (test) {
									return "0";
								} else {
									return $string;
								}
							});
						}
					});
				}
			}), $var, $wasQname, $number, n.forEach(n.eq($flag, "3"), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.eq($flag, "4"), test => {
						if (test) {
							return n.false();
						} else {
							return $comment;
						}
					});
				}
			}), n.forEach(n.eq($flag, "5"), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.eq($flag, "6"), test => {
						if (test) {
							return n.false();
						} else {
							return $opentag;
						}
					});
				}
			}), n.forEach(n.eq($flag, "7"), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.eq($flag, "8"), test => {
						if (test) {
							return n.false();
						} else {
							return $closetag;
						}
					});
				}
			}), n.forEach(n.eq($flag, "9"), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.eq($flag, 10), test => {
						if (test) {
							return n.false();
						} else {
							return $attrkey;
						}
					});
				}
			}), n.forEach(n.eq($flag, 10), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.and($attrval, n.eq($type, "6")), test => {
						if (test) {
							return n.false();
						} else {
							return $attrval;
						}
					});
				}
			}), n.forEach(n.eq($flag, 11), test => {
				if (test) {
					return n.true();
				} else {
					return n.forEach(n.eq($flag, 12), test => {
						if (test) {
							return n.false();
						} else {
							return $encExpr;
						}
					});
				}
			}), $hasQuot, n.forEach(n.eq($flag, 11), test => {
				if (test) {
					return n.seq(0, $opencount);
				} else {
					return n.forEach(n.eq($flag, 12), test => {
						if (test) {
							return n.tail($opencount);
						} else {
							return $opencount;
						}
					});
				}
			}));
		}
	});
}));
exports = xqc;
