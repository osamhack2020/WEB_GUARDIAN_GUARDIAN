var socket = io();

// CCTV일지 받기 대기중
socket.on("log", function(data) {
	$('.log').append($('<span>'+data+'</span>'));
	console.log(data);
});