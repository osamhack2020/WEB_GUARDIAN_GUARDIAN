import React, { useState, useEffect } from "react";
import { Spin,Row, Col } from "antd";
import "./index.css";
import { CameraRTSPUrl } from "./Util";
/*
>>
> Camera URL
`http://${window.location.hostname}:8081/camera_1`
`http://${window.location.hostname}:8081/camera_2`
`http://${window.location.hostname}:8081/camera_3`
    ...

 */

interface ICamera {
  className?: string;
  CameraURL: string;
}

function Camera({ className, CameraURL }: ICamera) {
  // Spinner & Auto Reload
  const [Spinning, SetSpinning] = useState<boolean>(true);
  return (
    <Spin tip="Camera Loading" spinning={Spinning} style={{height:'100vh'}}>
      <div>
        <img
          style={{width:'100vh'}}
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
      <Row style={{ height: "500px" }}>
        <Col style={{ background: "skyblue" }} span={16}>
        <Camera className="lFrame" CameraURL={CameraRTSPUrl[0]} />
        </Col>
        <Col span={8}>
          <Row style={{ height: "250px", background: "yellow" }}>Sub1</Row>
          <Row style={{ height: "250px", background: "gray" }}>Sub2</Row>
        </Col>
      </Row>
      <Row style={{ height: "250px" }}>
        <Col style={{ background: "red" }} span={8}>
          Sub3
        </Col>
        <Col style={{ background: "green" }} span={8}>
          Sub4
        </Col>
        <Col style={{ background: "blue" }} span={8}>
          Sub5
        </Col>
      </Row>
    </div>
  );
}
