var express = require('express');
var router = express.Router();
var app = express();
var User = require('../models/user');
var nunjucks = require( 'nunjucks' );
var PATH_TO_TEMPLATES = '../templateLogReg/' ;
var path = require("path");




function arr_diff (a1, a2) {

  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }

  for (var k in a) {
      diff.push(k);
  }

  return diff;
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passwordConf: req.body.passwordConf,
      curriculum: req.body.curriculum
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
router.get('/profile', function (req, res, next) {

  User.find().exec(function (error, user) {
    console.log(user);
  }
  );
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET route for showing all
router.get('/list', function (req, res, next) {

  User.find().exec(function (error, user) {

    var groupSize = 3;
    var maxNumberOfGroups = Math.floor(user.length/groupSize);
    var noOfUsers = user.length;
    var finalArr = shuffle(user);
    var Groups = [];

    //create groups
    for (var i=0; i<maxNumberOfGroups; i++) {
      Groups[i] = new Array (); 
    }

    var fulled = false;
    var sorted = [];
    var leftBehind = [];

    for (var i=0; i<noOfUsers; i++) {
      for (var y=0; y<maxNumberOfGroups; y++) {
          if(!Groups[y].some( e => e['curriculum'] === finalArr[i].curriculum) && !Groups[y].some( e => e['email'] === finalArr[i].email) && Groups[y].length < groupSize ) {
            Groups[y].push(finalArr[i]);
            break;
          }
      }
    }

    //merge arrays
    for (var i=0; i<maxNumberOfGroups; i++) {
      sorted = sorted.concat(Groups[i]);
    }

    leftBehind = finalArr.filter(x => !sorted.includes(x));

    Groups[Groups.length - 1] = Groups[Groups.length - 1].concat(leftBehind);
    //return res.send(Groups);

    var data = {
      groups: Groups,
    } ;
    return res.render(path.resolve(__dirname, '../templateLogReg/showGrouping.html'), data ) ;
  }
  );
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;


