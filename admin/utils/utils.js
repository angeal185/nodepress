//socket.io
const config = require('../config'),
http = require('http'),
fs = require('fs'),
_ = require('lodash'),
urls = require('../urls'),
path = require('path'),
os = require('os'),
socketUtils = require('./socketUtils'),
formatBytes = require('../modules/formatBytes').formatBytes,
modJSON = require('../modules/modJSON'),
chalk = require('chalk'),
User = require('../models/User'),
Content = require('../models/Content'),
Gallery = require('../models/Gallery'),
Message = require('../models/Message'),
arr = [],
obj = {};

function getRandomNum(cnt) {
  var rndNum = Math.random();
  rndNum = parseInt(rndNum * cnt);
  return rndNum;
}

function udMaintenance(i,exeTime){
  setTimeout(function(){
    fs.readFile(urls.config, 'utf8',function(err, data){
      if (err) throw err;
      var ud = JSON.parse(data)
      ud.maintenance.enabled = i;
      fs.writeFile(urls.config, JSON.stringify(ud,0,2),function(err){
        if (err) throw err;
      });
    });
  },exeTime)
}

function msToTime(duration) {
  var seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24),
    days = parseInt((duration / (1000 * 60 * 60 * 24)));


  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return  days + ":" + hours + ":" + minutes + ":" + seconds;
}

exports.seMaintenance = function(){
  var nowTime = Date.parse(new Date()),
  startTime = config.maintenance.start,
  endTime = config.maintenance.end,
  exeTime;

  if ((!config.maintenance.enabled) && (nowTime < startTime)) {
    exeTime = startTime - nowTime
    logX3(chalk.redBright,'[scheduled:maintenance]','starting in',msToTime(exeTime))
    udMaintenance(true,exeTime)
  }

  if ((config.maintenance.enabled) && (nowTime < endTime)){
    exeTime = endTime - nowTime
    logX3(chalk.redBright,'[scheduled:maintenance]','ending in',msToTime(exeTime))
    udMaintenance(false,exeTime)
  }

}

exports.getFile = function(getUrl,putUrl){

  http.get(getUrl, (res) => {
    var { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        console.log(rawData);
        fs.writeFile(putUrl, rawData, function(err){
          if (err){
            throw error;
          }
        });
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });

}

exports.getData = function(getUrl,socket){

  http.get('http://' + getUrl, (res) => {
    var { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    }
    if (error) {
      console.error(error.message);
      // consume response data to free up memory
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        //console.log(rawData);
        //return JSON.parse(rawData)
        socket.emit('ip',JSON.parse(rawData))
      } catch (e) {
        console.error(e.message);
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });

}

exports.hrToMs = hrToMs = function(i){
  return i * 60 * 60 * 1000
}

exports.dailyTimedTask = function(i){
  if (config.timed.dailyTask){
    if (config.env === 'development'){
      logX3(chalk.magentaBright,'[dailyTask:enabled]',config.timed.dailyTaskInterval,'hr interval')
    }
    setInterval(function(){
      statListCount()
      console.log('dailyTask task complete')
    },hrToMs(i));
  } else {
    if (config.env === 'development'){
      console.log(chalk.redBright('[dailyTask:disabled]'))
    }
  }
}

exports.statListCount = statListCount = function(){
  listDb(User,'users')
  listDb(Message,'messages')
  listDb(Content,'content')
  listDb(Gallery,'gallery')
}

function listDb(i,e){

  i.countDocuments().then(function (count) {
    fs.readFile(urls.statistics, 'utf8',function(err, data){
      if (err) throw err;
      var ud = JSON.parse(data)
      ud.mongo[e] = count;
      fs.writeFile(urls.statistics, JSON.stringify(ud,0,2),function(err){
        if (err) throw err;
      });

    });
  })
}

exports.updateEditorFiles = function(){
  socketUtils.getfileAdmin();
  socketUtils.getfileApp();
  socketUtils.getfileCompiler();
}

exports.logX3 = logX3 = function(a,b,c,d){
  console.log(
    a(b,
    chalk.greenBright(c),
    chalk.cyanBright(d))
  )
}

exports.serverInit = function(err,server) {
  if (err) {
    console.log('connection error');
  } else {
    server.listen(config.port);
    if (config.env === 'development'){
      logX3(chalk.greenBright,'[server]','listening on port:',config.port)
      logX3(chalk.magentaBright,'[MongoDB]','listening on port:',config.mongo.port)
    }
  }
}

/*
exports.startWatching = function() {

    watchFiles("./dev/admin/css/","./admin/public/css/","css","admin");
    watchFiles("./dev/app/css/","./app/app/css/","css","app");
    watchFiles("./dev/admin/js/","./admin/public/js/","js","admin");
    watchFiles("./dev/app/js/","./app/app/js/","js","app");

    if (config.app.compiler = 'stylus') {
      watchFiles("./dev/app/stylus/","./dev/app/css/","styl","app");
      watchFiles("./dev/admin/stylus/","./dev/admin/css/","styl","admin");
    } else if (config.app.compiler = 'less') {
      watchFiles("./dev/app/less/","./dev/app/css/","less","app");
      watchFiles("./dev/admin/less/","./dev/admin/css/","less","admin");
    }

}
*/

exports.passwordGen = passwordGen = function(length) {
  var res = '',
  str = '1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM!@#$%^&*';
  for (i = 0; i < length; i++) {
    j = getRandomNum(str.length);
    res = res + str.charAt(j);
  }
//  console.log(res)
  return res;
}
//passwordGen(64)



exports.consoleGreen = function(i){
  console.log(chalk.greenBright(i));
}

exports.consoleBlue = function(i){
  console.log(chalk.blueBright(i));
}


exports.onError = function(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}


exports.updateTimestamp = function(i) {
  var timestamp = i
  var newDate = new Date();
  newDate.setTime(timestamp);
  dateString = newDate.toUTCString();
  document.getElementById("time").innerHTML = dateString;
}

exports.logConsole = function (tokens, req, res) {
  return JSON.stringify(
      console.log(
        chalk.greenBright(tokens.method(req, res))+' '+
        chalk.cyanBright(tokens.url(req, res))+' '+
        chalk.magentaBright(tokens.status(req, res))+' '+
        chalk.magentaBright(tokens.res(req, res, 'content-length')+' '+'-')+' '+
        chalk.magentaBright(tokens['response-time'](req, res)+'ms')
    )
  )
}
exports.udMaintMode = function(i){
  fs.readFile(urls.config, 'utf8',function(err, data){
    if (err) throw err;
    var ud = JSON.parse(data)
    ud.maintenance.enabled = i;
      fs.writeFile(urls.config, JSON.stringify(ud,0,2),function(err){
        if (err) throw err;
      });
  });
}
