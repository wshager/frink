export const entries = function *(obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        yield [key, obj[key]];
    }
};

export const values = function *(obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        yield obj[key];
    }
};
