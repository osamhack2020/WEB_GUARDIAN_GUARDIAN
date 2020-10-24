package main

import (
	"encoding/json"
	"image"
	"reflect"
	"sort"

	gosocketio "github.com/graarh/golang-socketio"
	"gocv.io/x/gocv"
)

var ViewChannel = make(chan []byte)

var encodingSize image.Point = image.Point{854, 480}

//var encodingSize image.Point = image.Point{854, 480}
//var encodingSize image.Point = image.Point{1920, 1080}

func SendThumbLog(Server *gosocketio.Server, img gocv.Mat, content string, NowTime string) {
	buf, _ := gocv.IMEncode(".jpg", img)
	b, _ := json.Marshal(IDetect{buf, content, NowTime})
	Server.BroadcastToAll("detect", string(b))
}

// Old,New
func CloneValue(source interface{}, destin interface{}) {
	x := reflect.ValueOf(source)
	if x.Kind() == reflect.Ptr {
		starX := x.Elem()
		y := reflect.New(starX.Type())
		starY := y.Elem()
		starY.Set(starX)
		reflect.ValueOf(destin).Elem().Set(y.Elem())
	} else {
		destin = x.Interface()
	}
}

// Check String Array Contains String
func IsContainStrings(s []string, searchterm string) bool {
	i := sort.SearchStrings(s, searchterm)
	return i < len(s) && s[i] == searchterm
}

// Check Box Array Contains Box
func IsContainBoxs(ignoreBox []image.Rectangle, Box image.Rectangle) bool {
	for _, igbox := range ignoreBox {
		if igbox.Max.X-5 < Box.Max.X && Box.Max.X < igbox.Max.X+5 {
			return true
		}
		if igbox.Max.Y-5 < Box.Max.Y && Box.Max.Y < igbox.Max.Y+5 {
			return true
		}
		if igbox.Min.X-5 < Box.Min.X && Box.Min.X < igbox.Min.X+5 {
			return true
		}
		if igbox.Min.Y-5 < Box.Min.Y && Box.Min.Y < igbox.Min.Y+5 {
			return true
		}
	}
	return false
}

func FlushChannel(channel *chan gocv.Mat) {
	if len(*channel) == cap(*channel) {
		chanSz := len(*channel)
		for i := 0; i < chanSz; i++ {
			// Channel was full, but might not be by now
			select {
			case <-*channel:
			// Discard one item
			default:
				// Maybe it was empty already
			}
		}
	}
}
