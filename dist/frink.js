(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
    @fileOverview Hash Array Mapped Trie.

    Code based on: https://github.com/exclipy/pdata
*/

/* Configuration
 ******************************************************************************/
const SIZE = 5;

const BUCKET_SIZE = Math.pow(2, SIZE);

const MASK = BUCKET_SIZE - 1;

const MAX_INDEX_NODE = BUCKET_SIZE / 2;

const MIN_ARRAY_NODE = BUCKET_SIZE / 4;

/*
 ******************************************************************************/
const nothing = {};

const constant = x => () => x;

/**
    Get 32 bit hash of string.

    Based on:
    http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
*/
const hash = exports.hash = str => {
    const type = typeof str;
    if (type === 'number') return str;
    if (type !== 'string') str += '';

    let hash = 0;
    for (let i = 0, len = str.length; i < len; ++i) {
        const c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c | 0;
    }
    return hash;
};

/* Bit Ops
 ******************************************************************************/
/**
    Hamming weight.

    Taken from: http://jsperf.com/hamming-weight
*/
const popcount = v => {
    v -= v >>> 1 & 0x55555555; // works with signed or unsigned shifts
    v = (v & 0x33333333) + (v >>> 2 & 0x33333333);
    return (v + (v >>> 4) & 0xF0F0F0F) * 0x1010101 >>> 24;
};

const hashFragment = (shift, h) => h >>> shift & MASK;

const toBitmap = x => 1 << x;

const fromBitmap = (bitmap, bit) => popcount(bitmap & bit - 1);

/* Array Ops
 ******************************************************************************/
/**
    Set a value in an array.

    @param mutate Should the input array be mutated?
    @param at Index to change.
    @param v New value
    @param arr Array.
*/
const arrayUpdate = (mutate, at, v, arr) => {
    let out = arr;
    if (!mutate) {
        const len = arr.length;
        out = new Array(len);
        for (let i = 0; i < len; ++i) out[i] = arr[i];
    }
    out[at] = v;
    return out;
};

/**
    Remove a value from an array.

    @param mutate Should the input array be mutated?
    @param at Index to remove.
    @param arr Array.
*/
const arraySpliceOut = (mutate, at, arr) => {
    const len = arr.length - 1;
    let i = 0,
        g = 0;
    let out = arr;
    if (mutate) {
        g = i = at;
    } else {
        out = new Array(len);
        while (i < at) out[g++] = arr[i++];
    }
    ++i;
    while (i <= len) out[g++] = arr[i++];
    out.length = len;
    return out;
};

/**
    Insert a value into an array.

    @param mutate Should the input array be mutated?
    @param at Index to insert at.
    @param v Value to insert,
    @param arr Array.
*/
const arraySpliceIn = (mutate, at, v, arr) => {
    const len = arr.length;
    if (mutate) {
        let i = len;
        while (i >= at) arr[i--] = arr[i];
        arr[at] = v;
        return arr;
    }
    let i = 0,
        g = 0;
    const out = new Array(len + 1);
    while (i < at) out[g++] = arr[i++];
    out[at] = v;
    while (i < len) out[++g] = arr[i++];
    return out;
};

/* Node Structures
 ******************************************************************************/
const LEAF = 1;
const COLLISION = 2;
const INDEX = 3;
const ARRAY = 4;
const MULTI = 5;

/**
    Empty node.
*/
const emptyNode = {
    __hamt_isEmpty: true
};

const isEmptyNode = x => x === emptyNode || x && x.__hamt_isEmpty;

/**
    Leaf holding a value.

    @member edit Edit of the node.
    @member hash Hash of key.
    @member key Key.
    @member value Value stored.
*/
const Leaf = (edit, hash, key, value, prev, id, next) => ({
    type: LEAF,
    edit: edit,
    hash: hash,
    key: key,
    value: value,
    prev: prev,
    next: next,
    id: id,
    _modify: Leaf__modify
});

/**
    Leaf holding multiple values with the same hash but different keys.

    @member edit Edit of the node.
    @member hash Hash of key.
    @member children Array of collision children node.
*/
const Collision = (edit, hash, children) => ({
    type: COLLISION,
    edit: edit,
    hash: hash,
    children: children,
    _modify: Collision__modify
});

/**
    Internal node with a sparse set of children.

    Uses a bitmap and array to pack children.

  @member edit Edit of the node.
    @member mask Bitmap that encode the positions of children in the array.
    @member children Array of child nodes.
*/
const IndexedNode = (edit, mask, children) => ({
    type: INDEX,
    edit: edit,
    mask: mask,
    children: children,
    _modify: IndexedNode__modify
});

/**
    Internal node with many children.

    @member edit Edit of the node.
    @member size Number of children.
    @member children Array of child nodes.
*/
const ArrayNode = (edit, size, children) => ({
    type: ARRAY,
    edit: edit,
    size: size,
    children: children,
    _modify: ArrayNode__modify
});

const Multi = (edit, hash, key, children) => ({
    type: MULTI,
    edit: edit,
    hash: hash,
    key: key,
    children: children,
    _modify: Multi__modify
});

/**
    Is `node` a leaf node?
*/
const isLeaf = node => node === emptyNode || node.type === LEAF || node.type === COLLISION;

/* Internal node operations.
 ******************************************************************************/
/**
    Expand an indexed node into an array node.

  @param edit Current edit.
    @param frag Index of added child.
    @param child Added child.
    @param mask Index node mask before child added.
    @param subNodes Index node children before child added.
*/
const expand = (edit, frag, child, bitmap, subNodes) => {
    const arr = [];
    let bit = bitmap;
    let count = 0;
    for (let i = 0; bit; ++i) {
        if (bit & 1) arr[i] = subNodes[count++];
        bit >>>= 1;
    }
    arr[frag] = child;
    return ArrayNode(edit, count + 1, arr);
};

/**
    Collapse an array node into a indexed node.

  @param edit Current edit.
    @param count Number of elements in new array.
    @param removed Index of removed element.
    @param elements Array node children before remove.
*/
const pack = (edit, count, removed, elements) => {
    const children = new Array(count - 1);
    let g = 0;
    let bitmap = 0;
    for (let i = 0, len = elements.length; i < len; ++i) {
        if (i !== removed) {
            const elem = elements[i];
            if (elem && !isEmptyNode(elem)) {
                children[g++] = elem;
                bitmap |= 1 << i;
            }
        }
    }
    return IndexedNode(edit, bitmap, children);
};

/**
    Merge two leaf nodes.

    @param shift Current shift.
    @param h1 Node 1 hash.
    @param n1 Node 1.
    @param h2 Node 2 hash.
    @param n2 Node 2.
*/
const mergeLeaves = (edit, shift, h1, n1, h2, n2) => {
    if (h1 === h2) {
        return Collision(edit, h1, [n2, n1]);
    }
    const subH1 = hashFragment(shift, h1);
    const subH2 = hashFragment(shift, h2);
    return IndexedNode(edit, toBitmap(subH1) | toBitmap(subH2), subH1 === subH2 ? [mergeLeaves(edit, shift + SIZE, h1, n1, h2, n2)] : subH1 < subH2 ? [n1, n2] : [n2, n1]);
};

/**
    Update an entry in a collision list.

    @param mutate Should mutation be used?
    @param edit Current edit.
    @param keyEq Key compare function.
    @param hash Hash of collision.
    @param list Collision list.
    @param f Update function.
    @param k Key to update.
    @param size Size ref.
*/
const updateCollisionList = (mutate, edit, keyEq, h, list, f, k, size, insert, multi) => {
    const len = list.length;
    for (let i = 0; i < len; ++i) {
        const child = list[i];
        if (keyEq(k, child.key)) {
            const value = child.value;
            const newValue = f(value);
            if (newValue === value) return list;

            if (newValue === nothing) {
                --size.value;
                return arraySpliceOut(mutate, i, list);
            }
            return arrayUpdate(mutate, i, Leaf(edit, h, k, newValue, insert), list);
        }
    }

    const newValue = f();
    if (newValue === nothing) return list;
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert), list);
};

const updateMultiList = (mutate, edit, h, list, f, k, size, insert, multi) => {
    var len = list.length;
    var newValue = f();
    if (newValue === nothing) {
        --size.value;
        var idx = len - 1;
        for (; idx >= 0; idx--) if (list[idx].id === multi) break;
        return arraySpliceOut(mutate, idx, list);
    }
    ++size.value;
    return arrayUpdate(mutate, len, Leaf(edit, h, k, newValue, insert, list[len - 1].id + 1), list);
};

const canEditNode = (edit, node) => edit === node.edit;

/* Editing
 ******************************************************************************/
const Leaf__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    var leaf;
    if (keyEq(k, this.key)) {
        let v = f(this.value);
        if (v === nothing) {
            --size.value;
            return emptyNode;
        }
        if (multi) {
            leaf = this;
        } else {
            if (v === this.value) return this;
            if (canEditNode(edit, this)) {
                this.value = v;
                this.prev = insert || this.prev;
                return this;
            }
            return Leaf(edit, h, k, v, insert || this.prev, 0, this.next);
        }
    }
    let v = f();
    if (v === nothing) return this;
    ++size.value;
    if (multi && leaf) {
        //if(v===leaf.value) throw new Error("Either key or value must be unique in a multimap");
        return Multi(edit, h, k, [leaf, Leaf(edit, h, k, v, insert, multi)]);
    }
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

const Collision__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (h === this.hash) {
        const canEdit = canEditNode(edit, this);
        const list = updateCollisionList(canEdit, edit, keyEq, this.hash, this.children, f, k, size, insert);
        if (list === this.children) return this;

        return list.length > 1 ? Collision(edit, this.hash, list) : list[0]; // collapse single element collision list
    }
    const v = f();
    if (v === nothing) return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

const IndexedNode__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    const mask = this.mask;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const bit = toBitmap(frag);
    const indx = fromBitmap(mask, bit);
    const exists = mask & bit;
    const current = exists ? children[indx] : emptyNode;
    const child = current._modify(edit, keyEq, shift + SIZE, f, h, k, size, insert, multi);

    if (current === child) return this;

    const canEdit = canEditNode(edit, this);
    let bitmap = mask;
    let newChildren;
    if (exists && isEmptyNode(child)) {
        // remove
        bitmap &= ~bit;
        if (!bitmap) return emptyNode;
        if (children.length <= 2 && isLeaf(children[indx ^ 1])) return children[indx ^ 1]; // collapse

        newChildren = arraySpliceOut(canEdit, indx, children);
    } else if (!exists && !isEmptyNode(child)) {
        // add
        if (children.length >= MAX_INDEX_NODE) return expand(edit, frag, child, mask, children);

        bitmap |= bit;
        newChildren = arraySpliceIn(canEdit, indx, child, children);
    } else {
        // modify
        newChildren = arrayUpdate(canEdit, indx, child, children);
    }

    if (canEdit) {
        this.mask = bitmap;
        this.children = newChildren;
        return this;
    }
    return IndexedNode(edit, bitmap, newChildren);
};

