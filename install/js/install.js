var socket = io();
var arr = [];
var regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var lsData;
var editor = ace.edit("editor");
editor.session.setMode("ace/mode/javascript");
editor.setValue('var x = y;')
editor.setTheme('ace/theme/ambiance')

$(document).ready(function() {
  _.forEach(['L','o','a','d','i','n','g'],function(i){
      $('.words').append('<span>' + i + '</span>')
  })
});
$('.V').text(version);
$('.dbDiv').html('mongodb not connected');

if (window.localStorage) {
  $('.sideBar').css('display', 'block');
  toggleHelp('.helpBtn')
  toggleStatus('.infoBarBtn')
  lsData = JSON.parse(localStorage.getItem("nodepressInstall"))
  if (lsData) {
    if (!lsData.help) {
      $('.helpBtn').eq(1).click()
    }
    if (!lsData.status) {
      $('.infoBarBtn').eq(1).click()
    }
    console.log('data exists')
  } else {
    localStorage.setItem("nodepressInstall", JSON.stringify({"help":true,"status":true}));
    console.log('data created')
    lsData = JSON.parse(localStorage.getItem("nodepressInstall"))
  }

  function toggleHelp(i){
    $(i).click(function() {
      $(this).siblings(i).removeClass('active').attr('area-pressed', 'false')
      if (this.innerHTML === 'on'){
        lsData.help = true
      } else{
        lsData.help = false
      }
      localStorage.setItem("nodepressInstall", JSON.stringify(lsData))
    });
  }

  function toggleStatus(i){
    $(i).click(function() {
      $(this).siblings(i).removeClass('active').attr('area-pressed', 'false')
      $('.infoBar').toggleClass('hidden');
      if (this.innerHTML === 'on'){
        $('.infoBar').removeClass('hidden');
        lsData.status = true
      } else{
        $('.infoBar').addClass('hidden');
        lsData.status = false
      }
      localStorage.setItem("nodepressInstall", JSON.stringify(lsData))
    });
  }

  function helpMsg(i,e){
    $(i).hover(function() {
      if (lsData.help) {
        $('.helpContent').html(e)
        $('.helpDiv').fadeIn('fast');
      }
    }, function() {
      $('.helpDiv').fadeOut('fast');
    });
  }



  helpMsg('.navbar-brand','.helpContentdddddd dddddddddddd ddddddddd ddddddddddddddddd ddddddddddd dddddddd ddddddddd dddddddddd ddd dddddddddd dddddd ddddd ddddddd dddddd ddddddd ddddd ddddddddd ddddd ddddddd dddddddddddd')




} else {

}


function globeHover(i){
  $(i+'Globe').hover(function() {
      $(i+'Div').fadeIn('fast')
    }, function() {
      $(i+'Div').fadeOut('fast')
  });
}


globeHover('.db')
globeHover('.ud')

setTimeout(function(){

  $('.mask').fadeOut('fast', function() {
    $.getJSON('http://raw.githubusercontent.com/angeal185/versioning/master/versions.json','nodepress', function(data) {
      if ((data.nodepress) > (version)){
        $('.udDiv').html('v' + data.nodepress + ' is available');
      } else {
        $('.udDiv').html('current version is up to date');
        $('.udGlobe').removeClass('oGlobe').addClass('gGlobe')
      }
    })
    .fail(function() {
      $('.udDiv').html('connection error');
      $('.udGlobe').removeClass('oGlobe').addClass('rGlobe')
    })
  });
},3000)




function dflt(){
  var info = {
    dbHost:'localhost',
    dbPort: '27017',
    dbName: 'nodepress'
  }

  $('#dflt').click(function() {
    $('#db').find($('input.form-control')).val('')
    _.forIn(info,function(i,e){
      $('#'+e).val(i).keyup()
    })
  });
}



function setOutput(){
  $('#dbOutput')
    .attr('disabled','true')
      .parent('div')
        .removeClass('col-md-4')
        .addClass('col-md-12');
}

