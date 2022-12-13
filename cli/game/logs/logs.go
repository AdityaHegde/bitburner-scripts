package logs

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/mitchellh/mapstructure"
)

type Log struct {
	Label   string                 `json:"label"`
	Message string                 `json:"message"`
	Fields  map[string]interface{} `json:"fields"`
	Item    LogItem
}

type LogItem interface {
	LogString() string
}

func (l *Log) LogString() string {
	fields := ""
	if l.Item != nil {
		fields = l.Item.LogString()
	}
	return fmt.Sprintf("[%s] %s %s", l.Label, l.Message, fields)
}

func getLogItem(l *Log) LogItem {
	switch l.Label {
	case "DistributedHack":
		return GetHackLogItem(l)
	case "PlayerServers":
		return GetPlayerServerLogItem(l)
	case "HackNet":
		return GetHackNetLogItem(l)
	}
	return nil
}

func NewLog(rawLog string) (*Log, error) {
	l := &Log{}
	err := json.Unmarshal([]byte(rawLog), l)
	if err != nil {
		return nil, err
	}
	l.Item = getLogItem(l)
	if l.Item != nil {
		err := mapstructure.Decode(l.Fields, l.Item)
		if err != nil {
			return nil, err
		}
	}
	return l, nil
}

func ParseLogs(rawLogFile string) ([]*Log, error) {
	logs := make([]*Log, 0)
	rawLogs := strings.Split(rawLogFile, "\n")
	for _, rawLog := range rawLogs {
		rawLog = strings.TrimSpace(rawLog)
		if rawLog == "" {
			continue
		}
		l, err := NewLog(rawLog)
		if err != nil {
			fmt.Println(err)
			continue
		}
		logs = append(logs, l)
	}
	return logs, nil
}
