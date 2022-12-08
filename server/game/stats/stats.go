package stats

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/AdityaHegde/bitburner-scripts/server/game/scripts"
	"github.com/AdityaHegde/bitburner-scripts/server/socket"
)

const logFile = "out.txt"

type Stats struct {
	client       *socket.Client
	metadata     *metadata
	HackMetadata *HackMetadata
}

func NewStats(client *socket.Client) *Stats {
	return &Stats{
		client:       client,
		metadata:     &metadata{},
		HackMetadata: &HackMetadata{},
	}
}

func (s *Stats) Run() {
	fmt.Println("Starting Stats Collector")

	c := 5

	for {
		time.Sleep(time.Second)
		c++

		if c >= 5 {
			c = 1
			err := s.getMetadata()
			if err != nil {
				fmt.Println(err)
				continue
			}
		}

		if s.metadata == nil || s.metadata.HackOrchestratorServer == "" {
			continue
		}

		err := s.getLogs()
		if err != nil {
			fmt.Println(err)
			continue
		}

		err = s.getMetadata()
		if err != nil {
			fmt.Println(err)
			continue
		}
	}
}

func (s *Stats) getMetadata() error {
	rawMeta, err := s.client.GetFile(scripts.TargetServer, metadataFile)
	if err != nil {
		if err == socket.FileMissing {
			return nil
		}
		return err
	}
	return json.Unmarshal([]byte(rawMeta), s.metadata)
}

func (s *Stats) getHackMetadata() error {
	rawHackMetadata, err := s.client.GetFile(s.metadata.HackOrchestratorServer, hackMetadataFile)
	if err != nil {
		if err == socket.FileMissing {
			return nil
		}
		return err
	}
	return json.Unmarshal([]byte(rawHackMetadata), s.HackMetadata)
}

func (s *Stats) getLogs() error {
	rawLogs, err := s.client.GetFile(s.metadata.HackOrchestratorServer, logFile)
	if err != nil {
		if err == socket.FileMissing {
			return nil
		}
		return err
	}
	logs := getLogs(rawLogs)
	if len(logs) == 0 || logs[len(logs)-1].Message != "Ended" {
		return nil
	}
	// cleanup the log file to not bloat the file
	err = s.client.DeleteFile(s.metadata.HackOrchestratorServer, logFile)
	if err != nil {
		return err
	}
	for _, l := range logs {
		fmt.Println(l.string())
	}
	return nil
}
