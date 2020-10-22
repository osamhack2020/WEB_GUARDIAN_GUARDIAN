import React, { useState, useEffect } from "react";
import { Spin, Row, Col } from "antd";
import "./index.css";
import { CameraRTSPUrl } from "./Util";
import { LoadingOutlined } from "@ant-design/icons";
import { MainActions } from "./Reducer";
import { ISelect } from "./Interface";
import { useDispatch, useSelector } from "react-redux";
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

function Camera({ CameraURL, height }: ICamera) {
  // Spinner & Auto Reload
  const dispatch = useDispatch();
  // dispatch(MainActions.addComponent())
  const [Spinning, SetSpinning] = useState<boolean>(true);
  return (
    <Spin
      tip="Camera Loading"
      spinning={Spinning}
      style={{ color: "#607D8B" }}
      indicator={
        <LoadingOutlined style={{ fontSize: 24, color: "#607D8B" }} spin />
      }
    >
      <div style={{ height, background: "#607D8B" }}>
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
var M = "0";
export default function CameraWrapper() {
  const ViewURL = useSelector((state: ISelect) => state.mainReducer.ViewURL);
  const dispatch = useDispatch();
  const onDragStart = (e: any) => {
    e.dataTransfer.setData("targetId", e.target.id);
  };
  const onDragOver = (e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const onDrop = (e: any) => {
    let startId = e.dataTransfer.getData("targetId");
    M = startId;
    dispatch(MainActions.swap(M, "0"));
  };
  useEffect((): any => {
    console.log(ViewURL);
  }, [ViewURL]);

  return (
    <div>
      <Row style={{ height: "63vh" }} gutter={16}>
        <Col span={16} id="0" onDrop={onDrop} onDragOver={onDragOver}>
          <Camera CameraURL={ViewURL[0]} height="61.6vh" />
        </Col>
        <Col span={8}>
          <Row gutter={[16, 16]}>
            <Col
              style={{ width: "60vh" }}
              id="1"
              draggable="true"
              onDragStart={onDragStart}
            >
              <Camera CameraURL={ViewURL[1]} height="30vh" />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col
              style={{ width: "60vh" }}
              id="2"
              draggable="true"
              onDragStart={onDragStart}
            >
              <Camera CameraURL={ViewURL[2]} height="30vh" />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ height: "30vh" }} gutter={16}>
        <Col span={8} id="3" draggable="true" onDragStart={onDragStart}>
          <Camera CameraURL={ViewURL[3]} height="30vh" />
        </Col>
        <Col span={8} id="4" draggable="true" onDragStart={onDragStart}>
          <Camera CameraURL={ViewURL[4]} height="30vh" />
        </Col>
        <Col span={8} id="5" draggable="true" onDragStart={onDragStart}>
          <Camera CameraURL={ViewURL[5]} height="30vh" />
        </Col>
      </Row>
    </div>
  );
}
