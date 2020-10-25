# GUARDIAN - CCTV감지체계

# Logo
![Logo](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/logo.png)

## 팀소개 및 프로젝트 설명 동영상
[![Youtube](https://img.youtube.com/vi/62XSThINc_U/0.jpg)](https://youtu.be/62XSThINc_U)   
**시연 영상**  
## 기능 설계
**[Oven](https://ovenapp.io/project/yx0NjBwiaWnct4suJmMu9fvgJmmRNLwe#sy1Vs)**  
## 커뮤니티
[2020 국방오픈소스아카데미 해커톤 - GUARDIAN 개발 후기](https://velog.io/@gron1gh1/2020-%EA%B5%AD%EB%B0%A9%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4%EC%95%84%EC%B9%B4%EB%8D%B0%EB%AF%B8-%ED%95%B4%EC%BB%A4%ED%86%A4-GUARDIAN-%EA%B0%9C%EB%B0%9C-%ED%9B%84%EA%B8%B0)
## 핵심 기능 소개
### RTSP 스트리밍 및 상황일지 작성
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/main.PNG" height="300">

**네트워크 카메라 또는 DVR에서 지원하는 RTSP 스트림 데이터를 웹에서 보여줍니다.**  

### 사람 및 차량 감지
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/detect.jpg" height="300">

**YOLO기반 Object Detection으로 사람 및 자동차를 식별합니다.**  

### 감지 후 이동 거리 추적 시각화 및 자동 녹화
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/motion_liner.jpg" height="300">

**해당 객체가 움직임이 없어지면 경로를 추적하여 사용자에게 보여줍니다.**  
**또 (감지~움직임 감지 끝) 분기를 녹화하여 사용자에게 보여줍니다.**

### 일별 시계열 통계
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/statistics.PNG" height="300">

**일별로 데이터를 기록하여 0~24시까지 감지된 정보를 알려줍니다.**

### 과거 식별 데이터 스트리밍
<img src="https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/preview/prev_data_streaming.PNG" height="300">

**통계에서 해당 시간을 선택할 시 그 시간대에 감지됐던 식별 동영상을 볼 수 있습니다.**
## 컴퓨터 구성 / 필수 조건 안내 (Prerequisites)
* **ECMAScript 6 지원 브라우저 사용**
* **권장: Google Chrome 버젼 77 이상**
* **Golang 설치**
* **IP Camera 또는 RTSP 스트리밍을 지원하는 DVR**
## 기술 스택 (Technique Used)
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
 
## 설치 안내 (Installation Process)

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

## 프로젝트 사용법 (Getting Started)

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

## 팀 정보 (Team Information)
- 강선규 (gron1gh1@gmail.com), Github Id: gron1gh1
- 신기철 (skck0226@gmail.com), Github Id: skck0226
- 장성호 (csi9725@naver.com), Github Id: JangSeongHo99
- 백승민 (zlws554@naver.com), Github Id: me9min
- 이승규 (dltmdrb98@gmail.com), Github Id: seungy0
- 오택환 (jamesoh3928@naver.com), Github Id:jamesoh3928

## 저작권 및 사용권 정보 (Copyleft / End User License)
 * [MIT](https://github.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/blob/main/LICENSE)
