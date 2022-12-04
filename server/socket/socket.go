package socket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Server struct {
	upgrader  websocket.Upgrader
	hasClient func(c *Client)
}

func NewServer(hasClient func(c *Client)) *Server {
	return &Server{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
		hasClient: hasClient,
	}
}

func (s *Server) wsEndpoint(w http.ResponseWriter, r *http.Request) {
	// upgrade this connection to a WebSocket
	// connection
	ws, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected")

	c := NewClient(ws)
	go c.reader()
	s.hasClient(c)
}

func (s *Server) Start(port string) {
	http.HandleFunc("/", s.wsEndpoint)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
