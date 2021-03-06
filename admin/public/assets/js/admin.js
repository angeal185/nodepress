var socket = io.connect(),
a = {},
entries = [],
myEditor;

var npToken = localStorage.getItem('npToken');


$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    var setupPage = function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').removeClass('show');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').addClass('show');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    };

    $(window).bind("load resize", setupPage);

    var url = window.location;
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }

    setupPage();
});



function lstMsg(){
  $.getJSON('/api/message', function(data, textStatus) {
    _.forEach(data.data,function(i,e){
      if (e < 5){
        $('#msgList').prepend('<a class="dropdown-item" href="#"><div><strong>'+i.user+'</strong><span class="float-right text-muted"><em>'+date(i.addTime)+'</em></span></div><div>'+i.message+'</div></a><div class="dropdown-divider"></div>')
      }
    })
  });
}



function logDetails(){
  $.getJSON(window.location.protocol+'//geoip.nekudo.com/api',function(data,status){
    $.ajax({
        type: 'post',
        url: '/api/logs/unauth',
        data: {
            info: data,
            baseToken: ''//cookie.get
        },
        dataType: 'json',
        success: function (result) {
          logout()
        }
    });
  })
}


let H = {
  modal: function(options){
      options = $.extend(true, {}, {
        title: "",
        message: "",
        btnok: "",
        btncl: "",
        width: 300,
        timeOut: {
          state: false,
          time: 3000
        },
        position: 'top',
        clFn: function(){
        },
        okFn: function(){
        }
      }, options || {}
    );

      let generateId = function () {
          let date = new Date();
          return 'mdl' + date.valueOf();
      };
      let modalId = generateId();
      let html = '<div class="modal fade" tabindex="-1" role="dialog" id="' + modalId + '"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">' + options.title + '</h4></div><div class="modal-body">' + options.message + '<span class="timeCl"></span></div><div class="modal-footer"><button type="button" class="btn btn-default cl" data-dismiss="modal">' + options.btncl + '</button><button type="button" class="btn btn-primary ok">' + options.btnok + '</button></div></div></div></div>';

      $('body').append(html);
      if(options.timeOut.state){
    	if(options.timeOut.time)
        $('#'+ modalId).find('.close,.cl,.ok').hide();
        setTimeout(function() {
            close();
        }, options.timeOut.time);
      }
      if(!options.btncl){
    	  $('#'+ modalId).find('.cl').hide();
      }
      $('#'+ modalId).css({
        opacity: 1,
        background: 'rgba(0,0,0,.6)'
      }).show();
      $('#'+ modalId).find('.modal-dialog').css({
        width: options.width
      });
      if(options.position == 'top'){
          $('#'+ modalId).find('.modal-dialog').css({
              top: '100px'
          },300)
      }
      if(options.position == 'center'){
          $('#'+ modalId).find('.modal-dialog').css({
              top: ($(window).height() - $('#'+ modalId).height())/2
          },300)
      }

      function close(){
        $('#'+ modalId).remove();
      }

      $('#'+ modalId).find('.close').on('click', close);

      $('#'+ modalId).find('.cl').on('click',function(){
          options.clFn();
          close();
      })
      $('#'+ modalId).find('.ok').on('click',function(){
          options.okFn();
          close();
      })
  }
};



function initProfile(dt){
  var profile = {
    account:dt.isAdmin,
    username:dt.userName,
    email:dt.userEmail,
    city:dt.city,
    country:dt.country,
    avatar:dt.userImg,
    facebook:dt.facebook,
    twitter:dt.twitter,
    linkedin:dt.linkedin
  }
  _.forIn(profile,function(i,e){
    $('#profileDiv').append('<div class="col-md-6"><div class="card"><label>'+e+'</label><h4 class="text-truncate">'+i+'</h4></div></div>')
  })
}

function initEditor(){
  ClassicEditor
      .create( document.querySelector( '#editor' ) )
      .then( editor => {
          console.log( 'Editor was initialized', editor );
          myEditor = editor;
      } )
      .catch( err => {
          console.error( err.stack );
      } );
}



