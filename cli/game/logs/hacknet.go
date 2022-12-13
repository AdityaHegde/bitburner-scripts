package logs

import "fmt"

type HackNetPurchase struct {
	Node int `json:"node"`
}

func (h *HackNetPurchase) LogString() string {
	return fmt.Sprintf("node=%d", h.Node)
}

type HackNetUpgradedLevel struct {
	Node  int `json:"node"`
	Level int `json:"level"`
}

func (h *HackNetUpgradedLevel) LogString() string {
	return fmt.Sprintf("node=%d level=%d", h.Node, h.Level)
}

type HackNetUpgradedRam struct {
	Node int `json:"node"`
	Ram  int `json:"ram"`
}

func (h *HackNetUpgradedRam) LogString() string {
	return fmt.Sprintf("node=%d ram=%d", h.Node, h.Ram)
}

type HackNetUpgradedCore struct {
	Node  int `json:"node"`
	Cores int `json:"cores"`
}

func (h *HackNetUpgradedCore) LogString() string {
	return fmt.Sprintf("node=%d cores=%d", h.Node, h.Cores)
}

func GetHackNetLogItem(l *Log) LogItem {
	switch l.Message {
	case "Purchased":
		return new(HackNetPurchase)
	case "UpgradedLevel":
		return new(HackNetUpgradedLevel)
	case "UpgradedRam":
		return new(HackNetUpgradedRam)
	case "UpgradedCore":
		return new(HackNetUpgradedCore)
	}
	return nil
}
