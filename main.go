package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"

	gosocketio "github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"gocv.io/x/gocv"
)

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

	type Point struct {
		X int
		Y int
	}

	DetectPoint := [][]Point{}

	e.POST("/SetDetectPoint", func(c echo.Context) error {
		params := make(map[string][][]Point)
		c.Bind(&params)

		GetDetectPoint := params["DetectPoint"]
		for _, cameraPoint := range GetDetectPoint {
			DetectPoint = append(DetectPoint, cameraPoint)
		}
		fmt.Printf("%v\n", DetectPoint)
		return c.JSON(http.StatusOK, "success")
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
