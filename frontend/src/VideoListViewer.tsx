import React from "react";
import { Modal,Table,Button } from "antd";
import VideoPlayer from "./VideoPlayer";

const columns = [
    {
      title: 'Thumbnail',
      render: () => <img style={{width:120,height:100}}src="https://raw.githubusercontent.com/osamhack2020/WEB_GUARDIAN_GUARDIAN/main/logo.png" />,
      width: 150,
    },
    {
      title: 'Date',
      dataIndex: 'Date',
      width: 150,
    },
    {
      title: 'View',
      dataIndex: 'View',
    },
    {
        render: () => <Button type="primary">동영상 보기</Button>,
        width: 200,
    }
  ];
  
const data : any[] = [];
  for (let i = 0; i < 100; i++) {
    data.push({
      key: i,
      Date: 20201024,
      View: "사람 2명 식별"
    });
  }

export default function VideoListViewer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Modal
      title="Check Detection Video"
      centered
      visible={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 50 }} scroll={{ y: 500 }} />
    </Modal>
  );
}
