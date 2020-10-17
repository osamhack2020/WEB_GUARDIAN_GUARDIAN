package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"
	
	gosocketio "github.com/graarh/golang-socketio"
	"gocv.io/x/gocv"
)

func DetectStart(CapUrl string, Server *gosocketio.Server, DetectPointChannel chan DetectPointInfo) {
	cap, err := gocv.OpenVideoCapture(CapUrl)
	if err != nil {
		fmt.Printf("Error opening capture device")
		return
	}
	defer cap.Close()

	// Motion Init
	mog2 := gocv.NewBackgroundSubtractorMOG2()
	defer mog2.Close()

	// YOLO Init
	net := gocv.ReadNet("./assets/yolov4.weights", "./assets/yolov4.cfg")
	defer net.Close()
	net.SetPreferableBackend(gocv.NetBackendType(gocv.NetBackendDefault))
	net.SetPreferableTarget(gocv.NetTargetType(gocv.NetTargetCPU))
	classes := ReadCOCO()
	OutputNames := getOutputsNames(&net)

	img := gocv.NewMat()
	defer img.Close()

	oriImg := gocv.NewMat()
	defer oriImg.Close()
	FrameChannel := make(chan gocv.Mat)
	type IYoloData struct {
		original gocv.Mat
		roi      gocv.Mat
	}
	YoloChannel := make(chan IYoloData)
	type IDetect struct {
		Thumbnail []byte `json:"thumbnail"`
		Content   string `json:"content"`
		Time      string `json:"time"`
	}

	var DPI DetectPointInfo
	go func() { // Set DetectPointInfo
		for D := range DetectPointChannel {
			DPI = DetectPointInfo{D.ViewSize, TransPos(D, 0, encodingSize)}
			fmt.Printf("DPI %v\n", DPI)
			break
		}
	}()
	var NowTime string
	var detectClass []string
	go func() { // Yolo Thread
		for YoloData := range YoloChannel {
			NowTime = time.Now().Format("2006-01-02 15:04:05")
			detectClass = YoloDetect(&net, YoloData.roi, &YoloData.original, 0.45, 0.5, OutputNames, classes)

			fmt.Printf("class : %v\n ", detectClass)
			if len(detectClass) > 0 && !YoloData.original.Empty() {
				buf, _ := gocv.IMEncode(".jpg", YoloData.original)
				b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), NowTime})
				Server.BroadcastToAll("detect", string(b))
			}
			YoloData.original.Close()
			YoloData.roi.Close()
		}
	}()
	go func() { // Motion Detect Thread
		var startTime time.Time
		var startFlag bool

		imgDelta := gocv.NewMat()
		defer imgDelta.Close()

		imgThresh := gocv.NewMat()
		defer imgThresh.Close()

		mask := gocv.NewMatWithSize(encodingSize.Y, encodingSize.X, gocv.MatTypeCV8UC3)
		defer mask.Close()
		resultROI := gocv.NewMatWithSize(encodingSize.Y, encodingSize.X, gocv.MatTypeCV8UC3)
		defer resultROI.Close()

		// var resultROI gocv.Mat
		// defer resultROI.Close()

		timeSeq := []bool{false}
		for img := range FrameChannel {
			DetectArea(img, mask, &resultROI, DPI)

			motionCnt := MotionDetect(resultROI, imgDelta, imgThresh, mog2)
			if motionCnt > 0 { // 움직임 감지됐으면
				if !startFlag { // 움직임 감지 시작 시간 대입
					startFlag = true
					startTime = time.Now()

				} else {
					ingTime := int64(time.Since(startTime) / time.Second)
					if ingTime > 0 && !timeSeq[ingTime-1] {
						timeSeq[ingTime-1] = true
						timeSeq = append(timeSeq, false)
						if ingTime == 1 {

							go func(original gocv.Mat, roi gocv.Mat) {
								YoloChannel <- IYoloData{original.Clone(), roi.Clone()}
							}(img, resultROI)
						}
						fmt.Printf("%d\n", ingTime)
					}

				}
			} else { // 움직임 감지없으면
				if startFlag {
					startFlag = false
					timeSeq = []bool{false}
				}
			}
			img.Close()
		}

	}()

	for {
		if ok := cap.Read(&img); !ok {
			log.Println("RTSP Close")
			cap, _ = gocv.OpenVideoCapture(CapUrl)
			log.Println("RTSP ReStart")
		}
		if img.Empty() {
			log.Println("Frame Close")
			continue
		}

		gocv.Resize(img, &img, encodingSize, 0, 0, 0)
		buf, _ := gocv.IMEncode(".jpg", img)

		ViewChannel <- buf
		if DPI.ViewSize.X > 0 && DPI.ViewSize.Y > 0 { // 좌표 설정 돼있을 경우 이거 지우면 프로그램 안멈춤.

			FrameChannel <- img.Clone()
		}
		gocv.WaitKey(1)
	}
}
