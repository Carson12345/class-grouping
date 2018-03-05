var express = require('express');
var router = express.Router();
var app = express();
var User = require('../models/user');
var CM = require('../models/course_material');
var Discussion = require('../models/discussion');
var nunjucks = require( 'nunjucks' );
var PATH_TO_TEMPLATES = '../view/' ;
var path = require("path");

var
  
  url = require('url'),
  fs = require('fs'),
  path = require('path'),
  quizzer = require('node-quizzer'),
  _ = require('underscore-node'),
  getQuiz = function(method, req) {
    var urlParts = url.parse(req.url, true),
      query = urlParts.query,

      // generate random quiz
      quiz = quizzer[method]({
        uname: query.fullname,
        uemail: query.email,
        name: query.quiz,
        count: parseInt(query.count),
        time: parseInt(query.time),
        perc: parseInt(query.perc)
      });
    return quiz;
  };



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
  return res.render(path.resolve(__dirname, '../view/login.html')) ;
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
req.body.passwordConf&&
req.body.role) {

var userData = {
email: req.body.email,
username: req.body.username,
password: req.body.password,
passwordConf: req.body.passwordConf,
curriculum: req.body.curriculum,
role:req.body.role
}


User.create(userData, function (error, user) {
if (error) {
return next(error);
} else {
req.session.userId = user._id;

if (user.role == 'teacher') {
  return res.redirect('/profile_teacher');
} else {
  return res.redirect('/profile_student');
}

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
if (user.role == 'teacher') {
  return res.redirect('/profile_teacher');
} else {
  return res.redirect('/profile_student');
}
}
});
} else {
var err = new Error('All fields required.');
err.status = 400;
return next(err);
}
})

// GET route after registering
router.get('/profile_student', function (req, res, next) {

User.find().exec(function (error, user) {
//console.log(user);
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
var data = {
users: user,
} ;
return res.render(path.resolve(__dirname, '../view/profile_student.html'), data ) ;
}
}
});
});

// GET route after registering
router.get('/profile_teacher', function (req, res, next) {

  User.find().exec(function (error, user) {
  //console.log(user);
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
  var data = {
  users: user,
  } ;
  //console.log(data)
  return res.render(path.resolve(__dirname, '../view/profile_teacher.html'), data ) ;
  }
  }
  });
  });


