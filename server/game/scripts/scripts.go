package scripts

import (
	"fmt"
	"os"
	"path"
	"time"

	"github.com/AdityaHegde/bitburner-scripts/server/socket"
)

const TargetServer = "home"

type Scripts struct {
	dir     string
	client  *socket.Client
	lastRun time.Time
}

func NewScripts(dir string, client *socket.Client) *Scripts {
	return &Scripts{
		dir:    dir,
		client: client,
	}
}

func (s *Scripts) Run() {
	fmt.Println("Reading", s.dir)

	for {
		files, err := os.ReadDir(s.dir)
		if err != nil {
			fmt.Println("read dir error", err)
			return
		}

		for _, file := range files {
			if file.IsDir() {
				continue
			}

			filePath := path.Join(s.dir, file.Name())

			stat, err := os.Stat(filePath)
			if err != nil {
				fmt.Println("stat file error", err)
				continue
			}
			if s.lastRun.After(stat.ModTime()) {
				continue
			}

			content, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Println("read file error", err)
				continue
			}

			err = s.client.PushFile(TargetServer, file.Name(), string(content))
			if err != nil {
				fmt.Println("put file error", err)
			}
			mem, err := s.client.CalculateRam(TargetServer, file.Name())
			if err != nil {
				fmt.Println("calculate ram error", err)
			}
			fmt.Printf("Sent file: %s (%.2fGB)\n", file.Name(), mem)
		}
		// TODO: delete old files

		s.lastRun = time.Now()
		time.Sleep(time.Second)
	}
}
