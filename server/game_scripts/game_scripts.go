package game_scripts

import (
	"fmt"
	"os"
	"path"
	"time"

	"github.com/AdityaHegde/bitburner-scripts/server/socket"
)

const TargetServer = "home"

type GameScripts struct {
	dir     string
	client  *socket.Client
	lastRun time.Time
}

func NewGameScripts(dir string, client *socket.Client) *GameScripts {
	return &GameScripts{
		dir:    dir,
		client: client,
	}
}

func (gs *GameScripts) Run() {
	fmt.Println("Reading", gs.dir)

	for {
		files, err := os.ReadDir(gs.dir)
		if err != nil {
			fmt.Println("read dir error", err)
			return
		}

		for _, file := range files {
			if file.IsDir() {
				continue
			}

			filePath := path.Join(gs.dir, file.Name())

			stat, err := os.Stat(filePath)
			if err != nil {
				fmt.Println("stat file error", err)
				continue
			}
			if gs.lastRun.After(stat.ModTime()) {
				continue
			}

			content, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Println("read file error", err)
				continue
			}

			err = gs.client.PushFile(TargetServer, file.Name(), string(content))
			if err != nil {
				fmt.Println("put file error", err)
			}
			mem, err := gs.client.CalculateRam(TargetServer, file.Name())
			if err != nil {
				fmt.Println("calculate ram error", err)
			}
			fmt.Printf("Sent file: %s (%.2fGB)\n", file.Name(), mem)
		}
		// TODO: delete old files

		gs.lastRun = time.Now()
		time.Sleep(time.Second)
	}
}
