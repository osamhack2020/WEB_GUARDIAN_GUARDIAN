import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Spin,
  Row,
  Col,
  Dropdown,
  Menu,
  Slider,
  Layout,
  Tag,
  Carousel,
} from "antd";
import {
  LoadingOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { SettinActions } from "./Reducer";
import { IClickPos, ISelect } from "./Interface";
import ConvexHull_2D from "./ConvexHull";
import { CameraRTSPUrl } from "./Util";
import axios from "axios";
import produce from "immer";
import { BACKEND_URL } from "./Constant";
type CanvasContext = CanvasRenderingContext2D | null | undefined;
const ScreenX: number = 854;
const ScreenY: number = 480;

function drawPoint(ctx: CanvasContext, position: IClickPos) {
  if (ctx) ctx.strokeStyle = "rgb(0, 0, 255)";
  ctx?.beginPath();
  ctx?.arc(position.X, position.Y, 2, 0, 2 * Math.PI, true);
  ctx?.fill();
  ctx?.closePath();
  ctx?.stroke();
}

function drawLine(ctx: CanvasContext, start: IClickPos, end: IClickPos) {
  if (ctx) ctx.strokeStyle = "rgb(255, 0, 0)";
  ctx?.beginPath();
  ctx?.moveTo(start.X, start.Y);
  ctx?.lineTo(end.X, end.Y);
  ctx?.closePath();
  ctx?.stroke();
}
interface IDetectionAreaBox {
  CameraIdx: number;
}

function DetectionAreaBox({ CameraIdx }: IDetectionAreaBox) {
  const dispatch = useDispatch();
  const ConvexHullPos = useSelector(
    (state: ISelect) => state.settingReducer.ConvexHullPos
  );
  const [ClickPos, SetPos] = useState<IClickPos[][]>(
    Array.from(Array(6), () => new Array())
  );
  const [Spinning, SetSpinning] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onCanvasClick = useCallback(
    (e: MouseEvent) => {
      SetPos(
        produce(ClickPos, (draft) => {
          draft[CameraIdx].push({ X: e.offsetX, Y: e.offsetY });
        })
      );
    },
    [CameraIdx, ClickPos]
  ); // 클릭했을 때, 카메라 화면 바뀌었을 때

  const onClearBtn = () => {
    let canvas: HTMLCanvasElement | null = canvasRef.current;
    let ctx: CanvasContext = canvas?.getContext("2d");
    ctx?.clearRect(0, 0, ScreenX, ScreenY);
    let Pos = ClickPos.slice();
    Pos[CameraIdx] = [];
    SetPos(Pos);
  };

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = canvasRef.current;
    canvas?.addEventListener("click", onCanvasClick);
    if (ClickPos[CameraIdx].length > 0) {
      dispatch(
        SettinActions.SetConvexHullPos(
          CameraIdx,
          ConvexHull_2D(ClickPos[CameraIdx].slice())
        )
      );
    } else if (ClickPos[CameraIdx].length === 0) {
      // 배열에 간선이 0개 이면 이전에 그려진 그림 초기화
      let ctx: CanvasContext = canvas?.getContext("2d");
      ctx?.clearRect(0, 0, ScreenX, ScreenY);
    }
    return () => {
      canvas?.removeEventListener("click", onCanvasClick);
    };
  }, [ClickPos, CameraIdx]); // 클릭했을 때랑 카메라 바뀌었을 때

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = canvasRef.current;
    let ctx: CanvasContext = canvas?.getContext("2d");
    ctx?.clearRect(0, 0, ScreenX, ScreenY);
    for (var i = 0; i < ConvexHullPos[CameraIdx].length; i++) {
      // 점 띄우기
      drawPoint(ctx, ConvexHullPos[CameraIdx][i]);
    }
    if (ConvexHullPos[CameraIdx].length > 2) {
      // 라인 그리기
      for (var i = 0; i < ConvexHullPos[CameraIdx].length - 1; i++)
        drawLine(
          ctx,
          ConvexHullPos[CameraIdx][i],
          ConvexHullPos[CameraIdx][i + 1]
        );
      drawLine(
        ctx,
        ConvexHullPos[CameraIdx][ConvexHullPos[CameraIdx].length - 1],
        ConvexHullPos[CameraIdx][0]
      );
    }
  }, [ConvexHullPos, CameraIdx]);

  return (
    <div>
      <Spin
        tip="Camera Loading"
        style={{
          color: "#607D8B",
          position: "absolute",
          width: `${ScreenX}px`,
          height: `${ScreenY}px`,
        }}
        spinning={Spinning}
        indicator={
          <LoadingOutlined style={{ fontSize: 24, color: "#607D8B" }} spin />
        }
      >
        <img
          onLoad={() => SetSpinning(false)}
          onError={(e) => {
            e.currentTarget.src = "";
            e.currentTarget.src = CameraRTSPUrl[CameraIdx];
          }}
          style={{
            position: "relative",
            left: 0,
            top: 0,
            width: `${ScreenX}px`,
            height: `${ScreenY}px`,
          }}
          src={CameraRTSPUrl[CameraIdx]}
        />
        <canvas
          width={`${ScreenX}`}
          height={`${ScreenY}`}
          ref={canvasRef}
          style={{ cursor: "pointer", position: "absolute", left: 0, top: 0,zIndex:999 }}
        />
      </Spin>
      <Button type="primary" onClick={onClearBtn} style={{ width: "100%" }}>
        영역 설정 초기화
      </Button>
    </div>
  );
}

