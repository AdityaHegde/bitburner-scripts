package logs

import "fmt"

type HackTargetingLog struct {
	Target  string `json:"target"`
	Type    int    `json:"type"`
	Threads int    `json:"threads"`
}

func (h *HackTargetingLog) LogString() string {
	return fmt.Sprintf("target=%s type=%d threads=%d", h.Target, h.Type, h.Threads)
}

type HackAddingLog struct {
	Server string  `json:"server"`
	Score  float64 `json:"score"`
}

func (h *HackAddingLog) LogString() string {
	return fmt.Sprintf("server=%s score=%.2f", h.Server, h.Score)
}

type HackAssigningLog struct {
	Target  string `json:"target"`
	Server  string `json:"server"`
	Threads int    `json:"threads"`
}

func (h *HackAssigningLog) LogString() string {
	return fmt.Sprintf("target=%s server=%s threads=%d", h.Target, h.Server, h.Threads)
}

func GetHackLogItem(l *Log) LogItem {
	switch l.Message {
	case "Targeting":
		return new(HackTargetingLog)
	case "Adding":
		return new(HackAddingLog)
	case "Assigning":
		return new(HackAssigningLog)
	}
	return nil
}
