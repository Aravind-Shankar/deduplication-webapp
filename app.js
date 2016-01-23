'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'images/'});
var util = require('util');
var spawn = require('child_process').spawnSync;
var fs = require('fs');
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
	var image1Path, image2Path;
	var uploaded;
	// check if this came from sample images or image upload
	// sample images will have a 'sampleImage1' member
	if (Object.prototype.hasOwnProperty.call(req.body, 'sampleImage1')) {
		// sample image; just get the paths from 'req.body' itself
		uploaded = false;
		image1Path = req.body.sampleImage1.toString();
		image2Path = req.body.sampleImage2.toString();
	}
	else {
		// files uploaded; get paths from 'req.files'
		// req.files.image1[0] has image 1, and similarly for image 2 (image2[0]).
		uploaded = true;
		image1Path = req.files.image1[0].path;
		image2Path = req.files.image2[0].path;
	}

	var output = runProgram(image1Path, image2Path).split(" ");
	var distance = parseInt(output[0]);
	var thresh = parseInt(output[1]);
	var areDupes = (distance < thresh);

	// if files uploaded, delete them
	if (uploaded === true) {
		fs.unlink(image1Path);
		fs.unlink(image2Path);
	}

	// by default res.render() looks into the 'views' folder
	res.render('index', {posted: true, distance: distance, thresh: thresh, areDupes: areDupes});
});

app.get('/', function(req, res) {
	res.render('index', {posted: false});
});

var PORT_NUMBER = 8080;
app.listen(PORT_NUMBER, function() {
  	console.log('Server running at http://localhost:' + PORT_NUMBER + '/');
});