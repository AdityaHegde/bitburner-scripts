package main

import (
	"fmt"
	"path/filepath"

	"github.com/AdityaHegde/bitburner-scripts/server/game_scripts"
	"github.com/AdityaHegde/bitburner-scripts/server/socket"
)

func main() {
	s := socket.NewServer(func(c *socket.Client) {
		dist, err := filepath.Abs("./dist")
		if err != nil {
			fmt.Println(err)
			return
		}
		gs := game_scripts.NewGameScripts(dist, c)
		go gs.Run()
	})
	s.Start("9080")
}
