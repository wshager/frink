const http = require('http');
const fs = require("fs");
const port = 8000;

var express = require('express');
var app = express();
app.use(express.static(__dirname+"/.."));

app.listen(port, function () {
  console.log('Web server listening on port '+port);
});
