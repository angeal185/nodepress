var regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;


function regInit(){
  if(localStorage.getItem("npGeo") && localStorage.getItem("npGeo") != ''){
    var ipInfo = JSON.parse(localStorage.getItem("npGeo"));
    $('#signFrm .register').find('[name = city]').val(ipInfo.city).attr('disabled','true');
    $('#signFrm .register').find('[name = country]').val(ipInfo.country.name).attr('disabled','true');
    $('#signFrm .register').find('[name = ip]').val(ipInfo.ip);
  } else {
    $.getJSON(window.location.protocol+'//geoip.nekudo.com/api',function(data,status){
      console.log(data)
      $('#signFrm .register').find('[name = city]').val(data.city).attr('disabled','true');
      $('#signFrm .register').find('[name = country]').val(data.country.name).attr('disabled','true');
      $('#signFrm .register').find('[name = ip]').val(data.ip);
      var toStore = _.omit(data, 'location');
      console.log(toStore)
      localStorage.setItem("npGeo", JSON.stringify(toStore));
    })
  }
}


function initEvents(){

	$('#loadText').click(function(){
	  var reader = new FileReader();
	  var file = document.getElementById("myFile").files[0];
		var pwInputs = ['username','password']
	  reader.onload = function (e) {
				_.forEach(pwInputs,function(i){
					$('#signFrm .login').find('[name = '+i+']').val(e.target.result);
				})
	  };
	  reader.readAsText(file);
	})


		// Disable animations/transitions until the page has loaded.
		$('.search').append('<form id="search" method="get" action="#"><input type="text" name="query" placeholder="Search..." /></form>')
	$('body').addClass('is-loading');

	$(window).on('load', function() {
		window.setTimeout(function() {
			$('body').removeClass('is-loading');
		}, 100);
	});




	$('body').on('click', '[href="#search"]', function(event) {
			event.preventDefault();
				if (!$('#search').hasClass('visible')) {
						$('#search')[0].reset();
						$('#search').addClass('visible');
						$('#search').find('input').focus();
				}
		});

	$('#search').find('input')
	.on('keydown', function(event) {
			if (event.keyCode == 27)
				$('#search').find('input').blur();
		})
	.on('blur', function() {
		window.setTimeout(function() {
			$('#search').removeClass('visible');
		}, 100);
	});



	$('#signFrm .login .login-btn').on('click',login);

	$('#signFrm .login input').bind('keypress',function(event){
			if (event.keyCode == 13) {
					login();
			}
	});

	$('#signFrm .register input').bind('keypress',function(event){
			if (event.keyCode == 13) {
					register();
			}
	});
	$('#signFrm .register .register-btn').on('click',register);
	$('.logout').on('click', logout);

	if(localStorage.getItem("npRemember") && localStorage.getItem("npRemember") != ''){
			let userInfo = JSON.parse(localStorage.getItem("npRemember"));
			$('#signFrm .login').find('[name = username]').val(userInfo.userName);
			$('#signFrm .login').find('[name = password]').val(userInfo.password);
	}
}

console.log(window.location.protocol)

function subscribeInit(){
	$('#subscribeBtn').on('click',function(){
			$('.form-box .warning').html('');
			let subscribe = $('#subscribe').val();
			if(subscribe == '' ){
					$('#subscribe').attr('placeholder','cannot be empty!')
					console.log('empty')
					return;
			}
			else if(!regEmail.test(subscribe)){
					$('.newsInfo').html('Please enter the correct mailbox！');
					return;
			}
			else {
				$.ajax({
						type: 'post',
						url: '/api/newsletter',
						data: {
								subscribe: subscribe
						},
						dataType: 'json',
						success: function (result) {
								console.log( result.message );
								$('.newsInfo').html(result.message)
								if( !result.code ){

								}
						}
				});
			}
	});
}

function login(){
    let userName = $('#signFrm .login').find('[name = username]').val();
    let password = $('#signFrm .login').find('[name = password]').val();
    if(userName == '' ){
        $('#signFrm .login .warning').html('username cannot be empty!');
        return;
    }
    if( password == '' ){
        $('#signFrm .login .warning').html('password cannot be empty!');
        return;
    }
    let reg = /[a-zA-Z]/;
    if( !reg.test(userName )){
        $('#signFrm .login .warning').html('Please enter the English username!');
        return;
    }
    if( password.length < 6 ){
        $('#signFrm .login .warning').html('password must be at least 6 characters');
        return;
    }

    $.ajax({
        type: 'post',
        url: '/api/user/login',
        data: {
            userName: userName,
            password: password
        },
        dataType: 'json',
        success: function (result) {
            $('#sign .login .warning').html( result.message );
            if( !result.code ){
                if($('#rememberme').is(':checked')){
                    localStorage.setItem("npRemember",'{"userName":"'+ userName +'","password":"'+password+'"}');
                }else{
                    localStorage.setItem("npRemember",'');
                }
                window.location = './';
            }
        }
    });
}

