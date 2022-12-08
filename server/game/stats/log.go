package stats

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/mitchellh/mapstructure"
)

type targetingLog struct {
	Target  string
	Type    int
	Threads int
}

func (tl *targetingLog) string() string {
	return fmt.Sprintf("target=%s type=%d threads=%d", tl.Target, tl.Type, tl.Threads)
}

type addingLog struct {
	Server string
	Score  float64
}

func (al *addingLog) string() string {
	return fmt.Sprintf("server=%s score=%.2f", al.Server, al.Score)
}

type assigningLog struct {
	Target  string
	Server  string
	Threads int
}

func (al *assigningLog) string() string {
	return fmt.Sprintf("target=%s server=%s threads=%d", al.Target, al.Server, al.Threads)
}

type log struct {
	Label   string                 `json:"label"`
	Message string                 `json:"message"`
	Fields  map[string]interface{} `json:"fields"`
}

func (l *log) string() string {
	fields := ""
	switch l.Message {
	case "Targeting":
		tl := &targetingLog{}
		err := mapstructure.Decode(l.Fields, tl)
		if err == nil {
			fields = tl.string()
		} else {
			fmt.Println(err)
		}

	case "Adding":
		al := &addingLog{}
		err := mapstructure.Decode(l.Fields, al)
		if err == nil {
			fields = al.string()
		} else {
			fmt.Println(err)
		}

	case "Assigning":
		al := &assigningLog{}
		err := mapstructure.Decode(l.Fields, al)
		if err == nil {
			fields = al.string()
		} else {
			fmt.Println(err)
		}
	}
	return fmt.Sprintf("[%s] %s %s", l.Label, l.Message, fields)
}

func getLogs(rawLogs string) []*log {
	rawLogLines := strings.Split(rawLogs, "\n")
	logs := make([]*log, 0)
	for _, rawLogLine := range rawLogLines {
		if strings.TrimSpace(rawLogLine) == "" {
			continue
		}
		var l log
		err := json.Unmarshal([]byte(rawLogLine), &l)
		if err != nil {
			continue
		}
		logs = append(logs, &l)
	}
	return logs
}
