if (!process.env.MONGOLAB_USERNAME) {
  var env = require('./env.js');
}


var express = require('express');
var mongo = require('mongodb');
var router = express.Router();
//USED MONGOOSE DUE TO LACK OF FUNCTIONALITY OF MONK.JS
var mongoose = require('mongoose');
    mongoose.connect(`mongodb://${process.env.MONGOLAB_USERNAME}:${process.env.MONGOLAB_PASSWORD}@ds019916.mlab.com:19916/nodeblog`);
var conn = mongoose.connection;
var Grid = require('gridfs-stream');
    Grid.mongo = mongoose.mongo;
var gfs = Grid(conn.db);

//Route for getting image from db and convert it to readable format for browser
  //get req.params.img which is name of the picture in db and render it in view via /images/#{post.mainimage}
router.get('/:img', function(req, res, next) {
  gfs.collection('images')

  /** First check if file exists */
  gfs.files.find({
    filename: req.params.img
  }).toArray(function(err, files) {
    if (!files || files.length === 0) {
      return res.status(404).json({
        responseCode: 1,
        responseMessage: "error"
      });
    }
    /** create read stream */
    var readstream = gfs.createReadStream({
      filename: files[0].filename,
      root: "images"
    });
    /** set the proper content type */
    res.set('Content-Type', files[0].contentType)
    /** return response */
    return readstream.pipe(res);
  });


});
module.exports = router;
