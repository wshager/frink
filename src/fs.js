import { isNodeEnv } from "./util";

export const readFile = (...args) => {
	const l = args.length;
	const source = args[0];
	const cb = l == 2 ? args[1] : args[2];
	let options = l == 2 ? "utf-8" : args[1];
	if(typeof options == "string") options = {encoding:options};
	if(isNodeEnv) {
		require("fs").readFile(source,options,cb);
	} else {
		var reader = new FileReader();
		reader.onloadend = evt => {
			// file is loaded
			cb(null,evt.target.result);
		};
		reader.onerror = err => {
			cb(err);
		};
		reader.readAsText(source, options.encoding);
	}
};

export const readdir = (...args) =>
	isNodeEnv ?
		require("fs").readdir.apply(this,args) :
		() => {};
