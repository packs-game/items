var express = require('express');
var lib = require('packs-lib');

var app = express();

var bodyParser = require('body-parser');
var crossDomain = lib.crossDomain;

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.use(crossDomain);

module.exports = app;