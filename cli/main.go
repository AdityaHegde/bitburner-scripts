package main

import (
	"path/filepath"

	"github.com/AdityaHegde/bitburner-scripts/cli/database"
	"github.com/AdityaHegde/bitburner-scripts/cli/game"
	"github.com/AdityaHegde/bitburner-scripts/cli/server"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		panic(err)
	}

	dist, err := filepath.Abs("./dist")
	if err != nil {
		panic(err)
	}
	g := game.NewGame(dist, db)
	s := server.NewServer(g, db)
	s.Start(9080)
}