const ArrayNode__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    let count = this.size;
    const children = this.children;
    const frag = hashFragment(shift, h);
    const child = children[frag];
    const newChild = (child || emptyNode)._modify(edit, keyEq, shift + SIZE, f, h, k, size);

    if (child === newChild) return this;

    const canEdit = canEditNode(edit, this);
    let newChildren;
    if (isEmptyNode(child) && !isEmptyNode(newChild)) {
        // add
        ++count;
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    } else if (!isEmptyNode(child) && isEmptyNode(newChild)) {
        // remove
        --count;
        if (count <= MIN_ARRAY_NODE) return pack(edit, count, frag, children);
        newChildren = arrayUpdate(canEdit, frag, emptyNode, children);
    } else {
        // modify
        newChildren = arrayUpdate(canEdit, frag, newChild, children);
    }

    if (canEdit) {
        this.size = count;
        this.children = newChildren;
        return this;
    }
    return ArrayNode(edit, count, newChildren);
};

const Multi__modify = function (edit, keyEq, shift, f, h, k, size, insert, multi) {
    if (keyEq(k, this.key)) {
        // modify
        const canEdit = canEditNode(edit, this);
        var list = this.children;
        // if Multi exists, find leaf
        list = updateMultiList(canEdit, edit, h, list, f, k, size, insert, multi);
        if (list === this.children) return this;

        if (list.length > 1) return Multi(edit, h, k, list);
        // collapse single element collision list
        return list[0];
    }
    let v = f();
    if (v === nothing) return this;
    ++size.value;
    return mergeLeaves(edit, shift, this.hash, this, h, Leaf(edit, h, k, v, insert, 0));
};

emptyNode._modify = (edit, keyEq, shift, f, h, k, size, insert) => {
    const v = f();
    if (v === nothing) return emptyNode;
    ++size.value;
    return Leaf(edit, h, k, v, insert, 0);
};

/* Ordered / Multi helpers
 ******************************************************************************/

function getLeafOrMulti(node, hash, key) {
    var s = 0,
        len = 0;
    while (node && node.type > 1) {
        if (node.type == 2) {
            len = node.children.length;
            for (var i = 0; i < len; i++) {
                var c = node.children[i];
                if (c.key === key) {
                    node = c;
                    break;
                }
            }
        } else if (node.type == 3) {
            var frag = hashFragment(s, hash);
            var bit = toBitmap(frag);
            if (node.mask & bit) {
                node = node.children[fromBitmap(node.mask, bit)];
            } else {
                return;
            }
            s += SIZE;
        } else if (node.type == 4) {
            node = node.children[hashFragment(s, hash)];
            s += SIZE;
        } else {
            // just return
            if (node.key === key) {
                return node;
            } else {
                return;
            }
        }
    }
    if (!!node && node.key === key) return node;
}

function getLeafFromMulti(node, id) {
    for (var i = 0, len = node.children.length; i < len; i++) {
        var c = node.children[i];
        if (c.id === id) return c;
    }
}

function getLeafFromMultiV(node, val) {
    for (var i = 0, len = node.children.length; i < len; i++) {
        var c = node.children[i];
        if (c.value === val) return c;
    }
}

function updatePosition(parent, edit, entry, val, prev = false, s = 0) {
    var len = 0,
        type = parent.type,
        node = null,
        idx = 0,
        hash = entry[0],
        key = entry[1],
        id = entry[2];
    if (type == 1) {
        return Leaf(edit, parent.hash, parent.key, parent.value, prev ? val : parent.prev, parent.id, prev ? parent.next : val);
    }
    var children = parent.children;
    if (type == 2) {
        len = children.length;
        for (; idx < len; ++idx) {
            node = children[idx];
            if (key === node.key) break;
        }
    } else if (type == 3) {
        var frag = hashFragment(s, hash);
        var bit = toBitmap(frag);
        if (parent.mask & bit) {
            idx = fromBitmap(parent.mask, bit);
            node = children[idx];
            s += SIZE;
        }
    } else if (type == 4) {
        idx = hashFragment(s, hash);
        node = children[idx];
        s += SIZE;
    } else if (type == 5) {
        // assume not in use
        len = children.length;
        for (; idx < len;) {
            node = children[idx];
            if (node.id === id) break;
            idx++;
        }
    }
    if (node) {
        children = arrayUpdate(canEditNode(edit, node), idx, updatePosition(node, edit, entry, val, prev, s), children);
        if (type == 2) {
            return Collision(edit, parent.hash, children);
        } else if (type == 3) {
            return IndexedNode(edit, parent.mask, children);
        } else if (type == 4) {
            return ArrayNode(edit, parent.size, children);
        } else if (type == 5) {
            return Multi(edit, hash, key, children);
        }
    }
    return parent;
}

function last(arr) {
    return arr[arr.length - 1];
}

/*
 ******************************************************************************/
function Map(editable, edit, config, root, size, start, insert) {
    this._editable = editable;
    this._edit = edit;
    this._config = config;
    this._root = root;
    this._size = size;
    this._start = start;
    this._insert = insert;
}

Map.prototype.setTree = function (newRoot, newSize, insert) {
    var start = newSize == 1 ? insert : this._start;
    if (this._editable) {
        this._root = newRoot;
        this._size = newSize;
        this._insert = insert;
        this._start = start;
        return this;
    }
    return newRoot === this._root ? this : new Map(this._editable, this._edit, this._config, newRoot, newSize, start, insert);
};

/* Queries
 ******************************************************************************/
/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `alt` if none.
*/
const tryGetHash = exports.tryGetHash = (alt, hash, key, map) => {
    let node = map._root;
    let shift = 0;
    const keyEq = map._config.keyEq;
    while (true) switch (node.type) {
        case LEAF:
            {
                return keyEq(key, node.key) ? node.value : alt;
            }
        case COLLISION:
            {
                if (hash === node.hash) {
                    const children = node.children;
                    for (let i = 0, len = children.length; i < len; ++i) {
                        const child = children[i];
                        if (keyEq(key, child.key)) return child.value;
                    }
                }
                return alt;
            }
        case INDEX:
            {
                const frag = hashFragment(shift, hash);
                const bit = toBitmap(frag);
                if (node.mask & bit) {
                    node = node.children[fromBitmap(node.mask, bit)];
                    shift += SIZE;
                    break;
                }
                return alt;
            }
        case ARRAY:
            {
                node = node.children[hashFragment(shift, hash)];
                if (node) {
                    shift += SIZE;
                    break;
                }
                return alt;
            }
        case MULTI:
            {
                var ret = [];
                for (let i = 0, len = node.children.length; i < len; i++) {
                    var c = node.children[i];
                    ret.push(c.value);
                }
                return ret;
            }
        default:
            return alt;
    }
};

