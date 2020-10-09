import React, { useState, useEffect, useRef } from "react";
import { IClickPos } from "./Interface";
import ConvexHull_2D from "./ConvexHull";

type CanvasContext = CanvasRenderingContext2D | null | undefined;

function drawPoint(ctx: CanvasContext, position: IClickPos) {
  if (ctx)
    ctx.strokeStyle = "rgb(0, 0, 255)"
  ctx?.beginPath();
  ctx?.arc(position.X, position.Y, 2, 0, 2 * Math.PI, true)
  ctx?.fill();
  ctx?.closePath()

  ctx?.stroke();
}


function drawLine(ctx: CanvasContext, start: IClickPos, end: IClickPos) {
  if (ctx)
    ctx.strokeStyle = "rgb(255, 0, 0)"
  ctx?.beginPath()
  ctx?.moveTo(start.X, start.Y)
  ctx?.lineTo(end.X, end.Y)
  ctx?.closePath()
  ctx?.stroke();
}

export default function Setting() {
  const [ClickPos, SetPos] = useState<IClickPos[]>([]);
  const [ConvexHullPos, SetConvexHull] = useState<IClickPos[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCanvasClick = (e: MouseEvent) => {
    SetPos(ClickPos.concat({ X: e.offsetX, Y: e.offsetY }))
  }

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = canvasRef.current;
    let ctx: CanvasContext = canvas?.getContext('2d');
    canvas?.addEventListener("click", onCanvasClick);

    if (ClickPos.length > 0)
      SetConvexHull(ConvexHull_2D(ClickPos));
    
    return () => {
      canvas?.removeEventListener("click", onCanvasClick);
    }
  }, [ClickPos]);

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = canvasRef.current;
    let ctx: CanvasContext = canvas?.getContext('2d');
    console.log(ConvexHullPos);
    let img: HTMLImageElement = new Image();
    img.onload = function () {
      ctx?.drawImage(img, 0, 0);

      for (var i = 0; i < ConvexHullPos.length; i++) { // 점 띄우기
        drawPoint(ctx, ConvexHullPos[i])
      }
      if (ConvexHullPos.length > 2) { // 라인 그리기
        for (var i = 0; i < ConvexHullPos.length - 1; i++)
          drawLine(ctx, ConvexHullPos[i], ConvexHullPos[i + 1])
        drawLine(ctx, ConvexHullPos[ConvexHullPos.length - 1], ConvexHullPos[0])
      }

    };
    img.src = `http://${window.location.hostname}:8081/camera_1`;
  }, [ConvexHullPos])
  return (
    <canvas
    width="1024"
    height="768"
      ref={canvasRef}
      style={{ cursor: 'pointer' }}

    />
  )
}