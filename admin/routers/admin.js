const express = require('express'),
router = express.Router(),
Items = require('../config/items'),
Content = require('../models/Content'),
Gallery = require('../models/Gallery'),
config = require('../config'),
Message = require('../models/Message'),
User = require('../models/User'),
_ = require('lodash'),
nav = require('../config/nav');

let data;
let responseData;

router.use(function(req,res,next){
    if(typeof(req.userInfo.token) == 'undefined'){
        res.render('main/prevent',{
          config:config,
          nav:nav
        });
        return;
    } else {
        if( req.userInfo.isAdmin != 'admin' ){
            res.render('main/prevent',{
              config:config,
              nav:nav,
              userInfo: req.userInfo
            });
            return;
        }
    }
    data = {
        userInfo: req.userInfo
    };
    responseData = {
        code: 0,
        message: ''
    };
    next();

});

router.get('/', function(req, res, next){
    res.render('admin/index',{
      config:config,
      nav:nav,
      data:data,
      title: 'profile'
    })
});

router.get('/maintenance', function(req, res, next){
    res.render('admin/maintenance',{
      config:config,
      nav:nav,
      data:data,
      title: 'maintenance'
    })
});

router.get('/status', function(req, res, next){
    res.render('admin/status',{
      config:config,
      nav:nav,
      data:data,
      title: 'status'
    })
});

router.get('/config', function(req, res, next){
    res.render('admin/config',{
      config:config,
      nav:nav,
      data:data,
      title: 'config'
    })
});

router.get('/user/edit',function (req, res) {
    let id = req.query.id || '';
    User.findOne({
        _id: id
    }).then(function (user) {
        res.render('admin/User_edit',{
            config:config,
            nav:nav,
            userInfo: req.userInfo,
            user: user,
            title: 'user'
        });
    });
});

router.post('/user/edit',function (req, res) {
    let id = req.body._id || '';
    User.update({
        _id: id
    },{
        userImg:req.body.userImg,
        userName:req.body.userName,
        userEmail:req.body.userEmail,
        isAdmin: req.body.isAdmin,
        city: req.body.city,
        country: req.body.country,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin
    }).then(function () {
        res.json(responseData);
        return;
    });
});

router.get('/user/del',function(req, res){
    let id = req.query.id || '';
    User.remove({
        _id: id
    }).then(function(){
        res.json(responseData);
        return;
    });
});

router.get('/user',function(req, res){

  let page = Number( req.query.page || 1 );
  let limit = 10;
  let pages = 0;

  User.countDocuments().then(function (count) {
      pages = Math.ceil( count/limit );
      page = Math.min( page, pages );
      page = Math.max( page, 1 );
      let skip = (page - 1)*limit;
      User.find().sort({ addTime: -1 }).limit(limit).skip(skip).then(function( users ){
          res.render('admin/user_index',{
              config:config,
              nav:nav,
              users: users,
              count: count,
              limit: limit,
              pages: pages,
              page: page,
              userInfo: req.userInfo,
              admin: 'user',
              title: 'user',
              items: Items
          })
      });
  })

});

router.get('/content',function(req, res){

    let page = Number( req.query.page || 1 );
    let limit = 10;
    let pages = 0;

    Content.countDocuments().then(function (count) {
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        let skip = (page - 1)*limit;
        Content.find().sort({ addTime: -1 }).limit(limit).skip(skip).then( function( contents ){
            res.render('admin/content_index',{
                config:config,
                nav:nav,
                contents: contents,
                count: count,
                limit: limit,
                pages: pages,
                page: page,
                userInfo: req.userInfo,
                admin: 'content',
                title: 'content',
                items: Items
            })
        });
    })
});




router.get('/content/add',function(req, res){
    res.render('admin/add',{
      config:config,
      nav:nav,
      data:data,
      title: 'content',
      items: Items
    })
});

router.post('/content/add',function (req, res) {
    new Content({
        userImg: req.userInfo.userImg,
        user: req.userInfo.userName,
        title: req.body.title,
        category: req.body.category,
        tags: req.body.tags,
        titleImg: req.body.titleImg,
        description: req.body.description,
        content: req.body.content,
        addTime: new Date()
    }).save().then(function (rs) {
        res.json(responseData);
        return;
    });
});

