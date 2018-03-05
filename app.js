var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var nunjucks = require( 'nunjucks' ) ;
var PATH_TO_TEMPLATES = '.' ;
const fileUpload = require('express-fileupload');
var mongo = require('mongodb');
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

nunjucks.configure( PATH_TO_TEMPLATES, {
    autoescape: true,
    express: app
});


//connect to MongoDB
mongoose.connect('mongodb://learningsystem:123@ds123258.mlab.com:23258/class');
var db = mongoose.connection;



//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});


//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// serve static files from template
app.use(express.static(__dirname + '/view'));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


// listen on port 3000
app.listen(process.env.PORT || 3000, function(){
  console.log('Express app listening on port 3000');
});

