const url = require('url'),
express = require('express'),
router = express.Router(),
_ = require('lodash'),
path = require('path'),
fs = require('fs'),
crypto = require('crypto'),
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
        '/public/images/userImg/img.jpg'
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

router.route("/newsletter/unsubscribe/:id")
    .get(function(req, res, next){
      var toDelete = req.params.id

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
    var newToken = utils.passwordGen(config.token.length);
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
            addTime: Date.now(),
            userImg: userImgSrc[Math.floor(Math.random()*userImgSrc.length)],
            token: newToken
        }).save();




    }).then(function( newUserInfo ){
        //token
        req.cookies.set('token', newToken , {
          maxAge:config.token.maxAge,
          overwrite:config.token.overwrite,
          secure: config.https
        });
        responseData.message = 'Registration successful!';
        res.json( responseData );
        return;
    });
});

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
                $set: {
                  token: newToken
                }
            }).then(function () {

              setTimeout(function(){
                User.update({
                    userName: user.userName
                },{
                    $set: {
                      token: utils.passwordGen(config.token.length) + utils.passwordGen(16)
                    }
                }).then(function(){
                  console.log('done')
                })
              },config.token.maxAge)


              req.cookies.set('token', newToken , {
                maxAge:config.token.maxAge,
                overwrite:config.token.overwrite,
                secure: config.https
              });
              if (userInfo.isAdmin === 'admin'){
              }
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
    req.cookies.set('token.sig', null);
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

router.post('/friendRequest',function(req,res){
  var userName =  req.body.userName,
  userRequest = req.body.userRequest,
  userImg = req.body.userImg,
  userRequestImg = req.body.userRequestImg;

    User.findOne({
        userName: userName
    }).then(function (name) {
      if (_.find(name.friendRequests, {name:userRequest})){
        responseData.message = 'request already sent!';
        res.json(responseData);
        return;
      } else if (_.find(name.friends, {name:userRequest})){
        responseData.message = 'you are friends!';
        res.json(responseData);
        return;
      } else {
        name.friendRequests.push({
          name:userRequest,
          img:userRequestImg
        });
        return name.save();
      }

    }).then(function(msg){
      User.findOne({
          userName: userRequest
      }).then(function (name2) {
        if (_.find(name2.friendRequesting, {name:userName})){
          return;
        } else if (_.find(name2.friends, {name:userName})){
          return;
        } else{
          name2.friendRequesting.push({
            name:userName,
            img:userImg
          });
          return name2.save();
        }
      })
    }).then(function(msg){
        responseData.message = 'request successfully sent!';
        res.json(responseData);
        return;
    });
});

router.post('/acceptFriend',function(req,res){
  var userName =  req.body.userName,
  userRequest = req.body.userRequest,
  pmKey = passwordGen(32);
    User.findOne({
        userName: userName
    }).then(function ( name ) {
        name.friends.push(_.filter(name.friendRequests,{name:userRequest})[0]);
        name.friendRequests = _.reject(name.friendRequests,{name:userRequest});
        return name.save();
    }).then(function(name2){
      User.findOne({
          userName: userRequest
      }).then(function ( name2 ) {
        name2.friends.push(_.filter(name2.friendRequesting,{name:userName})[0]);
        name2.friendRequesting = _.reject(name2.friendRequesting,{name:userName});
        return name2.save();
      })
    }).then(function(msg){
        responseData.message = 'Friend request accepted!';
        res.json(responseData);
        return;
    });
});

router.post('/revokeFriend',function(req,res){
  var userName =  req.body.userName,
  userRequest = req.body.userRequest;
    User.findOne({
        userName: userName
    }).then(function ( name ) {
        name.friends = _.reject(name.friends,{name:userRequest});
        return name.save();
    }).then(function(msg){
      User.findOne({
          userName: userRequest
      }).then(function ( name2 ) {
          name2.friends = _.reject(name2.friends,{name:userName});
          return name2.save();
      })
    }).then(function(msg){
        responseData.message = 'friendship revoked!';
        res.json(responseData);
        return;
    });
});

router.post('/revokeOffer',function(req,res){
  var userName =  req.body.userName,
  userRequest = req.body.userRequest;
    User.findOne({
        userName: userName
    }).then(function (name) {
        name.friendRequesting = _.reject(name.friendRequesting,{name:userRequest});
        return name.save();
    }).then(function(msg){
      User.findOne({
          userName: userRequest
      }).then(function (name2) {
          name2.friendRequests = _.reject(name2.friendRequests,{name:userName});
          return name2.save();
      })
    }).then(function(msg){
        responseData.message = 'friendship offer revoked!';
        res.json(responseData);
        return;
    });
});

router.post('/refuseOffer',function(req,res){
  var userName =  req.body.userName,
  userRequest = req.body.userRequest;
    User.findOne({
        userName: userName
    }).then(function (name) {
        name.friendRequests = _.reject(name.friendRequests,{name:userRequest});
        return name.save();
    }).then(function(msg){
      User.findOne({
          userName: userRequest
      }).then(function (name2) {
          name2.friendRequesting = _.reject(name2.friendRequesting,{name:userName});
          return name2.save();
      })
    }).then(function(msg){
        responseData.message = 'friendship offer refused!';
        res.json(responseData);
        return;
    });
});

router.post('/sendPM',function(req,res){
  var from =  req.body.from,
  to = req.body.to,
  msg = req.body.msg;
    User.findOne({
        userName: to
    }).then(function (message) {
        message.pm.push({
          from:from,
          msg:msg,
          date: Date.now()
        });
        return message.save();
    }).then(function(msg){
        responseData.message = 'pm sent!';
        res.json(responseData);
        return;
    });
});

router.post('/readPM',function(req,res){
  var from =  req.body.from,
  to = req.body.to;
    User.findOne({
        userName: to
    }).then(function(msg){
        msg.message = _.filter(msg.pm,{from:from})[0];
        res.json(msg.message);
        return;
    });
});

router.post('/deletePM',function(req,res){
  var from =  req.body.from,
  user = req.body.user,
  dt = req.body.dt;
    User.findOne({
        userName: user
    }).then(function(msg){
        msg.pm = _.reject(msg.pm,{from:from,date:parseInt(dt)});
        return msg.save();
    }).then(function(response){
        res.json(response);
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
        addTime: Date.now(),
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
        addTime: Date.now(),
        message: req.body.msgContent,
        userImg: userImg,
        user: userName,
        email: userEmail
    };
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
