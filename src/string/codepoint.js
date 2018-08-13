import { forEach as map } from "../seq";

import { stringJoin } from "./value";

// TODO: use HOF from iterop: observables or transducers over iterables
export function stringToCodepoints(str){
	return map(c => c.codePointAt(0))(str);
}

export function codepointsToString(a){
	return stringJoin(map(_ => String.fromCodePoint(_.toString())(a)));
}
