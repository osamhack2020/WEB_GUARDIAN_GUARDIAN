# GUARDIAN - CCTV감지체계

# Logo
![Logo](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/logo.png)

## 프로젝트 소개 ✨
**'가디언'은 군 CCTV를 자동으로 감시하는 영상 감시 웹 어플리케이션입니다.**
* **CCTV 내 사람과 차량 식별, 움직임 동선 파악 자동화**  
 설정된 영역 안에서 사람 또는 차량 식별 시 상황일지가 작성되며 발견된 객체가 움직임이 없어질 경우 이동 경로를 추적해줍니다.  
 
* **식별된 과거 상황 데이터베이스 조회**  
 식별된 데이터와 자동 녹화 영상은 언제든지 조회 가능하여 사고 추적에 도움을 줍니다.  
 
* **사용자가 인지할 수 있는 TTS 경보음**  
 움직임 감지가 일어나면 울리는 비프음이 아닌 정확히 사람과 차량만 탐지하였을 때 TTS로 사람 또는 차량 감지를 알립니다.  
 
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/main.PNG" height="300">

## PPT 자료 📘
[PPT 파일](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/raw/main/PPT/%EA%B0%80%EB%94%94%EC%96%B8%20%EB%B0%9C%ED%91%9C%20PPT.pptx)  
[PDF 파일](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/raw/main/PPT/%EA%B0%80%EB%94%94%EC%96%B8%20%EB%B0%9C%ED%91%9C%20PPT.pdf)  

