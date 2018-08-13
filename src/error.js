import { throwError } from "rxjs";
import * as codes from "../errors.json";

export function error(qname,message){
	// TODO handle QName
	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/,"") : qname;//.getLocalPart();
	if(!message) message = codes[code];
	var err = new Error(message);
	//console.trace();
	err.name = code;
	return throwError(err);
}
