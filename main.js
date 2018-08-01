const path = require('path'),
config = require('./admin/config'),
express = require('express'),
nunjucks = require('nunjucks'),
Cookie = require('./admin/bin/cookie'),
bodyParser = require('body-parser'),
morgan = require('morgan'),
_ = require('lodash'),
app = express();


if (config.env === 'development'){
  app.use(morgan('tiny'))
}


app.use('/public', express.static(__dirname + '/admin/public'));

let env = nunjucks.configure(path.join(__dirname, 'admin/views'), {
  autoescape: true,
  express: app,
  noCache: true,
  web: {
    useCache: false
  }
});

env.addFilter('dateTime', function(str, style) {
  let date = new Date(str);
  function p(s) {
    return s < 10 ? '0' + s : s;
  }
  return p(date.getDate()) + '-' + p((date.getMonth() + 1)) + '-' + date.getFullYear() + '  ' + p(date.getHours()) + ':' + p(date.getMinutes()) + ':' + p(date.getSeconds());
}).addFilter('date', function(str, style) {
  let date = new Date(str);
  function p(s) {
    return s < 10 ? '0' + s : s;
  }
  return p(date.getDate() + '-' + p((date.getMonth() + 1)) + '-' + date.getFullYear());
}).addFilter('startCase', function(i) {
  return _.startCase(i)
}).addFilter('omit', function(i,e) {
  return _.omit(i, e)
});

app.set('view engine', 'njk');

app.use(bodyParser.json({
  limit: '10mb'
}));

app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));

//cookie
app.use(Cookie.cookie);

//routes
app.use('/', require('./admin/routers/main'));
app.use('/api', require('./admin/routers/api'));
app.use('/admin', require('./admin/routers/admin'));



module.exports = app;
