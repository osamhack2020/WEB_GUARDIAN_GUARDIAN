package main

import (
	"image"
	"reflect"
	"sort"

	"gocv.io/x/gocv"
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
<<<<<<< HEAD:main.go

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

	e := echo.New()
	e.Use(middleware.CORS())
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello World!")
	})

	e.Any("/socket.io/", func(context echo.Context) error {
		server.ServeHTTP(context.Response(), context.Request())
		return nil
	})

	e.GET("/camera_1", func(c echo.Context) error {
		c.Response().Header().Set("Content-Type", "multipart/x-mixed-replace; boundary=frame")
		data := ""
		for frame := range ViewChannel {
			data = "--frame\r\n  Content-Type: image/jpeg\r\n\r\n" + string(frame) + "\r\n\r\n"
			c.Response().Write([]byte(data))
		}
		return nil
	})

	e.Logger.Fatal(e.Start(os.Args[1]))
}

=======
>>>>>>> backend:cv_util.go
