var socket = io();

$(document).ready(function() {

	// CCTV일지 메세지가 올시 로그메뉴에 메세지추가
	socket.on("log", function(data) {
		var msg = JSON.parse(data);

		msg =
			'<span>'+
				'<img alt="404 error" src="'+msg.msg_thumbnail+'">'+
				msg.msg_text+
			'</span>'
		;
		console.log(msg);

		// 받은메세지 디스플레이
		$(".log").append(msg);
	});

	// 테스트 메세지 전송기능
	function log_input() {
		var msg_text = $(".msg_text").val();

		if (msg_text.length > 0) {

			var msg = '{"msg_thumbnail":"'+$('.msg_thumbnail').val()+'","msg_text":"'+msg_text+'"}';
			socket.emit("log_input",msg);

			$(".msg_thumbnail").val("");
			$(".msg_text").val("");
		} else {

			alert('내용이없습니다');
			$(".msg_text").focus();
		}
	}

	// 테스트 메세지 전송, 버튼클릭 or 엔터 누르면
	$(".send_msg").click(function() { log_input(); });
	$(".msg_text").keyup(function(e) { if(e.keyCode == 13) {log_input();} });

	// 테스트
	socket.emit("log_input",'{"msg_thumbnail":"/img/osam.png","msg_text":"test text"}');
});