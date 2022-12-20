package metadata

type ServerStats struct {
	ReqLevel     int                    `json:"reqLevel"`
	MinSecurity  float32                `json:"minSecurity"`
	Security     float32                `json:"security"`
	MaxMoney     float64                `json:"maxMoney"`
	Money        float64                `json:"money"`
	Mem          float32                `json:"mem"`
	Times        []float32              `json:"times"`
	Rates        []float32              `json:"rates"`
	TargetServer map[string]map[int]int `json:"targetServer"`
}

type HackTargetServer struct {
	TargetServer string `json:"targetServer"`
	Type         int    `json:"type"`
}

type HackMetadata struct {
	ServerStats map[string]*ServerStats `json:"serverStats"`
	Targets     []*HackTargetServer     `json:"targets"`
}

const HackMetadataFileName = "hack.txt"
