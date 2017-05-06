export const entries = function *(obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        yield [key, obj[key]];
    }
};
