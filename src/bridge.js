export function containsObservableOrPromise(a) {
	for(let i of a) {
		if(isObservable(i) || isPromise(i)) return true;
	}
}

export function fromArgsArray(args,fn) {
	// unwrap seqs (zeroOrOne, never oneOrMore)
	// apply native function to each
	let isAsync = containsObservableOrPromise(args);
	if(isAsync) {
		// return Observable
	} else {
		// return result
		// we have no transducers, so just write a loop
		const ret = [];
		for(let a of args) {
			if(isArraySeq(a)) {
				if(!isEmpty(a)) ret.push(a);
			} else {
                
			}
		}
		return fn(ret);
	}
}

export function appl(proto,method,...partials) {

}