const StateTag = {
  success: (
    <Tag icon={<CheckCircleOutlined />} color="success">
      success
    </Tag>
  ),
  processing: (
    <Tag icon={<SyncOutlined spin />} color="processing">
      processing
    </Tag>
  ),
  fail: (
    <Tag icon={<CloseCircleOutlined />} color="error">
      error
    </Tag>
  ),
  wait: (
    <Tag icon={<ClockCircleOutlined />} color="default">
      wait
    </Tag>
  ),
};

export function RuningFooter() {
  const ConvexHullPos = useSelector(
    (state: ISelect) => state.settingReducer.ConvexHullPos
  );
  const [WorkState, SetWorkState] = useState(StateTag.wait);

  return (
    <Layout.Footer
      style={{ background: "white", borderTop: "1px solid rgb(206,206,206)" }}
    >
      <Button
        type="primary"
        onClick={() => {
          SetWorkState(StateTag.processing); // 임시 상태 테스트
          setTimeout(() => {
            SetWorkState(StateTag.success);
            console.log({
              ViewSize: { X: ScreenX, Y: ScreenY },
              DetectPoint: ConvexHullPos,
            });
            axios
              .post(`${BACKEND_URL}/SetDetectPoint`, {
                ViewSize: { X: ScreenX, Y: ScreenY },
                DetectPoint: ConvexHullPos,
              })
              .then(function (response) {
                console.log(response);
              });
          }, 1000);
        }}
      >
        감지시작
      </Button>
      <Button type="primary" disabled>
        감지중지
      </Button>
      {WorkState}
    </Layout.Footer>
  );
}
export default function Setting() {
  return (
    <>
      <Row>
        <Col
          sm={ScreenY}
          style={{ position: "relative", background: "#C8D2D7" }}
        >
          <Carousel effect="fade" style={{
            position: "relative",
            width: `${ScreenX}px`,
            height: `${ScreenY}px`,
          }}>
            <DetectionAreaBox CameraIdx={0} />
            <DetectionAreaBox CameraIdx={1} />
            <DetectionAreaBox CameraIdx={2} />
            <DetectionAreaBox CameraIdx={3} />
            <DetectionAreaBox CameraIdx={4} />
            <DetectionAreaBox CameraIdx={5} />
          </Carousel>
        </Col>
        <Col flex={1}>
          <span>
            설정 <Slider defaultValue={10} tooltipVisible />
          </span>
        </Col>
      </Row>
    </>
  );
}
