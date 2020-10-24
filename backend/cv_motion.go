package main

import (
	"fmt"
	"image"
	"image/color"

	"gocv.io/x/gocv"
)

type DetectPointInfo struct {
	ViewSize    image.Point
	DetectPoint [][]image.Point
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
	gocv.FillPoly(&mask, info.DetectPoint, color.RGBA{255, 255, 255, 0})
	gocv.BitwiseAnd(img, mask, result)
}
