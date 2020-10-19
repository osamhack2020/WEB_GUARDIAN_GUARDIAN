package main

import (
	"image"
	"reflect"
)

var ViewChannel = make(chan []byte)
var encodingSize image.Point = image.Point{854, 480}

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