function galleryAdd(){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let sub = $('#sub').val();
      let url = $('#url').val();


      _.forIn([{
        title:"title",
        sub:"sub title",
        url:"url"
      }],function(i,e){
        if(e == '' ){
            $('.form-box .warning').html(i+' empty');
            return;
        }
      })
      $.ajax({
          type: 'post',
          url: '/admin/gallery/add',
          data: {
              title: title,
              sub: sub,
              url:url,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Gallery List",
                      btncl: "Continue to add",
                      clFn: function(){
                          window.location.reload();
                      },
                      okFn: function(){
                          window.location.href = '/admin/gallery';
                      }
                  })
              }
          }
      });
  });
}

function msgReply(){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let reply = myEditor.getData();
      if(reply == '' ){
          $('.form-box .warning').html('Content cannot be empty! ');
          return;
      }
      $.ajax({
          type: 'post',
          url: '/admin/message/reply',
          data: {
              id: message._id,
              reply: reply,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Success!",
                      btnok: "Message list",
                      btncl: "",
                      okFn: function(){
                          window.location.href = '/admin/message';
                      }
                  })
              }
          }
      });
  });
}

function addTask(){
  _.forEach(["1","2"],function(i){
    $('#datetimepicker'+i).datetimepicker({
      format:'d-m-Y H:i',
      inline:true,
      lang:'en',
      minDate:Date.parse(new Date()),
      onChangeDateTime:function(dp,$input){
        $('#output'+i).val($input.val());
        //$('#timestamp'+i).val(getTimestamp($input.val()));
      }
    });
  })

  $('#addTask').click(function(event) {
    $.ajax({
      url: '/admin/tasks/add',
      type: 'POST',
      dataType: 'json',
      data: {
        task: $('#task').val(),
        description: $('#description').val(),
        start: $('#output1').val(),
        finish: $('#output2').val(),
        status: $('#status').val(),
        npToken:npToken
      },
      success: function(result){
        $('.form-box .warning').html( result.message );
        if (!result.success){
          logout();
        } else {
            H.modal({
                title: "Info",
                message: "Save success!",
                btnok: "Tasks",
                btncl: "Continue to add",
                clFn: function(){
                    window.location.reload();
                },
                okFn: function(){
                    window.location.href = '/admin/gallery';
                }
            })
        }
      },
      fail:function() {
        console.log("error");
      }
    })
});
}

function galleryEdit(){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let sub = $('#sub').val();
      let url = $('#url').val();
      _.forEach([title,sub,url],function(i){
        if(i == '' ){
            $('.form-box .warning').html('input cannot be empty!');
            return;
        }
      })

      $.ajax({
          type: 'post',
          url: '/admin/gallery/edit',
          data: {
              title: title,
              sub: sub,
              url: url,
              _id: galleries._id,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Gallery list",
                      btncl: "",
                      okFn: function(){
                          window.location.href = '/admin/gallery';
                      }
                  })
              }
          }
      });
  });
}

function editVal(a,b){
  _.forEach(a,function(i){
    $('#'+i).val(b[i])
  })
}


function deleteIndex(i){
  $('.table .del').on('click',function(){
      let id= $(this).attr('_id');
      H.modal({
          title: "Delete",
          message: "Do you want to delete it?",
          btnok: "Delete",
          btncl: "Cancel",
          okFn: function(){
              $.ajax({
                  type: 'get',
                  url: '/admin/'+i+'/del',
                  data: {
                      id: id
                  },
                  success: function (result) {
                      if( !result.code ){
                          H.modal({
                            title: "Info",
                            message: "Delete Successful!",
                            btnok: "Are you sure!",
                            btncl: "",
                              okFn: function(){
                                  window.location.reload();
                              }
                          })
                      }
                  }
              })
          }
      })
  })
}

function contentEdit(cid,ct){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let category = $('#category').val();
      let tags = _.words($('#tags').val(), /[^, ]+/g);
      let description = $('#description').val();
      let content = myEditor.getData();
      let titleImg = $('#titleImg').val();

      _.forIn([{
        title:"title",
        description:"description",
        category:"category",
        tags:"tags"
      }],function(i,e){
        if(e == '' ){
            $('.form-box .warning').html(i+' empty');
            return;
        }
      })
      if(content == '' ){
          $('.form-box .warning').html('editor empty！');
          return;
      }
      $.ajax({
          type: 'post',
          url: '/admin/content/edit',
          data: {
              title: title,
              description: description,
              content: content,
              titleImg: titleImg,
              tags:tags,
              category,category,
              _id: cid,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Content List",
                      btncl: "",
                      okFn: function(){
                          window.location.href = '/admin/content';
                      }
                  })
              }
          }
      });
  });
}