function hideAdv(adv){
  _.forEach(adv,function(i){
    $('#db'+i).css('display', 'none');
    $('#db'+i).siblings('label').css('display', 'none');
  })
}

function toggleAdv(adv){
  $('#dbAdvShow').click(function() {
    _.forEach(adv,function(i){
      $('#db'+i).toggle('slow');
      $('#db'+i).siblings('label').toggle('slow');
    })
  });
}

function validDb(){
  _.forEach(_.pull(db, 'Output'),function(i){
    $('#db'+i).keyup(function() {
      let dbUsername,
      dbPassword,
      dbHost,
      port,
      dbName,
      dbExt;

      if($('#dbUsername').val()){
        dbUsername = $('#dbUsername').val() + ':';
      } else {
        dbUsername = '';
      }
      if($('#dbPassword').val()){
        dbPassword = $('#dbPassword').val() + '@';
      } else {
        dbPassword = '';
      }
      if($('#dbHost').val()){
        dbHost = $('#dbHost').val() + ':';
      } else {
        dbHost = '';
      }
      if($('#dbPort').val()){
        dbPort = $('#dbPort').val() + '/';
      } else {
        dbPort = '';
      }
      dbName = $('#dbName').val();
      dbExt = $('#dbExtention').val();

      if($('#db'+i).val()){
        $('#dbOutput').val('mongodb://' + dbUsername + dbPassword + dbHost + dbPort + dbName + dbExt);
      }

    });
  })
}

function connectDb(){
  $('#dbCreate').click(function() {
    if(!dbSet){
      socket.emit('dbConnect', {
        "url":$('#dbOutput').val(),
        "port":$('#dbPort').val(),
        "name":$('#dbName').val()
      })
    } else {
      socket.emit('dbConnect')
    }

  });
}

function getDbConf(){
  var adv = ['Username','Password','Extention']
  setOutput();
  if(!dbSet){
    $('#dbCreate').html('create');
    hideAdv(adv);
    toggleAdv(adv)
    validDb();
    dflt();
  } else {
    $('#dbCreate').html('connect');
    $('#dflt,#dbAdvShow').remove()
  }
  connectDb();
}
//'mongodb://'+DATABASEUSERNAME+':'+DATABASEPASSWORD+'@'+DATABASEHOST+':'DATABASEPORT+'/'+DATABASENAME

function eventListen(){
  socket.on("dbConnected", function (i) {
      console.log('dbConnected')
      changeTab('user','db')
      $('.dbGlobe').removeClass('rGlobe').addClass('gGlobe')
      $('.dbDiv').html('mongodb connection established');
  });

  socket.on("dbUpdated", function () {
    setTimeout(function(){
      location.reload()
    },3000)
  });


  socket.on("userCreated", function () {
      console.log('userCreated')
      changeTab('config','user')
  });

  socket.on("configUpdated", function () {
      console.log('userCreated')
      changeTab('theme','config')
  });

  socket.on("ip", function (i) {
      console.log(i.ip)
      $('.ip').text(i.ip)
  });

  socket.on("updateThemesSuccess", function () {
      console.log('themes updated')
      changeTab('build','theme')
  });

}




