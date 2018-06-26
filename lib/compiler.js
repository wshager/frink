const _l3 = require("./l3");
const _seq = require("./seq");
const _util = require("./util");
const _compilerUtil = require("./compiler-util");
const ReplaySubject = require("rxjs/ReplaySubject").ReplaySubject;

const isLeaf = _l3.isLeaf, isBranch = _l3.isBranch, isClose = _l3.isClose;

const isDirect = type => type == 18;

const { CALL, MODULE, IMPORT, EXPORT, PRIVATE, VAR, IF, AND, OR, SEQ, QUOT, TYPESIG, TYPESEQ, THEN, ELSE, TYPED, EXACTLY_ZERO, EXACTLY_ONE, ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, MORE_THAN_ONE } = require("./annot-const");


//const Call = require("./Call").Call;
const Datum = require("./Datum").Datum;
const Close = require("./Close").Close;

//const andOrRe = /^(n:)?(and|or)$/;
const ifRe = /^(n:)?if$/;
const andRe = /^(n:)?and$/;
const orRe = /^(n:)?or$/;

const isCallNode = node => node && node.type == 14;
const isQuotNode = node => node && node.type == 15;
const isSeqNode = node => isCallNode(node) && node.name === "";
const isModuleNode = node => isCallNode(node) && node.name === "$*";
const isImportNode = node => isCallNode(node) && node.name === "$<";
const isExportNode = node => isCallNode(node) && node.name === "$>";
const isVarNode = node => isCallNode(node) && node.name === "$";
const isPartialNode = node => isCallNode(node) && node.name == "$_";
const isRecursivePartialNode = node => isCallNode(node) && node.name == "$.";
const isIfNode = node => isCallNode(node) && ifRe.test(node.name);
const isAndNode = node => isCallNode(node) && andRe.test(node.name);
const isOrNode = node => isCallNode(node) && orRe.test(node.name);

