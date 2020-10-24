package main

import (
	"fmt"
	"image"
	"log"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"

	gosocketio "github.com/graarh/golang-socketio"
	"gocv.io/x/gocv"
)

var YoloChannel = make(chan gocv.Mat, 2)
var fps = 20.0

type IDetect struct {
	Thumbnail []byte `json:"thumbnail"`
	Content   string `json:"content"`
	Time      string `json:"time"`
}

func YoloRoutine(Server *gosocketio.Server, net *gocv.Net, OutputNames []string, classes []string, ignoreBox []image.Rectangle) { // Yolo Routine
	NowTime := time.Now().Format("2006-01-02 15:04:05")

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

	fmt.Printf("FPS %d\n", fps)

	FileName := strings.ReplaceAll(NowTime, ":", "")
	FileName = "video/" + strings.ReplaceAll(FileName, " ", "_")
	VideoFileName := FileName + ".mp4"
	fmt.Printf("Video File : %v\n", VideoFileName)
	writer, err := gocv.VideoWriterFile(
		VideoFileName, "avc1", fps, encodingSize.X, encodingSize.Y, true)
	if err != nil {
		fmt.Errorf("VideoWriter Error: %v\n", err)
	}

	defer func() { // 함수 끝나면 실행
		fmt.Println("YOLO Routine End.")
		if !ResultMotionLine.Empty() {
			SendThumbLog(Server, ResultMotionLine, "이동 경로 추적 완료", NowTime)
			gocv.IMWrite(FileName+"_thumb2.jpg", ResultMotionLine)
		}

		writer.Close()
		if YoloCheck { // 모션 라이너 끝나고

		} else { // YOLO 탐지 안되고 끝났으면
			os.Remove(VideoFileName)
		}
	}()

	FrameSeq := 0
	fmt.Println("YOLO Routine Start.")

	for YoloData := range YoloChannel {
		//	gocv.Resize(YoloData, &YoloData, encodingSize, 0, 0, 0)
		if !YoloCheck { // YOLO 탐지 안됐다면
			FrameSeq++
			if FrameSeq%30 == 0 {
				detectClass, detectBox = YoloDetect(net, &YoloData, 0.45, 0.5, OutputNames, classes, []string{}, ignoreBox) //고정 좌표 제외하고 식별
				fmt.Printf("class : %v %v\n ", detectClass, detectBox)
				for _, class := range detectClass {
					DB.ComposeUpdate(class)
				}
				if len(detectClass) > 0 && !YoloData.Empty() {
					SendThumbLog(Server, YoloData, strings.Join(detectClass, ","), NowTime)
					gocv.IMWrite(FileName+"_thumb.jpg", YoloData)
					YoloCheck = true
				}
				FrameSeq = 0
			}

		} else if YoloCheck { // YOLO 탐지 됐으면 OpticalFlow 시작
			writer.Write(YoloData)
			if !Prev.Empty() {

				MotionLiner(Prev, YoloData, &PrevPts, &mask, criteria, detectBox)
				if !mask.Empty() {
					gocv.Add(YoloData, mask, &ResultMotionLine)
				}
			}
			Prev.Close()
			Prev = YoloData.Clone()
		}
		YoloData.Close()
	}
}

func DetectStart(CapUrl string, Server *gosocketio.Server, DetectPointChannel chan DetectPointInfo) {

	runtime.GOMAXPROCS(runtime.NumCPU())
	Cap, err := gocv.OpenVideoCapture(CapUrl)
	if err != nil {
		fmt.Printf("Error opening capture device")
		return
	}
	defer Cap.Close()
	fps = Cap.Get(gocv.VideoCaptureFPS)
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
	FrameChannel := make(chan gocv.Mat, 2)
	type IYoloData struct {
		original gocv.Mat
		roi      gocv.Mat
	}

	type ILiner struct {
		img   gocv.Mat
		rects []image.Rectangle
	}

	var DPI DetectPointInfo
	go func() { // Set DetectPointInfo
		for D := range DetectPointChannel {
			DPI = DetectPointInfo{D.ViewSize, TransPos(D, 0, encodingSize)}
			fmt.Printf("DPI %v\n", DPI)
			break
		}
	}()
	ignoreBox := []image.Rectangle{}

	Result := gocv.NewMat()
	defer Result.Close()

	mask := gocv.NewMat()
	defer mask.Close()

	go func() { // Motion Detect Thread

		defer func() {
			i := recover()
			fmt.Println(i)
		}()
		var startTime time.Time
		var startFlag bool

		imgResize := gocv.NewMat()
		defer imgResize.Close()

		imgDelta := gocv.NewMat()
		defer imgDelta.Close()

		imgThresh := gocv.NewMat()
		defer imgThresh.Close()

		mask := gocv.NewMatWithSize(encodingSize.Y, encodingSize.X, gocv.MatTypeCV8UC3)
		defer mask.Close()
		resultROI := gocv.NewMatWithSize(encodingSize.Y, encodingSize.X, gocv.MatTypeCV8UC3)
		defer resultROI.Close()

		timeSeq := false
		oriImg := gocv.NewMat()
		defer oriImg.Close()

		for img := range FrameChannel {
			//	gocv.Resize(img, &imgResize, encodingSize, 0, 0, 0)
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
							DB.ComposeUpdate("motion")
							fmt.Println("움직임 감지 2초")
							timeSeq = true
							// run YoloRoutine.
							fmt.Printf("Channel Buf : %v %v\n", len(YoloChannel), cap(YoloChannel))

							go YoloRoutine(Server, &net, OutputNames, classes, ignoreBox)
						} else if timeSeq && ingTime > 2.0 {
							YoloChannel <- img.Clone()
						}
					}

				}
			} else { // 움직임 감지없으면
				if startFlag {
					startFlag = false
					if timeSeq {
						timeSeq = false
						fmt.Println("움직임 감지 끝")
						fmt.Printf("Channel Buf : %v %v\n", len(YoloChannel), cap(YoloChannel))
						FlushChannel(&YoloChannel)
						fmt.Printf("Channel Buf : %v %v\n", len(YoloChannel), cap(YoloChannel))
						close(YoloChannel)
						YoloChannel = make(chan gocv.Mat, 2)
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
		if ok := Cap.Read(&img); !ok {
			log.Println("RTSP Close")
			Cap, _ = gocv.OpenVideoCapture(CapUrl)
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
					&resizeImg,
					0.45,
					0.5,
					OutputNames,
					classes,
					[]string{"person"},
					[]image.Rectangle{}) // 배경에 있는 사람 제외 고정 물체 좌표 저장 (나중에 인식할 때 제외하기 위함).
				fmt.Printf("Ignore Box : %v\n", ignoreBox)
			})
			FrameChannel <- resizeImg.Clone()
		}
		gocv.WaitKey(1)
	}
}
