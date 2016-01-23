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
	console.log('in post request');
	var image1Path, image2Path;
	// check if this came from sample images or image upload
	// sample images will have a 'sampleImage1' member
	if (req.body.hasOwnProperty('sampleImage1')) {
		// sample image; just get the paths from 'req.body' itself
		image1Path = req.body.sampleImage1.toString();
		image2Path = req.body.sampleImage2.toString();
	}
	else {
		// files uploaded; get paths from 'req.files'
		// req.files.image1[0] has image 1, and similarly for image 2 (image2[0]).
		image1Path = req.files.image1[0].path;
		image2Path = req.files.image2[0].path;
	}

	var output = runProgram(image1Path, image2Path);
	res.end(output);
	// by default res.render() looks into the 'views' folder
	/*res.render('index', function(err, html) {
		if (err) {
			res.end(err.message);
			return;
		}
		res.send(html);
	});*/
});

/*app.post('/', function(req, res) {
	console.log('in plain post request');
	res.render('index');
});*/

app.get('/', function(req, res) {
	res.render('index');
});

var PORT_NUMBER = 8080;
app.listen(PORT_NUMBER, function() {
  	console.log('Server running at http://localhost:' + PORT_NUMBER + '/');
});