Map.prototype.tryGetHash = function (alt, hash, key) {
    return tryGetHash(alt, hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `tryGetHash`
*/
const tryGet = exports.tryGet = (alt, key, map) => tryGetHash(alt, map._config.hash(key), key, map);

Map.prototype.tryGet = function (alt, key) {
    return tryGet(alt, key, this);
};

/**
    Lookup the value for `key` in `map` using a custom `hash`.

    Returns the value or `undefined` if none.
*/
const getHash = exports.getHash = (hash, key, map) => tryGetHash(undefined, hash, key, map);

Map.prototype.getHash = function (hash, key) {
    return getHash(hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.

    @see `get`
*/
const get = exports.get = (key, map) => tryGetHash(undefined, map._config.hash(key), key, map);

Map.prototype.get = function (key, alt) {
    return tryGet(alt, key, this);
};

Map.prototype.first = function () {
    var start = this._start;
    var node = getLeafOrMulti(this._root, start[0], start[1]);
    if (node.type == MULTI) node = getLeafFromMulti(node, start[2]);
    return node.value;
};

Map.prototype.last = function () {
    var end = this._init;
    var node = getLeafOrMulti(this._root, end[0], end[1]);
    if (node.type == MULTI) node = getLeafFromMulti(node, end[2]);
    return node.value;
};

Map.prototype.next = function (key, val) {
    var node = getLeafOrMulti(this._root, hash(key), key);
    if (node.type == MULTI) {
        node = getLeafFromMultiV(node, val);
    }
    if (node.next === undefined) return;
    var next = getLeafOrMulti(this._root, node.next[0], node.next[1]);
    if (next.type == MULTI) {
        next = getLeafFromMulti(next, node.next[2]);
    }
    return next.value;
};

/**
    Does an entry exist for `key` in `map`? Uses custom `hash`.
*/
const hasHash = exports.hasHash = (hash, key, map) => tryGetHash(nothing, hash, key, map) !== nothing;

Map.prototype.hasHash = function (hash, key) {
    return hasHash(hash, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses internal hash function.
*/
const has = exports.has = (key, map) => hasHash(map._config.hash(key), key, map);

Map.prototype.has = function (key) {
    return has(key, this);
};

const defKeyCompare = (x, y) => x === y;

/**
    Create an empty map.

    @param config Configuration.
*/
const make = exports.make = config => new Map(0, 0, {
    keyEq: config && config.keyEq || defKeyCompare,
    hash: config && config.hash || hash
}, emptyNode, 0);

/**
    Empty map.
*/
const empty = exports.empty = make();

/**
    Does `map` contain any elements?
*/
const isEmpty = exports.isEmpty = map => map && !!isEmptyNode(map._root);

Map.prototype.isEmpty = function () {
    return isEmpty(this);
};

/* Updates
 ******************************************************************************/
/**
    Alter the value stored for `key` in `map` using function `f` using
    custom hash.

    `f` is invoked with the current value for `k` if it exists,
    or no arguments if no such value exists. `modify` will always either
    update or insert a value into the map.

    Returns a map with the modified value. Does not alter `map`.
*/
const modifyHash = exports.modifyHash = (f, hash, key, insert, multi, map) => {
    const size = { value: map._size };
    const newRoot = map._root._modify(map._editable ? map._edit : NaN, map._config.keyEq, 0, f, hash, key, size, insert, multi);
    return map.setTree(newRoot, size.value, insert || !map._size ? [hash, key, multi] : map._insert);
};

Map.prototype.modifyHash = function (hash, key, f) {
    return modifyHash(f, hash, key, this.has(key), false, this);
};

/**
    Alter the value stored for `key` in `map` using function `f` using
    internal hash function.

    @see `modifyHash`
*/
const modify = exports.modify = (f, key, map) => modifyHash(f, map._config.hash(key), key, map.has(key), false, map);

Map.prototype.modify = function (key, f) {
    return modify(f, key, this);
};

/**
    Store `value` for `key` in `map` using custom `hash`.

    Returns a map with the modified value. Does not alter `map`.
*/
const setHash = exports.setHash = (hash, key, value, map) => appendHash(hash, key, value, map.has(key), map);

Map.prototype.setHash = function (hash, key, value) {
    return setHash(hash, key, value, this);
};

const appendHash = exports.appendHash = function (hash, key, value, exists, map) {
    var insert = map._insert;
    map = modifyHash(constant(value), hash, key, exists ? null : insert, 0, map);
    if (insert && !exists) {
        const edit = map._editable ? map._edit : NaN;
        map._root = updatePosition(map._root, edit, insert, [hash, key]);
        if (map._start[1] === key) {
            var node = getLeafOrMulti(map._root, hash, key);
            var next = node.next;
            map._root = updatePosition(map._root, edit, [hash, key], undefined);
            map._root = updatePosition(map._root, edit, node.next, undefined, true);
            map._start = node.next;
        }
    }
    return map;
};

Map.prototype.append = function (key, value) {
    return appendHash(hash(key), key, value, false, this);
};

/**
    Store `value` for `key` in `map` using internal hash function.

    @see `setHash`
*/
const set = exports.set = (key, value, map) => setHash(map._config.hash(key), key, value, map);

Map.prototype.set = function (key, value) {
    return set(key, value, this);
};

/**
 * multi-map
 * - create an extra bucket for each entry with same key
 */
const addHash = exports.addHash = function (hash, key, value, map) {
    var insert = map._insert;
    var node = getLeafOrMulti(map._root, hash, key);
    var multi = node ? node.type == MULTI ? last(node.children).id + 1 : node.type == LEAF ? node.id + 1 : 0 : 0;
    var newmap = modifyHash(constant(value), hash, key, insert, multi, map);
    if (insert) {
        const edit = map._editable ? map._edit : NaN;
        newmap._root = updatePosition(newmap._root, edit, insert, [hash, key, multi]);
    }
    return newmap;
};

// single push, like arrays
Map.prototype.push = function (kv) {
    var key = kv[0],
        value = kv[1];
    return addHash(hash(key), key, value, this);
};

/**
    Remove the entry for `key` in `map`.

    Returns a map with the value removed. Does not alter `map`.
*/
const del = constant(nothing);
const removeHash = exports.removeHash = (hash, key, val, map) => {
    // in case of collision, we need a leaf
    var node = getLeafOrMulti(map._root, hash, key);
    if (node === undefined) return map;
    var prev = node.prev,
        next = node.next;
    var insert = map._insert;
    var leaf;
    if (node.type == MULTI) {
        // default: last will be removed
        leaf = val !== undefined ? getLeafFromMultiV(node, val) : last(node.children);
        prev = leaf.prev;
        next = leaf.next;
    }
    map = modifyHash(del, hash, key, null, leaf ? leaf.id : undefined, map);
    const edit = map._editable ? map._edit : NaN;
    var id = leaf ? leaf.id : 0;
    if (prev !== undefined) {
        map._root = updatePosition(map._root, edit, prev, next);
        if (insert && insert[1] === key && insert[2] === id) map._insert = prev;
    }
    if (next !== undefined) {
        map._root = updatePosition(map._root, edit, next, prev, true);
        if (map._start[1] === key && map._start[2] === id) {
            //next = node.next;
            map._root = updatePosition(map._root, edit, next, undefined, true);
            map._start = next;
        }
    }
    if (next === undefined && prev === undefined) {
        map._insert = map._start = undefined;
    }
    return map;
};

Map.prototype.removeHash = Map.prototype.deleteHash = function (hash, key) {
    return removeHash(hash, key, this);
};

/**
    Remove the entry for `key` in `map` using internal hash function.

    @see `removeHash`
*/
const remove = exports.remove = (key, map) => removeHash(map._config.hash(key), key, undefined, map);

Map.prototype.remove = Map.prototype.delete = function (key) {
    return remove(key, this);
};

// MULTI:
const removeValue = exports.removeValue = (key, val, map) => removeHash(map._config.hash(key), key, val, map);

Map.prototype.removeValue = Map.prototype.deleteValue = function (key, val) {
    return removeValue(key, val, this);
};
/* Mutation
 ******************************************************************************/
/**
    Mark `map` as mutable.
 */
const beginMutation = exports.beginMutation = map => new Map(map._editable + 1, map._edit + 1, map._config, map._root, map._size, map._start, map._insert);

Map.prototype.beginMutation = function () {
    return beginMutation(this);
};

/**
    Mark `map` as immutable.
 */
const endMutation = exports.endMutation = map => {
    map._editable = map._editable && map._editable - 1;
    return map;
};

Map.prototype.endMutation = function () {
    return endMutation(this);
};

/**
    Mutate `map` within the context of `f`.
    @param f
    @param map HAMT
*/
const mutate = exports.mutate = (f, map) => {
    const transient = beginMutation(map);
    f(transient);
    return endMutation(transient);
};

Map.prototype.mutate = function (f) {
    return mutate(f, this);
};

/* Traversal
 ******************************************************************************/
const DONE = {
    done: true
};

function MapIterator(root, v, f) {
    this.root = root;
    this.f = f;
    this.v = v;
}

MapIterator.prototype.next = function () {
    var v = this.v;
    if (!v) return DONE;
    var node = getLeafOrMulti(this.root, v[0], v[1]);
    if (node.type == MULTI) {
        node = getLeafFromMulti(node, v[2]);
        if (!node) return DONE;
    }
    this.v = node.next;
    return { value: this.f(node) };
};

MapIterator.prototype[Symbol.iterator] = function () {
    return this;
};

/**
    Lazily visit each value in map with function `f`.
*/
const visit = (map, f) => new MapIterator(map._root, map._start, f);

/**
    Get a Javascsript iterator of `map`.

    Iterates over `[key, value]` arrays.
*/
const buildPairs = x => [x.key, x.value];
const entries = exports.entries = map => visit(map, buildPairs);

Map.prototype.entries = Map.prototype[Symbol.iterator] = function () {
    return entries(this);
};

/**
    Get array of all keys in `map`.

    Order is not guaranteed.
*/
const buildKeys = x => x.key;
const keys = exports.keys = map => visit(map, buildKeys);

Map.prototype.keys = function () {
    return keys(this);
};

/**
    Get array of all values in `map`.

    Order is not guaranteed, duplicates are preserved.
*/
const buildValues = x => x.value;
const values = exports.values = Map.prototype.values = map => visit(map, buildValues);

Map.prototype.values = function () {
    return values(this);
};

/* Fold
 ******************************************************************************/
/**
    Visit every entry in the map, aggregating data.

    Order of nodes is not guaranteed.

    @param f Function mapping accumulated value, value, and key to new value.
    @param z Starting value.
    @param m HAMT
*/
const fold = exports.fold = (f, z, m) => {
    var root = m._root;
    if (isEmptyNode(root)) return z;
    var v = m._start;
    var node;
    do {
        node = getLeafOrMulti(root, v[0], v[1]);
        v = node.next;
        z = f(z, node.value, node.key);
    } while (node && node.next);
    return z;
};

Map.prototype.fold = Map.prototype.reduce = function (f, z) {
    return fold(f, z, this);
};

/**
    Visit every entry in the map, aggregating data.

    Order of nodes is not guaranteed.

    @param f Function invoked with value and key
    @param map HAMT
*/
const forEach = exports.forEach = (f, map) => fold((_, value, key) => f(value, key, map), null, map);

Map.prototype.forEach = function (f) {
    return forEach(f, this);
};

/* Aggregate
 ******************************************************************************/
/**
    Get the number of entries in `map`.
*/
const count = exports.count = map => map._size;

Map.prototype.count = function () {
    return count(this);
};

Object.defineProperty(Map.prototype, 'size', {
    get: Map.prototype.count
});

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.docIter = docIter;
exports.nextNode = nextNode;
exports.prevNode = prevNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.children = children;
exports.childrenByName = childrenByName;
exports.getRoot = getRoot;
exports.getDoc = getDoc;
exports.lastNode = lastNode;
exports.parent = parent;
exports.iter = iter;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function* docIter(node, reverse = false) {
	node = (0, _vnode.ensureRoot)(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if (node) yield node;
	}
}

function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    parent = node.parent,
	    indexInParent = node.indexInParent || 0;
	var depth = inode._depth;
	if (type != 17 && inode.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = inode.first();
		// TODO handle arrays
		//console.log("found first", inode._name,index);
		node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, parent, indexInParent);
		//node.path.push(node);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.inode.count() == indexInParent) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new _vnode.Step(inode, node.parent, node.indexInParent);
			//node.path.push(node);
			return node;
		} else {
			// return the next child
			inode = parent.inode.next(inode._name, inode);
			if (inode) {
				//console.log("found next", inode._name, index);
				node = new _vnode.VNode(inode, inode._type, inode._name, inode._value, parent, indexInParent);
				//node.path.push(node);
				return node;
			}
			throw new Error("Node " + parent.name + " hasn't been completely traversed. Found " + indexInParent + ", contains " + parent.inode.count());
		}
	}
}

function* prevNode(node) {
	var depth = node._depth;
	while (node) {
		if (!node.size) {
			depth--;
			node = node._parent;
			if (!node) break;
			yield node;
		} else {
			if (!("_index" in node)) node._index = node.size;
			node._index--;
			node = node.getByIndex(node._index);
		}
	}
}

function stringify(input) {
	var str = "";
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	const docAttrFunc = (z, v, k) => {
		return z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	};
	for (let node of docIter(input)) {
		let type = node.type;
		if (type == 1) {
			let inode = node.inode;
			str += "<" + node.name;
			str = inode._attrs.reduce(attrFunc, str);
			if (!inode._size) str += "/";
			str += ">";
		} else if (type == 3) {
			str += node.toString();
		} else if (type == 9) {
			let inode = node.inode;
			str += node._attrs.reduce(docAttrFunc, str);
		} else if (type == 17) {
			let inode = node.inode;
			if (inode._type == 1) str += "</" + inode._name + ">";
		}
	}
	return (0, _pretty.prettyXML)(str);
}

function firstChild(node, fltr = 0) {
	// FIXME return root if doc (or something else?)
	node = (0, _vnode.ensureRoot)(node);
	var next = nextNode(node);
	if (node.inode._depth == next.inode._depth - 1) return next;
}

/*
export function nextSibling(node){
	// SLOW version, but we have a path+index
	var inode = node.inode,
		path = node.path,
		i = node.index;
	var depth = inode._depth;
	// run down path
	inode = {};
	while(inode._depth != depth) {
		node = nextNode(node);
		if(node.type==17) continue;
		if(!node) break;
		inode = node.inode;
	}
	return node;
}
*/
function nextSibling(node) {
	node = (0, _vnode.ensureRoot)(node);
	var parent = node.parent;
	var next = parent.inode.next(node.name, node.inode);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return new _vnode.VNode(next, next.type, next.name, next.value, parent, node.indexInParent + 1);
}

function* children(node) {
	var inode = node;
	var i = 0,
	    iter = inode.values();
	while (!iter.done) {
		let c = iter.next().value;
		yield new _vnode.VNode(c, c.type, c.name, c.value, node, i);
		i++;
	}
}

function childrenByName(node, name) {
	var hasWildcard = /\*/.test(name);
	if (hasWildcard) {
		var regex = new RegExp(name.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		var xf = (0, _transducers.compose)((0, _transducers.filter)(c => regex.test(c.name), (0, _transducers.forEach)((c, i) => new _vnode.VNode(c, c._type, c._name, c._value, node, i))));
		return new _seq.LazySeq((0, _transducers.transform)(node.inode, xf));
	} else {
		let entry = node.inode.get(name);
		if (entry === undefined) return new _seq.LazySeq();
		if (entry.constructor == Array) {
			return new _seq.LazySeq((0, _transducers.forEach)(c => new _vnode.VNode(c, c._type, c._name, c._value, node.inode)));
		} else {
			return new _seq.LazySeq([new _vnode.VNode(entry, entry._type, entry._name, entry._value, node.inode)]);
		}
	}
}

function getRoot(node) {
	do {
		node = node.parent;
	} while (node.parent);
	return node;
}

function getDoc(node) {

	return getRoot(node);
}

function lastNode(node) {
	var depth = node.inode._depth;
	if (depth < 0) return node;
	var inode = {};
	var last;
	while (inode._depth != depth) {
		if (node.type < 17) last = node;
		node = nextNode(node);
		if (!node) break;
		inode = node.inode;
	}
	return last;
}

function parent(node) {
	return node.parent;
}

function iter(node, f) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = node => {
		prev = node;
	};
	node = (0, _vnode.ensureRoot)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	return prev;
}
},{"./pretty":7,"./seq":9,"./transducers":10,"./vnode":11}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.nodesList = nodesList;
exports.nextNode = nextNode;
function Step(node, depth) {
	this.node = node;
	this.nodeName = node.nodeName;
	this.parentNode = node.parentNode;
	this.nextSibling = node.nextSibling;
	this.previousSibling = node.previousSibling;
	this["@@doc-depth"] = depth;
}

Step.prototype.nodeType = 17;

function nodesList(node) {
	var list = [];
	var next = nextNode(node);
	do {
		list.push(next);
		next = next && nextNode(next);
	} while (next);
	return list;
}

// nextNode means:
// descend into firstChild or nextSibling
// if no more siblings, go back up using Step
// if Step, firstChild will be skipped, so nextSibling will be retried
function nextNode(node /* Node */) {
	var type = node.nodeType,
	    depth = node["@@doc-depth"] || 0;
	//index = node["@@doc-index"],
	//indexInParent = 0;
	//if(index === undefined) index = -1;
	//index++;
	if (type != 17 && node.firstChild) {
		// if we can still go down, return firstChild
		node = node.firstChild;
		//indexInParent = node.indexInParent = 0;
		node["@@doc-depth"] = ++depth;
		//node["@@doc-index"] = index;
		return node;
	} else {
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		// FIXME we could also directly return the parent's nextSibling
		if (!node.nextSibling) {
			//inode = parent;
			depth--;
			//console.log("found step", inode._name, indexInParent, depth, inode._depth);
			node = node.parentNode;
			if (!node || node["@@doc-depth"] !== depth) return;
			node = new Step(node, depth);
			return node;
		} else {
			// return the next child
			node = node.nextSibling;
			//console.log("found next", inode._name, index);
			node["@@doc-depth"] = depth;
			return node;
		}
	}
}
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uncompress = exports.compress = exports.render = exports.toL3 = exports.fromL3 = exports.childrenByName = exports.children = exports.parent = exports.nextSibling = exports.firstChild = exports.nextNode = exports.docIter = exports.removeChild = exports.insertBefore = exports.appendChild = exports.qname = exports.processingInstruction = exports.comment = exports.cdata = exports.text = exports.attr = exports.elem = undefined;

var _vnode = require("./vnode");

Object.defineProperty(exports, "elem", {
  enumerable: true,
  get: function () {
    return _vnode.elem;
  }
});
Object.defineProperty(exports, "attr", {
  enumerable: true,
  get: function () {
    return _vnode.attr;
  }
});
Object.defineProperty(exports, "text", {
  enumerable: true,
  get: function () {
    return _vnode.text;
  }
});
Object.defineProperty(exports, "cdata", {
  enumerable: true,
  get: function () {
    return _vnode.cdata;
  }
});
Object.defineProperty(exports, "comment", {
  enumerable: true,
  get: function () {
    return _vnode.comment;
  }
});
Object.defineProperty(exports, "processingInstruction", {
  enumerable: true,
  get: function () {
    return _vnode.processingInstruction;
  }
});
Object.defineProperty(exports, "qname", {
  enumerable: true,
  get: function () {
    return _vnode.qname;
  }
});

var _modify = require("./modify");

Object.defineProperty(exports, "appendChild", {
  enumerable: true,
  get: function () {
    return _modify.appendChild;
  }
});
Object.defineProperty(exports, "insertBefore", {
  enumerable: true,
  get: function () {
    return _modify.insertBefore;
  }
});
Object.defineProperty(exports, "removeChild", {
  enumerable: true,
  get: function () {
    return _modify.removeChild;
  }
});

var _access = require("./access");

Object.defineProperty(exports, "docIter", {
  enumerable: true,
  get: function () {
    return _access.docIter;
  }
});
Object.defineProperty(exports, "nextNode", {
  enumerable: true,
  get: function () {
    return _access.nextNode;
  }
});
Object.defineProperty(exports, "firstChild", {
  enumerable: true,
  get: function () {
    return _access.firstChild;
  }
});
Object.defineProperty(exports, "nextSibling", {
  enumerable: true,
  get: function () {
    return _access.nextSibling;
  }
});
Object.defineProperty(exports, "parent", {
  enumerable: true,
  get: function () {
    return _access.parent;
  }
});
Object.defineProperty(exports, "children", {
  enumerable: true,
  get: function () {
    return _access.children;
  }
});
Object.defineProperty(exports, "childrenByName", {
  enumerable: true,
  get: function () {
    return _access.childrenByName;
  }
});

var _l = require("./l3");

Object.defineProperty(exports, "fromL3", {
  enumerable: true,
  get: function () {
    return _l.fromL3;
  }
});
Object.defineProperty(exports, "toL3", {
  enumerable: true,
  get: function () {
    return _l.toL3;
  }
});

var _render = require("./render");

Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _render.render;
  }
});

