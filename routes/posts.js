var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
//var db = require('monk')('localhost/nodeblog')

//setup for process.env variables
//if there are no process.env variables on server setup(i.e you are running localy) for username and password
//import it from local env.js file 
if(!process.env.MONGOLAB_USERNAME){
  var env = require('../env.js');
}
var db = require('monk')(`mongodb://${process.env.MONGOLAB_USERNAME}:${process.env.MONGOLAB_PASSWORD}@ds019916.mlab.com:19916/nodeblog`)
//

var flash = require('connect-flash');
var crypto = require('crypto');
var mime = require('mime');

//multer stuff
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));

})}});

var upload = multer({ storage: storage })


router.get('/show/:id',function(req,res,next){
  var posts = db.get('posts');
  id = req.params.id;
  posts.findOne(id,function(err,post){
    res.render('show',{
      "post":post
    })
  })
})

router.get('/add',function(req,res,next){
  var categories = db.get('categories');

  categories.find({},{},function(err,categories){
    res.render('addpost',{
      'title': 'Add post',
      'categories':categories
    })
  })

});

router.post('/add',upload.single('mainimage'),function(req,res,next){
  //get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date().getTime();
  if(req.file){

    var mainImageOriginalName = req.file.originalname;
    var mainImageName = req.file.filename;
    var mainImageMime = req.file.mimetype;
    var mainImagePath = req.file.path;
    var mainImageExt = req.file.extension;
    var mainImageSize = req.file.size;
  }else {
    var mainImageName = 'noimage.jpeg';
  }

  //validation

  req.checkBody('title', 'Title field is required.').notEmpty();
  req.checkBody('author','Author name is required').notEmpty();
  req.checkBody('body', 'Body field is required').notEmpty();


  var errors = req.validationErrors();

  if(errors){
    res.render('addpost', {
      "errors":errors,
      "title":title
      //"body":body,
    //  "author":author
    })
  }else {
    var posts = db.get('posts');
    posts.insert({
      "title": title,
      "body": body,
      "category": category,
      "date": date,
      "author":author,
      "mainimage": mainImageName
    },function(err,post){
      if(err){
        console.log(err)
        res.send('There was an issue submitting the post');
      }else {
        req.flash('success', 'Post submitted');
        res.location('/');
        res.redirect('/')
      }
    })
  }
})

//ADD COMMENT
router.post('/addcomment',function(req,res,next){
  //get form values
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentdate = new Date();

  //validation

  req.checkBody('name', 'Name field is required.' ).notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not formatted correctly').isEmail();
  req.checkBody('body', 'Body field is required').notEmpty();


  var errors = req.validationErrors();

  if(errors){
    var posts = db.get('posts');
    posts.findOne(postid,function(err,post){
      res.render('show', {
        "errors":errors,
        "post":post
      })
    })

  }else {
    var comment = {'name':name, 'email':email, 'body':body, 'commentdate':commentdate }

    var posts = db.get('posts');

    posts.update({
      "_id":postid
    },
    {
      $push:{
        "comments":comment
      }
    },
    function(err,doc){
      if(err)throw err;

      req.flash('success','Comment Added');
      res.location('/posts/show/'+postid);
      res.redirect('/posts/show/'+postid);
    }
);
  }
})


module.exports = router;
