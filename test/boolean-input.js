class BooleanInput extends HTMLInputElement {
	constructor() {
		super();
		this.type = "checkbox";
	}
	get value() { return this.checked; }
	set value(val) { return this.checked = val; }
}
customElements.define("boolean-input", BooleanInput, { extends: "input" });
