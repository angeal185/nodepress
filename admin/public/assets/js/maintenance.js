var cols = ['#f5d76e','#f7ca18','#f4d03f','#ececec','#ecf0f1','#a2ded0'];
var stars = 250;

function getTimeRemaining(endtime) {
  var t = endtime - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(endtime){
  var timeinterval = setInterval(function(){
    var t = getTimeRemaining(endtime);
    document.querySelector(".days > .value").innerText=t.days;
    document.querySelector(".hours > .value").innerText=t.hours;
    document.querySelector(".minutes > .value").innerText=t.minutes;
    document.querySelector(".seconds > .value").innerText=t.seconds;
    if(t.total<=0){
      clearInterval(timeinterval);
    }
  },1000);
}

function updateTimestamp(i) {
  let newDate = new Date();
  newDate.setTime(i);
  dateString = newDate.toGMTString();
  return dateString;
}

function init(){
  $('body').prepend('<div id="starsBox"></div>');
  for (var i = 0; i <= stars; i++) {
  	var size = Math.random()*3;
    var color = cols[parseInt(Math.random()*4)];
  	$('#starsBox').prepend('<span style=" width: ' + size + 'px; height: ' + size + 'px; top: ' + Math.random()*100 + '%; left: ' + Math.random()*100 + '%; background: ' + color + '; box-shadow: 0 0 '+ Math.random()*10 +'px' + color + ';"></span>') ;
  };

  setTimeout(function(){
  	$('#starsBox span').each(function(){
   		$(this).css('top', Math.random()*100 + '%').css('left', Math.random()*100 + '%');
    });
  }, 1);

  setInterval(function(){
  	$('#starsBox span').each(function(){
   		$(this).css('top', Math.random()*100 + '%').css('left', Math.random()*100 + '%');
    });
  }, 100000);
}

function build(){
  _.forEach(["end","start"],function(i){
    $('.centerIt').after('<div class="glow '+i+'">'+_.capitalize(i)+': <span class="times"></span></div>');
    $('.'+i+'> span.times').html(updateTimestamp(maintTimes[i]))
  })
}

build();
//initCanvas();
initializeClock(maintTimes.end)