var _fastintcompression = require("fastintcompression");

var _fastintcompression2 = _interopRequireDefault(_fastintcompression);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const compress = _fastintcompression2.default.compress;
const uncompress = _fastintcompression2.default.uncompress;

exports.compress = compress;
exports.uncompress = uncompress;
},{"./access":2,"./l3":5,"./modify":6,"./render":8,"./vnode":11,"fastintcompression":12}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.str2array = str2array;
exports.array2str = array2str;
exports.convert = convert;
exports.toL3 = toL3;
exports.fromL3 = fromL3;

var _vnode = require("./vnode");

var _access = require("./access");

// optional:
//import FastIntCompression from "fastintcompression";

function str2array(str, ar = []) {
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		ar.push(str.codePointAt(i));
	}
	return ar;
}

function array2str(ar, i) {
	var str = "",
	    l = ar.length;
	for (; i < l; i++) {
		str += String.fromCodePoint(ar[i]);
	}
	return str;
}

function convert(v) {
	var i = parseFloat(v);
	if (!isNaN(i)) return i;
	if (v === "true" || v === "false") return v !== "false";
	return v;
}

function docAttrType(k) {
	switch (k) {
		case "DOCTYPE":
			return 10;
		default:
			return 7;
	}
}

/**
 * Create a flat buffer from the document tree
 * @param  {VNode} doc The document
 * @return {ArrayBuffer}  A flat buffer
 */
function toL3(doc) {
	var out = [],
	    names = {},
	    i = 1;
	for (let attr of doc._attrs.entries()) {
		let name = attr[0],
		    attrname = "@" + name;
		if (!names[attrname]) {
			names[attrname] = i;
			i++;
			out.push(0);
			out.push(15);
			out = str2array(name, out);
		}
		out.push(docAttrType(attr[0]));
		out = str2array(attr[0], out);
		out = str2array(attr[1], out);
	}
	(0, _access.iter)(doc, function (node) {
		let type = node.type,
		    inode = node.inode,
		    depth = inode._depth,
		    name = node.name;
		var nameIndex = 0;
		if (typeof name === "string") {
			if (!names[name]) {
				names[name] = i;
				i++;
				out.push(0);
				out.push(15);
				out = str2array(name, out);
			}
			nameIndex = names[name];
		}
		out.push(0);
		out.push(type);
		out.push(depth);
		if (nameIndex) out.push(nameIndex);
		if (type == 1) {
			for (let attr of inode._attrs.entries()) {
				let name = attr[0],
				    attrname = "@" + name;
				if (!names[attrname]) {
					names[attrname] = i;
					i++;
					out.push(0);
					out.push(15);
					out = str2array(name, out);
				}
				out.push(0);
				out.push(2);
				out.push(names[attrname]);
				out = str2array(attr[1], out);
			}
		} else if (type == 3 || type == 12) {
			out = str2array(node.value + "", out);
		}
	});
	// remove first 0
	out.shift();
	return out;
}

function fromL3(l3) {
	var names = {},
	    n = 0,
	    parents = [],
	    depth = 0;
	var doc = (0, _vnode.emptyINode)(9, "#document", 0, (0, _vnode.emptyAttrMap)());
	parents[0] = doc;
	const process = function (entry) {
		let type = entry[0];
		// TODO have attributes accept any type
		if (type == 2) {
			let parent = parents[depth];
			let name = names[entry[1]];
			parent._attrs = parent._attrs.push([name, array2str(entry, 2)]);
		} else if (type == 7 || type == 10) {
			doc._attrs = doc._attrs.push([entry[1], array2str(entry, 2)]);
		} else if (type == 15) {
			n++;
			names[n] = array2str(entry, 1);
		} else {
			depth = entry[1];
			let parent = parents[depth - 1];
			let isArray = !!parent && parent._type == 5;
			let valIndex = isArray ? 2 : 3;
			let name = isArray ? parent.count() : names[entry[2]];
			var node;
			if (type == 1 || type == 5 || type == 6) {
				if (parents[depth]) parents[depth] = parents[depth].endMutation();
				node = (0, _vnode.emptyINode)(type, name, depth, (0, _vnode.emptyAttrMap)());
				parents[depth] = node;
			} else if (type == 3) {
				node = new _vnode.Value(type, name, array2str(entry, valIndex), depth);
			} else if (type == 12) {
				node = new _vnode.Value(type, name, convert(array2str(entry, valIndex)), depth);
			}
			if (parent) parent = !isArray ? parent.push([name, node]) : parent.push(node);
		}
	};
	var entry = [];
	for (var i = 0, l = l3.length; i < l; i++) {
		if (l3[i] === 0) {
			process(entry);
			entry = [];
		} else {
			entry.push(l3[i]);
		}
	}
	process(entry);
	return parents[0].endMutation();
}
},{"./access":2,"./vnode":11}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.appendChild = appendChild;
exports.insertBefore = insertBefore;
exports.removeChild = removeChild;

var _vnode = require('./vnode');

var _access = require('./access');