function bufferTopLevel(o,modules = {}) {
	// TODO this should directly return a context /w modules
	return _seq.create($o => {
		var buffer = [];
		var analysis = [];
		// TODO create document top!
		var curQuot, curModule, curTop;
		const quots = [];
		var nodeMap = new WeakMap();
		var index = -1;
		const complete = () => {
			//console.log(buffer);
			if(importsToResolve.size === 0) {
				for(const b of buffer) {
					//console.log("b",b);
					$o.next(b);
				}
				$o.complete();
			}
		};
		const addDatum = (type,node,index) => {
			const a = new Datum(type,node,index);
			nodeMap.set(node.inode,a);
			analysis.push(a);
			return a;
		};
		const addCall = (type,node,index) => {
			const a = new Call(type,node,index);
			nodeMap.set(node.inode,a);
			analysis.push(a);
			return a;
		};
		const importsToResolve = new Map();
		return o.subscribe({
			next: node => {
				index++;
				//console.log("index",index);
				// this will be the new version of streaming-fromL3!
				var type = node.type;
				//var curSeq;
				if (isClose(type)) {
					// TODO handle all cases:
					// - quotation with or without if
					// - let-ret-seq
					// - var at any position
					//ret.text = ret.text.replace(/,$/, "");
					// call quote with params, etc using closure!
					//const depth = node.node.depth;
					//const parent = node.node.parent;
					let cur = analysis.pop();
					if(!cur) {
						console.log(node,index);
						throw new Error("Too many closes in source file!");
					}
					//console.log("closing",cur+"");
					if(cur.type == 18) {
						cur = cur.ref;
						cur.chained = true;
						if(node.node != cur.node) {
							//console.log(cur.ref);
							cur = cur.ref;
						}
					} else {
						if(cur.type == QUOT) {
							console.log("closing curQuot");
							curQuot = quots.pop();
						}
					}
					// always either close curQuot or curTop (I think)
					if(curQuot) {
						console.log("add close to curQuot of: "+cur);
						curQuot.ref = new Close(17,cur,index);
					} else if(curTop) {
						console.log("add close to curTop of: "+cur);
						curTop.ref = new Close(17,cur,index);
					}
					if(node.node == cur.node) {
						if(node.depth == 1) {
							// finally, add all top-level refs to module
							// FIXME if no module, create LOCAL placeHolder
							if(curModule && cur.type != MODULE) {
								//if(!curModule) {
								//	const node = new _vnode.VNode(inode, {$name:"$*",$args:["local"]}, 14, "$*", null, null, null, 0, 0, 0);
								//	curModule = addCall(MODULE,node,-1);
								//}
								curModule.ref = cur;
							}
							cur.nodeMap = nodeMap;
							if(cur.type == IMPORT){
								if(cur.node.count() < 3) return buffer.push(cur);
								const path = cur.node.last().valueOf();
								if(path == "./fn" || path == "./op") return buffer.push(cur);
								console.log("import",path);
								cur.path = path;
								importsToResolve.set(cur.index,cur);
								buffer.push(cur);
								// TODO skip already imported
								// FIXME modules are hitched to cur for now, return cx from function instead
								return bufferTopLevel(_l3.parseRdl("d:/workspace/raddle.xq/lib/"+path))
									.reduce(_compilerUtil.moduleAccumulator,modules)
									.subscribe(modules => {
										cur.modules = modules;
										//console.log("delete "+cur,cur.index);
										importsToResolve.delete(cur.index);
										complete();
									});
							} else {
								buffer.push(cur);
							}
							nodeMap = new WeakMap();
							curTop = null;
						}
					} else {
						console.log("cur not close: "+cur);
					}
				} else if (type == 18) {
					const cur = analysis.pop();
					const a = new Close(18,cur,index);
					nodeMap.set(node,a);
					analysis.push(a);
					if(curQuot) {
						//if(!curQuot.ref.includes(cur)) throw new Error("Cur not in Quot");
						curQuot.ref = a;
					}
				} else {
					let depth = node.depth;
					const len = analysis.length;
					let cur = len ? analysis[len - 1] : null;

					if (isBranch(type)) {
						switch (type) {
						case 1:
							break;
						case 11:
							console.log("doc!",node);
							break;
						case 14:
							{
								// TODO:
								// - create Analysis Object, add to stack, grouped by relevant sections
								// - populate Analysis:
								//   - Decl: a top-level declaration with it's type signature
								//   - Quotation: the quote belonging to the Decl
								//   - Let-Ret-Seq (FLOWR?)
								//   - Var: an assignment with the assigned value and (if possible) type; track refCount
								//   - Call: a call to a function (mark if chained ,FIXME change Call to Chained and handle properly)
								//   - Mark special calls: if/and/or
								// - load type signatures from calls in standard or ext libs
								// - check Var types where possible
								// - assigned can be full tree, can we keep it flat?
								if (isVar(node)) {
									// TODO private
									const a = addCall(VAR,node,index);
									// for refCount, add VAR to QUOT and count all vars of same name (determine assignment or not)
									if(curQuot) {
										// FIXME this means there's no body, so it's an RDL definition instead
										//if(!curTop) throw new Error("Var encountered, but no open quotation or top-level declaration found, at "+index);
										curQuot.ref = a;
									} else if(curTop) {
										curTop.ref = a;
									} else {
										console.log("make var "+ a +" isTop");
										a.isTop = true;
										curTop = a;
									}
								} else if(node.name == "xq-version") {
									//ret.text += "// transpiled from XQuery version ";
									if(depth > 1) throw new Error("XQ-version encountered below top-level");
									if(cur) throw new Error("Top-level XQ-version encountered, but previous level not closed");
									if(curQuot) throw new Error("Top-level XQ-version encountered, but previous quotation not closed");
									addCall(CALL,node,index);
								} else {
									// TODO handle Element
									if(isSeq(node)) {
										// if quote, use return
										// TODO detect let-ret seq
										const beforeLast = node.indexInParent == 1 ? analysis[analysis.length - 2] : null;
										const isTypeSeq = (cur && cur.type == TYPESIG) || (beforeLast && beforeLast.type == TYPED);
										const a = addCall(isTypeSeq ? TYPESEQ : SEQ,node,index);
										if(isTypeSeq) {
											cur.ref = a;
										} else if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											a.isTop = true;
											curTop = a;
										}
									} else if (isModule(name)) {
										//ret.text += "n.module($,";
										if(depth > 1) throw new Error("Module encountered below top-level");
										if(cur) throw new Error("Top-level module encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level module encountered, but previous quotation not closed");
										const a = addCall(MODULE,node,index);
										curModule = a;
									} else if (isImport(node)) {
										if(depth > 1) throw new Error("Import encountered below top-level");
										if(cur) throw new Error("Top-level import encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level import encountered, but previous quotation not closed");
										addCall(IMPORT,node,index);
									} else if (isExport(node)) {
										//if(depth > 1) console.log(node);
										if(depth > 1) throw new Error("Export encountered below top-level at "+index+", depth "+depth);
										if(cur) throw new Error("Top-level export encountered, but previous level not closed");
										if(curQuot) throw new Error("Top-level export encountered, but previous quotation not closed");
										const a = addCall(EXPORT,node,index);
										a.isTop = true;
										curTop = a;
									} else if(isIf(node)) {
										const a = addCall(IF,node,index);
										// TODO add to last QUOT
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											a.isTop = true;
											curTop = a;
										}
									} else if(isAnd(node)) {
										const a = addCall(AND,node,index);
										if(cur.type == SEQ) cur.ref = a;
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											a.isTop = true;
											curTop = a;
										}
									} else if(isOr(node)) {
										const a = addCall(OR,node,index);
										if(cur.type == SEQ) cur.ref = a;
										if(curQuot) {
											curQuot.ref = a;
										} else if(curTop) {
											curTop.ref = a;
										} else {
											a.isTop = true;
											curTop = a;
										}
									} else {
										let a;
										if(cur) {
											if((cur.type == TYPED && node.indexInParent == 1) || (cur.type == EXPORT && node.indexInParent == 2)) {
												a = addCall(TYPESIG,node,index);
												cur.typesig = a;
											} else if(cur.type == TYPESEQ) {
												a = addCall(TYPESIG,node,index);
												cur.ref = a;
											} else if(cur.type == TYPESIG) {
												a = addCall(TYPESIG,node,index);
												cur.ref = a;
											}
										}
										if(!a) {
											if(node.name == "typed") {
												// add refs later
												a = addCall(TYPED,node,index);
											} else {
												a = addCall(CALL,node,index);
												if(curQuot) {
													curQuot.ref = a;
												} else if(curTop) {
													curTop.ref = a;
												} else {
													a.isTop = true;
													curTop = a;
												}
											}
										}
									}
								}
							}
							break;
						case 15:
							{
								if(cur.type == IF) {
									const a = addCall(node.indexInParent == 2 ? THEN : ELSE,node,index);
									cur.ref = a;
									if(curQuot) curQuot.ref = a;
								} else {
									const a = addCall(QUOT,node,index);
									if(cur.type == EXPORT) {
										cur.ref = a;
									} else if(cur.type == TYPED) {
										// TODO handle inline function
										// remove the ref from its top
										a.typesig = nodeMap.get(cur.node.first());
										a.annot = _compilerUtil.expandDataType(nodeMap,nodeMap.get(a.typesig.node.last()));
										if(curQuot) {
											//console.log(curTop);
											curQuot.ref = a;
										} else {
											curTop.ref = a;
										}
									} else {
										//console.log("no correct cur for Quot",cur+"");
										curTop.ref = a;
									}
									if(curQuot) {
										quots.push(curQuot);
									}
									curQuot = a;
								}
							}
							break;
						case 5:
						case 6:
							{
								addDatum(type,node,index);
							}
							break;
						}
					} else {
						var value = node.value;
						if(node.indexInParent == 1 && cur && (cur.type == VAR || cur.type == EXPORT)) {
							if(!cur && curTop) cur = curTop;
							cur.name = value;
						} else {
							const a = new Datum(type,node,index);
							//console.log(node);
							nodeMap.set(node.inode,a);
							if(curQuot) {
								curQuot.ref = a;
							} else if(curTop) {
								curTop.ref = a;
							} else if(cur) {
								cur.ref = a;
							} else {
								buffer.push(a);
							}
						}
					}
				}
			},
			error: err => {
				$o.error(err);
			},
			complete: () => {
				complete();
			}
		});
	});
}

