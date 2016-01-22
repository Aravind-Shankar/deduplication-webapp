'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'images/'});
var util = require('util');
var spawn = require('child_process').spawnSync;
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/'));

var BIN_PATH = 'bin/dedupe';
function runProgram(image1Path, image2Path) {
	var result = spawn(BIN_PATH, [image1Path, image2Path]);
	return result.stdout.toString();
}

var upFields = upload.fields([{name: "image1"}, {name: "image2"}]);
app.post('/', upFields, function(req, res) {
	// req.files.image1[0] has image 1, and similarly for image 2 (image2[0]).

	// var output = runProgram(req.files.image1[0].path, req.files.image2[0].path);

	// by default res.render() looks into the 'views' folder
	res.render('index', function(err, html) {
		if (err) {
			res.end(err.message);
			return;
		}
		res.send(html);
	});
});

app.get('/', function(req, res) {
	res.render('index');
});

app.listen(8080, function() {
  	console.log('Server running at http://localhost:8080/');
});