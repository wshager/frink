export function isQName(maybe){
	return !!(maybe && maybe.__is_QName);
}

export function QName(uri, name) {
	var prefix = /:/.test(name) ? name.replace(/:.+$/,"") : null;
	return {
		__is_QName: true,
		name: name,
		prefix,
		uri: uri
	};
}

export const q = QName;
