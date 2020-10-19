package main

import (
	"image"
	"reflect"
	"sort"
)

var ViewChannel = make(chan []byte)

var encodingSize image.Point = image.Point{854, 480}

//var encodingSize image.Point = image.Point{854, 480}
//var encodingSize image.Point = image.Point{1920, 1080}

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
		if igbox.String() == Box.String() {
			return true
		}
	}
	return false
}
