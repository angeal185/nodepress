const express = require('express'),
router = express.Router(),
_ = require('lodash'),
User = require('../models/User'),
Content = require('../models/Content'),
Gallery = require('../models/Gallery'),
Message = require('../models/Message'),
config = require('../config'),
Items = require('../config/items'),
nav = require('../config/nav'),
arr = [];





if (config.maintenance.enabled){

  router.get('/',function(req,res,next){
      var fltr = _.omit(config.maintenance, 'enabled')
      res.render('maintenance/index',{
        items:Items,
        title:"maintenance",
        config: fltr,
        mStyles: config.mStyles,
        mScripts: config.mScripts
      });
  });

} else {

  let data,
  theme;

  if(config.theme){
    theme = 'theme';
  } else {
    theme = 'main';
  }

  router.use(function (req, res, next) {
      data = {
          userInfo: req.userInfo
      };
      Content.find().limit( 3 ).sort({
          laud: -1
      }).then(function( lauds ){
          data.lauds = lauds;
      });
      //category list
      Content.find().then(function(i){
        var catList = _.clone(arr);
          _.forEach(i,function(e){
            catList.push(e.category)
          })
          data.catList = _.sortBy(_.uniq(catList));
      });
      //tag list
      Content.find().then(function(i){
        var tagList = _.clone(arr);
          _.forEach(i,function(e){
            tagList.push(e.tags)
          })
          data.tagList = _.sortBy(_.uniq(_.flattenDeep(tagList)));
      });
      Message.find().limit( 3 ).sort({
          addTime: -1
      }).then(function( Message ){
          data.messageNews = Message;
      });
      next();
  });
  //home
  router.get('/', function(req, res, next){
      data.count = 0;
      data.page = Number( req.query.page || 1 );
      data.limit = 1;
      data.pages = 0;
      let where = {};
      Content
        .where( where ).countDocuments().then(function (count) {
          data.count = count;
          data.pages = Math.ceil(data.count / data.limit);
          data.page = Math.min(data.page, data.pages);
          data.page = Math.max(data.page, 1);

          let skip = (data.page - 1) * data.limit;
          return Content.where( where ).find().limit( data.limit ).skip( skip ).sort({
              addTime: -1
          });
      }).then(function (contents) {
          data.contents = contents;
          res.render(theme +'/index',{
            nav:nav,
            data:data,
            config:config
          });
      })
  });

  router.route("/gallery")
      .get(function(req, res, next){
        Gallery.find().then(function(i){
            console.log(i)
            data.gallery = i;
            res.render(theme +'/gallery',{
              nav:nav,
              title:"gallery",
              data:data,
              config:config
            });
        });
      })


  router.route("/category/:id")
      .get(function(req, res, next){
        Content.find({
          category:req.params.id
        }).then(function(i){
            //console.log(i)
            data.contents = i;
            res.render(theme +'/category',{
              nav:nav,
              title:"category",
              data:data,
              category:req.params.id,
              config:config
            });
        });
      })

  router.route("/tag/:id")
      .get(function(req, res, next){
        Content.find({
          tags:req.params.id
        }).then(function(i){
            //console.log(i)
            data.contents = i;
            res.render(theme +'/category',{
              nav:nav,
              title:"tag",
              contents:i,
              data:data,
              category:req.params.id,
              config:config
            });
        });
      })

  //message
  router.get('/message',function(req,res,next){
      res.render(theme +'/message',{
        nav:nav,
        data:data,
        config:config
      });
  });

  router.get('/login',function(req,res,next){
      res.render(theme +'/login',{
        nav:nav,
        data:data,
        config:config
      });
  });

  router.get('/register',function(req,res,next){
      res.render(theme +'/register',{
        nav:nav,
        data:data,
        config:config
      });
  });


  //about
  router.get('/about',function(req,res,next){
      res.render(theme +'/about',{
        nav:nav,
        data:data,
        config:config
      });
  });


  router.use('/v',function(req,res,next){
      let contentId = req.originalUrl.slice(3);

      Content.findOne({
          _id: contentId
      }).then(function ( content ) {
          Content.find().limit( 3 ).sort({
              laud: -1
          }).then(function( lauds ){
              return lauds;
          }).then(function(lauds){
              Message.find().limit( 3 ).sort({
                  addTime: -1
              }).then(function( Message ){
                  return Message;
              }).then(function(messageNews){

                  res.render(theme +'/view',{
                      nav:nav,
                      content: content,
                      lauds: lauds,
                      messageNews: messageNews,
                      userInfo: req.userInfo,
                      catList:data.catList,
                      tagList:data.tagList,
                      data:data,
                      config:config
                  });
              });
          });

      });

  });

  //findpassword
  router.get('/findpass',function(req,res,next){
      res.render(theme +'/findpass',{
        nav:nav,
        data:data,
        config:config
      });
  });

}
module.exports = router;
