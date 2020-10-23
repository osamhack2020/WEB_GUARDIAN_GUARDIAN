import React from "react";
import { Modal } from "antd";
import VideoPlayer from "./VideoPlayer";
export function VideoViewer({
  visible,
  src,
  onClose,
}: {
  visible: boolean;
  src: string;
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
      <VideoPlayer src={src} />
    </Modal>
  );
}
