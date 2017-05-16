var n = require("../lib/index");
var c = require("fastintcompression");
const ups = require("./mine/ups");

var env = ups.create_env(__dirname + "\\test.db");
var db = ups.create_db(env,1);

var ref = require("ref");
var l3 = n.toL3(n.parse(`<persoon id="243">
  <voornaam>Wouter</voornaam>
  <achternaam>Hager</achternaam>
  <beroep>programmeur</beroep>
</persoon>`));

console.log(c.compress(l3));
