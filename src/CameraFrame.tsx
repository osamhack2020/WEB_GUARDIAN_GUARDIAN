import React, { useState,useEffect } from "react";
import { Card,Image} from "antd";
import "./index.css";
export default function CameraFrame() {
    const [Frame,SetFrame] = useState<string>('');
  return (
      <div style={{marginTop:"100px"}}>
      <div id="mainFrame">
      <Image
      className="ant-card-hoverable2"
      src={"http://placehold.it/320x180"}
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
