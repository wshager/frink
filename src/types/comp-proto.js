export const compProto = {
	eq(other) {
		return this.valueOf() === other.valueOf();
	},
	gt(other) {
		return this.valueOf() > other.valueOf();
	},
	lt(other) {
		return this.valueOf() < other.valueOf();
	},
	gte(other) {
		return this.valueOf() >= other.valueOf();
	},
	lte(other) {
		return this.valueOf() <= other.valueOf();
	}
};

export default compProto;