// partial sentinel
const $_ = {__isPartial:true};

// case 1.
// [_,1,_] =>
// _: partial, perhaps all are partials, so we can return self
// 1: not partial, can't return self
// case 2.
// [1,_] =>
// 1: bindable, perhaps f is bindable
// _: partial, have bindable, so canBind = 1
// no more items, so canBind = 1
// case 3.
// [1,_,2]
// 1: bindable, perhaps f is bindable
// _: partial, have bindable, so canBind = 1
// 2: not partial, so can't bind
function papplyAny(fn,...orig) {
	// Convert arguments object to an array, removing the first argument.
	let i = 0, len = orig.length, lastNonPartial, canBind = 0, isSelf = false;
	for (;i < len; i++) {
		if(orig[i] === $_) {
			if(lastNonPartial === undefined) {
				isSelf = true;
			} else {
				canBind = i;
			}
		} else {
			if(canBind) {
				canBind = 0;
				break;
			} else if(isSelf) {
				isSelf = false;
				break;
			}
			lastNonPartial = i;
		}
	}
	if(isSelf) return fn;
	if(canBind) return fn.bind(this,...orig.slice(0,canBind));
	return function(...partial) {
		var args = [];
		for (var i = 0; i < orig.length; i++) {
			args[i] = orig[i] === $_ ? partial.shift() : orig[i];
		}
		// concat partial, because it can be papply-right only
		return fn.apply(this, args.concat(partial));
	};
}

