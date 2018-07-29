const express = require('express'),
Cookies = require('cookies'),
_ = require('lodash'),
User = require('../models/User'),
Keygrip = require("keygrip"),
app = express();

var keys = Keygrip(["SEKRIT2", "SEKRIT1"], 'sha256');

exports.cookie = function(req, res, next) {
    req.cookies = new Cookies(req, res, { "keys": keys });
    req.userInfo = {};
    if (req.cookies.get('token')) {
      try {
        User.findOne({
            token: req.cookies.get('token',{secure: true})
        }).then(function(userInfo) {
            req.userInfo = userInfo;
            next();
        })
      } catch (e) {}
    } else {
      next();
    }

}