function appendChild(node, child) {
	node = (0, _vnode.ensureRoot)(node);
	let last = (0, _access.lastNode)(node);
	if (node.type == 9 && node.inode.size > 0) {
		throw new Error("Document can only contain one child.");
	}
	let index = node.index;
	// create shallow copy of path down to lastchild of node
	if (typeof child.inode === "function") {
		child.inode(node);
	} else {
		// TODO make protective clone (of inode)
	}
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = (0, _vnode.restoreNode)(node.inode.set(child.name, child.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? (0, _access.firstChild)(node) : node;
}

function insertBefore(node, ins) {
	node = (0, _vnode.ensureRoot)(node);
	let parent = node.parent;
	if (typeof ins.inode == "function") {
		ins.inode(parent, node);
	}
	node = parent;
	while (node.parent) {
		ins = node;
		node = node.parent;
		node.inode = (0, _vnode.restoreNode)(node.inode.set(ins.name, ins.inode), node.inode);
	}
	// this ensures immutability
	return node.type == 9 ? (0, _access.firstChild)(node) : node;
}

function removeChild(node, child) {
	node = (0, _vnode.ensureRoot)(node);
	let inode = node.inode.removeValue(child.name, child.inode);
	node.inode = (0, _vnode.restoreNode)(inode, node.inode);
	while (node.parent) {
		child = node;
		node = node.parent;
		node.inode = (0, _vnode.restoreNode)(node.inode.set(child.name, child.inode), node.inode);
	}
	return node.type == 9 ? (0, _access.firstChild)(node) : node;
}
},{"./access":2,"./vnode":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.prettyXML = prettyXML;
function prettyXML(text) {
	const shift = ['\n']; // array of shifts
	const step = '  '; // 2 spaces
	const maxdeep = 100; // nesting level

	// initialize array with shifts //
	for (let ix = 0; ix < maxdeep; ix++) {
		shift.push(shift[ix] + step);
	}
	var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/xmlns\:/g, "~::~xmlns:").replace(/xmlns\=/g, "~::~xmlns=").split('~::~'),
	    len = ar.length,
	    inComment = false,
	    deep = 0,
	    str = '',
	    ix = 0;

	for (ix = 0; ix < len; ix++) {
		// start comment or <![CDATA[...]]> or <!DOCTYPE //
		if (ar[ix].search(/<!/) > -1) {
			str += shift[deep] + ar[ix];
			inComment = true;
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
				inComment = false;
			}
		} else
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
				// <elm></elm> //
				if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
					str += ar[ix];
					if (!inComment) deep--;
				} else
					// <elm> //
					if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
						str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
					} else
						// <elm>...</elm> //
						if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
							str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
						} else
							// </elm> //
							if (ar[ix].search(/<\//) > -1) {
								str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
							} else
								// <elm/> //
								if (ar[ix].search(/\/>/) > -1) {
									str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
								} else
									// <? xml ... ?> //
									if (ar[ix].search(/<\?/) > -1) {
										str += shift[deep] + ar[ix];
									} else
										// xmlns //
										if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
											str += shift[deep] + ar[ix];
										} else {
											str += ar[ix];
										}
	}

	return str[0] == '\n' ? str.slice(1) : str;
}
},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.render = render;

var _access = require("./access");

var _dom = require("./dom");

function same(node, vnode) {
	if (node === vnode) return true;
	if (node === undefined || vnode === undefined) return false;
	var inode = vnode.inode;
	if (node.nodeType !== vnode.type) return false;
	if (node["@@doc-depth"] !== inode._depth) return false;
	if (node.nodeValue !== null) {
		if (node.nodeValue !== vnode.value) return false;
	} else {
		if (vnode.value !== undefined) return false;
		if (node.nodeName !== (inode._name + '').toUpperCase()) return false;
		if (node.children.length !== inode.count()) return false;
		if (node.id && inode._attrs.get("id") !== node.id) return false;
		if (node.className && inode._attrs.get("class") !== node.className) return false;
	}
	return true;
}

function render(vnode, root) {
	// fixme stateless
	var parents = [{ domNode: root }];
	const attrFunc = (domNode, v, k) => (domNode.setAttribute(k, v), domNode);
	// ensure paths by calling iter
	var domNodes = (0, _dom.nodesList)(root);
	var i = 0;
	var skipDepth = 0,
	    append = false,
	    nextSame = false;
	var handleNode = function (node) {
		// TODO this won't work when pushed from server
		// we could diff an L3 buffer and update the tree (stateless)
		// perhaps it would be better to separate VNode and domNodes, but where to put the WeakMap?
		var type = node.type,
		    inode = node.inode,
		    domNode = node.domNode,
		    cur = domNodes[i],
		    next = domNodes[i + 1],
		    nn = (0, _access.nextNode)(node);
		var curSame = nextSame || same(cur, node);
		nextSame = same(next, nn);
		if (cur && curSame && nextSame) {
			// skip until next
			// console.log("same",cur,cur["@@doc-depth"],node.name,inode._depth);
			node.domNode = cur;
			skipDepth = cur["@@doc-depth"];
			if (type == 1) parents[inode._depth] = node;
		} else {
			if (cur) {
				if (cur["@@doc-depth"] == inode._depth - 1) {
					//console.log("append",cur);
					append = true;
				} else if (cur["@@doc-depth"] == inode._depth + 1) {
					// console.log("remove",cur);
					// don't remove text, it will be garbage collected
					if (cur.nodeType == 1) cur.parentNode.removeChild(cur);
					// remove from dom, retry this node
					// keep node untill everything is removed
					i++;
					return handleNode(node);
				} else {
					if (type == 1) {
						if (cur.nodeType != 17) cur.parentNode.removeChild(cur);
						// remove from dom, retry this node
						i++;
						return handleNode(node);
					} else if (type == 3) {
						// if we're updating a text node, we should be sure it's the same parent
						if (cur["@@doc-depth"] == skipDepth + 1) {
							cur.nodeValue = node.value;
						} else {
							append = true;
						}
					}
				}
			}
			if (!cur || append) {
				//console.log("empty",type, append)
				if (type == 1) {
					domNode = document.createElement(node.name);
					if (parents[inode._depth - 1]) parents[inode._depth - 1].domNode.appendChild(domNode);
					inode._attrs.reduce(attrFunc, domNode);
					parents[inode._depth] = node;
				} else if (type == 3) {
					domNode = document.createTextNode(node.value);
					parents[inode._depth - 1].domNode.appendChild(domNode);
				}
				node.domNode = domNode;
			}
		}
		if (!append) {
			i++;
		} else {
			append = false;
		}
	};
	(0, _access.iter)(vnode, handleNode);
	var l = domNodes.length;
	for (; --l >= i;) {
		var node = domNodes[l];
		if (node.nodeType == 1) node.parentNode.removeChild(node);
	}
}
},{"./access":2,"./dom":3}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.LazySeq = LazySeq;
function LazySeq(iterable) {
	this.iterable = iterable || [];
}

LazySeq.prototype.push = function (v) {
	return this.concat(v);
};

// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@append"] = LazySeq.prototype.push;

LazySeq.prototype.concat = function (...v) {
	return new LazySeq(this.iterable.concat(v));
};

LazySeq.prototype.get = function (index) {
	var i = 0;
	var iterable = this.iterable;
	var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : {
		next: function () {
			return { value: iterable, done: true };
		}
	};
	var next = iter.next();
	this.iterable = [];
	while (!next.done) {
		var v = next.value;
		this.iterable.push(v);
		if (i === index) {
			this.rest = iter;
			return v;
		}
		next = iter.next();
	}
};

LazySeq.prototype.toString = function () {
	return "[" + this.iterable + "]";
};
},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isIterable = isIterable;
exports.compose = compose;
exports.forEach$1 = forEach$1;
exports.filter$1 = filter$1;
exports.foldLeft$1 = foldLeft$1;
exports.forEach = forEach;
exports.filter = filter;
exports.foldLeft = foldLeft;
exports.transform = transform;
exports.into = into;
// very basic stuff, not really transducers but less code

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === 'function';
}

function compose(...funcs) {
  const l = funcs.length;
  return (v, i, iterable, z) => {
    for (var j = l; --j >= 0;) {
      let ret = funcs[j].call(null, v, i, iterable, z);
      // if it's a step, continue processing
      if (ret["@@step"]) {
        v = ret.v;
        z = ret.z;
      } else {
        z = ret;
      }
    }
    // append at the end
    return _append(z, v);
  };
}

/*
function _iterate(wrapped, z) {
  return function (iterable) {
    if (z === undefined) z = _new(iterable);
    var i = 0;
    // iterate anything
    var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
      next: function () {
        return { value: iterable, done: true };
      }
    };
    let next;
    while (next = iter.next(), !next.done) {
      let v = next.value;
      let ret = wrapped(v, i, iterable, z);
      if(ret["@@step"]) {
          z = _append(ret.z,ret.v);
      } else {
          z = ret;
      }
      //yield z;
      i++;
    }
    return z;
  };
}
*/
function _iterate(iterable, f, z) {
  if (z === undefined) z = _new(iterable);
  var i = 0;
  // iterate anything
  var iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
    next: function () {
      return { value: iterable, done: true };
    }
  };
  let next;
  while (next = iter.next(), !next.done) {
    let v = next.value;
    let ret = f(v, i, iterable, z);
    if (ret["@@step"]) {
      z = _append(ret.z, ret.v);
    } else {
      z = ret;
    }
    i++;
  }
  return z;
}

function _new(iterable) {
  return iterable.hasOwnProperty("@@empty") ? iterable["@@empty"]() : new iterable.constructor();
}

// memoized
function _append(iterable, appendee) {
  try {
    return iterable["@@append"](appendee);
  } catch (e) {
    try {
      let appended = iterable.push(appendee);
      // stateful stuff
      if (appended !== iterable) {
        iterable["@@append"] = appendee => {
          this.push(appendee);
          return this;
        };
        return iterable;
      }
      iterable["@@append"] = appendee => {
        return this.push(appendee);
      };
      return appended;
    } catch (e) {
      let appended = iterable.set(appendee[0], appendee[1]);
      // stateful stuff
      if (appended === iterable) {
        iterable["@@append"] = appendee => {
          this.set(appendee[0], appendee[1]);
          return this;
        };
        return iterable;
      }
      iterable["@@append"] = appendee => {
        return this.set(appendee[0], appendee[1]);
      };
      return appended;
      // badeet badeet bathatsallfolks!
      // if you want more generics, use a library
    }
  }
}

function step(z, v) {
  // we're going to process this further
  return {
    z: z,
    v: v,
    "@@step": true
  };
}

function forEach$1(f) {
  return function (v, i, iterable, z) {
    return step(z, f(v, i, iterable));
  };
}

function filter$1(f) {
  return function (v, i, iterable, z) {
    if (f(v, i, iterable)) {
      return step(z, v);
    }
    return z;
  };
}

function foldLeft$1(f, z) {
  return function (v, i, iterable, z) {
    return f(z, v, i, iterable);
  };
}

function forEach(iterable, f) {
  if (arguments.length == 1) return forEach$1(iterable);
  return _iterate(iterable, forEach$1(f), _new(iterable));
}

