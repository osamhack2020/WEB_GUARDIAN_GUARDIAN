var socket = io();

// 메세지보내기 기능 추가
function sendMsg(msg) {
	socket.emit("chat", msg);
};

// 서버의 데이터 받기 대기중
socket.on("dash", function(data) {
	$('.dash').text(data);
	console.log(data);
});

// 페이지로드후 바로실행
$(function() {
	sendMsg("192.168.0.2@com1");
});