function register(){
    let userName = $('#signFrm .register').find('[name = username]').val(),
    userEmail = $('#signFrm .register').find('[name = useremail]').val(),
		firstName = $('#signFrm .register').find('[name = firstName]').val(),
		lastName = $('#signFrm .register').find('[name = lastName]').val(),
		city = $('#signFrm .register').find('[name = city]').val(),
		country = $('#signFrm .register').find('[name = country]').val(),
    password = $('#signFrm .register').find('[name = password]').val(),
    repassword = $('#signFrm .register').find('[name = repassword]').val();

		var validateIt = {
			userName:"username",
			userEmail:"user email",
			firstName:"first name",
			lastName:"last name",
			city:"city",
			country:"country",
			password:"password"
		};

		_.forIn(validateIt,function(i,e){
			if(e === '' ){
          $('#signFrm .register .warning').html(i + ' cannot be empty!');
          return;
      }
		})

    let reg = /[a-zA-Z]/;
    if( !reg.test(userName )){
        $('#signFrm .register .warning').html('Please enter the English username!');
        return;
    }
    let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!regEmail.test(userEmail ) ){
        $('#signFrm .register .warning').html('enter valid email!');
        return;
    }
    if( password.length < 6 ){
        $('#signFrm .register .warning').html('password must be at least 6 characters');
        return;
    }
    if( password != repassword ){
        $('#signFrm .register .warning').html('passwords do not match!');
        return;
    }
    $.ajax({
        type: 'post',
        url: '/api/user/register',
        data: {
            userName: userName,
            userEmail: userEmail,
						firstName:firstName,
						lastName:lastName,
						city:city,
						country:country,
            password: password
        },
        dataType: 'json',
        success: function (result) {
            $('#signFrm .register .warning').html( result.message );
            if( !result.code ){
                window.location.reload();
            }
        }
    });
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
	});
}

function getQueryStr(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}





function tagCat(e,f){
	_.forEach(e,function(i){
		$('.'+f+'Cloud').append('<div class="'+f+'">'+i+'</div>')
	})
}

function pagina(pg,pgs){
	$('#pages').paging({
	    initPageNo: pg,
	    totalPages: pgs,
	    totalCount: '',
	    slideSpeed: 600,
	    callback: function(page) {
	    	$.ajax({
	    		type: 'post',
	    		url: '/api/pageAjax',
	    		success: function(res){
	    			window.location.href = '/?page='+page;
	    		}
	    	})
	    }
	},"back")
}


function tagCatEnable(){
	$('.cat').click(function() {
		window.location.href = '/category/'+this.innerHTML;
	});
	$('.tag').click(function() {
		window.location.href = '/tag/'+this.innerHTML;
	});
};


function date(str,style) {
		let date = new Date(str);
		function p(s) {
				return s < 10 ? '0' + s: s;
		}
		return date.getFullYear() + '-' + p((date.getMonth() + 1)) + '-' + p(date.getDate()) + '  ' + p(date.getHours()) + ':' + p(date.getMinutes()) + ':' + p(date.getSeconds());
}

function startEditor(){
	ClassicEditor
      .create( document.querySelector( '#editor' ) )
      .then( editor => {
          console.log( 'Editor was initialized', editor );
          myEditor = editor;
      } )
      .catch( err => {
          console.error( err.stack );
      } );
	$('#editor').css('height','160px');
}



function postMsg(){
	$('.article .laud').on('click',function(){
		$.ajax({
			type: "post",
			url: "/api/laud",
			data: {
				id: content._id
			},
			dataType: "json",
			success: function(result){
				if( !result.code ){
                    $('.laud span').html(result.message);
                    $('.article .laud').addClass('ban');
                    localStorage.setItem("l"+content._id,'0');
                }
			}
		})
	})
}

