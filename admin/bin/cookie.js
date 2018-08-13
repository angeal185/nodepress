const express = require('express'),
Cookies = require('cookies'),
config = require('../config'),
_ = require('lodash'),
User = require('../models/User'),
Keygrip = require("keygrip"),
app = express();

var keys = Keygrip(["SEKRIT2", "SEKRIT1"], 'sha256');

exports.cookie = function(req, res, next) {
    req.cookies = new Cookies(req, res, { "keys": keys });
    req.userInfo = {};
    if (req.cookies.get('npBaseToken')) {
      try {
        User.findOne({
            token: req.cookies.get('npBaseToken',{secure: config.https})
        }).then(function(userInfo) {
            req.userInfo = userInfo;
            next();
        })
      } catch (e) {}
    } else {
      next();
    }

}
