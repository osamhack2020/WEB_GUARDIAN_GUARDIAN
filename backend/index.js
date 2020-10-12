var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
require('dotenv').config();

var app = express();
var server = require('http').createServer(app);

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);

/*/ 세션 설정
app.use(session({
	secret: 'test',
	resave: false,
	saveUninitialized: true,
	store: new FileStore(),
	expires: 
}));*/

// js폴더 static등록
app.use(express.static('public'));

// 포트설정
var port = 80;
// 서버시작시 로그
server.listen(port, () => {
	console.log('Server listening at http://localhost:' + port);
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ세팅끝ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ//

// http://localhost 메인 페이지
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/html/main.html');
});

/*/ 대시보드페이지
app.get('/dashboard', (req, res) => {
	res.sendFile(__dirname + '/html/dashboard.html');
});

// 회원가입
app.get('/api/signup', (req, res) => {
	return res.json()
});

// 로그인
app.get('/api/signin', (req, res) => {
	return res.json()
});*/

// 연결시작
io.on('connection', function(socket) {

	/*/ 클라이언트로부터의 메시지가 수신되면
	socket.on('log', function(data) {
		console.log('client send msg : ' + data);

		var msg = "?: " + data;

		// 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
		//socket.broadcast.emit('log', msg);

		// 메시지를 전송한 클라이언트에게만 메시지를 전송한다
		//socket.emit('log', msg);

		// 접속된 모든 클라이언트에게 메시지를 전송한다
		io.emit('log', msg);

		// 특정 클라이언트에게만 메시지를 전송한다
		//io.to(id).emit('log', data);
	});*/

	// CCTV감지 앱으로부터의 메시지가 수신되면
	socket.on('log_input_be', function(data) {
		console.log('be : ' + data);

		// log 방에 접속된 모든 클라이언트에게 메시지를 전송한다
		io.emit('log', data);
	});

	// 프론트의 메시지가 수신되면
	socket.on('log_input', function(data) {
		console.log('fe : ' + data);

		// log 방에 접속된 모든 클라이언트에게 메시지를 전송한다
		io.emit('log', data);
	});

	// 연결 종료 (force client disconnect from server)
	socket.on('forceDisconnect', function() {
		socket.disconnect();
		console.log('user disconnected: ' + 'force client disconnect from server');
	})

	// 연결 종료
	socket.on('disconnect', function() {
		console.log('user disconnected: ' + socket.name);
	});
});