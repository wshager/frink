var n = require("../lib/index");
var array = require("../lib/array");
var map = require("../lib/map");
const xqc = require("../lib/xq-compat-b.js");
const console = require("../lib/console");
const Subject = require("rxjs/Subject").Subject;
const Observable = require("rxjs/Observable").Observable;
require("rxjs/add/operator/last");
const concat = require("rxjs/observable/concat").concat;
let $chars,$char,$next,$string,$comment,$opentag,$closetag,$attrkey,$wasVar,$oldType,$encExpr,$hasQuot,$ret,$xqCompat,$buffer,$wasQname,
	$wasNumber,$attrval,$stop,$type,$zero,$var,$number,$flag,$emitBuffer,$tpl,$fixQuot,$fixQuotAnd,$opencount;
let $ = n.frame([]);
$chars = xqc.toBuffer("\"");
$char = n.head($chars);
$chars = n.tail($chars);

(
	$next = n.head($chars),
	$string = 6,
	$comment = false,
	$opentag = false,
	$closetag = false,
	$attrkey = false,
	$wasVar = false,
	$oldType = 0,
	$opencount = 0,
	$encExpr = 0,
	$hasQuot = false,
	$ret = n.seq(),
	$xqCompat = true,

	$buffer = n.from("test"),
	$wasQname = false,
	$wasNumber = false,
	$attrval = false,

	$char.subscribe(),
	$stop = n.empty($chars),

	$type = n.if(n.ne($string, 0), test => {
		if (test) { /* skip anything but closers */
			return n.if(n.and(n.eq($string, 6), n.and(n.eq($char, "\""), n.or(n.ne($next, "\""),$stop))), test => {
				if (test) {
					return 6;
				} else {
					return n.if(n.and(n.eq($string, 7), n.eq($char, "'")), test => {
						if (test) {
							return 7;
						} else {
							return 0;
						}
					});
				}
			});
		} else {
			return n.if(n.boolean($comment), test => {
				if (test) {
					return n.if(n.eq($char, ":"), test => {
						if (test) {
							return n.if(n.eq($next, ")"), test => {
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
					return n.if(n.boolean($opentag), test => {
						if (test) {
							return n.if(n.eq($char, ">"), test => {
								if (test) {
									return 505;
								} else {
									return n.if(n.eq($char, "/"), test => {
										if (test) {
											return 1901; /* TODO direct close */
										} else {
											return n.if(n.matches($char, "[\\p{L}\\p{N}\\-_:]"), test => {
												if (test) {
													return 0;
												} else {
													return n.if(n.geq($char, n.seq("=", "\"")), test => {
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
	}),
	$zero = n.if(n.geq(n.seq($comment, $opentag, $closetag, $attrkey), n.true()), test => {
		if (test) {
			return n.false();
		} else {
			return n.eq($string, 0);
		}
	}),
	$var = n.and($zero, n.seq(n.or(
		n.seq(n.and(n.eq($wasVar, n.false()), n.eq($char, "$"))),
		n.seq(n.and($wasVar, n.matches($char, "[\\p{L}\\p{N}\\-_:]")))
	))),
	$number = n.and(n.and(n.eq($var, n.false()), $zero), n.and(n.eq($type, 11), n.and(n.ne($oldType, 12), n.ne($oldType, 14)))),
	$flag = n.if(n.boolean($number), test => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.boolean($zero), test => {
				if (test) {
					return n.if(n.geq($type, n.seq(6, 7)), test => {
						if (test) {
							return 1; /* open string */
						} else {
							return n.if(n.and(n.eq($type, 1), n.eq($next, ":")), test => {
								if (test) {
									return 3; /* open comment */
								} else {
									return n.if(n.eq($type, 507), test => {
										if (test) {
											return n.if(n.matches($next, "\\p{L}"), test => {
												if (test) {
													return 5; /* open opentag */
												} else {
													return n.if(n.and(n.eq($next, "/"), n.gt(n.head($opencount), 0)), test => {
														if (test) {
															return 7; /* open closetag */
														} else {
															return n.seq();
														}
													});
												}
											});
										} else {
											return n.if(n.and(n.eq($type, 3), n.and(n.ne($oldType, 3), n.and(n.ne($next, "{"), n.gt(n.head($opencount), 0)))), test => {
												if (test) {
													return 11; /* open enc-expr */
												} else {
													return n.if(n.and($encExpr, n.and(n.eq($type, 4), n.and(n.eq($hasQuot, 0), n.ne($next, "}")))), test => {
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
					return n.if(n.and($string, n.geq($type, n.seq(6, 7))), test => {
						if (test) {
							return 2; /* close string */
						} else {
							return n.if(n.and($comment, n.eq($type, 2502)), test => {
								if (test) {
									return 4; /* close comment */
								} else {
									return n.if(n.and($opentag, n.eq($type, 505)), test => {
										if (test) {
											return 6; /* close opentag */
										} else {
											return n.if(n.and($closetag, n.eq($type, 505)), test => {
												if (test) {
													return 8; /* close closetag */
												} else {
													return n.if(n.and(n.and(n.eq($attrkey, n.false()), n.empty($type)), n.gt(n.head($opencount), 0)), test => {
														if (test) {
															return 9;
														} else {
															return n.if(n.and($attrkey, n.and(n.eq($type, 509), n.gt(n.head($opencount), 0))), test => {
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
	}),

	$hasQuot = n.if(n.empty($flag), (($hasQuot,test) => {
		if (test) {
			return n.if(n.eq($type, 3), test => {
				if (test) {
					return n.add($hasQuot, 1);
				} else {
					return n.if(n.eq($type, 4), test => {
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
	}).bind(null,$hasQuot)),
	$opencount = n.if(n.eq($flag, 5), (($opencount,test) => {
		if (test) {
			return n.seq(n.add(n.head($opencount), 1), n.tail($opencount));
		} else {
			return n.if(n.eq($flag, 7), test => {
				if (test) {
					return n.seq(n.subtract(n.head($opencount), 1), n.tail($opencount));
				} else {
					return $opencount; /* closers van string, comment, opentag, closetag moeten worden vervangen */
				}
			});
		}
	}).bind(null,$opencount)),
	$emitBuffer = n.if(n.boolean($flag), test => {
		if (test) {
			return n.if(n.exists($buffer), test => {
				if (test) {
					return n.if(n.or(n.or($stop, n.exists(n.tail($buffer))), n.or(n.eq($flag, 2), n.eq(n.matches($buffer, "^\\s*$"), n.false()))), test => {
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
			return n.if(n.boolean($zero), test => {
				if (test) {
					return n.if(n.boolean($wasVar), test => {
						if (test) {
							return n.if(n.boolean($var), test => {
								if (test) {
									return n.if(n.boolean($stop), test => {
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
							return n.if(n.boolean($wasNumber), test => {
								if (test) {
									return n.if(n.boolean($number), test => {
										if (test) {
											return n.if(n.boolean($stop), test => {
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
									return n.if(n.and(n.eq($type, 2600), n.matches($next, "[$\\p{N}\"']")), test => {
										if (test) {
											return $char;
										} else {
											return n.if(n.eq($type, 10), test => {
												if (test) {
													return n.if(n.and(n.and(n.exists($chars), n.exists($buffer)), n.matches(n.stringJoin($buffer), "^(group|instance|treat|cast|castable|order)$")), test => {
														if (test) {
															return n.seq();
														} else {
															return $char;
														}
													});
												} else {
													return n.if(n.and(n.ne($type, 505), n.and(n.ne($type, 2600), n.and(n.ne($type, 509), n.and(n.ne($type, 9), n.and(n.ne($type, 11), n.and(n.ne($type, 12), n.and(n.ne($type, 14), n.ne($type, 0)))))))), test => {
														if (test) { /* these aren't blocks, unless they're paired */
															return $char;
														} else {
															return n.if(n.and(n.eq($type, 509), n.not(n.geq($buffer, n.seq(":", ">", "<", "!")))), test => {
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
					return n.if(n.boolean($stop), test => {
						if (test) {
							return n.stringJoin(n.seq($buffer, $char));
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	}),
	$tpl = n.if(n.or(n.or(n.geq($flag, n.seq(2, 4, 6, 7, 8, 9, 10)), $wasNumber), $wasVar), test => {
		if (test) {
			return n.seq();
		} else {
			return n.if(n.and(n.and($emitBuffer, n.exists($buffer)), $xqCompat), test => {
				if (test) {
					return xqc.inspectBuf($buffer);
				} else {
					return n.seq();
				}
			});
		}
	}),
	$fixQuot = n.seq(n.and(n.exists($tpl), n.and(n.eq($tpl("t"), 7), n.eq($type, 6)))),
	$flag = n.if(n.boolean($fixQuot), (($flag,test) => {
		if (test) {
			return n.seq();
		} else {
			return $flag;
		}
	}).bind(null,$flag)),
	$fixQuotAnd = n.and($fixQuot, n.eq($next, "\"")),
	console.log("$fixQuotAnd",$fixQuotAnd),
	$emitBuffer = n.if(n.boolean($fixQuotAnd), (($emitBuffer,test) => {
		if (test) {
			return n.seq();
		} else {
			return $emitBuffer;
		}
	}).bind(null,$emitBuffer)),
	$tpl = n.if(n.boolean($fixQuotAnd), (($tpl,test) => {
		if (test) {
			return n.seq();
		} else {
			return $tpl;
		}
	}).bind(null,$tpl)),
	$ret = n.seq($ret, $tpl, n.if(n.eq($flag, 2), test => {
		if (test) {
			return map.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.if(n.empty($emitBuffer), test => {
				if (test) {
					return "";
				} else {
					return $emitBuffer;
				}
			})));
		} else {
			return n.if(n.geq($flag, n.seq(4, 6, 8, 9, 10)), test => {
				if (test) {
					return n.if(n.boolean($emitBuffer), test => {
						if (test) {
							return map.map(n.pair("t", xqc.flagToExpr($flag)), n.pair("v", n.if(n.eq($flag, 8), test => {
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
					return n.if(n.boolean($emitBuffer), test => {
						if (test) {
							return n.if(n.eq($type, 8), test => {
								if (test) {
									return map.map(n.pair("t", 13), n.pair("v", $char));
								} else {
									return n.if(n.and(n.eq($type, 10), n.empty($buffer)), test => {
										if (test) {
											return n.seq();
										} else {
											return n.if(n.or(n.geq($flag, n.seq(7, 11)), n.gt(n.head($opencount), 0)), test => {
												if (test) {
													return map.map(n.pair("t", 7), n.pair("v", $emitBuffer));
												} else {
													return n.seq(n.if(n.or($wasVar, n.seq(n.and($var, $stop))), test => {
														if (test) {
															return map.map(n.pair("t", 5), n.pair("v", $emitBuffer));
														} else {
															return n.if(n.or($wasNumber, n.seq(n.and($number, $stop))), test => {
																if (test) {
																	return map.map(n.pair("t", 8), n.pair("v", $emitBuffer));
																} else {
																	return n.seq();
																}
															});
														}
													}), n.if(n.boolean($zero), test => {
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
								}
							});
						} else {
							return n.seq();
						}
					});
				}
			});
		}
	}))
);

//x.map(s => n.isSeq(s) ? s.subscribe() : n.of(s));
console.log("ret",$ret);
