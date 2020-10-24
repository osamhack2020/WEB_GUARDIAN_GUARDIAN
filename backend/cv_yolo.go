package main

import (
	"fmt"
	"image"
	"image/color"
	"os"

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
func drawRect(img *gocv.Mat, boxes []image.Rectangle, ignoreBox []image.Rectangle, classes []string, ignoreClass []string, classIds []int, indices []int) ([]string, []image.Rectangle) {
	var detectClass []string
	detectBox := []image.Rectangle{}
	for _, idx := range indices {
		if idx == 0 {
			continue
		}
		if IsContainStrings(ignoreClass, classes[classIds[idx]]) {
			//fmt.Printf("continue %v in %v\n", ignoreClass, classes[classIds[idx]])
			continue
		}
		box := image.Rect(boxes[idx].Max.X, boxes[idx].Max.Y, boxes[idx].Max.X+boxes[idx].Min.X, boxes[idx].Max.Y+boxes[idx].Min.Y)
		if IsContainBoxs(ignoreBox, box) {
			//fmt.Printf("continue2 %v\n", classes[classIds[idx]])
			continue
		}
		detectBox = append(detectBox, box)
		gocv.Rectangle(img, box,  color.RGBA{220, 20, 60, 0}, 2)
		gocv.PutText(img, classes[classIds[idx]], image.Point{boxes[idx].Max.X, boxes[idx].Max.Y - 10}, gocv.FontHersheySimplex , 1, color.RGBA{220, 20, 60, 0}, 2)
		detectClass = append(detectClass, classes[classIds[idx]])
	}
	return detectClass, detectBox
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
func YoloDetect(net *gocv.Net, src *gocv.Mat, scoreThreshold float32, nmsThreshold float32, OutputNames []string, classes []string, ignoreClass []string, ignoreBox []image.Rectangle) ([]string, []image.Rectangle) {
	ConvMat := src.Clone()
	src.ConvertTo(&ConvMat, gocv.MatTypeCV32F)
	blob := gocv.BlobFromImage(ConvMat, 1/255.0, image.Pt(640, 640), gocv.NewScalar(0, 0, 0, 0), true, false)
	net.SetInput(blob, "")
	probs := net.ForwardLayers(OutputNames)
	boxes, confidences, classIds := PostProcess(ConvMat, &probs)

	indices := make([]int, 100)
	if len(boxes) == 0 { // No Classes
		return []string{}, []image.Rectangle{}
	}
	gocv.NMSBoxes(boxes, confidences, scoreThreshold, nmsThreshold, indices)
	return drawRect(src, boxes, ignoreBox, classes, ignoreClass, classIds, indices)
}
