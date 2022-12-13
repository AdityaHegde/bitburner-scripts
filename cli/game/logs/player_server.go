package logs

import "fmt"

type PlayerServerPurchasing struct {
	Money int64 `json:"money"`
	Cost  int64 `json:"cost"`
	Ram   int   `json:"ram"`
}

func (p *PlayerServerPurchasing) LogString() string {
	return fmt.Sprintf("money=%d cost=%d ram=%d", p.Money, p.Cost, p.Ram)
}

type PlayerServerPurchased struct {
	Server string `json:"server"`
	Ram    int    `json:"ram"`
}

func (p *PlayerServerPurchased) LogString() string {
	return fmt.Sprintf("server=%s ram=%d", p.Server, p.Ram)
}

func GetPlayerServerLogItem(l *Log) LogItem {
	switch l.Message {
	case "Purchasing", "Upgrading":
		return new(PlayerServerPurchasing)
	case "Purchased", "Upgraded":
		return new(PlayerServerPurchased)
	}
	return nil
}
