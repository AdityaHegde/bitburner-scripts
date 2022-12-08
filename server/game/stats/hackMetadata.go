package stats

type ServerStats struct {
	ReqLevel     int                    `json:"reqLevel"`
	MinSecurity  float64                `json:"minSecurity"`
	Security     float64                `json:"security"`
	MaxMoney     float64                `json:"maxMoney"`
	Money        float64                `json:"money"`
	Mem          float64                `json:"mem"`
	TargetServer map[string]map[int]int `json:"targetServer"`
}

type HackTargetServer struct {
	TargetServer string `json:"targetServer"`
	Type         int    `json:"type"`
}

type HackMetadata struct {
	ServerStats map[string]*ServerStats      `json:"serverStats"`
	Targets     map[string]*HackTargetServer `json:"targets"`
}

const hackMetadataFile = "hack.txt"