function filter(iterable, f) {
  if (arguments.length == 1) return filter$1(iterable);
  return _iterate(iterable, filter$1(f), _new(iterable));
}

function foldLeft(iterable, f, z) {
  return _iterate(iterable, foldLeft$1(f), z);
}

// FIXME always return a collection, iterate by overriding _append to just return the value
function transform(iterable, f) {
  return _iterate(iterable, f);
  //    return new Iterator(iterable, f);
}

function into(iterable, f, z) {
  return _iterate(iterable, f, z);
}

// TODO:
// add Take/Nth/dropWhile/Range
// rewindable/fastforwardable iterators

const DONE = {
  done: true
};

function Iterator(iterable, f, z) {
  this.iterable = iterable;
  // iterate anything
  this.iter = isIterable(iterable) ? iterable[Symbol.iterator]() : typeof iterable.next === "function" ? iterable : {
    next: function () {
      return { value: iterable, done: true };
    }
  };
  this.f = f;
  this.z = z === undefined ? _new(iterable) : z;
  this.i = 0;
}

Iterator.prototype.next = function () {
  let next = this.iter.next();
  if (next.done) return DONE;
  let v = next.value;
  let z = this.z;
  let ret = this.f(v, this.i, this.iterable, z);
  if (ret["@@step"]) {
    z = _append(ret.z, ret.v);
  } else {
    z = ret;
  }
  this.z = z;
  this.i++;
  return { value: this.z };
};

Iterator.prototype[Symbol.iterator] = function () {
  return this;
};
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Value = Value;
exports.VNode = VNode;
exports.Step = Step;
exports.emptyINode = emptyINode;
exports.restoreNode = restoreNode;
exports.emptyAttrMap = emptyAttrMap;
exports.map = map;
exports.elem = elem;
exports.text = text;
exports.document = document;
exports.ensureRoot = ensureRoot;

var _ohamt = require("ohamt");

var ohamt = _interopRequireWildcard(_ohamt);

var _rrbVector = require("rrb-vector");

var rrb = _interopRequireWildcard(_rrbVector);

var _pretty = require("./pretty");

var _transducers = require("./transducers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function Value(type, name, value, depth) {
	this._type = type;
	this._name = name;
	this._value = value;
	this._depth = depth;
}

Value.prototype.count = function () {
	return 0;
};

Value.prototype.size = 0;

Value.prototype.toString = function (root = true, json = false) {
	var str = this._value + "";
	if (this._type == 3 && json) return '"' + str + '"';
	return str;
};

function VNode(inode, type, name, value, parent, indexInParent) {
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.indexInParent = indexInParent;
	Object.defineProperty(this, "children", {
		"get": () => {
			return (0, _transducers.into)(this.inode, (0, _transducers.forEach)((c, i) => new VNode(c, c._type, c._name, c._value, this.inode)), []);
		}
	});
}

VNode.prototype.toString = function () {
	var root = ensureRoot(this);
	return root.inode.toString();
};

VNode.prototype.clone = function () {
	return new VNode(this.inode, this.type, this.name, this.value, this.parent, this.indexInParent);
};

function Step(inode, parent, indexInParent) {
	this.inode = inode;
	this.parent = parent;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this._depth + ", closes:" + this.parent.name + "}";
};

function emptyINode(type, name, depth, attrs) {
	var inode = type == 5 ? rrb.empty.beginMutation() : ohamt.make().beginMutation();
	inode._type = type;
	inode._name = name;
	inode._depth = depth;
	inode._attrs = attrs;
	return inode;
}

function restoreNode(next, node) {
	next._type = node._type;
	next._name = node._name;
	next._attrs = node._attrs;
	next._depth = node._depth;
	return next;
}

function emptyAttrMap() {
	return ohamt.empty.beginMutation();
}

function elemToString(e) {
	const attrFunc = (z, v, k) => {
		return z += " " + k + "=\"" + v + "\"";
	};
	let str = "<" + e._name;
	str = e._attrs.reduce(attrFunc, str);
	if (e._size) {
		str += ">";
		for (let c of e.values()) {
			str += c.toString(false);
		}
		str += "</" + e._name + ">";
	} else {
		str += "/>";
	}
	return str;
}

var OrderedMap = ohamt.empty.constructor;

OrderedMap.prototype.toString = function (root = true, json = false) {
	var str = "";
	var type = this._type;
	const docAttrFunc = (z, v, k) => z += k == "DOCTYPE" ? "<!" + k + " " + v + ">" : "<?" + k + " " + v + "?>";
	const objFunc = kv => "\"" + kv[0] + "\":" + kv[1].toString(false, true);
	if (type == 1) {
		str += elemToString(this);
	} else if (type == 3 || type == 12) {
		str += this.toString();
	} else if (type == 6) {
		str += "{";
		str += (0, _transducers.into)(this, (0, _transducers.forEach)(objFunc), []).join(",");
		str += "}";
	} else if (type == 9) {
		str = this._attrs.reduce(docAttrFunc, str);
		for (let c of this.values()) {
			str += c.toString(false);
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
};

var List = rrb.empty.constructor;

List.prototype.toString = function (root = true, json = false) {
	var str = "[";
	for (var i = 0, l = this.size; i < l;) {
		str += this.get(i).toString(false, true);
		i++;
		if (i < l) str += ",";
	}
	return str + "]";
};

function map(name, children) {}
/**
 * Create a provisional element VNode.
 * Once the VNode's inode function is called, the node is inserted into the parent at the specified index
 * @param  {[type]} name     [description]
 * @param  {[type]} children [description]
 * @return {[type]}          [description]
 */
function elem(name, children) {
	var node = new VNode(function (parent, ref) {
		var attrMap = ohamt.empty.beginMutation();
		let pinode = parent.inode;
		let inode = emptyINode(1, name, pinode._depth + 1, attrMap);
		node.inode = inode;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			if (child.type == 2) {
				attrMap = attrMap.set(child.name, child.value);
			} else {
				// this call will mutate me (node)!
				child = child.inode(node);
				//node.inode = restoreNode(child.parent, node.inode);
			}
		}
		node.inode = node.inode.endMutation();
		node.inode._attrs = attrMap.endMutation(true);
		// insert into the parent means: update all parents until we come to the root
		// but the parents of my parent will be updated elsewhere
		// we just mutate the parent, because it was either cloned or newly created
		if (ref !== undefined) {
			parent.inode = restoreNode(pinode.insertBefore([ref.name, ref.inode], [node.name, node.inode]), pinode);
		} else {
			// FIXME check the parent type
			parent.inode = restoreNode(pinode.push([node.name, node.inode]), pinode);
		}
		node.parent = parent;
		return node;
	}, 1, name);
	return node;
}

function text(value) {
	var node = new VNode(function (parent, insertIndex = -1) {
		let pinode = parent.inode;
		// reuse insertIndex here to create a named map entry
		let name = insertIndex > -1 ? insertIndex : pinode.count() + 1;
		node.name = name;
		node.inode = new Value(3, name, value, pinode._depth + 1);
		// we don't want to do checks here
		// we just need to call a function that will insert the node into the parent
		parent.inode = restoreNode(pinode.push([name, node.inode]), pinode);
		node.parent = parent;
		return node;
	}, 3, null, value);
	return node;
}

function document() {
	return new VNode(emptyINode(9, "#document", 0, ohamt.empty), 9, "#document");
}

function ensureRoot(node) {
	if (!node.inode) {
		let root = node.first();
		return new VNode(root, root._type, root._name, root._value, new VNode(node, node._type, node._name), 0);
	}
	if (typeof node.inode === "function") {
		node.inode(document());
		return node;
	}
	return node;
}
},{"./pretty":7,"./transducers":10,"ohamt":1,"rrb-vector":16}],12:[function(require,module,exports){
/**
 * FastIntegerCompression.js : a fast integer compression library in JavaScript.
 * (c) the authors
 * Licensed under the Apache License, Version 2.0.
 *
 *FastIntegerCompression
 * Simple usage :
 *  // var FastIntegerCompression = require("fastintcompression");// if you use node
 *  var array = [10,100000,65999,10,10,0,1,1,2000];
 *  var buf = FastIntegerCompression.compress(array);
 *  var back = FastIntegerCompression.uncompress(buf); // gets back [10,100000,65999,10,10,0,1,1,2000]
 *
 *
 * You can install the library under node with the command line
 *   npm install fastintcompression
 */
'use strict';


// you can provide an iterable
function FastIntegerCompression() {
}

function bytelog(val) {
  if (val < (1 << 7)) {
    return 1;
  } else if (val < (1 << 14)) {
    return 2;
  } else if (val < (1 << 21)) {
    return 3;
  } else if (val < (1 << 28)) {
    return 4;
  }
  return 5;
}

// compute how many bytes an array of integers would use once compressed
FastIntegerCompression.computeCompressedSizeInBytes = function(input) {
  var c = input.length;
  var answer = 0;
  for(var i = 0; i < c; i++) {
    answer += bytelog(input[i]);
  }
  return answer;
};


// compress an array of integers, return a compressed buffer (as an ArrayBuffer)
FastIntegerCompression.compress = function(input) {
  var c = input.length;
  var buf = new ArrayBuffer(FastIntegerCompression.computeCompressedSizeInBytes(input));
  var view   = new Int8Array(buf);
  var pos = 0
  for(var i = 0; i < c; i++) {
    var val = input[i];
    if (val < (1 << 7)) {
      view[pos++] = val ;
    } else if (val < (1 << 14)) {
      view[pos++] = (val & 0x7F) | 0x80;
      view[pos++] = val >>> 7;
    } else if (val < (1 << 21)) {
      view[pos++] = (val & 0x7F) | 0x80;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = val >>> 14;
    } else if (val < (1 << 28)) {
      view[pos++] = (val & 0x7F ) | 0x80 ;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 14) & 0x7F ) | 0x80;
      view[pos++] = val >>> 21;
    } else {
      view[pos++] = ( val & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 7) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 14) & 0x7F ) | 0x80;
      view[pos++] = ( (val >>> 21) & 0x7F ) | 0x80;
      view[pos++] = val >>> 28;
    }
  }
  return buf;
};

// from a compressed array of integers stored ArrayBuffer, compute the number of compressed integers by scanning the input
FastIntegerCompression.computeHowManyIntegers = function(input) {
  var view   = new UInt8Array(input);
  var c = view.length;
  var count = 0;
  for(var i = 0; i < c; i++) {
    count += (input[i]>>>7);
  }
  return c - count;
}

// uncompress an array of integer from an ArrayBuffer, return the array
FastIntegerCompression.uncompress = function(input) {
  var array = new Array()
  var inbyte = new Int8Array(input);
  var end = inbyte.length;
  var pos = 0;
  while (end > pos) {
        var c = inbyte[pos++];
        var v = c & 0x7F;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 7;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 14;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 21;
        if (c >= 0) {
          array.push(v)
          continue;
        }
        c = inbyte[pos++];
        v |= c << 28;
        array.push(v)
  }
  return array;
};



///////////////

