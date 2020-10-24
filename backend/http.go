package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"

	gosocketio "github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
	"github.com/labstack/echo"

	"github.com/labstack/echo/middleware"
)

var DB = new(Mongo)

func main() {
	DB.Init()
	// Socket.io Server
	server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())
	server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		log.Println("New client connected")
	})

	// Echo Server
	DetectPointChannel := make(chan DetectPointInfo)
	e := echo.New()
	e.Use(middleware.CORS())
	e.Static("/detect_video", "video")
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello World!")
	})

	e.Any("/socket.io/", func(context echo.Context) error {
		server.ServeHTTP(context.Response(), context.Request())
		return nil
	})

	e.POST("/GetVideoFile", func(c echo.Context) error {
		var DataInfo map[string]string
		c.Bind(&DataInfo)
		fmt.Printf("POST /GetVideoFile date : %s\n", DataInfo["date"])
		files, _ := ioutil.ReadDir("video")
		filterFiles := []string{}
		for _, file := range files {
			if strings.Contains(file.Name(), DataInfo["date"]) && strings.Contains(file.Name(), ".mp4") {
				filterFiles = append(filterFiles, file.Name())
			}
		}
		return c.JSON(http.StatusOK, filterFiles)
	})

	e.POST("/ChartData", func(c echo.Context) error {
		var DataInfo map[string]string
		c.Bind(&DataInfo)
		fmt.Printf("POST /ChartData date : %s\n", DataInfo["date"])
		if data, ok := DB.Find(DataInfo["date"]); ok {
			return c.JSON(http.StatusOK, data)
		}
		return c.JSON(http.StatusOK, "fail")

	})

	e.POST("/SetDetectPoint", func(c echo.Context) error {
		SendInfo := DetectPointInfo{}
		c.Bind(&SendInfo)
		fmt.Printf("%v\n", SendInfo)
		DetectPointChannel <- SendInfo
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

	go DetectStart("rtsp://gron1gh2.southeastasia.cloudapp.azure.com:8554/test", server, DetectPointChannel)
	// Core
	// go DetectStart("rtsp://gron1gh2.southeastasia.cloudapp.azure.com:8554/test", server, DetectPoint)

	e.Logger.Fatal(e.Start(os.Args[1])) // go run *.go :8081
}
