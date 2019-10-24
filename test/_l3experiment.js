class L3Base extends HTMLElement {
	static get formAssociated() { return true; }

	constructor() {
		super();
		this._internals = this.attachInternals();
		this._shadowRoot = this.attachShadow({ mode: "open" });
		this._appearance = void 0;
		this._props = void 0;
	}

	get form() {
		return this._internals.form;
	}
	get controls() {
		return this.children;
	}
	static get observedAttributes() {
		return ["name", "type", "value"];
	}
	connectedCallback() {
	}
	focus() {
		let child = this._shadowRoot;
		while (child && !child.focus) {
			child = child.firstElementChild;
		}
		child && child.focus();
	}
	render() {
		const root = this._shadowRoot;
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
		this._appearance({
			l3Type: this._l3Type,
			...Array.from(this.attributes).reduce((acc, v) => {
				if (["appearance", "props"].includes(v.name)) {
					return acc;
				}
				acc[v.name] = v.textContent;
				return acc;
			}, {}),
			...this._props
		})(this._shadowRoot);
	}
	attributeChangedCallback(name, oldval, newval) {
		console.log("L3Base", name, oldval, newval);
	}
	get l3Type() {
		return this._l3Type;
	}
	get type() {
		return this.getAttribute("type");
	}
	set type(val) {
		return this.setAttribute("type", val);
	}
	get appearance() {
		return this._appearance;
	}

	set appearance(val) {
		// TODO sanitize #+qname
		this.setAttribute("appearance", "#" + val.name);
		this._appearance = val;
		this.render();
		return val;
	}

	get props() {
		return this._props;
	}

	set props(val) {
		this.setAttribute("props", JSON.stringify(val));
		return this._props = val;
	}

	get name() {
		return this.getAttribute("name");
	}

	set name(val) {
		return this.setAttribute("name", val);
	}

	get value() {
		return this._shadowRoot.firstElementChild.value;
	}

	set value(val) {
		return this._shadowRoot.firstElementChild.value = val;
	}
}
// TODO validation
class L3Form extends L3Base {
	constructor() {
		super();
	}
}
customElements.define("l3-form", L3Form);
class L3Text extends L3Base {
	constructor() {
		super();
		this._l3Type = "x";
	}
	_coerce(val) {
		const typeMap = {
			n: Number,
		};
		const type = this.getAttribute("type");
		const coercion = typeMap[type] || String;
		return coercion(val);
	}
	get value() {
		const node = this._shadowRoot.firstElementChild;
		if (this.getAttribute("appearance") === "#plain" && this.type === "b") {
			return node.checked;
		}
		return this._coerce(node.value);
	}
	set value(val) {
		const node = this._shadowRoot.firstElementChild;
		if (this.getAttribute("appearance") === "#plain") {
			if (this.type === "b") {
				return node.checked = val;
			}
		}
		return node.value = String(val);
	}
}
customElements.define("l3-text", L3Text);
const structuredControlFactory = () => {
	class LongNameStruct extends HTMLDivElement {
		get value() {
			return this.controls.reduce(
				(acc, control) => appender(acc, valueNormalizer(control, acc), keyNormalizer(control.name)),
				valueContainer
			);
		}
		set value(v) {
			Object.entries(v).forEach(([k, v]) => {
				const elm = this.children[k];
				elm.value = v;
			});
			return v;
		}
	}
};
/*
class L3List extends L3Base {
    constructor() {
        super();
        this._l3Type = 'l';
    }
}
customElements.define('l3-list', L3List);
class L3Map extends L3Base {
    constructor() {
        super();
        this._l3Type = 'm';
    }
}
customElements.define('l3-map', L3Map);

class L3Call extends L3Base {
    constructor() {
        super();
        this._l3Type = 'c';
    }
}
customElements.define('l3-call', L3Call);

class L3Element extends L3Base {
    constructor() {
        super();
        this._l3Type = 'e';
    }
}
customElements.define('l3-element', L3Element);

class L3Attribute extends L3Base {
    constructor() {
        super();
        this._l3Type = 'a';
    }
}
customElements.define('l3-attribute', L3Attribute);

class L3Quotation extends L3Base {
    constructor() {
        super();
        this._l3Type = 'q';
    }
}
customElements.define('l3-quotation', L3Quotation);

class L3X extends L3Text {}
customElements.define('l3-x', L3X);
class L3L extends L3List {}
customElements.define('l3-l', L3L);
class L3M extends L3Map {}
customElements.define('l3-m', L3M);
class L3C extends L3Call {}
customElements.define('l3-c', L3C);
class L3E extends L3Element {}
customElements.define('l3-e', L3E);
class L3A extends L3Attribute {}
customElements.define('l3-a', L3A);
class L3Q extends L3Quotation {}
customElements.define('l3-q', L3Q);
*/

class Labeled extends HTMLElement {
	static get formAssociated() { return true; }

	constructor() {
		super();
		this._internals = this.attachInternals();
		this._shadowRoot = this.attachShadow({ mode: "open" });
		this._handlers = new WeakMap();
	}

