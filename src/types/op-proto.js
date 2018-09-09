export const opProto = {
	plus(other) {
		return this + other;
	},
	minus(other) {
		return this - other;
	},
	times(other) {
		return this * other;
	},
	div(other) {
		return this / other;
	},
	neg() {
		return -this;
	}
};

export default opProto;
