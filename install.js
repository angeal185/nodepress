const express = require('express'),
config = require('./admin/config'),
fs = require('fs'),
bcrypt = require('bcrypt-nodejs'),
path = require('path'),
nunjucks = require('nunjucks'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
urls = require('./admin/urls'),
User = require('./admin/models/User'),
_ = require('lodash'),
debug = require('debug')('app:server'),
chalk = require('chalk'),
utils = require('./admin/utils/utils'),
aceConf = require('./admin/config/aceConf'),
bw = require('./admin/config/bootswatch'),
iData = require('./install/data'),
port = config.port;
app = express();
var http = require('http'),
server = http.createServer(app),
io = require('socket.io')(server);

app.set('port', port);

app.use('/public', express.static(__dirname + '/admin/public'));
app.use('/install', express.static(__dirname + '/install'));
let env = nunjucks.configure(path.join('install/views/'), {
  autoescape: true,
  express: app,
  noCache: true,
  web: {
    useCache: false
  }
});

env.addFilter('startCase', function(i) {
  return _.startCase(i)
});

app.set('view engine', 'njk');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));

//utils.getFile('stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js','./bootstrap.css')

//utils.getData('postman-echo.com/ip');

//routes
app.get('/',function(req,res,next){
    res.render('index',{
      title:"installation",
      config:config,
      bw:bw,
      aceConf:aceConf,
      db:iData.db,
      inputs:iData.inputs,
      settings:iData.settings
    });
});




server.on('error', utils.onError);
server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

server.listen(config.port);
if (config.env === 'development'){
  logX3(chalk.greenBright,'[server]','listening on port:',config.port)
}


function generateSalt(){
  bcrypt.genSalt(20, function(err,i){
    if (err){
      console.log(err)
    } else{
      //console.log('salt: '+i)
      return i
    }
  })
}



function pwHash(i){

  bcrypt.hash(i, null, null, function(err, hash) {
    if (err){
      console.log(err)
    } else{
      return hash
    }
  })

}

//salt: $2a$20$iCvRnV8sux12rjUuF1O81e
//final: $2a$10$ZdwozB5FfPQJeiO506ylY.C66rGBIxCYvkaN1YWV3pk8gmraRS/0q
function pwCompare(i,e){
  bcrypt.compare(i, e, function(err, res) {
    if (err){
      console.log(err)
    } else{
      console.log(res)
      return res
    }
  });
}


//pwHash('password')
pwCompare('password','$2a$10$ZdwozB5FfPQJeiO506ylY.C66rGBIxCYvkaN1YWV3pk8gmraRS/0q')
//socket.io
io.sockets.on("connection", function(socket){

  utils.logX3(chalk.cyanBright,'[socketio]','listening on port:',config.port)

  socket.on('dbConfig', function(i){



  })


  utils.getData('postman-echo.com/ip',socket)

  socket.on('dbConnect', function(i){

    if (!config.dbUrlSet) {
      fs.readFile(urls.config, 'utf8',function(err, data){
        if (err) throw err;
        var ud = JSON.parse(data)
        ud.dbUrlSet = true;
        ud.mongo.url = i.url;
        ud.mongo.port = parseInt(i.port);
        ud.mongo.options.dbName = i.name;
          fs.writeFile(urls.config, JSON.stringify(ud,0,2),function(err){
            if (err) throw err;
            socket.emit('dbUpdated')
          });
      });
    } else {
      mongoose.connect(
        config.mongo.url,
        config.mongo.options,
        function(err) {
          socket.emit('dbConnected')
        }
      );
    }

  })

  socket.on('createAdmin', function(i){
    console.log(i)
    var pw = bcrypt.hashSync(i.password)
    return new User({
        userName: i.userName,
        userEmail: i.userEmail,
        password: pw,
        isAdmin:'admin',
        country: i.country,
        city: i.city,
        firstName: i.firstName,
        lastName: i.lastName,
        addTime: Date.now(),
        userImg: "/public/images/userImg/img.jpg"
      }).save().then(function() {
        socket.emit('userCreated')
      console.log('success!')
    });

  })

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

  socket.on('updateThemes', function(i){
    var bsUrl = urls.css + 'bootstrap.min.css'
    fs.readFile(urls.ace, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = JSON.parse(data)
      result.defaultTheme = i.ace;
      fs.writeFile(urls.ace, JSON.stringify(result,0,2), 'utf8', function (err) {
         if (err) return console.log(err);
         console.log('ace theme updated!')

      });
    });

    if (i.base != 'default'){
      var bwUrl = [bw.url,bw.version,i.base,bw.ext]
      utils.getFile(bwUrl.join("/"), bsUrl)
      fs.readFile(urls.bw, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        var result = JSON.parse(data)
        result.selected = i.base;
        fs.writeFile(urls.bw, JSON.stringify(result,0,2), 'utf8', function (err) {
           if (err) return console.log(err);
           console.log('main theme updated!')
           socket.emit('updateThemesSuccess')
        });
      });
    } else {
      utils.getFile(bw.bootstrap, bsUrl)
      console.log('default theme used!')
    }
  });

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

  socket.on('updateOptions', function(i){

    fs.readFile(urls.config, 'utf8', function (err,res) {
      if (err) {
        return console.log(err);
      }
      var data = JSON.parse(res)

      data.port = JSON.parse(i.port),
      data.app.name = i.title,
      data.app.uploads = i.uploads,
      data.app.favicon = i.favicon,
      data.https = i.https,
      data.app.gallery.enabled = i.gallery,
      data.app.contact.enabled = i.contact,
      data.app.socialLinks.enabled = i.socialLinks,
      data.app.debugToolbar = i.debugToolbar,
      data.maintenance.enabled = i.maintenanceMode,
      data.backup.enabled = i.encryptedBackup,
      data.app.logging.enabled = i.logs,
      data.timed.dailyTask = i.timedTasks,
      data.app.minifyOutput = i.minifyOutput,
      data.chat.enabled = i.chat,
      data.chat.logs = i.chatLogs,
      data.chat.encryptedMessages = i.chatEncryptedMessages,
      data.chat.userPersonalEncryptedMessages = i.userPersonalEncryptedMessages
      //console.log(data)

      fs.writeFile(urls.config, JSON.stringify(data,0,2), 'utf8', function (err) {
         if (err) return console.log(err);
         console.log('config options Updated!');
         socket.emit('configUpdated');
      });

    });

  });

});