## 프로젝트 동영상 🎬
|발표 영상|시연영상|
|:---:|:---:|
|[![Youtube](https://img.youtube.com/vi/o0_1TyjyGuI/0.jpg)](https://youtu.be/o0_1TyjyGuI)|[![Youtube](https://img.youtube.com/vi/OUVyoL5Y0DY/0.jpg)](https://youtu.be/OUVyoL5Y0DY)|
|<a href="https://drive.google.com/file/d/17f_Y475dRi8Zn96GPG8C1lWNHbNy8lPM/view?usp=sharing"><img src="https://w.namu.la/s/c0d20de14d789f2b504263608dd48abb00ee7c10e208fd647da9e4117b56e32d16332f50e0337d9c57f555a5d3660f759b919b910c3ce7cb7007df59e06209abcd01d968dce821fb7460cd9d5f28c51929eec5f30298db856120f0f19e752f2b" height="20"><b style="margin-top:-5px"> Google Drive</b></a>|<a href="https://drive.google.com/file/d/1kWrpgiZdk3v0ILAGT2mdWSJEXkWaVGaH/view?usp=sharing"><img src="https://w.namu.la/s/c0d20de14d789f2b504263608dd48abb00ee7c10e208fd647da9e4117b56e32d16332f50e0337d9c57f555a5d3660f759b919b910c3ce7cb7007df59e06209abcd01d968dce821fb7460cd9d5f28c51929eec5f30298db856120f0f19e752f2b" height="20"><b style="margin-top:-5px"> Google Drive</b></a>|
|<a href="https://youtu.be/o0_1TyjyGuI"><img src="https://ww.namu.la/s/a4013816a435533ad87dfccfa89d548db221f0e74f2aac166acf69ab6d609d20c832bc6e964d0bf39d55ced3528fec9bbfd2456252b59e0a5a099b3c4dc256c29837081b43213d647bc8773a21099a9348b410ecc949bbb6158d2a3694e6ff58" height="20"></a>|<a href="https://youtu.be/OUVyoL5Y0DY"><img src="https://ww.namu.la/s/a4013816a435533ad87dfccfa89d548db221f0e74f2aac166acf69ab6d609d20c832bc6e964d0bf39d55ced3528fec9bbfd2456252b59e0a5a099b3c4dc256c29837081b43213d647bc8773a21099a9348b410ecc949bbb6158d2a3694e6ff58" height="20"></a>|

## 기능 설계 🕹
**[Oven](https://ovenapp.io/project/yx0NjBwiaWnct4suJmMu9fvgJmmRNLwe#sy1Vs)**  

## 커뮤니티 👨‍👩‍👦‍👦
[2020 국방오픈소스아카데미 해커톤 - GUARDIAN 개발 후기](https://develment.tistory.com/1)
## 핵심 기능 소개 📌
### RTSP 스트리밍 및 상황일지 작성

|RTSP 스트리밍 및 상황일지 작성|
|:---:|
|<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/main.PNG" height="300">|
|**네트워크 카메라 또는 DVR에서 지원하는 RTSP 스트림 데이터를 웹에서 보여줍니다.**|

|사람 및 차량 감지|
|:---:|
|<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/detect.jpg" height="300">|
|**YOLO기반 Object Detection으로 사람 및 자동차를 식별합니다.**|


|감지 후 이동 거리 추적 시각화 및 자동 녹화|
|:---:|
|<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/detect.jpg" height="300">|
|**해당 객체가 움직임이 없어지면 경로를 추적하여 사용자에게 보여줍니다.**|
|**확실한 감지를 했을 때**  
**(감지~움직임 감지 끝) 분기를 녹화하여 사용자에게 보여줍니다.**|

|자동 녹화 된 영상 프리뷰|
|:---:|
|![Alt Text](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/detect_preview.gif)|
|**위 예제에서 탐지된 자동 녹화 영상입니다.**|

|일별 시계열 통계|
|:---:|
|<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/statistics.PNG" height="300">|
|**일별로 데이터를 기록하여 0~24시까지 감지된 정보를 알려줍니다.**|


|과거 식별 데이터 스트리밍|
|:---:|
|<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/prev_data_streaming.PNG" height="300">|
|**통계에서 해당 시간을 선택할 시 그 시간대에 감지됐던 식별 동영상을 볼 수 있습니다.**|

## 컴퓨터 구성 / 필수 조건 안내 (Prerequisites) 🛠
* **ECMAScript 6 지원 브라우저 사용**
* **권장: Google Chrome 버젼 77 이상**
* **Golang 설치**
* **IP Camera 또는 RTSP 스트리밍을 지원하는 DVR**

## 기술 스택 (Technique Used) 💻
### 주요 기술 선정 이유
 - **Golang : 영상 감시 프로젝트는 사이즈가 큰 실시간 데이터를 처리하기 때문에**  
 **퍼포먼스, 동시성, HTTP를 모두 갖춘 Go언어를 선택했습니다.**
 - **OpenCV : 컴퓨터비전 작업이 많은 프로젝트인 만큼 오픈소스인 'OpenCV' 라이브러리를 선택했습니다.**
 - **Darknet Yolov4-tiny: YOLO 모델 자체는 실시간 물체 감지를 위해 태어났습니다.** 
   **개발 환경이 VM에서 제한됐기 때문에 적은 CPU 코어에서도 운용할 수 있는 Tiny 모델을 선택했습니다.**
 - **React : 웹 어플리케이션 개발에 용이한 프론트엔드 프레임워크입니다.**
### Server(back-end)
 - **golang 1.15.2**
 - **Echo**
 - **GoCV (OpenCV Binding)** 
 - **mongoDB**
 
### front-end
 - **TypeScript**
 - **React.js**  
 - **Antd UI Framework**  
 - **Socket.io**
 - **Video.js**
 
### Infra
 - **Docker**

### Machine-learning
 - **Darknet Yolov4-tiny**
 
## 설치 안내 (Installation Process) 🔍

**GoCV 사용을 위한 OpenCV 라이브러리 설치**
```sh
> go get -u -d gocv.io/x/gocv
> cd $GOPATH/src/gocv.io/x/gocv
> make install
```

**프론트엔드 모듈 설치**
```sh
> git clone https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN.git
> cd frontend
> yarn install
```

## 프로젝트 사용법 (Getting Started) 📕

**가상 CCTV 환경 구축**
```sh
> git clone https://github.com/gron1gh1/docker-rtsp-video-streaming.git
> cd docker-rtsp-video-streaming
> vi .env
# Modify .env file
> HOST_PORT={Port to be actually serviced}
> VIDEO_FILE ={Video File to be actually streamed}
> docker-compose up -d
```

**데이터베이스 실행**
```sh
> cd infra/mongo
# 데이터베이스 패스워드 설정
> echo MONGO_PW={set_password} > .env
> docker-compose up -d
```

**프론트엔드 실행**
```sh
> cd frontend
> yarn start
```

**백엔드 실행**
```sh
> cd backend
# 데이터베이스 패스워드 설정
> echo {set_password} > MONGO_PW
> go run cv_core.go cv_motion_liner.go cv_util.go http.go cv_motion.go cv_yolo.go mongo.go :8081
```

**백엔드 실행 (Docker)**
```sh
# OpenCV 라이브러리를 설치하지 않았을 때 쓰는 방법입니다.
# 데이터베이스 패스워드 설정
> cd WEB_GUARDIAN_GUARDIAN
> docker -v $PWD/backend:/ gocv/opencv 'go run cv_core.go cv_motion_liner.go cv_util.go http.go cv_motion.go cv_yolo.go mongo.go :8081'
> echo {set_password} > MONGO_PW
> go run cv_core.go cv_motion_liner.go cv_util.go http.go cv_motion.go cv_yolo.go mongo.go :8081
```

**인터넷 브라우저 접속 http://localhost:8080**

## 팀 정보 (Team Information) 👩‍👦‍👦
- 강선규 (gron1gh1@gmail.com), Github Id: gron1gh1
- 신기철 (skck0226@gmail.com), Github Id: skck0226
- 장성호 (csi9725@naver.com), Github Id: JangSeongHo99
- 백승민 (zlws554@naver.com), Github Id: me9min
- 이승규 (dltmdrb98@gmail.com), Github Id: seungy0
- 오택환 (jamesoh3928@naver.com), Github Id:jamesoh3928

## 저작권 및 사용권 정보 (Copyleft / End User License) 👈
 * [MIT](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/LICENSE)
