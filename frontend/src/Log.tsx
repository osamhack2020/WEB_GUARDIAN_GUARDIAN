import React,{useState,useEffect,useRef} from "react";
import {useSelector} from "react-redux";
import { Card, Image } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import {ILogItem,IDetectData, ISelect} from "./Interface";
import {
  VideoCameraOutlined
} from "@ant-design/icons";
const { Meta } = Card;

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
export default function Log() {
  const Data = useSelector((state : ISelect) => state.mainReducer.DetectLog);
  //const [Data,SetData] = useState<IDetectData[]>([])
  const ref = useRef<Scrollbars>(null)

  useEffect(() => {
    ref.current?.scrollToBottom()
  },[])

  return (
    <div>
      <Scrollbars style={{height:"100vh"}} autoHide ref={ref}>
      {Data.map((v: IDetectData) => <LogItem src={v.thumbnail} content={v.content} time={v.time} / >)}
      </Scrollbars>
    </div>
  );
}