function postComment(){
	$('.form-box .btn').on('click',function(){

			$('.form-box .warning').html('');
			let userName = $('.form-box').find('[name = userName]').val();
			let userEmail = $('.form-box').find('[name = userEmail]').val();
			let msgContent = myEditor.getData();

			if( typeof (userName) != "undefined" ){
					if(userName == '' ){
							$('.form-box .warning').html('User name cannot be empty! ');
							return;
					}
					if(userEmail == '' ){
							$('.form-box .warning').html('The mailbox cannot be empty! ');
							return;
					}
					let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
					if(!regEmail.test(userEmail ) ){
							$('.form-box .warning').html('Please enter the correct mailbox！');
							return;
					}
	}

			if(msgContent == '' ){
					$('.form-box .warning').html('Content cannot be empty！');
					return;
			}
			console.log(msgContent)
			$.ajax({
					type: 'post',
					url: '/api/comment',
					data: {
						id: content._id,
						userName: userName,
						userEmail: userEmail,
						msgContent: msgContent
					},
					dataType: 'json',
					success: function (result) {
							$('.form-box .warning').html( result.message );
							if( !result.code ){
									setTimeout(function () {
											myEditor.setData('');
											$('.form-box .warning').html('');
											if( typeof (userName) != "undefined" ){
												$('.form-box').find('[name = userName]').val('');
						$('.form-box').find('[name = userEmail]').val('');
											}
									},500);
									comments = result.data.reverse();
									renderComment(comments);
									$('#pages').paging({
										initPageNo: page,
										totalPages: pages,
										totalCount: '',
										slideSpeed: 600,
										callback: function(_page) {
											page = _page;
											renderComment(comments)
										}
									})
							}
					}
			});
	});
}

function renderComment(comments) {
	$('.form-box .userBox .count').html(`There is already ${comments.length} comment from you`)
	$('.article .comments').html(`Comments（${comments.length}）`)

		pages = Math.max(Math.ceil(comments.length / prepage),1);
		let start = Math.max(0, (page-1) * prepage);
		let end = Math.min(start + prepage, comments.length);
		let html = '';
		for(let i=start; i<end; i++){
				html += `<div class="comment clearfix">
					<div class="comment-img">
						<img class="userRad" src="${comments[i].userImg}" alt="">
					</div>
					<div class="comment-content">
						<div class="comment-name clearfix">
							<div class="left">
								<span>${comments[i].user}</span>
							</div>
						</div>
						<div class="comment-mes">${comments[i].message}</div>
						<div class="date">${ date(comments[i].addTime,'Text') }</div>
					</div>
				</div>`;
		}
		$('#message-conent').html(html);

		if(!comments.length){
		$('#message-conent').html('<span class="null">no comments! </span>');
	}
}

function getComment(){
	$.ajax({
		type: 'get',
			url: '/api/comment',
			data: {
				id: content._id
			},
			dataType: 'json',
			success: function (responseData) {
					comments = responseData.data.reverse();
					renderComment(comments);
					if(comments.length){
						$('#pages').paging({
							initPageNo: page,
							totalPages: pages,
							totalCount: '',
							slideSpeed: 600,
							callback: function(_page) {
								page = _page;
								renderComment(comments)
							}
						})
					}
			}
	});
}


function getContent(){
	if(localStorage.getItem("l"+content._id)){
		$('.article .laud').addClass('ban');
	}
	if(!localStorage.getItem("v"+content._id)){
		$.ajax({
			type: "post",
			url: "/api/view",
			data: {
				id: content._id
			},
			dataType: "json",
			success: function(result){
				if( !result.code ){
						$('.article .views').html(`Read（${ result.message }）`);
						localStorage.setItem("v"+content._id,'0');
				}
			}
		})
	}
}



