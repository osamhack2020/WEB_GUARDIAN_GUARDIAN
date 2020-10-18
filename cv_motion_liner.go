package main

import (
	"image"
	"image/color"

	"gocv.io/x/gocv"
)

type Vecf []float32

func (v Vecf) SetVecfAt(m gocv.Mat, row int, col int) {
	ch := m.Channels()

	for c := 0; c < ch; c++ {
		m.SetFloatAt(row, col*ch+c, v[c])
	}
}

func Point2fToMat(pts []gocv.Point2f) gocv.Mat {
	result := gocv.NewMatWithSize(len(pts), 1, gocv.MatTypeCV32FC2)
	for i, pt := range pts {
		Vecf{pt.X, pt.Y}.SetVecfAt(result, i, 0)
	}
	return result
}

func RectToPoint2fs(rect image.Rectangle) []gocv.Point2f {
	var (
		x = rect.Min.X
		y = rect.Min.Y
		w = rect.Max.X
		h = rect.Max.Y
	)
	result := []gocv.Point2f{}
	for _y := y; _y < h; _y += 10 {
		for _x := x; _x < w; _x += 10 {
			//fmt.Printf("Val : %v %v\n", float32(_x), float32(_y))
			result = append(result, gocv.Point2f{float32(_x), float32(_y)})
		}
	}
	return result
}

//return criteria, result,CurrPts,status,err
func MotionLinerInit(rects []image.Rectangle) gocv.Mat {
	result := []gocv.Point2f{}
	for _, rect := range rects {
		result = append(result, RectToPoint2fs(rect)...)
	}
	PrevPts := Point2fToMat(result)
	return PrevPts
}

// Get Mask !
func MotionLiner(Prev gocv.Mat, Curr gocv.Mat, PrevPts *gocv.Mat, mask *gocv.Mat, criteria gocv.TermCriteria, rects []image.Rectangle) {
	PrevGrey := gocv.NewMat()
	defer PrevGrey.Close()

	CurrGrey := gocv.NewMat()
	defer CurrGrey.Close()

	CurrPts := gocv.NewMat()
	defer CurrPts.Close()

	status := gocv.NewMat()
	defer status.Close()

	err := gocv.NewMat()
	defer err.Close()

	if mask.Empty() {
		*mask = gocv.NewMatWithSize(Curr.Rows(), Curr.Cols(), gocv.MatTypeCV8UC3)
	}
	gocv.CvtColor(Prev, &PrevGrey, gocv.ColorBGRToGray)
	gocv.CvtColor(Curr, &CurrGrey, gocv.ColorBGRToGray)

	if PrevPts.Empty() {
		result := []gocv.Point2f{}
		for _, rect := range rects {
			result = append(result, RectToPoint2fs(rect)...)
		}
		*PrevPts = Point2fToMat(result)
	}
	gocv.CalcOpticalFlowPyrLKWithParams(Prev, Curr, *PrevPts, CurrPts, &status, &err, image.Point{15, 15}, int(2), criteria, 0, 1e-4)

	good_new := []gocv.Point2f{}
	statusBytes := status.ToBytes()
	for i := 0; i < PrevPts.Rows(); i++ {
		if statusBytes[i] == 1 {

			currPt := CurrPts.GetVecfAt(i, 0)
			prevPt := PrevPts.GetVecfAt(i, 0)
			//fmt.Printf("%v %v | %v %v\n", CurrPts.GetVecfAt(0, i), PrevPts.GetVecfAt(0, i), CurrPts.GetVecfAt(i, 0), PrevPts.GetVecfAt(i, 0))
			good_new = append(good_new, gocv.Point2f{currPt[0], currPt[1]})
			gocv.Line(mask, image.Point{int(currPt[0]), int(currPt[1])}, image.Point{int(prevPt[0]), int(prevPt[1])}, color.RGBA{255, 0, 0, 0}, 2)
			//	gocv.Circle(Result, image.Point{int(currPt[0]), int(currPt[1])}, 5, color.RGBA{0, 255, 0, 0}, -1)
		}
	}
	*PrevPts = Point2fToMat(good_new)
}
