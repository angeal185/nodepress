const config = require('../config'),
fs = require('fs'),
_ = require('lodash'),
urls = require('../urls'),
zlib = require('zlib'),
os = require('os'),
crypto = require('crypto'),
formatBytes = require('../modules/formatBytes'),
modJSON = require('../modules/modJSON'),
chalk = require('chalk'),
versions = require('../utils/versions');


var arr = [];
var obj = {};

exports.stats = {
    dir:{
      homedir: os.homedir(),
      cwd: process.cwd()
    },
    info:{
      ostype: os.type(),
      platform: os.platform(),
      nodeVersion: process.version
    }
  }


exports.checkV = function(i,e){
  exec(i+' -v', (err, stdout, stderr) => {
      if (err) {
          console.log(chalk.red(`[CustomCMD]: ${stderr}`));
      } else {
        var res = stdout.slice(0,-1);
        config.app.node[i] = res;
        fs.writeFile(urls.config + '.json', JSON.stringify(config,0,2), (err) => {
          if (err) throw err;
        });
      }
  });
}


exports.updateVersions = function(socket){
  var moduleV = _.clone(arr);
  _.forEach(versions.modules, function(i) {

    xtc = require('../../node_modules/'+i+'/package.json').version;
    moduleV.push({"title":i,"version":xtc});

    });
    console.log(moduleV);
    fs.readFile(urls.versions, 'utf8',function(err, data){
      if (err) throw err;
      var ud = JSON.parse(data)
      ud.versions = moduleV;
      fs.writeFile(urls.versions, JSON.stringify(ud,0,2),function(err){
        if (err) throw err;
        console.log(chalk.greenBright('versions updated!'))
        socket.emit('success');
      });
    });
}



exports.loadIt = function(i,socket){
  fs.readFile(i, 'utf8', function read(err, data) {
    if (err) {
        throw err;
    } else {
      socket.emit('loadit', data);
    }
  });
}
