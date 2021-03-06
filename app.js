var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog')
var multer = require('multer');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mime = require('mime');


// setup for process.env variables
// if there are no process.env variables on server setup(i.e you are running localy) for username and password
// import it from local env.js file
 if(!process.env.MONGOLAB_USERNAME){
   var env = require('./env.js');
 }
var db = require('monk')(`mongodb://${process.env.MONGOLAB_USERNAME}:${process.env.MONGOLAB_PASSWORD}@ds019916.mlab.com:19916/nodeblog`)
// //


var index = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var images = require('./routes/images');


var app = express();

app.locals.moment = require('moment');

app.locals.truncateText = function(text,length){
  var truncatedText = text.substring(0,length).concat('...');
  return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//multer


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}))
//connect-flash
app.use(flash());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
})
//VAlidator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(express.static(path.join(__dirname, 'public')));



//Make db accesable to router
app.use(function(req,res,next){
  req.db = db;
  next()
})

//route middleware
app.use('/', index);
app.use('/posts', posts);
app.use('/categories', categories);
app.use('/images', images);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