const isCall = x => x && x instanceof Call;
const isQuot = x => x && x instanceof Quot;
const isVar = x => x && x instanceof Var;
//const isParam = x => x && x instanceof Var && x.isParam;
const NOOP = {__noop:true};

// TODO module namespace
class Context {
	constructor(props = {}) {
		this.modules = props.modules || {};
		this.stack = [];
		this.length = 0;
		this.scope = {};
		this.refsToResolve = {};
	}
	addVar(count){
		let v;
		if(count > 1) {
			// assigment
			v = new Var(this,1,count);
		} else {
			const index = this.stack.last();
			if(typeof index == "number") {
				this.length++;
				v = new Var(this,2,1);
			} else {
				v = new Var(this,3,1);
			}
		}
		this.append(v);
	}
	addModule(length) {
		const ref = prefix => {
			this.modules[prefix] = {};
			return NOOP;
		};
		this.append(new Call("module",length,ref));
	}
	addImport(length) {
		const ref = (prefix,loc) => {
			this.refsToResolve[prefix] = {};
			// TODO merge properly
			compile(_l3.parseRdl(loc),this).subscribe(cx => {
				cx.apply().subscribe(() => {
					const module = cx.modules[prefix];
					Object.entries(this.refsToResolve[prefix]).forEach(([k,v]) => {
						v.next(module[k]);
						v.complete();
					});
				});
			});
			return NOOP;
		};
		this.append(new Call("import",length,ref));
	}
	addExport(length){
		const ref = (qname,type,body) => {
			const { prefix, name } = _compilerUtil.normalizeName(qname);
			const module = this.modules[prefix];
			if(!module) throw new Error(`Module "${prefix}" has not been formally declared`);
			if(isQuot(body)) {
				// add an object that serves as a proxy (i.e. can be applied)
				if(!module[name]) module[name] = {
					apply(self,args) {
						const ref = this[args.length];
						if(!ref) throw new Error(`Incorrect number of parameters for ${qname}, received ${args.length}, have ${Object.keys(this)}`);
						return ref.apply(self,args);
					}
				};
				// TODO add type
				module[name][body.length] = body;
			} else {
				module[name] = body;
			}
			return NOOP;
		};
		this.append(new Call("export",length,length == 2 ? papplyAny(ref,$_,() => {},$_) : ref));
	}
	getRef(qname) {
		const modules = this.modules;
		const { prefix, name } = _compilerUtil.normalizeName(qname,"n");
		if(modules.hasOwnProperty(prefix)) {
			return modules[prefix][name];
		} else {
			//console.log("no module found",prefix);
			// deferring module entry as a ReplaySubject
			const rts = this.refsToResolve;
			if(!rts.hasOwnProperty(prefix)) throw new Error(`Import of prefix ${prefix} not yet encountered`);
			const def = new ReplaySubject();
			if(!rts[prefix].hasOwnProperty(name)) rts[prefix][name] = def;
			return def;
		}
	}
	isBoundQname(qname) {
		const { prefix } = _compilerUtil.prefixAndName(qname);
		return this.modules.hasOwnProperty(prefix) || this.refsToResolve.hasOwnProperty(prefix);
	}
	getVarRef(qname) {
		// ignore NS to see if we have prefix
		if(this.isBoundQname(qname)) return this.getRef(qname);
		return this.scope[qname];
	}
	setVarRef(qname,type,value) {
		this.scope[qname] = value;
		return NOOP;
	}
	addCall(qname,length) {
		if(!qname) console.trace(qname,length);
		this.append(new Call(qname,length));
	}
	addDatum(type,value) {
		if(type !== 8) this.append(value);
	}
	append(item){
		this.stack.push(item);
	}
	apply(self,args){
		// TODO first arg is external?
		// evaluation stack
		var stack = [];
		var ret = new ReplaySubject();
		const len = this.stack.length;
		//for(let i = 0, len = this.stack.length; i < len; i++) {
		const next = (i) => {
			if(i == len) {
				const last = stack.pop();
				if(last instanceof ReplaySubject) {
					last.subscribe(ret);
				} else {
					ret.next(last);
					ret.complete();
				}
				return;
			}
			const last = this.stack[i];
			if(isQuot(last)) {
				stack.push(last);
				next(i+1);
			} else if(isCall(last)) {
				const len = last.length;
				const _args = stack.splice(-len,len);
				// TODO original stack as Observable
				// if last.ref is Subject, evaluation must be deferred:
				// take next from the stack when ref is resolved
				last.apply(this,_args).subscribe(ret => {
					if(ret !== NOOP) stack.push(ret);
					next(i+1);
				});
			} else if(isVar(last)) {
				if(last.isParam) {
					// pop the index, push the arg
					const index = stack.pop();
					stack.push(args[index - 1]);
					next(i+1);
				} else {
					// treat vars as Calls
					const len = last.length;
					const _args = stack.splice(-len,len);
					const ref = last.apply(self,_args);
					if(last.isAssig) {
						next(i+1);
					} else {
						if(ref instanceof ReplaySubject) {
							ref.subscribe((x) => {
								stack.push(x);
								next(i+1);
							});
						} else {
							stack.push(ref);
							next(i+1);
						}
					}
				}
			} else {
				stack.push(last);
				next(i+1);
			}
		};
		next(0);
		return ret;
	}
}
class Var {
	constructor(cx,type,length) {
		this.cx = cx;
		// 1. assignment
		// 2. param
		// 3. var
		this.isAssig = type == 1;
		this.isParam = type == 2;
		this.length = length;
	}
	apply(self,args) {
		if(this.isAssig) {
			const hasType = args.length > 2;
			return this.cx.setVarRef(args[0], hasType ? args[1] : null, hasType ? args[2] : args[1]);
		} else {
			return this.cx.getVarRef(args[0]);
		}
	}
}

