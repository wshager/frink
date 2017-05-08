export const values = function *(obj) {

    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {

        yield obj[key];
    }
};