function contentAdd(){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let category = $('#category').val();
      let tags = _.words($('#tags').val(), /[^, ]+/g);
      let description = $('#description').val();
      let content = myEditor.getData();
      let titleImg = $('#titleImg').val();

      _.forIn([{
        title:"title",
        description:"description",
        category:"category",
        tags:"tags"
      }],function(i,e){
        if(e == '' ){
            $('.form-box .warning').html(i+' empty');
            return;
        }
      })
      if(content == '' ){
          $('.form-box .warning').html('editor empty！');
          return;
      }
      $.ajax({
          type: 'post',
          url: '/admin/content/add',
          data: {
              title: title,
              description: description,
              content: content,
              titleImg: titleImg,
              tags:tags,
              category,category,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Content List",
                      btncl: "Continue to add",
                      clFn: function(){
                          window.location.reload();
                      },
                      okFn: function(){
                          window.location.href = '/admin/content';
                      }
                  })
              }
          }
      });
  });
}



function initAce(a,b,c,d){
  var editor = ace.edit(a);
  editor.session.setMode("ace/mode/"+b);
  //editor.setValue('var x = y;')
  editor.setTheme('ace/theme/'+c)
  editor.setValue(d)
}

function pageAdd(){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let CSS = _.words($('#CSS').val(), /[^, ]+/g);
      let JS = _.words($('#JS').val(), /[^, ]+/g);
      let content = myEditor.getData();

      _.forIn([{
        title:"title"
      }],function(i,e){
        if(e == '' ){
            $('.form-box .warning').html(i+' empty');
            return;
        }
      })
      if(content == '' ){
          $('.form-box .warning').html('editor empty！');
          return;
      }
      $.ajax({
          type: 'post',
          url: '/admin/page/add',
          data: {
              title: title,
              content: content,
              CSS: CSS,
              JS:JS,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Page List",
                      btncl: "Continue to add",
                      clFn: function(){
                          window.location.reload();
                      },
                      okFn: function(){
                          window.location.href = '/admin/page';
                      }
                  })
              }
          }
      });
  });
}

function pageEdit(cid){
  $('.form-box .btn').on('click',function(){
      $('.form-box .warning').html('');
      let title = $('#title').val();
      let css = _.words($('#CSS').val(), /[^, ]+/g);
      let js = _.words($('#JS').val(), /[^, ]+/g);
      let content = myEditor.getData();

      _.forIn([{
        title: "title",
        content: "content",
        CSS: "CSS",
        JS:"JS"
      }],function(i,e){
        if(e == '' ){
            $('.form-box .warning').html(i+' empty');
            return;
        }
      })
      if(content == '' ){
          $('.form-box .warning').html('editor empty！');
          return;
      }
      $.ajax({
          type: 'post',
          url: '/admin/content/edit',
          data: {
              title: title,
              description: description,
              content: content,
              titleImg: titleImg,
              tags:tags,
              category,category,
              _id: cid,
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('.form-box .warning').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Save success!",
                      btnok: "Page List",
                      btncl: "",
                      okFn: function(){
                          window.location.href = '/admin/page';
                      }
                  })
              }
          }
      });
  });
}

function tagGen(item){
  $('#'+item).parent().after('<div id="'+item+'Group"></div>');
  $('#'+item).keyup(function() {
    $('#'+item+'Group').empty();
    var x = _.words(this.value, /[^, ]+/g);
    _.forEach(x,function(i){
      $('#'+item+'Group').append('<div class="'+item+'">'+i+'</div>')
    })
  });
}

function scriptGen(item){
  $('#'+item).parent().after('<div id="'+item+'Group"></div>');
  $('#'+item).keyup(function() {
    $('#'+item+'Group').empty();
    var x = _.words(this.value, /[^, ]+/g);
    _.forEach(x,function(i){
      $('#'+item+'Group').append('<div class="'+item+'">'+i+'</div>')
    })
  });
}