class Quot extends Context {
}
class Call {
	constructor(qname,length,ref) {
		this.qname = qname;
		this.length = length;
		this.ref = ref;
	}
	apply(cx,args) {
		const ref = this.ref || cx.getRef(this.qname,this.length);
		if(ref instanceof ReplaySubject) {
			return ref.map(ref => ref.apply(this,args));
		} else {
			const ret = ref.apply(this,args);
			let sub = {
				subscribe(obj) {
					if(typeof obj == "function") {
						obj(ret);
					} else if(obj.hasOwnProperty("next") && typeof obj.next == "function"){
						obj.next(ret);
						if(typeof obj.complete == "function") obj.complete();
					}
				}
			};
			return sub;

		}
	}
}

function compile(o,cx) {
	cx = new Context(cx);
	const quots = [cx];
	// this is a reduction into a single result
	return o.reduce((cx,node) => {
		const type = node.type;
		if(isClose(type)) {
			if(isQuotNode(node.node)) {
				const dest = quots.pop();
				quots.last().append(dest);
			} else {
				const target = quots.last(), refNode = node.node;
				if(isVarNode(refNode)) {
					// var or param
					const count = refNode.count();
					// TODO add default prefix
					// NOTE we know the first child on the node, so we can read the name there
					// HOWEVER this goes against the pure stack-based implementation
					if(count > 1 && refNode.depth == 1 && target.isBoundQname(refNode.first())) {
						// private top-level declaration, simply add as export
						target.addExport(count);
					} else {
						target.addVar(count);
					}
				} else if(isModuleNode(refNode)) {
					// handle module insertion
					target.addModule(refNode.count());
				} else if(isImportNode(refNode)) {
					// handle import
					target.addImport(refNode.count());
				} else if(isExportNode(refNode)) {
					// handle export
					// expect type to be compiled to a single Call
					target.addExport(refNode.count());
				} else if(isPartialNode(refNode)) {
					// partial any
					target.append($_);
				} else if(isCallNode(refNode)){
					// handle call
					target.addCall(refNode.name,refNode.count());
				}
			}
		} else if(isDirect(type)) {
			// call last on stack
			quots.last().addDirect(node.node);
		} else if(isLeaf(type)) {
			quots.last().addDatum(node.type,node.value);
		} else if(isBranch(type) && isQuotNode(node)) {
			// add new quot to scope stack
			quots.push(new Quot(cx));
		}
		return cx;
	},cx);
}

