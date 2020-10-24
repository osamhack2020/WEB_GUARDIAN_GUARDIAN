import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Card, Image } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import { ILogItem, IDetectData, ISelect } from "./Interface";
import { VideoCameraOutlined } from "@ant-design/icons";
import { produce } from "immer";
import { BACKEND_URL } from "./Constant";
import VideoViewer from "./VideoViewer";
const { Meta } = Card;

function LogItem({ src, content, time, state, onState }: ILogItem) {
  return (
    <Card
      style={{ width: 300 }}
      cover={<Image style={{ cursor: "pointer" }} src={src} />}
      actions={[
        <span
          onClick={() => {
            let transTime = time.replace(/:/g, "").replace(/ /g, "_");
            onState({
              showViewer: true,
              Src: `${BACKEND_URL}/detect_video/${transTime}.mp4`,
            });
          }}
        >
          <VideoCameraOutlined key="video" /> 식별 비디오
        </span>,
      ]}
    >
      <Meta title={content} description={time} />
    </Card>
  );
}
export default function Log() {
  const [state, SetState] = useState({
    showViewer: false,
    Src: "",
  });
  const Data = useSelector((state: ISelect) => state.mainReducer.DetectLog);
  const ref = useRef<Scrollbars>(null);

  useEffect(() => {
    ref.current?.scrollToBottom();
  }, []);

  return (
    <div>
      <Scrollbars style={{ height: "100vh" }} autoHide ref={ref}>
        {Data.map((v: IDetectData) => (
          <LogItem
            src={v.thumbnail}
            content={v.content}
            time={v.time}
            onState={SetState}
            state={state}
          />
        ))}
      </Scrollbars>
      <VideoViewer
        onClose={() =>
          SetState(
            produce(state, (draft) => {
              draft.showViewer = false;
            })
          )
        }
        visible={state.showViewer}
        src={state.Src}
      />
    </div>
  );
}