function date(str) {
  let date = new Date(str);
  function p(s) {
    return s < 10 ? '0' + s : s;
  }
  return p(date.getDate()) + '-' + p((date.getMonth() + 1)) + '-' + date.getFullYear() + '  ' + p(date.getHours()) + ':' + p(date.getMinutes()) + ':' + p(date.getSeconds());
}


function deleteUser(a,b){
  $(a).click(function(event) {
      let id = $(this).attr('_id');
      console.log(id)
      H.modal({
          title: "Delete",
          message: "Do you want to delete?",
          btnok: "Delete",
          btncl: "Cancel",
          okFn: function(){
              $.ajax({
                  type: 'post',
                  url: b,
                  data: {
                      id: id,
                      npToken:npToken
                  },
                  dataType: 'json',
                  success: function (result) {
                    if (!result.success){
                      logout();
                    } else {
                          H.modal({
                              title: "alert",
                              message: "Delete Successful!",
                              btnok: "confirm",
                              btncl: "",
                              okFn: function(){
                                  window.location.reload();
                              }
                          })
                      }
                  }
                })
          }
      })

  })
}


function logRes(result) {
    if( !result.code ){
        window.location.href = "./login";
    } else {
        window.location.href = "./login";
    }
}

function logout(){
  $.ajax({
      type: 'post',
      url: '/api/user/logout',
      data: {
          userName: $('.userName').html()
      },
      dataType: 'json'
      //,  success: logRes(result)
  })
}

function logoutClick(){
  $('.logout').click(function(event) {
    logout()
  });
}


function addcard(a, e, i) {
  $("#" + a).append('<div class="col-md-3"><div class="card statusCard shrink"><h4 class="card-title nGreen">' + e + '</h4><h5 class="blink">' + i + "</h5></div></div>")
}

function initAPI() {

  _.forEach(["versions", "status", "statistics"], function(i) {
    $(".w90").append("<h3>" + i + '</h3><div id="' + i + '" class="row"></div>')
  }),

  socket.on("getVersions", function(i) {

    _.forEach(config.app.node, function(value, key) {
      addcard("versions", key, "v" + value)
    }),
    _.forEach(i.versions, function(value, key) {
      addcard("versions", value.title, "v" + value.version)
    }),
    _.forEach(i.fw, function(value, key) {
      addcard("versions", value.title, "v" + value.version)
    })

  }),
  socket.on("getStats", function(i) {
    addcard("status", "Platform", i.info.platform),
    addcard("status", "OS", i.info.ostype),
    addcard("versions", "Nodejs", i.info.nodeVersion),
    addcard("status", "CWD", i.dir.cwd),
    addcard("status", "homedir", i.dir.homedir)
  }),
  socket.on("sendTimed", function(i) {

    $("#statistics").empty(),
    addcard("statistics", "Uptime", i.uptime + "s"),
    addcard("statistics", "totalmem", i.totalmem),
    addcard("statistics", "freemem", i.totalmem),
    addcard("statistics", "nodemem", i.nodeMemUsage),
    addcard("statistics", "cpuUsage:user", i.cpuUser),
    addcard("statistics", "cpuUsage:system", i.cpuSystem)

  }),
  setInterval(function() {
    socket.emit("sendTimed")
  }, 3e3),
  socket.emit("getStats"),
  socket.emit("getVersions");
}

function logout(){
  $.ajax({
      type: 'post',
      url: '/api/user/logout',
      data: {
          userName: $('.userName').html()
      },
      dataType: 'json',
      success: function (result) {
        if( !result.code ){
            window.location.reload();
        }
      }
  })
}

