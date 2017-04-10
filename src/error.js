import * as codes from "../errors.json";

export function error(qname,message){
	// TODO handle QName
	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/,"") : qname.getLocalPart();
	if(!message) message = codes[code];
	var err = new Error(message);
	// remove self
	//var stack = err.stack.split(/\n/g);
	//stack.splice(1,1);
	//console.error(stack.join("\n"));
	//return err;
	// TODO let implementor catch errors
	throw err;
}
