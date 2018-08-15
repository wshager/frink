export class UntypedAtomic extends String {
	constructor(a) {
		super(a);
		this._value = a;
	}
	//cast(other) {
	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is an instance of a numeric type,
	//then the xdt:untypedAtomic value is cast to the type xs:double.

	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is an instance of xdt:untypedAtomic or xs:string,
	//then the xdt:untypedAtomic value is cast to the type xs:string.

	//If the atomic value is an instance of xdt:untypedAtomic
	//and the other is not an instance of xs:string, xdt:untypedAtomic, or any numeric type,
	//then the xdt:untypedAtomic value is cast to the dynamic type of the other value.

	// NO-OP, moved elsewhere
	//}
	toString() {
		return this._value.toString();
	}
	valueOf() {
		return this._value.valueOf();
	}
}

export default UntypedAtomic;
