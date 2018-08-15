const url = require('url'),
express = require('express'),
router = express.Router(),
_ = require('lodash'),
path = require('path'),
fs = require('fs'),
crypto = require('crypto'),
config = require('../config'),
jwt = require('jsonwebtoken'),
bcrypt = require('bcrypt-nodejs'),
User = require('../models/User'),
Session = require('../models/Session'),
Unauth = require('../models/Unauth'),
Newsletter = require('../models/Newsletter'),
Content = require('../models/Content'),
Message = require('../models/Message'),
utils = require('../utils/utils'),
nodemailer = require('nodemailer'),
nmConfig = require('../config/nmConfig');
let responseData,
userImg;

function hash512(i){
  let hashGen = require('crypto')
    .createHash('sha512')
    .update(i)
    .digest('hex')
    return hashGen;
}



const transporter = nodemailer.createTransport({
    service: nmConfig.service,
    port: 465, // SMTP
    secureConnection: config.https, //  SSL
    auth: {
        user: nmConfig.auth.user,
        pass: nmConfig.auth.pass
    }
});


if(config.theme){
  theme = 'theme';
} else {
  theme = 'main';
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setJWT(){
  var npToken = req.npToken || req.body.npToken || req.query.npToken || req.headers['x-access-token'];

  // decode token
  if (npToken) {

    // verifies secret and checks exp
    jwt.verify(npToken, 'secret', function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        console.log(decoded);
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
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
    var usrHash = hash512(user.userEmail)


    User.findOne({
        userName: user.userName
    }).then(function ( userInfo ) {
        if( userInfo ){
            responseData.code = 4;
            responseData.message = 'User name has been registered';
            res.json( responseData );
            return;
        }
        new User({
            //isAdmin:'admin',
            userName: user.userName,
            userEmail: user.userEmail,
            password: user.password,
            country: user.country,
            city: user.city,
            ip: user.ip,
            firstName: user.firstName,
            lastName: user.lastName,
            addTime: Date.now(),
            userImg: userImgSrc[Math.floor(Math.random()*userImgSrc.length)],
            token: newToken,
            hash: usrHash
        }).save();

        new Session({
          userName: user.userName,
          time: Date.now(),
          token: newToken,
          country: user.country,
          city: user.city,
          ip: user.ip
        }).save();

        let mailOptions = {
            from: 'beneaves01@hotmail.com',
            to: 'beneaves01@hotmail.com',//user.userEmail,
            subject: 'np signup',
            text:'<p>welcome '+ user.username + ' please click here to activate your account: <a href="http://localhost:8000/api/activate/'+usrHash+'" target="_blank">activate</a><p>',
            html: '<p>welcome '+ user.username + ' please click here to activate your account: <a href="http://localhost:8000/api/activate/'+usrHash+'" target="_blank">activate</a><p>'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            } else {
              req.cookies.set('npBaseToken', newToken , {
                maxAge:config.token.maxAge,
                overwrite:config.token.overwrite,
                secure: config.https
              });
              responseData.message = 'Registration successful!';
              res.json( responseData );
              return;
            }
        });


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
            responseData.success = false;
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


              req.cookies.set('npBaseToken', newToken , {
                maxAge:config.token.maxAge,
                overwrite:config.token.overwrite,
                secure: config.https
              });
              if (userInfo.isAdmin === 'admin'){

                var npToken = jwt.sign({userName: user.userName}, 'secret', {
                  expiresIn: config.token.maxAge
                });
                responseData.npToken = npToken;
              }
              responseData.message = 'Login successful';
              responseData.success = true;
              res.json( responseData );
              return new Session({
                userName: user.userName,
                time: Date.now(),
                token: newToken,
                country: user.country,
                city: user.city,
                ip: user.ip
              }).save();
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
    req.cookies.set('npBaseToken', null);
    req.cookies.set('npBaseToken.sig', null);
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

router.post('/logs/unauth',function(req,res){
    let userName = req.body.userName,
    city = req.body.city,
    country = req.body.country,
    ip = req.body.ip,
    baseToken = req.body.baseToken;

    new Unauth({
      userName: String,
      city: city,
      country: country,
      time: Date.now(),
      ip: ip,
      baseToken: npBaseToken
    })
    .save()
    .then(function(){
          res.json({'success':true,'message':'goodbye for now.'});
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

router.post('/saveInvoice',function (req, res) {
    var invFile = './admin/config/invoice.json';
    let npToken = req.body.npToken;
    let invTitle = req.body.invTitle;
    let newInv = JSON.parse(req.body.newInv);


    jwt.verify(npToken, 'secret', function(err, decoded) {
     if (err) {
       return res.json({ success: false, message: 'Failed to authenticate token.' });
     } else {
       req.decoded = decoded;
       fs.readFile(invFile,'utf8', function(err, data) {
         if (err) throw err;
         data = JSON.parse(data);
         //_.pick(data.tpl, invTitle) = newInv
         data.tpl[invTitle] = newInv;
         fs.writeFile(invFile, JSON.stringify(data), function(err, data) {
           if (err) throw err;
           console.log('The file has been saved!');
           res.json({ success: true, message: 'invoice successfully saved!'})
         });
       });
     }
    });
});

router.post('/deleteInvoice',function (req, res) {
    var invFile = './admin/config/invoice.json';
    let invTitle = req.body.invTitle;
    let npToken = req.body.npToken;
    jwt.verify(npToken, 'secret', function(err, decoded) {
     if (err) {
       return res.json({ success: false, message: 'Failed to authenticate token.' });
     } else {
       req.decoded = decoded;
       fs.readFile(invFile,'utf8', function(err, data) {
         if (err) throw err;
         data = JSON.parse(data);
         if(invTitle === data.main){
           res.json('main template cannot be deleted!')
           return;
         } else{
           data.tpl =  _.omit(data.tpl, invTitle);
           console.log(data.tpl)
           fs.writeFile(invFile, JSON.stringify(data), function(err, data) {
             if (err) throw err;
             console.log('The file has been deleted!');
             if(invTitle === data)
             res.json({ success: true, message: 'invoice successfully deleted!'})
             return;
           });
         }
       });
     }
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


router.route("/activate/:id")
    .get(function(req, res, next){
      var usrHash = req.params.id

        User.findOne({
            hash: usrHash
        }).then(function (userdata) {
          if (userdata.status === 'inactive'){
            userdata.status = 'active';
            userdata.save();
            res.json('Activation success!');
          } else {
            res.redirect('/')
          }

          return;
        });

    })

//mail
router.post('/recover',function(req, res){

  let user = req.body;

  User.findOne({
      firstName: user.firstName,
      lastName: user.lastName,
      userEmail: user.userEmail,
      country: user.country
  }).then(function ( userInfo ) {
      if( userInfo ){

          var newPass = utils.passwordGen(32);

          let mailOptions = {
              from: 'beneaves01@hotmail.com',
              to: user.userEmail,
              subject: 'np recovery info',
              text: 'your new password is: '+newPass+'. Please delete this message',
              html: '<p>your new password is: <b>'+newPass+'</b><p><p>Please delete this message</p>'
          };

          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                  return console.log(error);
              } else{
                //console.log('Message sent: ' + info.response);
                userInfo.password = bcrypt.hashSync(newPass);
                responseData.code = 4;
                responseData.message = 'new password has been sent. check your email!';
                responseData.success = true;
                res.json( responseData );
                userInfo.save();
              }
          });

          return

      } else {
        responseData.message = 'user not found';
        responseData.success = false;
        res.json( responseData );
        return;
      }

  });


})



module.exports = router;