function sendMsg(){
	let messages = [];

	$('.form-box .btn').on('click',function(){

			$('.form-box .warning').html('');
			let userName = $('.form-box').find('[name = userName]').val();
			let userEmail = $('.form-box').find('[name = userEmail]').val();
			let content = myEditor.getData();

			if( typeof (userName) != "undefined" ){
					if(userName == '' ){
							$('.form-box .warning').html('User name cannot be empty!');
							return;
					}
					if(userEmail == '' ){
							$('.form-box .warning').html('Email cannot be empty!');
							return;
					}
					let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
					if(!regEmail.test(userEmail ) ){
							$('.form-box .warning').html('Please enter a correct email!');
							return;
					}
	}

			if(content == '' ){
					$('.form-box .warning').html('Content cannot be empty!');
					return;
			}
			$.ajax({
					type: 'post',
					url: '/api/message',
					data: {
							userName: userName,
							userEmail: userEmail,
							msgContent: content
					},
					dataType: 'json',
					success: function (result) {
							$('.form-box .warning').html( result.message );

							if( !result.code ){
									setTimeout(function () {
											myEditor.setData('');
											$('.form-box .warning').html('');
											if( typeof (userName) != "undefined" ){
												$('.form-box').find('[name = userName]').val('');
												$('.form-box').find('[name = userEmail]').val('');
											}
									},500);
									messages = result.data.reverse();
									renderMessage();
							}
					}
			});
	});

	function renderMessage() {
		$('.form-box .userBox .count').html('There is already ' + messages.length + ' messages.')

			_.forEach(messages,function(e){
				if(!e.reply){
						$('#message-conent').append('<div class="comment clearfix"><div class="comment-img"><img class="userRad" src="'+e.userImg+'"></div><div class="comment-content"><div class="comment-name clearfix"><div class="left"><span>'+ e.user +'</span></div></div><div class="comment-mes">'+ e.message +'</div><div class="date">'+ date(e.addTime,'Text') +'</div></div></div>');
				} else {
						$('#message-conent').append('<div class="comment clearfix"><div class="comment-img"><img class="userRad" src="'+e.userImg+'"></div><div class="comment-content"><div class="comment-name clearfix"><div class="left"><span>'+ e.user +'</span></div></div><div class="comment-mes">'+ e.message +'</div><div class="date">'+ date(e.addTime,'Text') +'</div><div class="reply"><div class="reply-img"><img class="userRad" src="'+e.reply.userImg+'" /><span>'+e.reply.user+'</span></div><div class="reply-content"><div class="reply-rep">'+e.reply.content+'</div></div></div></div></div>');
				}
		})
}

	$.ajax({
			url: '/api/message',
			dataType: 'json',
			success: function (responseData) {
					messages = responseData.data.reverse();
					renderMessage();
			}
	});
}

//gallery
function initGal(){
  $( ".img-wrapper" ).hover(
    function() {
      $(this).find(".img-overlay").animate({opacity: 1}, 600);
    }, function() {
      $(this).find(".img-overlay").animate({opacity: 0}, 600);
    }
  );

  // Lightbox
  var $overlay = $('<div id="overlay"></div>'),
  $image = $("<img>"),
  $prevButton = $('<div id="prevButton"><i class="fa fa-chevron-left"></i></div>'),
  $nextButton = $('<div id="nextButton"><i class="fa fa-chevron-right"></i></div>'),
  $exitButton = $('<div id="exitButton"><i class="fa fa-times"></i></div>');
  // Add overlay
  $overlay.append($prevButton,$image,$nextButton,$exitButton);
  $("#gallery").append($overlay);
  // Hide overlay on default
  $overlay.hide();

  // When an image is clicked
  $(".img-overlay").click(function(event) {
    event.preventDefault();
    $image.attr("src", $(this).prev().attr("href"));
    $overlay.fadeIn("slow");
  });

  // When the overlay is clicked
  $overlay.click(function() {
    $(this).fadeOut("slow");
  });

  // When next button is clicked
  $nextButton.click(function(event) {
    $("#overlay img").hide();
    var $currentImgSrc = $("#overlay img").attr("src");
    var $currentImg = $('#image-gallery img[src="' + $currentImgSrc + '"]');
    var $nextImg = $($currentImg.closest(".image").next().find("img"));
    var $images = $("#image-gallery img");
    if ($nextImg.length > 0) {
      $("#overlay img").attr("src", $nextImg.attr("src")).fadeIn(800);
    } else {
      $("#overlay img").attr("src", $($images[0]).attr("src")).fadeIn(800);
    }
    event.stopPropagation();
  });

  // When previous button is clicked
  $prevButton.click(function(event) {
    $("#overlay img").hide();
    var $currentImgSrc = $("#overlay img").attr("src");
    var $currentImg = $('#image-gallery img[src="' + $currentImgSrc + '"]');
    var $nextImg = $($currentImg.closest(".image").prev().find("img"));
    $("#overlay img").attr("src", $nextImg.attr("src")).fadeIn(800);
    event.stopPropagation();
  });

  // When the exit button is clicked
  $exitButton.click(function() {
    $("#overlay").fadeOut("slow");
  });
}

function lightBoxInit(){
  var $lightbox = $("<div class='lightbox'></div>");
  var $img = $("<img>");
  var $caption = $("<p class='caption'></p>");
  $lightbox
    .append($img)
    .append($caption);

  $('body').append($lightbox);

  $('.lightbox-img').click(function(e) {
    e.preventDefault();
    var src = $(this).attr("src");
    var cap = $(this).attr("data-caption");
    $img.attr('src', src);
    $caption.text(cap);
    $lightbox.fadeIn('fast');

    $lightbox.click(function() {
      $lightbox.fadeOut('fast');
    });

  });
}
initEvents();
