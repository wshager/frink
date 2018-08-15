import Decimal from "big.js";

export class Integer extends Decimal {
	constructor(a) {
		super(Math.floor(a));
		this.constructor = Integer;
	}
}

export default Integer;