function userList(){
    let prepage = 10;
    let page = 1;
    let pages = 0;
    let users = [];
    _.forEach(Users,function(i){
      users.push({
          _id: i._id,
          userName: i.userName,
          userImg: i.userImg,
          userEmail: i.userEmail,
          isAdmin: i.isAdmin,
          addTime: date(i.addTime)
      })
    })

    users.reverse();
    function renderUser() {

        pages = Math.max(Math.ceil(users.length / prepage),1);
        let start = Math.max(0, (page-1) * prepage);
        let end = Math.min(start + prepage, users.length);
        let html = '';
        for(let i=start; i<end; i++){
            let isAdmin = 'User';
            if( users[i].isAdmin == 'admin'  ){
                isAdmin = 'Administrator';
            }
            html += `<tr>
                        <td><img src="${ users[i].userImg }" class="sml"></td>
                        <td>${ users[i].userName }</td>
                        <td>${ users[i].userEmail }</td>
                        <td>${ isAdmin }</td>
                        <td>${ users[i].addTime }</td>
                        <td>
                            <a class="btn btn-primary btn-xs edit" href="/admin/user/edit?id=${ users[i]._id }">Edit</a>
                            <a class="btn btn-danger btn-xs del" _id="${ users[i]._id }">Delete</a>
                        </td>
                    </tr>`;
        }
        $('#user tbody').html(html);
    }
    renderUser();
    $('#userPages').paging({
        initPageNo: page,
        totalPages: pages,
        totalCount: '',
        slideSpeed: 600,
        callback: function(_page) {
            page = _page;
            renderUser();
        }
    })
}

function updateUser(user){

  var userDetails = {
    avatar:user.userImg,
    username:user.userName,
    email:user.userEmail,
    city:user.city,
    country:user.country,
    facebook:user.facebook,
    twitter:user.twitter,
    linkedin:user.linkedin
  }
  _.forIn(userDetails,function(e,i){
    $('.userDetails').append('<div class="col-md-6"><label>'+i+'</label><input type="text" id="'+i+'" class="form-control" value="'+e+'"></div>')
  })
  $('#updateDetails').on('click',function(){
      $.ajax({
          type: 'post',
          url: '/admin/user/edit',
          data: {
              _id: user._id,
              userImg:$('#avatar').val(),
              userName:$('#username').val(),
              userEmail:$('#email').val(),
              isAdmin: $('#isAdmin').val(),
              city: $('#city').val(),
              country: $('#country').val(),
              facebook:$('#facebook').val(),
              twitter:$('#twitter').val(),
              linkedin:$('#linkedin').val(),
              npToken:npToken
          },
          dataType: 'json',
          success: function (result) {
              $('#formWarn').html( result.message );
              if (!result.success){
                logout();
              } else {
                  H.modal({
                      title: "Info",
                      message: "Success!",
                      btnok: "User List",
                      btncl: "",
                      okFn: function(){
                          window.location.href = '/admin/user';
                      }
                  })
              }
          }
      });
  })
}

function udMaintTime(){
  $('.changeOpt').click(function() {
    var dat = $(this).children('input').val()
    socket.emit('udMaintVal',dat);
    $('.maintStatus').addClass('hidden').html($(this).text())
  });
  $('#udTimes').click(function() {
    var ts1 = $('#timestamp1').val(),
    ts2 = $('#timestamp2').val();
    if ((ts1) && (ts2)){
      var data = {
        from:parseInt(ts1),
        to:parseInt(ts2)
      }
      socket.emit('udMaintenance',data);
    } else {
      $('.warning').html("times not chosen!")
  }
  });

  socket.on('udMaintVal',function(){
    $('.udMaintVal').html('update success!')
    $('.maintStatus').removeClass('hidden');
  })
  socket.on('success',function(){
    $('.warning').html('update success!')
  })
}

function getTimestamp(x){
  var dateString = x;
    dateTimeParts = dateString.split(' '),
    timeParts = dateTimeParts[1].split(':'),
    dateParts = dateTimeParts[0].split('-'),
    date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
    return date.getTime();
}

function initMaintenanec(){
  function change(i){
    $('.maintStatus').text(i),
    $('#stat'+i).attr('checked',true).parents('label').addClass('active');
  }
  if (maint.enabled){
    change('Enabled')
  } else {
    change('Disabled')
  }
  _.forEach(["1","2"],function(i){
    $('#datetimepicker'+i).datetimepicker({
      format:'d-m-Y H:i',
      inline:true,
      lang:'en',
      minDate:Date.parse(new Date()),
      onChangeDateTime:function(dp,$input){
        $('#output'+i).val($input.val());
        $('#timestamp'+i).val(getTimestamp($input.val()));
      }
    });
  })
}


$('.logout').on('click', logout);
