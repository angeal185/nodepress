const app = require('../../main'),
config = require('../config'),
fs = require('fs'),
mongoose = require('mongoose'),
url = require('url'),
os = require('os'),
formatBytes = require('../modules/formatBytes'),
User = require('../models/User'),
_ = require('lodash'),
debug = require('debug')('app:server'),
chalk = require('chalk'),
socketUtils = require('../utils/socketUtils'),
utils = require('../utils/utils'),
versions = require('../utils/versions'),
arr = [],
port = config.port;



if (config.https){
  const https = require('https'),
  options = {
    key: fs.readFileSync('./admin/cert/localhost.key'),
    cert: fs.readFileSync('./admin/cert/localhost.cert')
  };
  var server = https.createServer(options,app);
} else {
  const  http = require('http');
  var server = http.createServer(app);
}

const io = require('socket.io')(server);

app.set('port', port);
server.on('error', utils.onError);
server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


utils.dailyTimedTask(config.timed.dailyTaskInterval)
utils.seMaintenance()


mongoose.connect(
  config.mongo.url,
  config.mongo.options,
  function(err) {
    utils.serverInit(err,server)
  }
);


//socket.io
io.sockets.on("connection", function(socket){
  if (config.env === 'development'){
    utils.logX3(chalk.cyanBright,'[socketio]','listening on port:',config.port)
  }

if (!config.maintenance.enabled){
  socket.on('chat', function(i){
      console.log(JSON.stringify(i))
      io.emit('chat', {"user":i.user, "message":i.message});
  });
}
  socket.on('getUser', function(i){
      console.log(i)
      io.emit('getUser', i);
  });

  socket.on('udMaintenance', function(i){
      console.log(i);
      var udFile = './admin/config/index.json'
      fs.readFile(udFile,'utf8', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data)
        data.maintenance.start = i.from
        data.maintenance.end = i.to
        //console.log(data);
        fs.writeFile(udFile, JSON.stringify(data,0,2), (err) => {
          if (err) throw err;
          //console.log('maintenance times updated!');
          socket.emit('success');
        });
      });
  });

  socket.on('getStats', function(){
    socket.emit('getStats', socketUtils.stats);
  });

  socket.on('sendTimed', function(){
      var Timed = {
          cpuUser:formatBytes.formatBytes(process.cpuUsage().user,2),
          cpuSystem:formatBytes.formatBytes(process.cpuUsage().system,2),
          freemem: formatBytes.formatBytes(os.freemem(),2),
          totalmem: formatBytes.formatBytes(os.totalmem(),2),
          uptime: process.uptime(),
          nodeMemUsage:formatBytes.formatBytes(process.memoryUsage().rss,2)
        }
      socket.emit('sendTimed', Timed);
  });

  socket.on('getVersions', function(i){
    socket.emit('getVersions',versions);
  });

  socket.on('udMaintVal', function(i){
    console.log(i);
    utils.udMaintMode(JSON.parse(i))
    socket.emit('udMaintVal')
  });

  socket.on('updateVersions', function(i){
      socketUtils.updateVersions()
  });

if (config.app.installExists){

  socket.on('installation', function(i){

    fs.readFile(urls.socketio, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/install/g, 'main');
      fs.writeFile(urls.socketio, result, 'utf8', function (err) {
         if (err) return console.log(err);
      });
    });

  });
/*
  socket.on('removeInstall', function(){
    _.forEach(config.installation,function(i){
      fs.unlink(i, function(err){
        if (err) {
          return console.log('file:' + i + ' not found!');
        }
      })
    })
    fs.readFile(urls.config, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = JSON.parse(data)

      result.app.installExists = false

      fs.writeFile(urls.config, result, 'utf8', function (err) {
         if (err) return console.log(err);
      });
    });

    fs.rmdir(urls.install, function (err) {
       if (err) return console.log(err);
    })


  });

*/
}
});