module.exports = FastIntegerCompression;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.concatRoot = concatRoot;

var _const = require("./const");

var _util = require("./util");

function concatRoot(a, b, mutate) {
	var tuple = _concat(a, b, mutate);
	var a2 = tuple[0],
	    b2 = tuple[1];
	var a2Len = a2.length;
	var b2Len = b2.length;

	if (a2Len === 0) return b2;
	if (b2Len === 0) return a2;

	// Check if both nodes can be crunched together.
	if (a2Len + b2Len <= _const.M) {
		var a2Height = a2.height;
		var a2Sizes = a2.sizes;
		var b2Height = b2.height;
		var b2Sizes = b2.sizes;
		a2 = a2.concat(b2);
		a2.height = a2Height;
		a2.sizes = a2Sizes;
		// Adjust sizes
		if (a2Height > 0) {
			var len = (0, _util.length)(a2);
			for (var i = 0, l = b2Sizes.length; i < l; i++) {
				b2Sizes[i] += len;
			}
			a2.sizes = a2Sizes.concat(b2Sizes);
		}
		return a2;
	}

	if (a2.height > 0) {
		var toRemove = calcToRemove(a, b);
		if (toRemove > _const.E) {
			let tuple = shuffle(a2, b2, toRemove);
			a2 = tuple[0];
			b2 = tuple[1];
		}
	}

	return (0, _util.siblise)(a2, b2);
}

/**
 * Returns an array of two nodes; right and left. One node _may_ be empty.
 * @param {Node} a
 * @param {Node} b
 * @return {Array<Node>}
 * @private
 */
