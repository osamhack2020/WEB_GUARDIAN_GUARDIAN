$(document).ready(function() {
	var socket = io();

	// 메세지보내기 기능 추가 (room= 이벤트네임, msg= 보낼내용)
	function sendMsg(room, msg) {
		socket.emit(room, msg);
	};

	// 메세지 디스플레이 기능
	function displayMsg(clas, msg) {
		$(clas).append($('<span>'+msg+'</span>'));
	};

	// CCTV일지 메세지가 올시 로그메뉴에 메세지추가
	socket.on("log", function(data) {
		displayMsg(".log",data);
	});

	// 테스트 메세지 전송기능
	function log_input() {
		sendMsg("log_input",$(".msg").val());
		$(".msg").val("");
	}

	// 테스트 메세지 전송, 버튼클릭 or 엔터 누르면
	$(".send_msg").click(function() { log_input(); });
	$(".msg").keyup(function(e) { if(e.keyCode == 13) {log_input();} });

});