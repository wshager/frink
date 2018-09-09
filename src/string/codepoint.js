import { from, forEach } from "../seq";

import { stringJoin } from "./value";

// TODO: use HOF from iterop: observables or transducers over iterables
export function stringToCodepoints(str){
	return forEach(from(str),c => c.codePointAt(0));
}

export function codepointsToString(a){
	return stringJoin(forEach(a,_ => String.fromCodePoint(_+"")));
}