function toJS(o) {
	const def = "\"use strict\";\nconst n = require(\"../lib/index\"), array = require(\"../lib/array\"), map = require(\"../lib/map\"), local = {};\n";
	// load definitions
	return bufferTopLevel(_l3.parseRdl("../raddled/fn.rdl")).reduce(_compilerUtil.moduleAccumulator,{})
		//.mergeMap(modules => bufferTopLevel(parseRdl("../raddled/n.rdl")).reduce(moduleAccumulator,modules))
		//.mergeMap(modules => bufferTopLevel(parseRdl("../raddled/map.rdl")).reduce(moduleAccumulator,modules))
		//.mergeMap(modules => bufferTopLevel(parseRdl("../raddled/array.rdl")).reduce(moduleAccumulator,modules))
		.mergeMap(modules => {
			//console.log(modules);
			return bufferTopLevel(o,modules).reduce(function (ret, a) {
				a.analyze(null,ret.modules,null,false);
				//console.log(ret.modules);
				if(!ret.modules.$current) {
					ret.modules.$current = ret.modules.local;
				} else
				if(ret.modules.$current.$uri == "http://www.w3.org/2005/xpath-functions") {
					delete ret.modules.$current;
				}
				console.log(a);
				// TODO if not modules.$current,set it to local
				ret.text += a.serialize(ret.modules.$current);
				return ret;
			},{text:"",modules:modules})
				.map(x => {
					//console.log(x);
					let text = def+x.text.replace(/,$/, "");
					if(x.modules.$current) {
						// interop
						const module = x.modules.$current;
						delete x.modules.$current;
						const prefix = module.$prefix;
						for(const k in module) {
							if(k == "$prefix" || k == "$uri") continue;
							const ars = module[k];
							if(ars instanceof Call || ars instanceof Datum) continue;
							const name = _util.camelCase(k);
							text += prefix + "." + name + " = (...$) => {\n";
							text += "const $len = $.length;";
							for(let arity of Object.keys(ars)) {
								text += `if(process.env.debug) console.log("${prefix}.${name}",$len);\n`;
								text += `if($len == ${arity}) return n.fromPromise(${prefix}.${name}$${arity}.apply(null,$));\n`;
							}
							text += "};";
						}
						text += "module.exports = " + prefix;
					}
					return text;
				});
		});
}

const run = (o,cx) => compile(o,cx).map(cx => cx.apply());

exports.run = run;
exports.compile = compile;
exports.toJS = toJS;
