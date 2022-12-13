package stats

import (
	"github.com/AdityaHegde/bitburner-scripts/cli/game/client"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/logs"
)

func (s *Stats) getLogs(server string) ([]*logs.Log, error) {
	rawLogs, err := s.client.GetFile(server, logFile)
	if err != nil {
		if err == client.FileMissing {
			return nil, nil
		}
		return nil, err
	}
	ls, err := logs.ParseLogs(rawLogs)
	if err != nil {
		return nil, err
	}
	if len(ls) == 0 || ls[len(ls)-1].Message != "Ended" {
		return nil, nil
	}
	// cleanup the log file to not bloat the file
	err = s.client.DeleteFile(server, logFile)
	if err != nil {
		return nil, err
	}
	return ls, nil
}
