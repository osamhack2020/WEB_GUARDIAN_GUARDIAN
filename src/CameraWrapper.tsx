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
}

function Camera({  CameraURL,height }: ICamera) {
  // Spinner & Auto Reload
  const [Spinning, SetSpinning] = useState<boolean>(true);
  return (
    <Spin tip="Camera Loading" spinning={Spinning} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
      <div style={{height}}>
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
        />
      </div>
    </Spin>
  );
}

// export default function CameraWrapper() {
//   return (
//     <div style={{ marginTop: "100px" }}>
//       <div id="mainFrame">
//         <Camera className="lFrame" CameraURL={CameraRTSPUrl[0]} />
//       </div>

//       <div id="firstFrame">

//         <Image className="sFrame" src={"http://placehold.it/320x180"} />
//         <Image className="sFrame" src={"http://placehold.it/320x180"} />
//       </div>
//       <div id="secondFrame">
//         <Image className="sFrame" src={"http://placehold.it/320x180"} />
//         <Image className="sFrame" src={"http://placehold.it/320x180"} />
//         <Image className="sFrame" src={"http://placehold.it/320x180"} />
//       </div>
//     </div>
//   );
// }

export default function CameraWrapper() {
  return (
    <div>
      <Row style={{ height: "60vh" }}>
        <Col style={{ background: "skyblue" }} span={16}>
          <Camera CameraURL={CameraRTSPUrl[0]} height="60vh" />
        </Col>
        <Col span={8}>
          <Row style={{ height: "30vh" , background: "yellow" }}>
          <Col style={{width:'60vh'}}>
            <Camera CameraURL={CameraRTSPUrl[1]} height="30vh" />
            </Col>
          </Row>
          <Row style={{ height: "30vh" , background: "gray" }}>
          <Col style={{width:'60vh'}}>
            <Camera CameraURL={CameraRTSPUrl[2]} height="30vh" />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ height: "30vh" }}>
        <Col style={{ background: "red" }} span={8}>
        <Camera CameraURL={CameraRTSPUrl[0]} height="30vh" />
        </Col>
        <Col style={{ background: "green" }} span={8}>
        <Camera CameraURL={CameraRTSPUrl[2]} height="30vh" />
        </Col>
        <Col style={{ background: "blue" }} span={8}>
        <Camera CameraURL={CameraRTSPUrl[2]} height="30vh" />
        </Col>
      </Row>
    </div>
  );
}
