package main

import (
	"encoding/json"
	"fmt"
	"image"
	"log"
	"strings"
	"sync"
	"time"

	gosocketio "github.com/graarh/golang-socketio"
	"github.com/gron1gh1/queue"
	"gocv.io/x/gocv"
)

var YoloChannel = make(chan gocv.Mat)

type IDetect struct {
	Thumbnail []byte `json:"thumbnail"`
	Content   string `json:"content"`
	Time      string `json:"time"`
}

func YoloRoutine(Server *gosocketio.Server, net *gocv.Net, OutputNames []string, classes []string, ignoreBox []image.Rectangle) { // Yolo Routine
	var NowTime string
	YoloCheck := false

	detectClass := []string{}
	detectBox := []image.Rectangle{}

	Prev := gocv.NewMat()
	defer Prev.Close()

	PrevPts := gocv.NewMat()
	defer PrevPts.Close()

	criteria := gocv.NewTermCriteria(gocv.Count+gocv.EPS, 10, 0.3)

	ResultMotionLine := gocv.NewMat()
	defer ResultMotionLine.Close()

	mask := gocv.NewMat()
	defer mask.Close()

	defer func() { // 함수 끝나면 실행
		fmt.Println("YOLO Routine End.")
		if !ResultMotionLine.Empty() {
			buf, _ := gocv.IMEncode(".jpg", ResultMotionLine)
			b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), NowTime})
			Server.BroadcastToAll("detect", string(b))
		}
	}()

	FrameSeq := 0
	fmt.Println("YOLO Routine Start.")
	for YoloData := range YoloChannel {
		fmt.Println("GET")
		NowTime = time.Now().Format("2006-01-02 15:04:05")
		if !YoloCheck { // YOLO 탐지 안됐다면
			FrameSeq++
			if FrameSeq%30 == 0 {
				detectClass, detectBox = YoloDetect(net, &YoloData, 0.45, 0.5, OutputNames, classes, []string{}, ignoreBox) //고정 좌표 제외하고 식별
				fmt.Printf("class : %v %v\n ", detectClass, detectBox)
				if len(detectClass) > 0 && !YoloData.Empty() {
					buf, _ := gocv.IMEncode(".jpg", YoloData)
					b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), NowTime})
					Server.BroadcastToAll("detect", string(b))
					YoloCheck = true
				}
				FrameSeq = 0
			}

		} else if YoloCheck { // YOLO 탐지 됐으면 OpticalFlow 시작
			if !Prev.Empty() {
				MotionLiner(Prev, YoloData, &PrevPts, &mask, criteria, detectBox)
				if !mask.Empty() {
					gocv.Add(YoloData, mask, &ResultMotionLine)
				}
			}
			Prev = YoloData.Clone()
		}
		YoloData.Close()
	}
}

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
	net := gocv.ReadNet("./assets/yolov4-tiny.weights", "./assets/yolov4-tiny.cfg")
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

	type ILiner struct {
		img   gocv.Mat
		rects []image.Rectangle
	}
	YoloDone := make(chan []image.Rectangle)
	MotionDone := make(chan bool)

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
	ignoreBox := []image.Rectangle{}
	//var detectBoxes []image.Rectangle
	movingQ := queue.New()

	Result := gocv.NewMat()
	defer Result.Close()

	mask := gocv.NewMat()
	defer mask.Close()

	go func() { // Liner Thread

		Prev := gocv.NewMat()
		defer Prev.Close()

		PrevPts := gocv.NewMat()
		defer PrevPts.Close()

		criteria := gocv.NewTermCriteria(gocv.Count+gocv.EPS, 10, 0.3)

		ResultMotionLine := gocv.NewMat()
		defer ResultMotionLine.Close()

		mask := gocv.NewMat()
		defer mask.Close()

		for {
			DoneCheck := []bool{false, false}
			LinerData := []image.Rectangle{}

			select {

			case _LinerData := <-YoloDone: // 감지 먼저 끝나면 움직임 감지 끝 기다리기 (움직임 감지는 오래걸림)
				LinerData = _LinerData
				DoneCheck[0] = true
				fmt.Println("YOLO Done.")
				<-MotionDone
				DoneCheck[1] = true
				fmt.Println("Motion Done.")
			case <-MotionDone: // 움직임 감지 먼저 끝나면 YOLO 인식 기다리기 (YOLO 인식은 2~3초 걸림)
				DoneCheck[1] = true
				fmt.Println("Motion Done.")
				select {
				case _LinerData := <-YoloDone:
					LinerData = _LinerData
					DoneCheck[0] = true
					fmt.Println("YOLO Done.")
				case <-time.After(time.Second * 2):
					DoneCheck[0] = false
					fmt.Println("Time out.")
				}

			}
			// 예외 욜로 먼저끝나고 움직임 감지 끝나고 움직임 감지 시작
			if !DoneCheck[0] || !DoneCheck[1] {
				fmt.Println("Done Fail.")
				continue
			}
			//	LinerData := <-YoloDone

			//<-MotionDone

			mask = gocv.NewMat()

			movingQ_Copy := queue.New()
			CloneValue(movingQ, movingQ_Copy)
			movingQ.Clean()

			qSize := movingQ_Copy.Length()
			fmt.Printf("%d\n", qSize)
			for i := 0; i < qSize; i++ {
				//fmt.Printf("q: %d\n", movingQ.Length())
				img := movingQ_Copy.Pop().(gocv.Mat)
				if !Prev.Empty() {
					//fmt.Printf("RC %v\n",PrevPts.Size())
					MotionLiner(Prev, img, &PrevPts, &mask, criteria, LinerData)
					if !mask.Empty() {
						gocv.Add(img, mask, &ResultMotionLine)
					}
				}
				Prev = img.Clone()
				img.Close()
				//LinerData.img.Close()
			}
			fmt.Printf("qSize : %d\tEmp : %v\n", movingQ_Copy.Length(), ResultMotionLine.Empty())
			if !ResultMotionLine.Empty() {
				buf, _ := gocv.IMEncode(".jpg", ResultMotionLine)
				b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), NowTime})
				Server.BroadcastToAll("detect", string(b))
			}
		}
	}()
	go func() { // Motion Detect Thread
		defer func() {
			i := recover()
			fmt.Println(i)
		}()
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

		/*
					panic: runtime error: index out of range [250] with length 32

			goroutine 39 [running]:
			github.com/sheerun/queue.(*Queue).Append(0xc000086b40, 0x79dd80, 0x7f36f84b34c0)
			        /home/gron1gh1/go/src/github.com/sheerun/queue/queue.go:97 +0x3b0
			main.DetectStart.func4(0xc0000b6540, 0xc00014a1e0, 0xc0000b4138, 0xc000086b40, 0xc0000b65a0, 0xc0000a6d20, 0xc0000b6600, 0xc0000b4150, 0xc0000a6d00, 0xc000148130, ...)
			        /home/gron1gh1/code-server-gocv/data/code-server/config/workspace/WEB_BACK/cv_core.go:165 +0x3ae
		*/
		timeSeq := false
		oriImg := gocv.NewMat()
		defer oriImg.Close()

		for img := range FrameChannel {
			oriImg = img.Clone()
			DetectArea(img, mask, &resultROI, DPI)

			motionCnt := MotionDetect(resultROI, imgDelta, imgThresh, mog2)
			if motionCnt > 0 { // 움직임 감지됐으면

				if !startFlag { // 움직임 감지 시작 시간 대입
					startFlag = true
					startTime = time.Now()
				} else {
					ingTime := float32(time.Since(startTime) / time.Second)
					if ingTime > 0 {
						if !timeSeq && ingTime > 2.0 {
							fmt.Println("움직임 감지 2초")
							timeSeq = true
							// run YoloRoutine
							go YoloRoutine(Server, &net, OutputNames, classes, ignoreBox)
						} else if timeSeq && ingTime > 2.0 {
							YoloChannel <- oriImg
						}
					}

				}
			} else { // 움직임 감지없으면
				if startFlag {
					startFlag = false
					if timeSeq {
						timeSeq = false
						fmt.Println("움직임 감지 끝")
						close(YoloChannel)
						YoloChannel = make(chan gocv.Mat)
					}
				}
			}
			img.Close()
		}

	}()
	resizeImg := gocv.NewMat()
	var once sync.Once
	defer resizeImg.Close()
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

		gocv.Resize(img, &resizeImg, encodingSize, 0, 0, 0)
		buf, _ := gocv.IMEncode(".jpg", resizeImg)
		ViewChannel <- buf

		if DPI.ViewSize.X > 0 && DPI.ViewSize.Y > 0 {
			once.Do(func() {
				_, ignoreBox = YoloDetect(&net,
					&img,
					0.45,
					0.5,
					OutputNames,
					classes,
					[]string{"person"},
					[]image.Rectangle{}) // 배경에 있는 사람 제외 고정 물체 좌표 저장 (나중에 인식할 때 제외하기 위함).
				fmt.Printf("Ignore Box : %v\n", ignoreBox)
			})
			FrameChannel <- img.Clone()
		}
		gocv.WaitKey(1)
	}
}
