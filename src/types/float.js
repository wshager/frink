export class Float extends Number {
	constructor(a) {
		var temp = new Float32Array(1);
		temp[0] = +a;
		super(temp[0]);
		this._f = temp[0];
		this._d = a;
	}
	toString() {
		var temp = new Float64Array(1);
		temp[0] = +this._d;
		return temp[0].toString();
	}
	valueOf() {
		return this._f;
	}
}

export default Float;
