const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
const io = require('socket.io')(server);

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// 몽고DB에 연결할 호스트,DB,아이디,비번 불러오기
const dci = require('config/db_connect_info.json');

// 몽구스 세팅
let db = mongoose.connection;
	db.on("error", console.error);
	db.once("open", function() {
	console.log("Connected to mongodb server");
});
mongoose.connect(
	"mongodb+srv://"+dci.id+":"+dci.pw+
	"@"+dci.host+"/"+dci.db+"?retryWrites=true&w=majority",
	{ useUnifiedTopology: true, useNewUrlParser: true }
);

// 포트설정
const port = 80;
// 서버시작시 로그
server.listen(port, () => {
	console.log('Server listening at http://localhost:' + port);
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ페이지ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ//

// http://localhost 메인 페이지
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/html/main.html');
});

/*/ 대시보드페이지
app.get('/dashboard', (req, res) => {
	res.sendFile(__dirname + '/html/dashboard.html');
});*/

// API 회원가입
app.get('/signup', (req, res) => {
	res.sendFile(__dirname + '/html/signup.html');
});

// API로그인
app.get('/signin', (req, res) => {
	res.sendFile(__dirname + '/html/signin.html');
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡAPIㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ//

// 회원가입
app.get('/api/signup', (req, res) => {
	return res.json();
});

// 로그인
app.get('/api/signin', (req, res) => {
	return res.json();
});

//ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ소켓통신ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ//

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