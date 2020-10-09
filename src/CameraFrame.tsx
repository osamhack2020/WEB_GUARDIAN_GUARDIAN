import React, { useState,useEffect } from "react";
import { Card,Image} from "antd";
import "./index.css";
import {CameraRTSPUrl} from "./Util";
/*

> Camera URL
`http://${window.location.hostname}:8081/camera_1`
`http://${window.location.hostname}:8081/camera_2`
`http://${window.location.hostname}:8081/camera_3`
    ...

 */
export default function CameraFrame() {
    const [Frame,SetFrame] = useState<string>('');
  return (
      <div style={{marginTop:"100px"}}>
      <div id="mainFrame">
      <Image
      className="ant-card-hoverable2"
      src={CameraRTSPUrl[0]}
      />
      </div>
      <div id="firstFrame">
      <Image
      className="ant-card-hoverable"
      src={"http://placehold.it/320x180"}
      />
      <Image
      className="ant-card-hoverable"
      src={"http://placehold.it/320x180"}
      />
      </div>
      <div id="secondFrame">
      <Image
      className="ant-card-hoverable"
      src={"http://placehold.it/320x180"}
      />
      <Image
      className="ant-card-hoverable"
      src={"http://placehold.it/320x180"}
      />
      <Image
      className="ant-card-hoverable"
      src={"http://placehold.it/320x180"}
      />
      </div>
      </div>
  );
}
