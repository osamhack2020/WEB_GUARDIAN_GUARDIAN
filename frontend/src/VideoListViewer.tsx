import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "antd";
import produce from "immer";
import VideoPlayer from "./VideoPlayer";
import { GetPostData } from "./Util";
import { BACKEND_URL } from "./Constant";
const columns = [
  {
    title: "Thumbnail-Detect",
    dataIndex: "Thumb",
    render: (text: any, row: any, index: any) => (
      <img style={{ width: 230, height: 200 }} src={text} />
    ),
    width: 70,
  },
  {
    title: "Thumbnail-Motion Liner",
    dataIndex: "Thumb2",
    render: (text: any, row: any, index: any) => (
      <img style={{ width: 230, height: 200 }} src={text} />
    ),
    width: 70,
  },
  {
    title: "Date",
    dataIndex: "Date",
    render: (text: any, row: any, index: any) => (
      <p style={{ fontWeight: "bold", textAlign: "center" }}>{text}</p>
    ),
    width: 30,
  },
  {
    dataIndex: "SetVideo",
    render: (SetVideo: any, row: any, index: any) => (
      <Button type="primary" onClick={() => SetVideo("1")}>
        동영상 보기
      </Button>
    ),
    width: 50,
  },
];

export default function VideoListViewer({
  visible,
  onClose,
  date
}: {
  visible: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
  date: string;
}) {
  const [Data, SetData] = useState<any[]>([]);
  const [VideoView, SetVideo] = useState<string>("");
  useEffect(() => {
    if (visible) {
      GetPostData(date, "GetVideoFile").then((res: any) => {
        if (res.data.length > 0) {
          let File: string[] = res.data.map((v: string) => v.slice(0, -4));
          SetData(File.map((v, i) => {
            let DateString = v.split("_");
            DateString[1] = DateString[1].slice(0,2)+":"+DateString[1].slice(2,4)+":"+DateString[1].slice(4,6);
            return {
              key: i,
              Thumb: `${BACKEND_URL}/detect_video/${v}_thumb.jpg`,
              Thumb2: `${BACKEND_URL}/detect_video/${v}_thumb2.jpg`,
              SetVideo: SetVideo,
              Date: DateString.join(" "),
            }
          }))
        }
      });
    }
  }, [visible])

  return (
    <Modal
      title="Check Detection Video"
      centered
      visible={visible}
      onCancel={onClose}
      width={890}
      footer={null}
    >
      {VideoView === "" ? (
        <Table
          bordered={true}
          columns={columns}
          dataSource={Data}
          pagination={{ pageSize: 50 }}
          scroll={{ y: 500 }}
        />
      ) : (
          <Button>A</Button>
        )}
    </Modal>
  );
}
