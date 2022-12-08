package main

import (
	"fmt"
	"path/filepath"

	"github.com/AdityaHegde/bitburner-scripts/server/game/scripts"
	"github.com/AdityaHegde/bitburner-scripts/server/game/stats"
	"github.com/AdityaHegde/bitburner-scripts/server/socket"
)

func main() {
	s := socket.NewServer(func(c *socket.Client) {
		dist, err := filepath.Abs("./dist")
		if err != nil {
			fmt.Println(err)
			return
		}
		gameScripts := scripts.NewScripts(dist, c)
		go gameScripts.Run()
		gameStats := stats.NewStats(c)
		go gameStats.Run()
	})
	s.Start("9080")
}
