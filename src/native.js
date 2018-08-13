export const string = Object.entries(Object.getOwnPropertyDescriptors(String.prototype)).reduce((a,[k,v]) => {
	a[k] = typeof v.value == "function" ? (...args) => v.value.bind(...args)() : x => x[k];
	return a;
},{});

export const array = Object.entries(Object.getOwnPropertyDescriptors(Array.prototype)).reduce((a,[k,v]) => {
	a[k] = typeof v.value == "function" ? (...args) => v.value.bind(...args)() : x => x[k];
	return a;
},{});

export const number = Object.entries(Object.getOwnPropertyDescriptors(Number.prototype)).reduce((a,[k,v]) => {
	a[k] = typeof v.value == "function" ? (...args) => v.value.bind(...args)() : x => x[k];
	return a;
},{});
