import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "antd";
import produce from "immer";
import VideoPlayer from "./VideoPlayer";

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
}: {
  visible: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const [Data, SetData] = useState<any[]>([]);
  const [VideoView, SetVideo] = useState<string>("");
  useEffect(() => {
    SetData(
      produce(Data, (draft) => {
        for (let i = 0; i < 70; i++) {
          draft.push({
            key: i,
            Thumb: "",
            Thumb2: "",
            SetVideo:SetVideo,
            Date: "2020-10-24 13:34:34",
            View: "사람 2명 식별",
          });
        }
      })
    );
  }, []);

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
