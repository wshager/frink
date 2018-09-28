import { throwError } from "rxjs";
import { codes } from "./error-codes.js";

export function error(qname,message){
	// TODO handle QName
	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/,"") : qname;//.getLocalPart();
	if(!message) message = codes[code];
	var err = new Error(message || "Unknown error");
	//console.trace();
	err.name = code;
	return throwError(err);
}
