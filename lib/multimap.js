"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = multimap;

function MultiMap() {
  this._buckets = {};
  this._size = 0;
  this.__is_MultiMap = true;
}

MultiMap.prototype.push = function (entry) {
  var key = entry[0];
  var bucket = this._buckets[key];
  entry[2] = this._size++;

  if (bucket && bucket.__is_Bucket) {
    bucket.push(entry);
  } else {
    this._buckets[key] = new Bucket(entry);
  }

  return this;
};

MultiMap.prototype.get = function (key) {
  var bucket = this._buckets[key];

  if (bucket && bucket.__is_Bucket) {
    var vals = bucket._values,
        len = vals.length;
    if (len === 0) return;
    if (len == 1) return vals[0][1]; // TODO fix order if needed

    var out = new Array(len);

    for (var i = 0; i < len; i++) out[i] = vals[i][1];

    return out;
  }
};

MultiMap.prototype.keys = function () {
  // retain key types
  var keys = [];

  for (var i = 0, l = this._buckets.length; i < l; i++) {
    keys[i] = this._buckets[i][0];
  }

  return keys;
};

function Bucket(val) {
  this._values = [val];
  this.__is_Bucket = true;
}

Bucket.prototype.push = function (val) {
  this._values.push(val);

  return this;
};

function multimap() {
  return new MultiMap();
}
//# sourceMappingURL=multimap.js.map