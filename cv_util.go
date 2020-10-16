package main

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"log"
	"os"
	"strings"
	"time"

	gosocketio "github.com/graarh/golang-socketio"
	"gocv.io/x/gocv"
)

var ViewChannel = make(chan []byte)
var encodingSize image.Point = image.Point{854, 480}

type DetectPointInfo struct {
	ViewSize    image.Point
	DetectPoint [][]image.Point
}

// getOutputsNames : YOLO Layer
func getOutputsNames(net *gocv.Net) []string {
	var outputLayers []string
	for _, i := range net.GetUnconnectedOutLayers() {
		layer := net.GetLayer(i)
		layerName := layer.GetName()
		if layerName != "_input" {
			outputLayers = append(outputLayers, layerName)
		}
	}
	return outputLayers
}

// PostProcess : All Detect Box
func PostProcess(frame gocv.Mat, outs *[]gocv.Mat) ([]image.Rectangle, []float32, []int) {
	var classIds []int
	var confidences []float32
	var boxes []image.Rectangle
	for _, out := range *outs {

		data, _ := out.DataPtrFloat32()
		for i := 0; i < out.Rows(); i, data = i+1, data[out.Cols():] {

			scoresCol := out.RowRange(i, i+1)

			scores := scoresCol.ColRange(5, out.Cols())
			_, confidence, _, classIDPoint := gocv.MinMaxLoc(scores)
			if confidence > 0.5 {

				centerX := int(data[0] * float32(frame.Cols()))
				centerY := int(data[1] * float32(frame.Rows()))
				width := int(data[2] * float32(frame.Cols()))
				height := int(data[3] * float32(frame.Rows()))

				left := centerX - width/2
				top := centerY - height/2
				classIds = append(classIds, classIDPoint.X)
				confidences = append(confidences, float32(confidence))
				boxes = append(boxes, image.Rect(left, top, width, height))
			}
		}
	}
	return boxes, confidences, classIds
}

// ReadCOCO : Read coco.names
func ReadCOCO() []string {
	var classes []string
	read, _ := os.Open("./assets/coco.names")
	defer read.Close()
	for {
		var t string
		_, err := fmt.Fscan(read, &t)
		if err != nil {
			break
		}
		classes = append(classes, t)
	}
	return classes
}

// drawRect : Detect Class to Draw Rect
func drawRect(img *gocv.Mat, boxes []image.Rectangle, classes []string, classIds []int, indices []int) []string {
	var detectClass []string
	for _, idx := range indices {
		if idx == 0 {
			continue
		}
		gocv.Rectangle(img, image.Rect(boxes[idx].Max.X, boxes[idx].Max.Y, boxes[idx].Max.X+boxes[idx].Min.X, boxes[idx].Max.Y+boxes[idx].Min.Y), color.RGBA{255, 0, 0, 0}, 2)
		gocv.PutText(img, classes[classIds[idx]], image.Point{boxes[idx].Max.X, boxes[idx].Max.Y + 30}, gocv.FontHersheyPlain, 5, color.RGBA{0, 0, 255, 0}, 3)
		detectClass = append(detectClass, classes[classIds[idx]])
	}
	return detectClass
}

// TransPos : Frontend ViewSize => CV Mat ViewSize
func TransPos(FrontInfo DetectPointInfo, CameraIdx int, CvViewSize image.Point) [][]image.Point {
	TransPoint := make([][]image.Point, 1)
	for x := 0; x < len(FrontInfo.DetectPoint[CameraIdx]); x++ {
		transX := FrontInfo.DetectPoint[CameraIdx][x].X * CvViewSize.X / FrontInfo.ViewSize.X
		transY := FrontInfo.DetectPoint[CameraIdx][x].Y * CvViewSize.Y / FrontInfo.ViewSize.Y
		TransPoint[0] = append(TransPoint[0], image.Pt(transX, transY))
	}
	return TransPoint
}

// Detect : Run YOLOv4 Process
func YoloDetect(net *gocv.Net, src gocv.Mat, ori *gocv.Mat, scoreThreshold float32, nmsThreshold float32, OutputNames []string, classes []string) []string {
	ConvMat := src.Clone()
	src.ConvertTo(&ConvMat, gocv.MatTypeCV32F)
	blob := gocv.BlobFromImage(ConvMat, 1/255.0, image.Pt(416, 416), gocv.NewScalar(0, 0, 0, 0), true, false)
	net.SetInput(blob, "")
	probs := net.ForwardLayers(OutputNames)
	boxes, confidences, classIds := PostProcess(ConvMat, &probs)

	indices := make([]int, 100)
	if len(boxes) == 0 { // No Classes
		return []string{}
	}
	gocv.NMSBoxes(boxes, confidences, scoreThreshold, nmsThreshold, indices)

	return drawRect(ori, boxes, classes, classIds, indices)
}

func MotionDetect(src gocv.Mat, imgDelta gocv.Mat, imgThresh gocv.Mat, mog2 gocv.BackgroundSubtractorMOG2) int {
	if src.Empty() {
		return -1
	}
	// first phase of cleaning up image, obtain foreground only
	mog2.Apply(src, &imgDelta)

	// remaining cleanup of the image to use for finding contours.
	// first use threshold
	gocv.Threshold(imgDelta, &imgThresh, 25, 255, gocv.ThresholdBinary)

	// then dilate
	kernel := gocv.GetStructuringElement(gocv.MorphRect, image.Pt(3, 3))
	defer kernel.Close()
	gocv.Dilate(imgThresh, &imgThresh, kernel)

	// now find contours
	contours := gocv.FindContours(imgThresh, gocv.RetrievalExternal, gocv.ChainApproxSimple)

	contours_cnt := 0
	for _, c := range contours {
		area := gocv.ContourArea(c)
		if area < 500 && area < 5000 {
			continue
		}

		contours_cnt++
	}
	if contours_cnt > 10 {
		contours_cnt = -1
	}
	return contours_cnt
}

func DetectArea(img gocv.Mat, mask gocv.Mat, result *gocv.Mat, info DetectPointInfo) {
	defer func() {
		s := recover()
		if s != nil {
			fmt.Println(s)
		}
	}()
	if img.Channels() == 3 && img.Type() == gocv.MatTypeCV8UC3 {
		gocv.FillPoly(&mask, info.DetectPoint, color.RGBA{255, 255, 255, 0})
		fmt.Printf("%v %v %v\n", img.Channels(), img.Type(), img.Size())
		gocv.BitwiseAnd(img, mask, result)
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

	go func() { // Yolo Thread
		for YoloData := range YoloChannel {
			NowTime := time.Now().Format("2006-01-02 15:04:05")
			detectClass := YoloDetect(&net, YoloData.roi, &YoloData.original, 0.45, 0.5, OutputNames, classes)
			buf, _ := gocv.IMEncode(".jpg", YoloData.original)
			fmt.Printf("class : %v\n ", detectClass)
			if len(detectClass) > 0 {
				b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), NowTime})
				Server.BroadcastToAll("detect", string(b))
			}
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

		//go func(frame gocv.Mat) {
		if DPI.ViewSize.X > 0 && DPI.ViewSize.Y > 0 { // 좌표 설정 돼있을 경우 이거 지우면 프로그램 안멈춤.

			FrameChannel <- img.Clone()
		}
		//}(img)
		gocv.WaitKey(1)
	}
}