function _concat(a, b, mutate) {
	var aHeight = a.height;
	var bHeight = b.height;

	if (aHeight === 0 && bHeight === 0) {
		return [a, b];
	}

	if (aHeight !== 1 || bHeight !== 1) {
		if (aHeight === bHeight) {
			a = (0, _util.nodeCopy)(a, mutate);
			b = (0, _util.nodeCopy)(b, mutate);
			let tuple = _concat((0, _util.last)(a), (0, _util.first)(b), mutate);
			let a0 = tuple[0];
			let b0 = tuple[1];
			insertRight(a, a0);
			insertLeft(b, b0);
		} else if (aHeight > bHeight) {
			a = (0, _util.nodeCopy)(a, mutate);
			let tuple = _concat((0, _util.last)(a), b, mutate);
			let a0 = tuple[0];
			let b0 = tuple[1];
			insertRight(a, a0);
			b = (0, _util.parentise)(b0, b0.height + 1);
		} else {
			b = (0, _util.nodeCopy)(b, mutate);
			var tuple = _concat(a, (0, _util.first)(b), mutate);
			var left = tuple[0].length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, tuple[left]);
			a = (0, _util.parentise)(tuple[right], tuple[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.length === 0 || b.length === 0) {
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= _const.E) {
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for _concat. Replaces a child node at the side of the parent.
function insertRight(parent, node) {
	var index = parent.length - 1;
	parent[index] = node;
	parent.sizes[index] = (0, _util.length)(node) + (index > 0 ? parent.sizes[index - 1] : 0);
}

function insertLeft(parent, node) {
	var sizes = parent.sizes;

	if (node.length > 0) {
		parent[0] = node;
		sizes[0] = (0, _util.length)(node);

		var len = (0, _util.length)(parent[0]);
		for (let i = 1, l = sizes.length; l > i; i++) {
			sizes[i] = len = len += (0, _util.length)(parent[i]);
		}
	} else {
		parent.shift();
		for (let i = 1, l = sizes.length; l > i; i++) {
			sizes[i] = sizes[i] - sizes[0];
		}
		sizes.shift();
	}
}

/**
 * Returns an array of two balanced nodes.
 * @param {Node} a
 * @param {Node} b
 * @param {number} toRemove
 * @return {Array<Node>}
 */
function shuffle(a, b, toRemove) {
	var newA = allocate(a.height, Math.min(_const.M, a.length + b.length - toRemove));
	var newB = allocate(a.height, Math.max(0, newA.length - (a.length + b.length - toRemove)));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	let aLen = a.length;
	let either, fromA;
	let newALen = newA.length;
	while (fromA = read < aLen, either = fromA ? a[read] : b[read - aLen], either.length % _const.M === 0) {
		let fromNewA = read < newALen;
		if (fromNewA) {
			newA[read] = either;
		} else {
			newB[read - newALen] = either;
		}
		let size = fromNewA ? a.sizes[read] : b.sizes[read - newALen];
		if (!size) {
			size = newA.sizes[read - 1] + (0, _util.length)(either);
		}
		if (fromNewA) {
			newA.sizes[read] = size;
		} else {
			newB.sizes[read - newALen] = size;
		}
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = allocate(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.length > 0 ? 1 : 0) < toRemove && read - a.length < b.length) {
		// Find out the max possible items for copying.
		var source = getEither(a, b, read);
		var to = Math.min(_const.M - slot.length, source.length);

		// Copy and adjust size table.
		var height = slot.height,
		    sizes = height === 0 ? null : slot.sizes.slice(0);
		slot = slot.concat(source.slice(from, to));
		slot.height = height;
		if (slot.height > 0) {
			slot.sizes = sizes;
			var len = sizes.length;
			for (var i = len; i < len + to - from; i++) {
				sizes[i] = (0, _util.length)(slot[i]);
				sizes[i] += i > 0 ? slot.sizes[i - 1] : 0;
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.length <= to) {
			read++;
			from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.length === _const.M) {
			saveSlot(newA, newB, write, slot);
			slot = allocate(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.length > 0) {
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.length + b.length) {
		saveSlot(newA, newB, write, getEither(a, b, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Creates a node or leaf with a given length at their arrays for performance.
// Is only used by shuffle.
function allocate(height, length) {
	var node = new Array(length);
	node.height = height;
	if (height > 0) {
		node.sizes = new Array(length);
	}
	return node;
}

/**
 * helper for setting picking a slot between to nodes
 * @param {Node} aList - a non-leaf node
 * @param {Node} bList - a non-leaf node
 * @param {number} index
 * @param {Node} slot
 */
function saveSlot(aList, bList, index, slot) {
	setEither(aList, bList, index, slot);

	var isInFirst = index === 0 || index === aList.sizes.length;
	var len = isInFirst ? 0 : getEither(aList.sizes, bList.sizes, index - 1);

	setEither(aList.sizes, bList.sizes, index, len + (0, _util.length)(slot));
}

// getEither, setEither and saveSlot are helpers for accessing elements over two arrays.
function getEither(a, b, i) {
	return i < a.length ? a[i] : b[i - a.length];
}

function setEither(a, b, i, value) {
	if (i < a.length) {
		a[i] = value;
	} else {
		b[i - a.length] = value;
	}
}

/**
 * Returns the extra search steps for E. Refer to the paper.
 *
 * @param {Node} a - a non leaf node
 * @param {Node} b - a non leaf node
 * @return {number}
 */
function calcToRemove(a, b) {
	var subLengths = 0;
	subLengths += a.height === 0 ? 0 : sumOfLengths(a);
	subLengths += b.height === 0 ? 0 : sumOfLengths(b);

	return a.length + b.length - (Math.floor((subLengths - 1) / _const.M) + 1);
}

function sumOfLengths(table) {
	var sum = 0;
	var len = table.length;
	for (var i = 0; len > i; i++) sum += table[i].length;
	return sum;
}
},{"./const":14,"./util":17}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const B = exports.B = 5;
const M = exports.M = 1 << B;
const E = exports.E = 2;
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sliceRoot = sliceRoot;

var _util = require("./util");

function sliceRoot(list, from, to) {
	if (to === undefined) to = (0, _util.length)(list);
	return sliceLeft(from, sliceRight(to, list));
}

function sliceLeft(from, list) {
	if (from === 0) return list;

	// Handle leaf level.
	if ((0, _util.isLeaf)(list)) {
		var node = list.slice(from, list.length + 1);
		node.height = 0;
		return node;
	}

	// Slice the left recursively.
	var left = (0, _util.getSlot)(from, list);
	var sliced = sliceLeft(from - (left > 0 ? list.sizes[left - 1] : 0), list[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === list.length - 1) {
		// elevate!
		return sliced.height < list.height ? (0, _util.parentise)(sliced, list.height) : sliced;
	}

	// Create new node.
	var tbl = list.slice(left, list.length + 1);
	tbl[0] = sliced;
	var sizes = new Array(list.length - left);
	var len = 0;
	for (var i = 0; i < tbl.length; i++) {
		len += (0, _util.length)(tbl[i]);
		sizes[i] = len;
	}
	tbl.height = list.height;
	tbl.sizes = sizes;
	return tbl;
}

function sliceRight(to, list) {
	if (to === (0, _util.length)(list)) return list;

	// Handle leaf level.
	if ((0, _util.isLeaf)(list)) {
		let node = list.slice(0, to);
		node.height = 0;
		return node;
	}

	// Slice the right recursively.
	var right = (0, _util.getSlot)(to, list);
	var sliced = sliceRight(to - (right > 0 ? list.sizes[right - 1] : 0), list[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0) return sliced;

	// Create new node.
	var sizes = list.sizes.slice(0, right);
	var tbl = list.slice(0, right);
	if (sliced.length > 0) {
		tbl[right] = sliced;
		sizes[right] = (0, _util.length)(sliced) + (right > 0 ? sizes[right - 1] : 0);
	}
	tbl.height = list.height;
	tbl.sizes = sizes;
	return tbl;
}
},{"./util":17}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.empty = undefined;
exports.Tree = Tree;
exports.push = push;
exports.get = get;
exports.set = set;
exports.concat = concat;
exports.slice = slice;
exports.toArray = toArray;
exports.fromArray = fromArray;

var _const = require("./const");

var _util = require("./util");

var _concat = require("./concat");

var _slice = require("./slice");

// TODO pvec interop. transients.

const EMPTY_LEAF = [];
EMPTY_LEAF.height = 0;

function Tree(size, root, tail, editable) {
	this.size = size;
	this.root = root;
	this.tail = tail;
	this.editable = editable;
}

const EMPTY = new Tree(0, null, EMPTY_LEAF, false);

const canEditNode = (edit, node) => edit === node.edit;

function push(tree, val) {
	if (tree.tail.length < _const.M) {
		// push to tail
		let newTail = (0, _util.createLeafFrom)(tree.tail, tree.editable);
		newTail.push(val);
		tree.size++;
		if (!tree.editable) return new Tree(tree.size, tree.root, newTail);
		tree.tail = newTail;
		return tree;
	}
	// else push to root if space
	// else create new root
	let newTail = [val];
	newTail.height = 0;
	let newRoot = tree.root ? (0, _util.sinkTailIfSpace)(tree.tail, tree.root, tree.editable) || (0, _util.siblise)(tree.root, (0, _util.parentise)(tree.tail, tree.root.height)) : (0, _util.parentise)(tree.tail, 1);
	tree.size++;
	if (!tree.editable) return new Tree(tree.size, newRoot, newTail);
	tree.root = newRoot;
	tree.tail = newTail;
	return tree;
}

// Gets the value at index i recursively.
function get(tree, i) {
	if (i < 0 || i >= tree.size) {
		throw new Error('Index ' + i + ' is out of range');
	}
	var offset = (0, _util.tailOffset)(tree);
	if (i >= offset) {
		return tree.tail[i - offset];
	}
	return (0, _util.getRoot)(i, tree.root);
}

// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(tree, i, item) {
	var len = tree.size;
	if (i < 0 || len < i) {
		throw new Error("Index " + i + " out of range!");
	}
	if (i === len) return push(tree, item);
	var offset = (0, _util.tailOffset)(tree);
	if (i >= offset) {
		var newTail = (0, _util.createLeafFrom)(tree.tail, tree.editable);
		newTail[i - offset] = item;
		if (!tree.editable) return new Tree(tree.size, tree.root, newTail);
		tree.tail = newTail;
		return tree;
	}
	var newRoot = (0, _util.setRoot)(i, item, tree.root, tree.editable);
	if (!tree.editable) return new Tree(tree.size, newRoot, tree.tail);
	tree.root = newRoot;
	return tree;
}

/**
 * join to lists together(concat)
 *
 * @param {Node} a
 * @param {Node} b
 * @return {Node}
 */
function concat(a, b) {
	var aLen = a.size;
	var bLen = b.size;
	var newLen = aLen + bLen;

	if (aLen === 0) return b;
	if (bLen === 0) return a;

	if (!a.root || !b.root) {
		if (aLen + bLen <= _const.M) {
			let newTail = a.tail.concat(b.tail);
			newTail.height = 0;
			if (!a.editable) return new Tree(newLen, null, newTail);
			a.size = newLen;
			a.root = null;
			a.tail = newTail;
			return a;
		}
		if (!a.root && !b.root) {
			// newTail will overflow, but newRoot can't be over M
			let newRoot = a.tail.concat(b.tail.slice(0, _const.M - aLen));
			newRoot.height = 0;
			let newTail = b.tail.slice(_const.M - aLen);
			newTail.height = 0;
			if (!a.editable) return new Tree(newLen, newRoot, newTail);
			a.size = newLen;
			a.root = newRoot;
			a.tail = newTail;
			return a;
		}
		// else either a has a root or b does
		if (!b.root) {
			// b has no root
			let aTailLen = a.tail.length;
			let bTailLen = b.tail.length;
			// size left over in last root node in a
			let rightCut = _const.M - aTailLen;
			// create a new tail by concatting b until cut
			let newTail = a.tail.concat(b.tail.slice(0, rightCut));
			newTail.height = 0;
			let newRoot;
			// if tail would overflow, sink it and make leftover newTail
			if (aTailLen + bTailLen > _const.M) {
				newRoot = (0, _util.sinkTailIfSpace)(newTail, a.root, a.editable);
				newTail = b.tail.slice(rightCut);
				newTail.height = 0;
			} else {
				newRoot = a.root.slice(0);
				newRoot.sizes = a.root.sizes.slice(0);
				newRoot.height = a.root.height;
			}
			if (!a.editable) return new Tree(newLen, newRoot, newTail);
			a.size = newLen;
			a.root = newRoot;
			a.tail = newTail;
			return a;
		}
		// else a has no root
		// make a.tail a.root and concat b.root
		let newRoot = (0, _concat.concatRoot)((0, _util.parentise)(a.tail, 1), b.root, a.editable);
		let newTail = (0, _util.createLeafFrom)(b.tail, a.editable);
		if (!a.editable) return new Tree(newLen, newRoot, newTail);
		a.size = newLen;
		a.root = newRoot;
		a.tail = newTail;
		return a;
	} else {
		// both a and b have roots
		// if have a.tail, just sink a.tail and make b.tail new tail...
		let aRoot = a.tail.length === 0 ? a.root : (0, _util.sinkTailIfSpace)(a.tail, a.root, a.editable) || (0, _util.siblise)(a.root, (0, _util.parentise)(a.tail, a.root.height));
		let newRoot = (0, _concat.concatRoot)(aRoot, b.root, a.editable);
		let newTail = (0, _util.createLeafFrom)(b.tail, a.editable);
		if (!a.editable) return new Tree(newLen, newRoot, newTail);
		a.size = newLen;
		a.root = newRoot;
		a.tail = newTail;
		return a;
	}
}

/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param from
 * @param to
 * @param list
 */
function slice(tree, from, to) {
	var max = tree.size;

	if (to === undefined) to = max;

	if (from >= max) {
		return EMPTY;
	}

	if (to > max) {
		to = max;
	}
	//invert negative numbers
	function confine(i) {
		return i < 0 ? i + max : i;
	}
	from = confine(from);
	to = confine(to);
	var offset = (0, _util.tailOffset)(tree);var newRoot, newTail;
	if (from >= offset) {
		newRoot = null;
		newTail = tree.tail.slice(from - offset, to - offset);
	} else if (to <= offset) {
		newRoot = (0, _slice.sliceRoot)(tree.root, from, to);
		newTail = [];
	} else {
		newRoot = (0, _slice.sliceRoot)(tree.root, from, offset);
		newTail = tree.tail.slice(0, to - offset);
	}
	newTail.height = 0;
	return new Tree(to - from, newRoot, newTail);
}

// Converts an array into a list.
function toArray(tree) {
	var out = [];
	if (tree.root) {
		rootToArray(tree.root, out);
	}
	return out.concat(tree.tail);
}
function fromArray(jsArray) {
	var len = jsArray.length;
	if (len === 0) return EMPTY;

	return _fromArray(jsArray, Math.floor(Math.log(len) / Math.log(_const.M)), 0, len);

	function _fromArray(jsArray, h, from, to) {
		if (h === 0) {
			var node = (0, _slice.sliceRoot)((0, _util.createLeafFrom)(jsArray), from, to);
			node.height = 0;
			return node;
		}

		var step = Math.pow(_const.M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			//todo: trampoline?
			table[i] = _fromArray(jsArray, h - 1, from + i * step, Math.min(from + (i + 1) * step, to));
			lengths[i] = (0, _util.length)(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		table.height = h;
		table.sizes = lengths;
		return table;
	}
}

exports.empty = EMPTY;


Tree.prototype.push = function (val) {
	return push(this, val);
};

Tree.prototype.pop = function () {
	return slice(this, 0, this.size - 1);
};

Tree.prototype.get = function (i) {
	return get(this, i);
};

Tree.prototype.set = function (i, val) {
	return set(this, i, val);
};

Tree.prototype.concat = function (other) {
	return concat(this, other);
};

Tree.prototype.slice = function (from, to) {
	return slice(this, from, to);
};

Tree.prototype.beginMutation = function () {
	return new Tree(this.size, this.root, this.tail, true);
};

Tree.prototype.endMutation = function () {
	this.editable = false;
	return this;
};

Tree.prototype.count = function () {
	return this.size;
};

Tree.prototype.first = function () {
	return this.get(0);
};

Tree.prototype.next = function (idx) {
	return this.get(idx + 1);
};
},{"./concat":13,"./const":14,"./slice":15,"./util":17}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createRoot = createRoot;
exports.nodeCopy = nodeCopy;
exports.createLeafFrom = createLeafFrom;
exports.tailOffset = tailOffset;
exports.sinkTailIfSpace = sinkTailIfSpace;
exports.getRoot = getRoot;
exports.setRoot = setRoot;
exports.parentise = parentise;
exports.siblise = siblise;
exports.last = last;
exports.first = first;
exports.isLeaf = isLeaf;
exports.length = length;
exports.getSlot = getSlot;
exports.rootToArray = rootToArray;

var _const = require("./const");

// Helper functions
function createRoot(tail) {
	let list = [tail];
	list.height = 1;
	list.sizes = [tail.length];
	return list;
}

function nodeCopy(list, mutate) {
	var height = list.height;
	if (height === 0) return createLeafFrom(list);
	if (mutate) return list;
	var sizes = list.sizes.slice(0);
	list = list.slice(0);
	list.height = height;
	list.sizes = sizes;
	return list;
}

function createLeafFrom(list) {
	list = list.slice(0);
	list.height = 0;
	return list;
}

function tailOffset(tree) {
	return tree.root ? length(tree.root) : 0;
}

function sinkTailIfSpace(tail, list, mutate) {
	// Handle resursion stop at leaf level.
	var newA,
	    tailLen = tail.length;
	if (list.height == 1) {
		if (list.length < _const.M) {
			newA = nodeCopy(list, mutate);
			newA.push(tail);
			newA.sizes.push(last(newA.sizes) + tail.length);
			return newA;
		} else {
			return null;
		}
	}

	// Recursively push
	var pushed = sinkTailIfSpace(tail, last(list), mutate);

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null) {
		newA = nodeCopy(list);
		newA[newA.length - 1] = pushed;
		newA.sizes[newA.sizes.length - 1] += tailLen;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (list.length < _const.M) {
		var newSlot = parentise(tail, list.height - 1);
		newA = nodeCopy(list, mutate);
		newA.push(newSlot);
		newA.sizes.push(last(newA.sizes) + length(newSlot));
		return newA;
	} else {
		return null;
	}
}

// Calculates in which slot the item probably is, then
// find the exact slot in the sizes. Returns the index.
function getRoot(i, list) {
	for (var x = list.height; x > 0; x--) {
		var slot = i >> x * _const.B;
		while (list.sizes[slot] <= i) {
			slot++;
		}
		if (slot > 0) {
			i -= list.sizes[slot - 1];
		}
		list = list[slot];
	}
	return list[i];
}

function setRoot(i, item, list, mutate) {
	var len = length(list);
	list = nodeCopy(list, mutate);
	if (isLeaf(list)) {
		list[i] = item;
	} else {
		var slot = getSlot(i, list);
		if (slot > 0) {
			i -= list.sizes[slot - 1];
		}
		list[slot] = setRoot(i, item, list[slot], mutate);
	}
	return list;
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, height) {
	if (height == tree.height) {
		return tree;
	} else {
		var list = [parentise(tree, height - 1)];
		list.height = height;
		list.sizes = [length(tree)];
		return list;
	}
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b) {
	var list = [a, b];
	list.height = a.height + 1;
	list.sizes = [length(a), length(a) + length(b)];
	return list;
}

function last(list) {
	return list[list.length - 1];
}

function first(a) {
	return a[0];
}

// determine if this is a leaf vs container node
function isLeaf(node) {
	return node.height === 0;
}

// get the # of elements in a rrb list
function length(list) {
	return isLeaf(list) ? list.length : last(list.sizes);
}

function getSlot(i, list) {
	var slot = i >> _const.B * list.height;
	while (list.sizes[slot] <= i) {
		slot++;
	}
	return slot;
}

function rootToArray(a, out = []) {
	for (var i = 0; i < a.length; i++) {
		if (a.height === 0) {
			out.push(a[i]);
		} else {
			rootToArray(a[i], out);
		}
	}
	return out;
}
},{"./const":14}]},{},[4])(4)
});