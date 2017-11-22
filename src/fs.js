import isNodeEnv from "./util";

export const readFile = (...args) =>
	isNodeEnv() ?
		require("fs").readFile.apply(this,args) :
		(source, cb, encoding = "utf-8") => {
			var reader = new FileReader();
			reader.onloadend = evt => {
				// file is loaded
				cb(null,evt.target.result);
			};
			reader.onerror = err => {
				cb(err);
			};
			reader.readAsText(source, encoding);
		};

export const readdir = (...args) =>
	isNodeEnv() ?
		require("fs").readdir.apply(this,args) :
		() => {};
