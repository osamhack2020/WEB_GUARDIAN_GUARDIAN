
import React, { useState, useEffect } from "react";
import { Spin,Row, Col } from "antd";
import "./index.css";
import { CameraRTSPUrl } from "./Util";
import { LoadingOutlined } from '@ant-design/icons';
/*
>>
> Camera URL
`http://${window.location.hostname}:8081/camera_1`
`http://${window.location.hostname}:8081/camera_2`
`http://${window.location.hostname}:8081/camera_3`
    ...

 */
interface ICamera {
  CameraURL: string;
  height: string;
  id: string;
}

function Camera({  CameraURL, height, id}: ICamera) {
  // Spinner & Auto Reload
  const [Spinning, SetSpinning] = useState<boolean>(true);
  return (
    <Spin tip="Camera Loading" spinning={Spinning} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
      <div style={{height,background:'skyblue'}}>
        <img
          width="100%"
          height="100%"
          onLoad={() => SetSpinning(false)} // 로딩 성공 시 Spin 종료
          onError={(e) => {
            // 로딩 실패 시 경로 재설정 (ReLoad)
            e.currentTarget.src = "";
            e.currentTarget.src = CameraURL;
          }}
          src={CameraURL}
          id={id}
        />
      </div>
    </Spin>
  );
}
var whatCh=[
  "0","1","2","3","4","5"
]
var makeBig="0";

var frame =[
  {src:"http://placehold.it/320x180"},
  {src:"http://placehold.it/420x180"},
  {src:"http://placehold.it/520x180"},
  {src:"http://placehold.it/620x180"},
  {src:"http://placehold.it/720x180"},
  {src:"http://placehold.it/820x180"}
]
var frameM = "http://placehold.it/320x180";
var frame1 = [
  {src:"http://placehold.it/420x180"},
  {src:"http://placehold.it/520x180"}
];
var frame2 = [
  {src:"http://placehold.it/620x180"},
  {src:"http://placehold.it/720x180"},
  {src:"http://placehold.it/820x180"}
];
const reRender = (arr:Array<String>,makeBig:String)=>{
  arr.splice(arr.indexOf(makeBig),1);
  arr.sort(function(a, b) { // 오름차순
    return Number(a) - Number(b);
  });
  arr.unshift(makeBig);
}
export default function CameraWrapper() {
  var dragStart = (e:any)=>{
    makeBig=whatCh[e.target.id];
    // console.log(e.target.id);
    // console.log("whatCh: "+whatCh);
    // console.log("makeBig: "+makeBig);
  }
  var drop = (e:any)=>{
    
    console.log("makeBig: "+makeBig);
    if(makeBig!==main){
      reRender(whatCh,makeBig);
      // console.log(whatCh);
      reRender(frame,makeBig);
      setMain(makeBig);
    }
  }
  const [main,setMain] = useState<String>("0");

  useEffect(() => {
    // console.log("frame change~")
    // console.log("main: "+main);
    // console.log("watCh"+whatCh);
    var N=Number(main);
    var k=0,l=0;;
    frameM=frame[Number(main)].src;
    for(var i=0;i<3;i++){
      if(N>2&&i===2) break;
      if(i===N){
        continue;
      }
      frame1[k].src=frame[i].src;
      k++;
    }
    for(var i=2;i<6;i++){
      if(N<2&&i===2) continue;
      if(i===N){
        continue;
      }
      frame2[l].src=frame[i].src;
      l++;
    }
    console.log(frameM);
    console.log(frame1[0].src);
    console.log(frame1[1].src);
    console.log(frame2[0].src);
    console.log(frame2[1].src);
    console.log(frame2[2].src);
    frame[0].src=frameM;
    frame[1].src=frame1[0].src; 
    frame[2].src=frame1[1].src;
    frame[3].src=frame2[0].src;
    frame[4].src=frame2[1].src;
    frame[5].src=frame2[2].src;
    // frame.sort(function(a, b) { // 오름차순
    //     return Number(a) - Number(b);
    //   });
    // frame.unshift(frame[1]);
    // frame.splice(1,1);    
    // console.log(frame[0].src);
    // console.log(frame[1].src);
    // console.log(frame[2].src);
    // console.log(frame[3].src);
    // console.log(frame[4].src);
    // console.log(frame[5].src);
  },[main]);

  return (
    <div>
      <Row style={{ height: "60vh" }}>
        <Col span={16} onDragOver={e=>{e.preventDefault();}} onDrop={drop}>
          <Camera CameraURL={frameM} height="60vh" id="0"/>
        </Col>
        <Col span={8}>
          <Row style={{ height: "30vh" }}>
          <Col style={{width:'60vh'}} draggable="true" onDragStart={dragStart}>
            <Camera CameraURL={frame1[0].src} height="30vh" id="1"/>
          </Col>
          </Row>
          <Row style={{ height: "30vh" }}>
          <Col style={{width:'60vh'}} draggable="true" onDragStart={dragStart}>
            <Camera CameraURL={frame1[1].src} height="30vh" id="2"/>
          </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ height: "30vh" }}>
        <Col span={8} draggable="true" onDragStart={dragStart}>
          <Camera CameraURL={frame2[0].src} height="30vh" id="3" />
        </Col>
        <Col span={8} draggable="true" onDragStart={dragStart}>
          <Camera CameraURL={frame2[1].src} height="30vh" id="4"/>
        </Col>
        <Col span={8} draggable="true" onDragStart={dragStart}>
          <Camera CameraURL={frame2[2].src} height="30vh" id="5"/>
        </Col>
      </Row>
    </div>
  );
}
