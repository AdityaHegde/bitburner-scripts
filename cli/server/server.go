package server

import (
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/AdityaHegde/bitburner-scripts/cli/game"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/client"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type Server struct {
	upgrader websocket.Upgrader
	game     *game.Game
	db       *gorm.DB
}

func NewServer(game *game.Game, db *gorm.DB) *Server {
	return &Server{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
		game: game,
		db:   db,
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

	c := client.NewClient(ws)
	s.game.Connection(c)
}

func (s *Server) Start(port int) {
	mux := http.NewServeMux()
	mux.HandleFunc("/hack-metadata", func(w http.ResponseWriter, r *http.Request) {
		s.getHackMetadata(w, r)
	})
	mux.HandleFunc("/server-stats", func(w http.ResponseWriter, r *http.Request) {
		s.getServerStats(w, r)
	})
	mux.HandleFunc("/hack-target-servers", func(w http.ResponseWriter, r *http.Request) {
		s.getHackTargets(w, r)
	})
	mux.HandleFunc("/", s.wsEndpoint)

	srv := &http.Server{Handler: cors(mux)}
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		panic(err)
	}
	err = srv.Serve(lis)
	if err != nil {
		panic(err)
	}
}

func cors(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			if r.Method == "OPTIONS" && r.Header.Get("Access-Control-Request-Method") != "" {
				w.Header().Set("Access-Control-Allow-Headers", "*")
				w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE")
				return
			}
		}
		h.ServeHTTP(w, r)
	})
}
