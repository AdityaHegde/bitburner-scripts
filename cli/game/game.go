package game

import (
	"context"

	"github.com/AdityaHegde/bitburner-scripts/cli/game/client"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/scripts"
	"github.com/AdityaHegde/bitburner-scripts/cli/game/stats"
	"gorm.io/gorm"
)

type Game struct {
	Stats   *stats.Stats
	Scripts *scripts.Scripts
	db      *gorm.DB
}

func NewGame(scriptsDir string, db *gorm.DB) *Game {
	return &Game{
		Stats:   stats.NewStats(),
		Scripts: scripts.NewScripts(scriptsDir),
		db:      db,
	}
}

func (g *Game) Connection(c *client.Client) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go g.Stats.Run(ctx, c, g.db)
	go g.Scripts.Run(ctx, c)
	c.Start()
}
