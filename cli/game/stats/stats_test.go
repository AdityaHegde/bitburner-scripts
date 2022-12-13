package stats

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"github.com/AdityaHegde/bitburner-scripts/cli/game/metadata"
	"github.com/stretchr/testify/require"
)

func TestStats_GetHackMetadata(t *testing.T) {
	hm := &metadata.HackMetadata{}
	raw, err := os.ReadFile("hack.txt")
	require.NoError(t, err)
	err = json.Unmarshal(raw, hm)
	require.NoError(t, err)

	for _, s := range hm.ServerStats {
		fmt.Println(s)
	}
}
