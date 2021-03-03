/*
CSC3916 HW 2
File: server.js
Desctiption: Web API scaffolding for movie API
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
db = require('./db')(); //Hacky
var jwt = require('jsonwebtoken');
var cors = require('cors');
var authController = require("./auth");
var authJwtController = require("./auth_jwt");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(passport.initialize());

var router = express.Router();


function getJSONObjectForMovieRequirement(req, message) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body",
        query: req.url,
        method: req.method,
        message: message
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'})
    }
});

router.post('/signin', function (req, res) {
    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
        if (req.body.password == user.password) {
            var userToken = { id: user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json ({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed.'});
        }
    }
});

router.route('/movie')

    .delete(authController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req, "Movie Deleted");
            res.json(o);

        }
    )
    .post(function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req,"Movie Saved");
            res.json(o);
        }
    )
    .get(function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req, "Get Movie");
            res.json(o);
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObjectForMovieRequirement(req,"Movie Updated");
            res.json(o);
        }
    )
    .all(function(req, res) {
        res = res.status(400);
        var o = {"Error": "Method is not supported."}
        res.json(o)
        }
    );

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only

