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

/* GET home page. */
router.get('/', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
//get documents from collection and order it by date in reverse order
  posts.find({}, {sort: { 'date' : -1 }}).then((posts)=>{
    res.render('index',{
      "posts":posts
    }).catch((e)=>{
      console.log(e)
    })
})


});


module.exports = router;
