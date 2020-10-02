<<<<<<< HEAD
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
=======
# guardian
국방오픈소스아카데미 해커톤

# 정리

## 프론트엔드
**React로 구현  
Bootstrap이나 Antd 사용. (디자인)  
socket.io 라이브러리로 서버와 실시간 통신 (서버 주는 데이터 실시간 시간 받기)  
상황일지 작성 (몇시 몇분부 사람 식별, 자동차 식별)  
데이터 시각화 (타임라인 그래프로 움직임 감지에 관한 그래프)  
RTSP 스트리밍**


## 클라우드
**Docker로 OpenCV C++ Lib 컴파일한 이미지 굽기.  
웹서버 컨테이너 (Node.js)  
데이터베이스 컨테이너 (SQL or mongoDB)  
영상처리 컨테이너 (C++)  
RTSP 스트리밍 프레임 가져오는 컨테이너 (Node.js)**

## 백엔드
**OpenCV 카메라 프레임 구하기**



## 테스트  
**적절한 영상 구해서 영상 RTSP 스트리밍하고 VLC로 스트리밍 되나 확인한다.  
RTSP 스트림을 백엔드에서 프레임 받아와서 프론트엔드로 넘겨준다.  
만약 이 방식이 백엔드에 부하를 걸면 프론트엔드에서 RTSP 스트리밍이 가능한지 확인한다.**
>>>>>>> 87c22d50f73e44733eb28919430579be694c6adf
