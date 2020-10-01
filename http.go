package main

import (
	"fmt"
	"image"
	"log"
	"net/http"

	gosocketio "github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
	"gocv.io/x/gocv"
)

func main() {
	//create
	server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())

	//handle connected
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

	go func() {

		img := gocv.NewMat()
		defer img.Close()
		for {
			if ok := cap.Read(&img); !ok {
				fmt.Printf("Device closed\n")
				return
			}
			if img.Empty() {
				continue
			}
			gocv.Resize(img, &img, image.Point{X: 480, Y: 270}, 0, 0, 1)
			buf, _ := gocv.IMEncode(".jpg", img)
			server.BroadcastToAll("frame", buf)
		}
	}()

	//setup http server
	serveMux := http.NewServeMux()
	serveMux.Handle("/socket.io/", server)
	serveMux.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Println("server on 8080!")
	log.Panic(http.ListenAndServe(":8080", serveMux))
}
