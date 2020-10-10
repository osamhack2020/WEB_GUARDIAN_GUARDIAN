import React,{useState,useEffect} from "react";
import { Card, Image } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import {ILogItem} from "./Interface";
import io from "socket.io-client";
import {
  VideoCameraOutlined
} from "@ant-design/icons";
const { Meta } = Card;

const socket = io(`http://${window.location.hostname}:8081/`,{ transports: ["websocket"]});

function LogItem({src,content,time} : ILogItem) {
  return (
    <Card
    style={{ width: 300 }}
    cover={
      <Image
        style={{cursor:'pointer'}}
        src={src}
      />
    }
    actions={[<span><VideoCameraOutlined key="video" /> 식별 비디오</span>]}
  >
    <Meta title={content} description={time} />
  </Card>
  )
}
interface IDetectData{
  thumbnail: string
  content: string
  time: string
}
export default function Log() {
  const [Data,SetData] = useState<IDetectData[]>([])
  useEffect((): any => {
    socket.on('detect', function(res : string){
    //  console.log(res)
      let DetectData = JSON.parse(res);
      SetData(Data.concat({
        thumbnail: `data:image/jpeg;base64,${DetectData.thumbnail}`,
        content: DetectData.content + " 식별",
        time: DetectData.time
      }))
       // let data : string = res;
    });
    return (): any => socket.off('frame'); // componentWillUnmount 
},[Data])
  return (
    <div>
      <Scrollbars style={{height:"100vh"}} autoHide>
      {Data.map((v: IDetectData) => <LogItem src={v.thumbnail} content={v.content} time={v.time} / >)}
      </Scrollbars>
    </div>
  );
}
