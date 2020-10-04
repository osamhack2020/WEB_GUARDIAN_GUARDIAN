import React, { useState,useEffect } from "react";
import { Card,Image} from "antd";

import io from "socket.io-client";
const socket = io(`http://${window.location.hostname}:8081/`,{ transports: ["websocket"]});
/*
 window.socket = io({transports: ['websocket']});
        socket.on('frame', function(res){
            let data = res;
            $('#frame').attr('src',`data:image/jpeg;base64,${data}`);
        });
 */
export default function CameraFrame() {
    const [Frame,SetFrame] = useState<string>('');
    useEffect((): any =>{
        socket.on('frame', function(res : string){
            let data : string = res;
            SetFrame(`data:image/jpeg;base64,${data}`);
        });
        return (): any => socket.off('frame'); // componentWillUnmount 
    },[])
  return (

        <Image
        className="ant-card-hoverable"
        style={{width:480,height:270}}
        src={Frame}
      />
  );
}
