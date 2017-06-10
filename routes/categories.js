var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

//setup for process.env variables
//if there are no process.env variables on server setup(i.e you are running localy) for username and password
//import it from local env.js file
if(!process.env.MONGOLAB_USERNAME){
  var env = require('../env.js');
}
var db = require('monk')(`mongodb://${process.env.MONGOLAB_USERNAME}:${process.env.MONGOLAB_PASSWORD}@ds019916.mlab.com:19916/nodeblog`)
//

var flash = require('connect-flash');

//handle upload data
var multer = require('multer')
var upload = multer({dest: './public/images/uploads'})


router.get('/show/:category',function(req,res,next){
  var db = req.db;
  var posts = db.get('posts');
  posts.find({category:req.params.category},{},function(err,posts){
    res.render('index',{
      "title": req.params.category,
      "posts": posts
    })
  })

})

router.get('/add', function(req, res, next) {
  res.render('addcategory',{
    'title':'Add category'
  })
});

router.post('/add',upload.any(),function(req,res,next){
  //get form values
  var title = req.body.title;

  //validation
  console.log('first',title)
  req.checkBody('title', 'Title field is required.' ).notEmpty();


  var errors = req.validationErrors();

  if(errors){
    res.render('addcategory', {
      "errors":errors,
      "title":title
    })
  }else {
    var categories = db.get('categories');

//Check if category exist and if does don't insert it into category collection
    //find entered title inside category collection
    categories.findOne({title:title}).then((doc)=>{
      //if result of search is not null(does exist) return to addcategory page
      if(doc!=null){
        req.flash('errors', 'Category already exists');
        res.location('/categories/add');
        return res.redirect('/categories/add')
      //else(it's new and does not exist) add it to category collection
      }else{
      categories.insert({
        "title": title,
      },function(err,category){
        if(err){
          console.log(err)
          res.send('There was an issue submitting the category');
        }else {
          req.flash('success', 'Category submitted');
          res.location('/');
          res.redirect('/')
        }
      })
  }//from nested else
    }).catch((e)=>{
      console.log(e)
    })

}//from else
})


module.exports = router;
