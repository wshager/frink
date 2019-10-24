//import { elem, text } from "./dom-constr.js";

class RadioGroup extends HTMLElement {
	static get formAssociated() { return true; }
	constructor() {
		super();
		this._internals = this.attachInternals();
		this._shadowRoot = this.attachShadow({mode: "open"});
		this._options = [];
	}
	get form() { return this._internals.form; }
	get name() { return this.getAttribute("name"); }
	set name(val) { return this.setAttribute("name", val); }
    
	get value() {
		const ret = Array.from(this._shadowRoot.querySelectorAll("input")).find(elm => elm.checked);
		return ret.value;
	}
	set value(val) {
		const ret = Array.from(this._shadowRoot.querySelectorAll("input")).find(elm => elm.value === val);
		console.log(ret);
		ret.checked = true;
		return val;
	}
	get options() {
		return this._options;
	}
	set options(val) {
		this._options = val;
		this.render();
	}
	focus() {
		this._shadowRoot.querySelector("input").focus();
	}
	destroyContent() {
		const root = this._shadowRoot;
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
	}
	render() {
		const root = this._shadowRoot;
		const style = `
            label {
                display:block;
            }
        `;
		this.destroyContent();
		const styleNode = elem({
			$name: "style",
			$children: [text(style)]
		});
		root.appendChild(styleNode);
		const fieldset = elem({
			$name: "fieldset"
		}, root);
		this._options.forEach(([k, v]) => {
			elem({
				$name: "label",
				$children: [
					elem({
						$name: "input",
						type: "radio",
						name: "type",
						value: k,
					}),
					text(`[${k}] ${v}`),
				]
			}, fieldset);
		});
	}
}
customElements.define("radio-group", RadioGroup);