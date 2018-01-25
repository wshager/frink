var n = require("../lib/index");

n.frame = (args, closure) => {
	const stack = args.slice(0);
	stack.unshift(args[0]);
	if(closure) {
		for(const k in closure._stack) {
			if(k.charCodeAt(0) < 58) continue;
			stack[k] = closure._stack[k];
		}
	}
	const f = function (...a) {
		const l = a.length;
		if (a == 0) return f;
		const key = a[0];
		if (l == 1) {
			//console.log(key,args);
			return stack[key];
		} else {
			if (l == 2) {
				if(/\./.test(key)) {
					const parts = key.split(".");
					stack.$modules[parts[0]][parts[1]] = a[1];
				} else {
					stack[key] = a[1];
				}
			} else {
				//types[key] = a[1];
				if(/\./.test(key)) {
					const parts = key.split(".");
					stack.$modules[parts[0]][parts[1]] = a[1];
				} else {
					stack[key] = a[2];
				}
			}
			//return f;
		}
	};
	f._stack = stack;
	//f._types = types;
	return f;
};

var $ = n.frame([]);
n.quoteTyped = ($typesig,$lambda) => {
	// ignore type for now
	//console.log($typesig);
	return $lambda;
};

n.item = a => a;
n.function = a => a;
n.occurs = a => a;
//config.$ = $;

const json = n.from([14,"fold-left",14,"to",12,"1",12,"10",17,12,"0",14,"quote-typed",14,"function",14,"",14,"item",17,14,"item",17,17,14,"item",17,17,15,14,"$",3,"acc",14,"$",12,"1",17,17,14,"$",3,"x",14,"$",12,"2",17,17,14,"add",14,"$",3,"acc",17,14,"$",3,"x",17,17,17,17,17]);

n.toJS(n.fromL3Stream(json,NaN))
	.concatMap(x => eval(x.text))
	.subscribe(x => console.log(x));
