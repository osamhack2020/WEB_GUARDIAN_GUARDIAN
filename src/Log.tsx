import React from "react";
import { Card, List, Avatar } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import {ILogItem} from "./Interface";
import {
  EllipsisOutlined,
  EditOutlined,
  SettingOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
const { Meta } = Card;

function LogItem({src,content,time} : ILogItem) {
  return (
    <Card
    style={{ width: 300 }}
    cover={
      <img
        alt="example"
        src="https://via.placeholder.com/350x150"
      />
    }
    actions={[<span><VideoCameraOutlined key="video" /> 식별 비디오</span>]}
  >
    <Meta title={content} description={time} />
  </Card>
  )
}
export default function Log() {
  const arr: Number[] = [1, 2, 3, 4, 5];
  return (
    <div>
      <Scrollbars style={{height:"100vh"}} autoHide>
      {arr.map((v: Number) => <LogItem src="" content={`${v}`} time="2020-10-02 오후 12:29" / >)}
      </Scrollbars>
    </div>
  );
}