function validatePassword(i) {
    var p = $(i).val(),
        errors = _.clone(arr);
    if ((p.length < 8) || (p.length > 31)) {
        errors.push("must be between 8 - 32 characters");
    }
    if (p.search(/[a-z]/) < 0) {
        errors.push("must contain at least one lower letter");
    }
    if (p.search(/[A-Z]/) < 0) {
        errors.push("must contain at least one upper letter");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("must contain at least one digit");
    }
    if (p.search(/[!@#$%^&*]/) < 0) {
        errors.push("must contain at least one special character");
    }
    if (errors.length > 0) {
        isInValid(i,'Password ' + errors.join(", "))
        return false;
    }
    isValid(i)
    return true;
}

function validateUsername(i) {
    var p = $(i).val(),
        errors = _.clone(arr);
    if ((p.length < 4) || (p.length > 16)) {
        errors.push("must be between 4 - 16 characters");
    }

    if (p.search(/^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/)  < 0 ) {
        errors.push("must not contain special character");
    }
    if (errors.length > 0) {
      isInValid(i,'Username ' + errors.join(", "))
        return false;
    }
    isValid(i)
    return true;
}

function isValid(i){
  $(i)
    .removeClass('invalid')
    .addClass('valid')
      .siblings('small')
        .css('color', 'lime')
        .html('ok!')
}

function isInValid(i,e){
  $(i)
    .removeClass('valid')
    .addClass('invalid')
      .siblings('small')
        .css('color', 'red')
        .html(e)
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function checkEmail(i) {

  if (validateEmail($(i).val())) {
    isValid(i)
    return true;
  } else {
    isInValid(i,'email invalid')
    return false;
  }
}


function userCreate(){
  $('#password').keyup(function() {
    validatePassword('#password')
  });
  $('#userName').keyup(function() {
    validateUsername('#userName')
  });
  $('#userEmail').keyup(function() {
    checkEmail('#userEmail')
  });

  $('#userCreate').click(function() {

    var userData = {
      userName: $('#userName').val(),
      userEmail: $('#userEmail').val(),
      password: $('#password').val(),
      country: $('#country').val(),
      city: $('#city').val(),
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val()
    }

     if(!checkEmail("#userEmail")){
        return;
      } else if(!validatePassword('#password')) {
          return;
      } else if(!validateUsername('#userName')) {
          return;
      } else {
      socket.emit('createAdmin', userData)
    }

  });
}


$('#configBtn').click(function(event) {
  _.forEach(settings.inputs,function(i){
      obj[i.label] = $('#opi'+i.label).val()
   })
   _.forEach(settings.select,function(i){
     if ($('#op'+i.label).val() === "true"||"false" ){

       obj[i.label] = JSON.parse($('#op'+i.label).val())
     } else {
       obj[i.label] = $('#op'+i.label).val()
     }

    })
   console.log(JSON.stringify(obj))
   socket.emit('updateOptions',obj)
});
var obj = {};

$('#opnodepressTheme').prepend('<option value="default" selected>default</option>')
$('#opnodepressTheme').siblings('label').addClass('mt40')
$('#opnodepressTheme').change(function() {
  var i = $('#opnodepressTheme').val()
  var bwUrl = [bw.url,bw.version,i,bw.ext]
  if (i === 'default'){
    $('#bsTheme').attr('href', bw.bootstrap)
    $('#themeImg').attr({'src':'','alt':'default'}).css('display', 'none');
  } else {
    $('#bsTheme').attr('href', bwUrl.join("/"))
    $('#themeImg').attr('src','https://bootswatch.com/'+i+'/thumbnail.png').css('display', 'inline-block');
  }


});

$('#opAceTheme').change(function() {
  var i = this.value
  editor.setTheme("ace/theme/"+i)
});

$('#changeTheme').click(function() {
  $('#bsTheme').attr('href', bw.bootstrap)
  $('#themeImg').attr({'src':'','alt':'default'})
});

function changeTab(i,e){
  $('#'+i+'-tab').attr('data-toggle','tab').click()
  $('#'+e+'-tab').attr('data-toggle','')
}


$('#confirmTheme').click(function() {

  var baseTheme = $('#opnodepressTheme').val()
  var aceTheme = $('#opAceTheme').val()
  console.log(baseTheme)
  socket.emit('updateThemes',{"base":baseTheme,"ace":aceTheme})
});

/*
$.getJSON("http://ip-api.com/json/?callback=?", function(data) {
    $(".ip").text(data.query);
});
*/

//init
eventListen()
getDbConf()
userCreate()
