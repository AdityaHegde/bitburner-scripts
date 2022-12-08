package stats

type metadata struct {
	Servers                []string `json:"servers"`
	NewServers             []string `json:"newServers"`
	HackOrchestratorServer string   `json:"hackOrchestratorServer"`
	OrchestratorServer     string   `json:"orchestratorServer"`
}

const metadataFile = "metadata.txt"
