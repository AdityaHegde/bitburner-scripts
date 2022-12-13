package stats

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/AdityaHegde/bitburner-scripts/cli/database"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/client"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/metadata"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/scripts"
	"gorm.io/gorm"
)

const logFile = "out.txt"

type Stats struct {
	client       *client.Client
	Metadata     *metadata.Metadata
	HackMetadata *metadata.HackMetadata
}

func NewStats() *Stats {
	return &Stats{
		Metadata:     &metadata.Metadata{},
		HackMetadata: &metadata.HackMetadata{},
	}
}

func (s *Stats) Run(ctx context.Context, client *client.Client, db *gorm.DB) {
	s.client = client
	fmt.Println("Starting Stats Collector")

	c := 5

	for {
		if ctx.Err() != nil {
			fmt.Println(ctx.Err())
			return
		}
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

		// home logs
		_, err := s.getLogs("home")
		if err != nil {
			fmt.Println(err)
			continue
		}

		if s.Metadata == nil || s.Metadata.HackOrchestratorServer == "" {
			continue
		}

		// hack data
		err = s.collectHackMetadata(db)
		if err != nil {
			fmt.Println(err)
			continue
		}
	}
}

func (s *Stats) getMetadata() error {
	rawMeta, err := s.client.GetFile(scripts.TargetServer, metadata.MetadataFileName)
	if err != nil {
		if err == client.FileMissing {
			return nil
		}
		return err
	}
	return json.Unmarshal([]byte(rawMeta), s.Metadata)
}

func (s *Stats) collectHackMetadata(db *gorm.DB) error {
	ls, err := s.getLogs(s.Metadata.HackOrchestratorServer)
	if err != nil {
		return err
	}
	if len(ls) == 0 {
		return nil
	}
	err = s.getHackMetadata()
	if err != nil {
		return err
	}
	err = database.CreateHackMetadata(db, s.HackMetadata)
	if err != nil {
		return err
	}
	return nil
}

func (s *Stats) getHackMetadata() error {
	rawHackMetadata, err := s.client.GetFile(s.Metadata.HackOrchestratorServer, metadata.HackMetadataFileName)
	if err != nil {
		if err == client.FileMissing {
			return nil
		}
		return err
	}
	return json.Unmarshal([]byte(rawHackMetadata), s.HackMetadata)
}
