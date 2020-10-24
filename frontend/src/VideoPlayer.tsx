import React, { useState, useRef, useEffect } from "react";
import videojs from "video.js";
import "./video-js.css";
export default function VideoPlayer({ src }: { src: string }) {
  const videoNode = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let player = videojs(videoNode.current, {
      autoplay: true,
      controls: true,
      sources: [
        {
          src,
          type: "video/mp4",
        },
      ],
    });
    return () => {
      if (player) player.dispose();
    };
  }, []);

  return (
    <div>
      <div data-vjs-player>
        <video ref={videoNode} className="video-js"></video>
      </div>
    </div>
  );
}
