class NumberInput extends HTMLInputElement {
	constructor() {
		super();
		this.type = "number";
	}
	get value() {
		return +super.value;
	}
}
customElements.define("number-input", NumberInput, { extends: "input" });
