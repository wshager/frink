const registry = new Map();
const elements = new WeakMap();

export const register = (name, {render, setValue, getValue}) => {
    const wrappedRender = props => {
        const elm = render(props);
        elements.set(elm, name);
        return elm;
    };
    registry.set(name, {render: wrappedRender, setValue, getValue});
    return wrappedRender;
};

export const setValue = (elm, val) => {
    const name = elements.get(elm);
    const entry = registry.get(name);
    const { setValue } = entry;
    return setValue(elm, val);
};

export const getValue = elm => {
    const name = elements.get(elm);
    const entry = registry.get(name);
    const { getValue } = entry;
    return getValue(elm);
};
