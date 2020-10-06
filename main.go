package main

import (
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"log"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	gosocketio "github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
	"gocv.io/x/gocv"
)

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
func drawRect(img gocv.Mat, boxes []image.Rectangle, classes []string, classIds []int, indices []int) (gocv.Mat, []string) {
	var detectClass []string
	for _, idx := range indices {
		if idx == 0 {
			continue
		}
		gocv.Rectangle(&img, image.Rect(boxes[idx].Max.X, boxes[idx].Max.Y, boxes[idx].Max.X+boxes[idx].Min.X, boxes[idx].Max.Y+boxes[idx].Min.Y), color.RGBA{255, 0, 0, 0}, 2)
		gocv.PutText(&img, classes[classIds[idx]], image.Point{boxes[idx].Max.X, boxes[idx].Max.Y + 30}, gocv.FontHersheyPlain, 5, color.RGBA{0, 0, 255, 0}, 3)
		detectClass = append(detectClass, classes[classIds[idx]])
	}
	return img, detectClass
}

// Detect : Run YOLOv4 Process
func Detect(net *gocv.Net, src gocv.Mat, scoreThreshold float32, nmsThreshold float32, OutputNames []string, classes []string) (gocv.Mat, []string) {
	img := src.Clone()
	img.ConvertTo(&img, gocv.MatTypeCV32F)
	blob := gocv.BlobFromImage(img, 1/255.0, image.Pt(416, 416), gocv.NewScalar(0, 0, 0, 0), true, false)
	net.SetInput(blob, "")
	probs := net.ForwardLayers(OutputNames)
	boxes, confidences, classIds := PostProcess(img, &probs)

	indices := make([]int, 100)
	if len(boxes) == 0 { // No Classes
		return src, []string{}
	}
	gocv.NMSBoxes(boxes, confidences, scoreThreshold, nmsThreshold, indices)

	return drawRect(img, boxes, classes, classIds, indices)
}

func MotionDetect(src gocv.Mat, mog2 gocv.BackgroundSubtractorMOG2) (gocv.Mat, int) {
	img := src.Clone()

	imgDelta := gocv.NewMat()
	defer imgDelta.Close()

	// first phase of cleaning up image, obtain foreground only
	mog2.Apply(img, &imgDelta)

	// remaining cleanup of the image to use for finding contours.
	// first use threshold
	gocv.Threshold(imgDelta, &imgDelta, 25, 255, gocv.ThresholdBinary)

	// then dilate
	kernel := gocv.GetStructuringElement(gocv.MorphRect, image.Pt(3, 3))
	defer kernel.Close()
	gocv.Dilate(imgDelta, &imgDelta, kernel)

	// now find contours
	contours := gocv.FindContours(imgDelta, gocv.RetrievalExternal, gocv.ChainApproxSimple)

	contours_cnt := 0
	for i, c := range contours {
		area := gocv.ContourArea(c)
		if area < 100 && area < 5000 {
			continue
		}

		gocv.DrawContours(&img, contours, i, color.RGBA{255, 0, 255, 0}, 2)

		rect := gocv.BoundingRect(c)
		gocv.Rectangle(&img, rect, color.RGBA{0, 0, 255, 0}, 2)
		contours_cnt++
	}
	return img, contours_cnt

}

func SendFrame(cap *gocv.VideoCapture, server *gosocketio.Server, DelayChannel chan gocv.Mat) {
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

	type IDetect struct {
		Thumbnail []byte `json:"thumbnail"`
		Content   string `json:"content"`
		Time      string `json:"time"`
	}
	go func() { // Queue Thread
		for {
			q_img := <-FrameChannel
			_, detectClass := Detect(&net, q_img, 0.45, 0.5, OutputNames, classes)
			buf, _ := gocv.IMEncode(".jpg", q_img)
			fmt.Printf("class : %v\n ", detectClass)
			b, _ := json.Marshal(IDetect{buf, strings.Join(detectClass, ","), time.Now().Format("2006-01-02 15:04:05")})
			server.BroadcastToAll("detect", string(b))
		}
	}()

	frameNext := 0
	for {
		if ok := cap.Read(&img); !ok {
			fmt.Printf("Device closed\n")
			return
		}
		if img.Empty() {
			continue
		}
		if frameNext >= 10 {
			// 	// 	go q.Append(img)
			// 	// 	fmt.Println("frameNext")
			go func() {
				FrameChannel <- img
			}()
			frameNext = 0
		}

		gocv.Resize(img, &img, image.Point{1280, 720}, 0, 0, 1)

		buf, _ := gocv.IMEncode(".jpg", img)
		server.BroadcastToAll("frame", buf)

		gocv.WaitKey(1)
		frameNext++
	}
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())
	server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())
	server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		log.Println("New client connected")
	})
	//"rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov"
	cap, err := gocv.OpenVideoCapture("rtsp://gron1gh2.southeastasia.cloudapp.azure.com:8554/test")
	if err != nil {
		fmt.Printf("Error opening capture device")
		return
	}
	defer cap.Close()

	DelayChannel := make(chan gocv.Mat)
	go SendFrame(cap, server, DelayChannel)

	//setup http server
	serveMux := http.NewServeMux()
	serveMux.Handle("/socket.io/", server)
	serveMux.Handle("/", http.FileServer(http.Dir("./assets")))

	log.Println("server on " + os.Args[1] + "!")
	log.Panic(http.ListenAndServe(os.Args[1], serveMux))
}
