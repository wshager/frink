const _compilerUtil = require("./compiler-util");
const _util = require("./util");
const _Observable = require("rxjs/Observable");

const { CALL, MODULE, IMPORT, EXPORT, PRIVATE, VAR, IF, AND, OR, SEQ, QUOT, TYPESIG, TYPESEQ, THEN, ELSE, TYPED, EXACTLY_ZERO, EXACTLY_ONE, ZERO_OR_ONE, ZERO_OR_MORE, ONE_OR_MORE, MORE_THAN_ONE } = require("./annot-const");

class Call {
	constructor(type,node,index) {
		this.$type = type;
		this.$node = node;
		this.$index = index;
		this.$refs = [];
		this.$closed = [];
		//console.log("added",this+"");
	}
	get index() {
		return this.$index;
	}
	set name(v) {
		this.$name = v;
	}
	get name() {
		return this.$name;
	}
	get node() {
		return this.$node;
	}
	set typesig(v) {
		this.$typesig = v;
	}
	get typesig() {
		return this.$typesig;
	}
	get type() {
		return this.$type;
	}
	set ref(index) {
		this.$refs.push(index);
	}
	get ref() {
		return this.$refs;
	}
	toString() {
		let name;
		switch (this.$type) {
		case 1:
			name = "Module";
			break;
		case 2:
			name = "Import";
			break;
		case 3:
			name = "Export";
			break;
		case 4:
			name = "Private";
			break;
		case 5:
			name = this.node.count() > 1 ? "ASSIG" : "Var";
			break;
		case 6:
			name = "If";
			break;
		case 7:
			name = "And";
			break;
		case 8:
			name = "Or";
			break;
		case 9:
			name = "Seq";
			break;
		case 10:
			name = "Quot";
			break;
		case 11:
			name = "TypeSig";
			break;
		case 12:
			name = "TypeSeq";
			break;
		case 13:
			name = "THEN";
			break;
		case 14:
			name = "ELSE";
			break;
		default:
			name = "Call";
		}
		return `${name}[${this.node.name},${this.$index},${this.name}]`;
	}
	serialize(module) {
		let ret = "";
		const hasIfBranch = this.hasIfBranch;
		const isIfAssigned = hasIfBranch && !hasIfBranch.ternary ? hasIfBranch.assignee : null;
		if(isIfAssigned) {
			const { prefix, name } = _compilerUtil.normalizeName(isIfAssigned.name);
			ret = "$" + (prefix ? prefix + ":" : "") + name + " = ";
		} else if(this.isReturn) {
			ret = "return ";
		}
		if(this.type == VAR) {
			const { prefix, name } = this.isParam ? {name:this.name} : _compilerUtil.normalizeName(this.name,"");
			let varName = (prefix ? prefix + "." : "$") + name;
			if(this.isAssignment) {
				if(this.hasIfAssigned || this.selfAssigment) return "";
				//if(this.isTop) console.log(this.ref);
				return (hasIfBranch && hasIfBranch.ternary && hasIfBranch.isLetRet ? "(" : "") + varName + " = " + (this.ref.length > 1 ? "n.replay(" : "") +  + (this.isTop ? this.ref.reduce((ret,x) => ret + x.serialize(module),"") : "");
				//return ret;
			} else {
				// TODO add exists when isIfTest
				if(this.selfAssigned) return `/* self-assignment of ${varName} */`;
				return ret + (this.isIfTest || this.isBoolean ? (module.$async ? "await n.booleanPromise(" : "n.boolean(") : "") + (this.annot && !_util.isObservable(this.annot) ? "/*" + this.annot.dataType + "[" + this.annot.occurs + "]*/" : "") + varName;
				//(this.external ? "n.fromPromise($" + this.name + ")" :  "$" + this.name);
			}
		} else if(this.type == IF) {
			// TODO handle non-ternary if-block with assignment
			//if(this.node.parent.name == "$") this.assignee = this.node.parent.first();
			//console.log("IF",this.ternary,this.assignee);
			return (this.ternary ? ret : "if (") + (this.isTop ? this.ref.reduce((ret,x) => ret + x.serialize(module),"") : "");
		} else if(this.type == AND || this.type == OR) {
			return ret;
		} else if(this.type == THEN) {
			// TODO detect and / or
			return this.ternary ? " ?\n " : ") {\n";
		} else if(this.type == ELSE) {
			// TODO detect and / or
			return this.ternary ? " :\n " : " else " + (this.isElseIf ? "" : "{\n");
		} else if(this.type == CALL) {
			if(this.node.name == "xq-version") return "// compiled from XQuery version " + this.ref[0].node.value + "\n";
			if(this.node.name == "true" || this.node.name == "false") return ret + this.node.name;
			const { prefix, name } = _compilerUtil.normalizeName(this.node.name,"n");
			console.log(this.ref);
			return ret + (this.isIfTest || this.isBoolean ? (module.$async ? "await n.booleanPromise(" : "n.boolean(") : "") + (prefix ? prefix + "." : "") + name + "(" + (this.isTop ? this.ref.reduce((ret,x) => x.serialize(module),"") + ")" : "");
		} else if(this.type == SEQ) {
			// detect if AND/OR in ref
			if(this.isLetRet) {
				const hoistMap = this.ref.filter(x => x.type == VAR && x.isAssignment).reduce((hoistMap,x) => {
					let { prefix, name } = _compilerUtil.normalizeName(x.name);
					let qname = (prefix ? (prefix + ":") : "") + name;
					hoistMap[qname] = true;
					return hoistMap;
				},{});
				const hoist = Object.keys(hoistMap).map(x => "$"+x);
				return "/* let-ret-seq */" +ret + (hoist.length ? "let "+hoist.join(",")+";\n" : "") + (this.isTop ? this.ref.reduce((ret,x) => ret + x.serialize(module),"") : "");
			} else {
				return ret + (!this.hasAndOr && (this.isIfTest || this.isBoolean) ? (module.$async ? "await n.booleanPromise(" : "n.boolean(") : "") + (this.hasAndOr ? "(" : "n.seq(") + (this.isTop ? this.ref.reduce((ret,x) => ret + x.serialize(module),"") + ")" : "");
			}
		} else if(this.type == MODULE) {
			return "const " + this.node.first() + " = {};\n";
		} else if(this.type == EXPORT) {
			const typesig = this.typesig;
			const typeseq = typesig.ref[0];
			const { prefix, name } = _compilerUtil.normalizeName(this.node.first(),"n");
			return (prefix ? prefix + "." : "") + name + (typesig.node.name == "function" ? "$" + typeseq.ref.length : "") + " = " +  this.ref.reduce((ret,x) => ret + x.serialize(module),"");
		} else if(this.type == IMPORT) {
			return `const ${this.node.first()} = require("${this.node.last().replace(/\.xq[a-z]?$/,".js")}");\n`;
		} else if(this.type == QUOT) {
			// TODO if node count > 1 create Seq
			/*
			const typeseq = this.typesig.ref[0];
			const size = typeseq.ref.length;
			*/
			const refs = this.ref;
			const noIfAndOr = !refs.filter(x => (x.type == IF || x.type == AND || x.type == OR)).length;
			const hoistMap = refs.filter(x => x.type == VAR && x.isAssignment).reduce((hoistMap,x) => {
				let { prefix, name } = _compilerUtil.normalizeName(x.name);
				let qname = (prefix ? (prefix + ":") : "") + name;
				hoistMap[qname] = true;
				return hoistMap;
			},{});
			const size = 2;
			//console.log("HM",hoistMap);
			const hoist = Object.keys(hoistMap).map(x => "$"+x);
			let out = noIfAndOr || !module.$async ? "" : "async ";
			out += "(" + Array.from(Array(size).keys()).map(x => "$" + (x + 1)) + ") => {\n";
			out += hoist.length ? "let "+hoist.join(",")+";\n" : "";
			// NOTE start from the nodes again, recurse down, but use info in ref
			//txt += this.node.map().serialize(module);
			out = refs.reduce((txt,x) => txt + x.serialize(module),out);
			//if(count > 1) txt += ")";
			out += "\n}";
			return ret + (this.isIfTest || this.isBoolean ? (module.$async ? "await n.booleanPromise(" : "n.boolean(") : "") + out ;
		} else {
			return "";
		}
	}
	typeCheck(nodeMap,modules){
		//return;
		const ichildren = this.node.values();
		const { prefix, name } = _compilerUtil.prefixAndName(this.node.name,"fn");
		let arity = ichildren.length;
		const qname = (prefix ? prefix + ":" : "") + name;
		const self = this;
		const def = _compilerUtil.getDef(modules,prefix,name,arity);
		if(!def) {
			throw new Error("nodef "+qname);
		}
		_Observable.Observable.from(ichildren).mergeMap(node => {
			// TODO log index!
			const param = nodeMap.get(node);
			if(param.annot){
				if(_util.isObservable(param.annot)) {
					return param.annot;
				} else {
					return _Observable.Observable.of(param.annot);
				}
			} else {
				throw new Error("No annot!");
			}
		}).toArray().subscribe(params => {
			//console.log(params);
			const fnNodeMap = def.nodeMap;
			const typeseq = def.typesig.ref[0];
			const defParams = typeseq.ref.map(_compilerUtil.expandDataType.bind(null,fnNodeMap));
			let end = defParams.length - 1;
			let last = defParams[end];
			if(last && last.dataType === "...") {
				defParams.pop();
				//end--;
				last = defParams[end - 1];
				for(let i = 0; i < arity - end; i++) defParams.push(last);
			}
			//if(!matchTypesOccurs(params,defParams)) {
			//throw new Error("Mismatch calling: "+qname+"#"+arity+"("+self+self.node.values().map(x => nodeMap.get(x)).join(",")+") => "+stringify(params)+" != "+stringify(defParams));
			//} else {
			//console.log("Types match: "+qname+" => "+stringify(params)+" != "+stringify(defParams));
			//}
		});
	}
	analyze(nodeMap,modules,assigMap,shallow) {
		// FIXME do move to Close and call in bufferTopLevel
		// - everytime a node closes it may be analyzed
		// - exceptions are made for modules, imports, exports, quotations:
		//   - modules must be known in module map before stuff can be exported
		//   - imports must be resolved before the first export (this may be changed now because of "lazy" typechecks)
		//   - exports must pass their type signatures to their children (not true, children can access their parents)
		//   - quote params must be known before the content closes
		if(this.preAnalyzed) return;
		this.preAnalyzed = true;
		console.log("pre-analyze "+this);
		const type = this.type;
		nodeMap = nodeMap || this.nodeMap;
		if(type == MODULE) {
			// these may coincide
			const prefix = this.node.first().valueOf();
			const uri = this.node.last().valueOf();
			if(modules[prefix] && modules[prefix].$uri !== uri) {
				throw new Error("Namespace prefix collision! Use may use only one prefix at a time");
			}
			modules[prefix] = {};
			modules[prefix].$prefix = prefix;
			modules[prefix].$uri = uri;
			modules.$current = modules[prefix];
		} else if(type == EXPORT) {
			// FIXME this is bullshit
			var firstRef = nodeMap.get(this.node.last());
			if(!firstRef) throw new Error("No ref found on EXPORT");
			const typesig = this.typesig;
			firstRef.typesig = typesig;
			if(typesig) {
				const { prefix, name } = _compilerUtil.prefixAndName(this.name,"fn");
				if(typesig.node.name == "function") {
					// NOTE handle param expansion on demand
					const typeseq = typesig.ref[0].ref;
					this.annot = _compilerUtil.expandDataType(nodeMap,nodeMap.get(typesig.node.last()));
					let arity = typeseq.length;
					if(arity) {
						const lastParam = typeseq.last();
						if(!lastParam) console.log("TYPESEQ",this+"");
						if(lastParam.node.name == "...") {
							arity = "N";
						}
					}
					this.arity = arity;
					this.typeseq = typeseq;
					// TODO pass default ns prefix with cx
					_compilerUtil.setDef(modules,prefix,name,arity,this);
				} else {
					this.annot = _compilerUtil.expandDataType(nodeMap,typesig);
					if(!modules[prefix]) modules[prefix] = {};
					modules[prefix][name] = this;
				}
				//firstRef.annot = this.annot;
			}
			if(shallow) return;
		} else if(type == IF || type == THEN || type == ELSE) {
			const parentNode = this.node.parent;
			const parentRef = nodeMap.get(parentNode.inode);
			const self = this;
			// mark arguments
			// FIXME dirty hack
			const args = this.node.values();
			this.ternary = parentRef ? parentRef.ternary || parentRef.type == CALL || parentRef.type == SEQ || parentRef.node.__hasCall : this.node.count() == 1;//parentRef.ternary || !(this.ref[0].node.count() > 1 || this.ref[1].node.count() > 1);
			if(type == IF) {
				this.ref[0].assignee = this.ref[1].assignee = this.assignee;
				if(parentRef && parentRef.type == VAR && !this.ternary) {
					parentRef.hasIfAssigned = true;
					this.assignee = parentRef;
				}
				this.ref[0].ternary = this.ref[1].ternary = this.ternary;
				//console.log(this+"",this.ternary,this.assignee);
				nodeMap.get(args[0]).isIfTest = true;
			}
			//console.log("ifAnnot",this.annot);
			//if(this.annot.filter(x => !x || Array.isArray(x)).length) throw new Error("has undef");
			// mark sibling too
			// TODO check if test of type boolean, otherwise coerce
			const siblingRef = type == THEN ? nodeMap.get(parentNode.next(this.node)) : type == ELSE ? nodeMap.get(parentNode.previous(this.node)) : null;
			//if(!parentRef || !parentRef.ternary) {
			//	this.ternary = false;
			//	console.log("par:"+parentRef+", sib: "+siblingRef);
			//	if(siblingRef) siblingRef.ternary = false;
			//}
			if(parentRef && parentRef.assignee) {
				this.assignee = parentRef.assignee;
				if(siblingRef) siblingRef.assignee = parentRef.assignee;
			}
			if(type == THEN || type == ELSE) {
				//if(!this.ternary) {
				//if(type == ELSE) {
				const firstArg = nodeMap.get(args[0]);
				if(firstArg.type == IF) {
					if(type == ELSE) {
						this.isElseIf = true;
					} else {
						this.isThenIf = true;
					}
				} else if(firstArg.type == VAR && firstArg.node.count() > 1) {
					this.isLetRet = true;
					//console.log("isLetRet",this);
				}
				//}
				args.forEach(v => {
					const argRef = nodeMap.get(v);
					//console.log("place ifBranch on "+argRef);
					argRef.hasIfBranch = self;
				});
				const lastArg = nodeMap.get(args.last());
				lastArg.isReturn = !this.ternary;
			}
		}
		if(this.isTop) {
			console.log("isTop "+this);
			this.ref.forEach(r => {
				r.analyze(nodeMap,modules,assigMap || {},shallow);
			});
		}
	}
}

exports.Call = Call;