// GET route for showing all
router.get('/list_student', function (req, res, next) {

User.find({role:"student"}).exec(function (error, user) {

var groupSize = 3;
var maxNumberOfGroups = Math.floor(user.length/groupSize);
var noOfUsers = user.length;
var finalArr = shuffle(user);
var Groups = [];

//create groups
for (var i=0; i<maxNumberOfGroups; i++) {
Groups[i] = new Array ();
}

//var fulled = false;
var sorted = [];
var leftBehind = [];

for (var i=0; i<noOfUsers; i++) {
for (var y=0; y<maxNumberOfGroups; y++) {
if(!Groups[y].some( e => e['curriculum'] === finalArr[i].curriculum) && Groups[y].length < groupSize ) {
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

var data = {
groups: Groups,
} ;

return res.render(path.resolve(__dirname, '../view/showGrouping_student.html'), data ) ;
}
);
});

// GET route for showing all
router.get('/list_teacher', function (req, res, next) {

  User.find({role:"student"}).exec(function (error, user) {
  
  var groupSize = 3;
  var maxNumberOfGroups = Math.floor(user.length/groupSize);
  var noOfUsers = user.length;
  var finalArr = shuffle(user);
  var Groups = [];
  
  //create groups
  for (var i=0; i<maxNumberOfGroups; i++) {
  Groups[i] = new Array ();
  }
  
  //var fulled = false;
  var sorted = [];
  var leftBehind = [];
  
  for (var i=0; i<noOfUsers; i++) {
  for (var y=0; y<maxNumberOfGroups; y++) {
  if(!Groups[y].some( e => e['curriculum'] === finalArr[i].curriculum) && Groups[y].length < groupSize ) {
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
  
  var data = {
  groups: Groups,
  } ;

  console.log(Groups);
  
  return res.render(path.resolve(__dirname, '../view/showGrouping_teacher.html'), data ) ;
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

// Get for course material
router.get('/coursematerial_student', function (req, res, next) {
  CM.find({}, function(err, cms) {
    if (err) throw err;
    var c_m = cms;
  var data = {
    c_material: c_m,
    } ;
  //console.log(c_material);
return res.render(path.resolve(__dirname, '../view/course_material_student.html'),data ) ;
  });
});

router.get('/coursematerial_teacher', function (req, res, next) {
  CM.find({}, function(err, cms) {
    if (err) throw err;
    var c_m = cms;
  var data = {
    c_material: c_m,
    } ;
  //console.log(c_material);
return res.render(path.resolve(__dirname, '../view/course_material_teacher.html'),data ) ;
  });
});


//POST route for updating data
router.post('/coursematerial_teacher', function (req, res, next) {

if (req.body.title &&
req.body.content ) {

var material = CM({
title: req.body.title,
content: req.body.content,
});

material.save(function(){
  return res.redirect('/coursematerial_teacher');
  console.log('material saved');
});

}
});

router.get('/delete', function (req, res, next) {
  CM.find().exec(function (error, user) {} );

  CM.findOneAndRemove({}, function(err) {
    
    return res.redirect('/profile') ;
  });
});

router.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(path.resolve(__dirname, '../download/'+req.files.sampleFile.name), function(err) {
    if (err)
      return res.status(500).send(err);
     
    res.send('File uploaded!');
    console.log(req.files.sampleFile);
  });
});


router.get('/download', function(req, res){
  var file = path.resolve(__dirname, '../download/jjj.jpg');
  res.download(file); // Set disposition and send it.
});


router.post('/forum_teacher', function (req, res, next) {
  if (req.body.question) {
    console.log('gggggg');
  var material = Discussion({
  question: req.body.question
  
  });
  
  material.save(function(){
    return res.redirect('/profile_teacher');
    console.log('material saved');
  });
  
  }
  });

  router.post('/forum_student', function (req, res, next) {
    
    if (req.body.group && req.body.content) {
    console.log('yes i love u');
    var material = Discussion({
    group: req.body.group,
    content: req.body.content
    });
    
    material.save(function(){
      return res.redirect('/forum_student');
    });
    
    }
    });
  


router.get('/forum_teacher', function (req, res, next) {
  Discussion.find({}, function(err, discussions) {
    if (err) throw err;
    var dcs = discussions;
  var data = {
    discussion: dcs,
    } ;
  //console.log(c_material);
return res.render(path.resolve(__dirname, '../view/forum_teacher.html'),data ) ;
  });
});

router.get('/forum_student', function (req, res, next) {
  Discussion.find({}, function(err, discussions) {
    if (err) throw err;
    var dcs = discussions;
  var data = {
    discussion: dcs,
    } ;
  //console.log(c_material);
return res.render(path.resolve(__dirname, '../view/forum_student.html'),data ) ;
  });
});


///////////////////////////////////////////////////////////////////



router.get('/quizIndex', function(req, res) {
  var list = quizzer.getCategories();

  // load the index.html template
  fs.readFile(path.resolve(__dirname, '../view/index_Q.html'), function(err, data) {
    if(err) throw err;
    
    // populate it with templated questions from the node-quizzer module
    var compiled = _.template(data.toString());
    res.send(compiled({ availableQuizzes: list }));
  });
});


router.get('/quiz', function(req, res) {
  var quiz = getQuiz('generate', req);

  // load the quiz.html template
  fs.readFile(path.resolve(__dirname, '../view/quiz.html'), function(err, data) {
    if(err) throw err;

    // populate it with templated questions from the node-quizzer module
    var compiled = _.template(data.toString());
    res.send(compiled({ quiz: quiz }));
  });
});

router.get('/tokenize', function(req, res) {
  var quiz = getQuiz('tokenize', req),
    tokenUrl = req.protocol + '://' + req.get('host') + "/quiz/" + quiz.quid;

  res.set('Content-Type', 'text/plain');
  res.send(tokenUrl);
});

router.get('/quiz/:id', function(req, res) {
  var quiz = quizzer.fromToken(req.params.id);

  // load the quiz.html template
  if(quiz) {
    fs.readFile(path.resolve(__dirname, '../view/quiz.html'), function(err, data) {
      if(err) throw err;

      // populate it with templated questions from the node-quizzer module
      var compiled = _.template(data.toString());
      res.send(compiled({ quiz: quiz }));
    });
  } else {
    res.send("This token has expired!");
  }
})

router.get('/review', function(req, res) {
  var urlParts = url.parse(req.url, true),
    query = urlParts.query,
    results = quizzer.evaluate(query);

  // load the review.html template
  fs.readFile(path.resolve(__dirname, '../view/review.html'), function(err, data) {
    if(err) throw err;

    // populate it with templated questions from the node-quizzer module
    var compiled = _.template(data.toString());
    res.send(compiled({ results: results }));
  });
});







module.exports = router;
