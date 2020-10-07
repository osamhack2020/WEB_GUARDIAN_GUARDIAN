import React, { useState,useEffect } from "react";
import { Card,Image} from "antd";

export default function CameraFrame() {
    const [Frame,SetFrame] = useState<string>('');
  return (
        <Image
        className="ant-card-hoverable"
        style={{width:480,height:270}}
        src={`http://${window.location.hostname}:8081/video`}
      />
  );
}
