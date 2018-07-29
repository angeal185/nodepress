const url = require('url'),
express = require('express'),
router = express.Router(),
_ = require('lodash'),
path = require('path'),
fs = require('fs'),
config = require('../config'),
bcrypt = require('bcrypt-nodejs'),
User = require('../models/User'),
Newsletter = require('../models/Newsletter'),
Content = require('../models/Content'),
Message = require('../models/Message'),
utils = require('../utils/utils'),
nodemailer = require('nodemailer');
let responseData,
userImg;

if(config.theme){
  theme = 'theme';
} else {
  theme = 'main';
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.use( function(req, res, next){
    responseData = {
        code: 0,
        message: ''
    };
    userImgSrc = [
        '/public/images/userImg/1.jpg',
        '/public/images/userImg/2.jpg',
        '/public/images/userImg/3.jpg',
        '/public/images/userImg/4.jpg',
        '/public/images/userImg/5.jpg',
        '/public/images/userImg/6.jpg',
        '/public/images/userImg/7.jpg',
        '/public/images/userImg/8.jpg',
        '/public/images/userImg/9.jpg',
        '/public/images/userImg/10.jpg',
        '/public/images/userImg/11.jpg',
        '/public/images/userImg/12.jpg',
        '/public/images/userImg/13.jpg',
        '/public/images/userImg/14.jpg',
        '/public/images/userImg/15.jpg',
        '/public/images/userImg/16.jpg',
        '/public/images/userImg/17.jpg',
        '/public/images/userImg/18.jpg',
        '/public/images/userImg/19.jpg',
        '/public/images/userImg/20.jpg',
        '/public/images/userImg/21.jpg',
        '/public/images/userImg/22.jpg',
        '/public/images/userImg/23.jpg',
        '/public/images/userImg/24.jpg',
        '/public/images/userImg/25.jpg'
    ];
    next();
});

router.post('/newsletter',function (req, res) {
    var subscribe = req.body.subscribe;
    Newsletter.findOne({
        title: 'newsletter'
    }).then(function(item){

      if(item){
        if (_.indexOf(item.subscribers, subscribe) != -1){
          responseData.message = 'email already registered!';
          res.json( responseData );
          return;
        }
        Newsletter.update({
            title: 'newsletter'
        },{
            $push: { subscribers: subscribe  }
        }).then(function () {
          responseData.message = 'subscribe successful!';
          res.json( responseData );
          return;
        });
      } else {
        var arr = [];
        arr.push(subscribe);
        return new Newsletter({
            title: 'newsletter',
            subscribers: arr
        })
        .save()
        .then(function () {
          responseData.message = 'subscribe successful!!!!!!!!!!!';
          res.json( responseData );
          return;
        });
      }
    });
});

//console.log(encodeURIComponent('dsasda@dsgfsdfs.com'))

router.route("/newsletter/unsubscribe/:id")
    .get(function(req, res, next){
      var toDelete = req.params.id

        console.log('ok')
        Newsletter.update({
            title: 'newsletter'
        },{
            $pull: { subscribers: toDelete  }
        }).then(function () {
          res.json(toDelete + ' unsubscribe success!');
          return;
        });

    })

router.post('/user/register',function(req,res,next){

    let user = req.body;
    user.password = bcrypt.hashSync(user.password);

    User.findOne({
        userName: user.userName
    }).then(function ( userInfo ) {
        if( userInfo ){
            responseData.code = 4;
            responseData.message = 'User name has been registered';
            res.json( responseData );
            return;
        }
        return new User({
            userName: user.userName,
            userEmail: user.userEmail,
            password: user.password,
            country: user.country,
            city: user.city,
            firstName: user.firstName,
            lastName: user.lastName,
            addTime: new Date(),
            userImg: userImgSrc[Math.floor(Math.random()*userImgSrc.length)],
            token: utils.passwordGen(config.token.length)
        }).save();

    }).then(function( newUserInfo ){
        //token
        req.cookies.set('token', newUserInfo.token, {maxAge:config.token.maxAge});
        responseData.message = 'Registration successful!';
        res.json( responseData );
        return;
    });
});
//console.log(_.now() + config.cookie.maxAge)
router.post('/user/login',function(req,res,next){
    let user = req.body;
    var newToken = utils.passwordGen(config.token.length);
    User.findOne({
        userName: user.userName
    }).then(function ( userInfo ) {
        if(!userInfo || !bcrypt.compareSync(user.password, userInfo.password) ){
            responseData.code = 2;
            responseData.message = 'User name or password incorrect';
            res.json( responseData );
            return;
        } else {
          User.findOne({
              token: newToken
          }).then(function ( userToken ) {

            if(userToken){
              newToken = newToken + getRandomInt(100, 99999);
            }

            User.update({
                userName: user.userName
            },{
                $set: { token: newToken }
            }).then(function ( userInfo ) {
              req.cookies.set('token', newToken , {
                maxAge:config.token.maxAge,
                overwrite:config.token.overwrite,
                secure: true
              });
              responseData.message = 'Login successful';
              res.json( responseData );
              return;
            })


          })

        }
    })
});

router.post('/user/findpass',function (req, res) {
    res.json( responseData );
    return;
});

router.post('/user/logout',function (req, res) {
  var username = req.body.userName;
    req.cookies.set('token', null);
    res.json( responseData );
    return;
});

router.post('/laud',function(req,res){
    Content.findOne({
        _id: req.body.id
    }).then(function ( content ) {
        content.laud++;
        return content.save();
    }).then(function(laud){
        responseData.message = laud.laud;
        res.json(responseData);
        return;
    });
});

router.post('/view',function(req,res){
    Content.findOne({
        _id: req.body.id
    }).then(function ( content ) {
        content.views++;
        return content.save();
    }).then(function(view){
        responseData.message = view.views;
        res.json(responseData);
        return;
    });
});

router.get('/message',function (req, res) {
    Message.find().then(function(message){
        responseData.data = message;
        res.json(responseData);
    });
});

router.post('/pageAjax',function (req, res) {
    res.json(responseData);
});

router.post('/message',function(req,res){
    let userName = req.body.userName;
    let userEmail= req.body.userEmail;
    let userImg = "/public/images/userImg/none.png";

    if( typeof(userEmail) == "undefined" ){
        userEmail = req.userInfo.userEmail;
        userImg = req.userInfo.userImg;
        userName = req.userInfo.userName;
    }

    new Message({
        addTime: new Date(),
        message: req.body.msgContent,
        userImg: userImg,
        user: userName,
        email: userEmail
    }).save().then(function( newmessage ){
        responseData.message = 'Message Successful!';
        Message.find().then(function(message){
            responseData.data = message;
            res.json( responseData );
        });
    });
});

router.get('/comment',function (req, res) {
    let contentId = req.query.id || '';
    Content.findOne({
        _id: contentId
    }).then(function(content){
        responseData.data = content.comments;
        res.json(responseData);
    });
});

router.post('/comment',function(req, res){
    let contentId = req.body.id || '';
    let userName = req.body.userName;
    let userEmail= req.body.userEmail;
    let userImg = "/public/images/userImg/none.png";

    if( typeof(userEmail) == "undefined" ){
        userEmail = req.userInfo.userEmail;
        userImg = req.userInfo.userImg;
        userName = req.userInfo.userName;
    }

    let postData = {
        addTime: new Date(),
        message: req.body.msgContent,
        userImg: userImg,
        user: userName,
        email: userEmail
    };
    console.log(postData)
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comments.push( postData );
        return content.save();
    }).then(function(newContent){
       responseData.message = 'Comment Successful';
       responseData.data = newContent.comments;
       res.json(responseData);
    });
});


//mail
router.post('/email/password',function(req, res){
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        port: 465, // SMTP
        secureConnection: true, //  SSL
        auth: {
            user: '‘’',
            pass: '‘’'
        }
    });
    let mailOptions = {
        from: 'beneaves01@hotmail.com',
        to: '',
        subject: 'subject',
        text: 'add text',
        html: '<b>Hello world ?</b>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });
})



module.exports = router;
