package main

import (
	"net/http"
	"log"
	"time"
	gosocketio "github.com/graarh/golang-socketio"
	"github.com/graarh/golang-socketio/transport"
)

func main() {
		//create
		server := gosocketio.NewServer(transport.GetDefaultWebsocketTransport())

		//handle connected
		var global_channel *gosocketio.Channel
		server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
			log.Println("New client connected")
			global_channel = c
		})

		go func() {
			i:=0
			for{
				if global_channel == nil {
					continue
				}
				global_channel.Emit("data",i)
				i++
				time.Sleep(time.Second)
			}
		}()
		
		//setup http server
		serveMux := http.NewServeMux()
		serveMux.Handle("/socket.io/", server)
		serveMux.Handle("/", http.FileServer(http.Dir("./asset")))
		log.Panic(http.ListenAndServe(":80", serveMux))
}