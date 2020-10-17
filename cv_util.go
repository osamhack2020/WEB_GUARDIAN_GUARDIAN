package main

import (
	"image"
)

var ViewChannel = make(chan []byte)
var encodingSize image.Point = image.Point{854, 480}
