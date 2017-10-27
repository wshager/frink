import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import * as codes from "../errors.json";

export function error(qname,message){
	// TODO handle QName
	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/,"") : qname;//.getLocalPart();
	if(!message) message = codes[code];
	var err = new Error(message);
	err.name = code;
	return Observable.throw(err);
}
