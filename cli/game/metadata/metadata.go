package metadata

type Metadata struct {
	Servers                []string `json:"servers"`
	NewServers             []string `json:"newServers"`
	HackOrchestratorServer string   `json:"hackOrchestratorServer"`
	OrchestratorServer     string   `json:"orchestratorServer"`
}

const MetadataFileName = "metadata.txt"