	get form() {
		return this._internals.form;
	}
	static get observedAttributes() {
		return ["name", "value"];
	}
	_mapName(key) {
		const name = this.name;
		if (mapKeyRE) console.log(name.replace(mapKeyRE, ""));
		return mapKeyRE.test(name)
			? mapKeyFormatter(name.replace(mapKeyRE, ""), key)
			: key;
	}
	appendChild(val) {
		this._child = val;
		this.render();
		// FIXME this is why
		HTMLElement.prototype.appendChild.bind(this)(val);
	}
	focus() {
		this._child.focus();
	}
	_on(target, type, callback) {
		const entries = this._handlers.get(target) || [];
		this._handlers.set(target, [...entries, {
			type,
			callback,
		}]);
		target.addEventListener(type, callback);
	}
	_off(target, clearType) {
		const entries = this._handlers.get(target) || [];
		entries.forEach(({ type, callback }) => {
			if (!clearType || type === clearType) {
				target.removeEventListener(type, callback);
			}
		});
		if (!clearType) {
			this._handlers.delete(target);
		}
	}
	_renderLabel() {
		if (!this._child || !this.name) {
			return;
		}
		const label = document.createElement("label");
		const text = this._editableTextNode = document.createElement("span");
		text.contentEditable = true;
		text.textContent = mapKeyNormalizer(this.name);
		this._on(text, "click", evt => {
			evt.preventDefault();
		});
		this._on(text, "input", evt => {
			try {
				const name = this._mapName(evt.target.textContent);
				console.log(name);
				this.name = name;
				evt.target.classList.remove("label-invalid");
			} catch (err) {
				console.log(err);
				evt.target.classList.add("label-invalid");
			}
		});
		label.appendChild(text);
		const slot = document.createElement("slot");
		label.appendChild(slot);
		this._shadowRoot.appendChild(label);
		return label;
	}
	destroyContent() {
		const root = this._shadowRoot;
		if (this._editableTextNode) {
			this._off(this._editableTextNode);
		}
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
	}
	render() {
		this.destroyContent();
		this._renderLabel();
	}
	attributeChangedCallback(name, oldval, newval) {
	}
	get name() {
		return this._child.name;
	}
	set name(val) {
		this.setAttribute("name", val);
		return this._child.name = val;
	}
	get value() {
		return this._child.value;
	}
	set value(val) {
		return this._child.value = val;
	}
	get controls() {
		return this._child.controls;
	}
}
// TODO validation
customElements.define("l3-labeled", Labeled);

/*
class L3List extends L3Base {
    constructor() {
        super();
        this._l3Type = 'l';
    }
}
customElements.define('l3-list', L3List);
class L3Map extends L3Base {
    constructor() {
        super();
        this._l3Type = 'm';
    }
}
customElements.define('l3-map', L3Map);

class L3Call extends L3Base {
    constructor() {
        super();
        this._l3Type = 'c';
    }
}
customElements.define('l3-call', L3Call);

class L3Element extends L3Base {
    constructor() {
        super();
        this._l3Type = 'e';
    }
}
customElements.define('l3-element', L3Element);

class L3Attribute extends L3Base {
    constructor() {
        super();
        this._l3Type = 'a';
    }
}
customElements.define('l3-attribute', L3Attribute);

class L3Quotation extends L3Base {
    constructor() {
        super();
        this._l3Type = 'q';
    }
}
customElements.define('l3-quotation', L3Quotation);

class L3X extends L3Text {}
customElements.define('l3-x', L3X);
class L3L extends L3List {}
customElements.define('l3-l', L3L);
class L3M extends L3Map {}
customElements.define('l3-m', L3M);
class L3C extends L3Call {}
customElements.define('l3-c', L3C);
class L3E extends L3Element {}
customElements.define('l3-e', L3E);
class L3A extends L3Attribute {}
customElements.define('l3-a', L3A);
class L3Q extends L3Quotation {}
customElements.define('l3-q', L3Q);
*/

class Typed extends HTMLElement {
	static get formAssociated() { return true; }

	constructor() {
		super();
		this._internals = this.attachInternals();
		this._shadowRoot = this.attachShadow({ mode: "open" });
	}

	get form() {
		return this._internals.form;
	}
	static get observedAttributes() {
		return ["name", "type", "value"];
	}
	appendChild(val) {
		this._child = val;
		this.render();
	}
	focus() {
		this._child.focus();
	}
	destroyContent() {
		const root = this._shadowRoot;
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		}
	}
	render() {
		this.destroyContent();
		this._shadowRoot.appendChild(this._child);
	}
	attributeChangedCallback(name, oldval, newval) {
		console.log("Typed", name, oldval, newval);
	}
	get type() {
		return this.getAttribute("type");
	}
	set type(val) {
		return this.setAttribute("type", val);
	}
	get name() {
		const val = this._child.name;
		return val;
	}
	set name(val) {
		this.setAttribute("name", val);
		return this._child.name = val;
	}
	_coerce(val) {
		const typeMap = {
			s: String,
			n: Number,
			b: Boolean,
		};
		const type = this.getAttribute("type");
		const coercion = typeMap[type];
		return coercion(val);
	}
	get value() {
		return this._coerce(this._child.value);
	}
	set value(val) {
		return this._child.value = val;
	}
}
// TODO validation
customElements.define("l3-typed", Typed);

/*const _l3Structure = l3Type => (name, children, appearance = plain, props = {}) => {
    const node = document.createElement('l3-' + l3Type);
    node.name = name;
    node.props = props;
    node.appearance = appearance;
    children.forEach(child => {
        node.appendChild(child);
    })
    return node;
};*/