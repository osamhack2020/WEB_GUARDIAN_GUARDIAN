package main

import (
	"fmt"
	"image"
	"testing"

	"gocv.io/x/gocv"
)

func Test_Point2fToMat(t *testing.T) {
	m := Point2fToMat([]gocv.Point2f{gocv.Point2f{1, 2}, gocv.Point2f{2, 3}, gocv.Point2f{3, 4}})
	fmt.Printf("Channel : %v\n", m.Channels())

}

func Test_MotionLiner(t *testing.T) {
	Prev := gocv.IMRead("/config/workspace/1.jpg", gocv.IMReadColor)
	defer Prev.Close()
	Curr := gocv.IMRead("/config/workspace/2.jpg", gocv.IMReadColor)
	defer Curr.Close()
	Result := gocv.NewMat()
	defer Result.Close()

	fmt.Printf("SIze : %v %v\n", Prev.Size(), Curr.Size())
	criteria, PrevPts := MotionLinerInit([]image.Rectangle{image.Rectangle{image.Point{597, 167}, image.Point{634, 243}}})
	defer PrevPts.Close()
	MotionLiner(&Result, Prev, Curr, &PrevPts, criteria)
}