router.get('/content/edit',function (req, res) {
    let id = req.query.id || '';

    Content.findOne({
        _id: id
    }).then(function (content) {
        res.render('admin/edit',{
            config:config,
            nav:nav,
            userInfo: req.userInfo,
            content: content,
            title: 'content',
            items: Items
        });
    });
});

router.post('/content/edit',function (req, res) {
    let id = req.body._id || '';
    Content.update({
        _id: id
    },{
        userImg: req.userInfo.userImg,
        user: req.userInfo.userName,
        title: req.body.title,
        description: req.body.description,
        titleImg: req.body.titleImg,
        content: req.body.content,
        category: req.body.category,
        tags: req.body.tags
    }).then(function () {
        res.json(responseData);
        return;
    });
});

router.get('/content/del',function(req, res){
    let id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function(){
        res.json(responseData);
        return;
    });
});

router.get('/gallery',function(req, res){

    let page = Number( req.query.page || 1 );
    let limit = 10;
    let pages = 0;

    Gallery.countDocuments().then(function (count) {
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        let skip = (page - 1)*limit;
        Gallery.find().sort({ title: -1 }).limit(limit).skip(skip).then( function( galleries ){
            res.render('admin/gallery_index',{
                config:config,
                nav:nav,
                galleries: galleries,
                count: count,
                limit: limit,
                pages: pages,
                page: page,
                userInfo: req.userInfo,
                admin: 'gallery',
                title: 'gallery',
                items: Items
            })
        });
    })
});
router.get('/gallery/add',function(req, res){
    res.render('admin/add',{
      config:config,
      nav:nav,
      data:data,
      title: 'gallery',
      items: Items
    })
});
router.post('/gallery/add',function (req, res) {
    new Gallery({
        title: req.body.title,
        sub: req.body.sub,
        url: req.body.url,
        addTime: new Date()
    }).save().then(function (rs) {
        res.json(responseData);
        return;
    });
});
router.get('/gallery/edit',function (req, res) {
    let id = req.query.id || '';

    Gallery.findOne({
        _id: id
    }).then(function (galleries) {
        res.render('admin/edit',{
          config:config,
          nav:nav,
          userInfo: req.userInfo,
          galleries: galleries,
          title: 'gallery',
          items: Items
        });
    });
});

router.post('/gallery/edit',function (req, res) {
    let id = req.body._id || '';
    Gallery.update({
        _id: id
    },{
        userImg: req.userInfo.userImg,
        user: req.userInfo.userName,
        title: req.body.title,
        sub: req.body.sub,
        url: req.body.url
    }).then(function () {
        res.json(responseData);
        return;
    });
});
router.get('/gallery/del',function(req, res){
    let id = req.query.id || '';
    Gallery.remove({
        _id: id
    }).then(function(){
        res.json(responseData);
        return;
    });
});

router.get('/message',function(req, res){

    let page = Number( req.query.page || 1 );
    let limit = 10;
    let pages = 0;

    Message.countDocuments().then(function (count) {
        pages = Math.ceil( count/limit );
        page = Math.min( page, pages );
        page = Math.max( page, 1 );
        let skip = (page - 1)*limit;
        Message.find().sort({ _id: -1 }).limit(limit).skip(skip).then( function( messages ){
            res.render('admin/message_index',{
                config:config,
                nav:nav,
                messages: messages,
                count: count,
                limit: limit,
                pages: pages,
                page: page,
                userInfo: req.userInfo,
                admin: 'message',
                title: 'message',
                items: Items
            })
        });
    })
});

router.get('/message/reply',function (req, res) {
    let id = req.query.id || '';
    Message.find({
        _id: id
    }).then(function(message){
        res.render('admin/message_rep', {
            config:config,
            nav:nav,
            userInfo: req.userInfo,
            message: message[0],
            title: 'message'
        });

    })
});

router.post('/message/reply',function (req, res) {
    let id = req.body.id || '';
    Message.update({
        _id: id
    },{
        reply: {
            content: req.body.reply,
            user: req.userInfo.userName,
            userImg: req.userInfo.userImg,
            addTime: new Date()
        }
    }).then(function () {
        res.json(responseData);
        return;
    });
});

router.get('/message/del',function(req, res){
    let id = req.query.id || '';
    Message.remove({
        _id: id
    }).then(function(){
        res.json(responseData);
        return;
    });
});

module.exports = router;
