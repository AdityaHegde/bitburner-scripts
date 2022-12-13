package database

import (
	"time"

	"github.com/AdityaHegde/bitburner-scripts/cli/game/metadata"
	"github.com/jinzhu/copier"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type HackMetadata struct {
	ID          uint                `json:"id" gorm:"primaryKey;autoIncrement"`
	Targets     []*HackTargetServer `json:"targets" gorm:"foreignKey:ID"`
	ServerStats []*ServerStats      `json:"serverStats" gorm:"foreignKey:ID"`
	CreatedAt   time.Time           `json:"createdAt"`
}

type HackTargetServer struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	TargetServer string    `json:"targetServer" gorm:"primaryKey"`
	Type         uint8     `json:"type" gorm:"primaryKey"`
	CreatedAt    time.Time `json:"createdAt"`
}

type ServerStats struct {
	ID           uint                   `json:"id" gorm:"primaryKey"`
	Server       string                 `json:"server" gorm:"primaryKey"`
	ReqLevel     int                    `json:"reqLevel"`
	MinSecurity  float32                `json:"minSecurity"`
	Security     float32                `json:"security"`
	MaxMoney     float64                `json:"maxMoney"`
	Money        float64                `json:"money"`
	Mem          float32                `json:"mem"`
	Times        pq.Float32Array        `json:"times" gorm:"type:float[]"`
	Rates        pq.Float32Array        `json:"rates" gorm:"type:float[]"`
	Securities   pq.Float32Array        `json:"securities" gorm:"type:float[]"`
	TargetServer map[string]map[int]int `json:"targetServer" gorm:"type:jsonb"`
	CreatedAt    time.Time              `json:"createdAt"`
}

func CreateHackMetadata(db *gorm.DB, meta *metadata.HackMetadata) error {
	var dbMeta HackMetadata
	db.Create(&dbMeta)
	if db.Error != nil {
		return db.Error
	}

	for _, targetServer := range meta.Targets {
		dbTargetServer := &HackTargetServer{}
		err := copier.Copy(dbTargetServer, targetServer)
		if err != nil {
			return err
		}
		dbTargetServer.ID = dbMeta.ID
		dbTargetServer.CreatedAt = dbMeta.CreatedAt
		db.Create(&dbTargetServer)
		if db.Error != nil {
			return db.Error
		}
		dbMeta.Targets = append(dbMeta.Targets, dbTargetServer)
	}

	for server, serverStats := range meta.ServerStats {
		if server == "" {
			continue
		}
		dbServerStats := &ServerStats{}
		err := copier.Copy(dbServerStats, serverStats)
		if err != nil {
			return err
		}
		dbServerStats.ID = dbMeta.ID
		dbServerStats.Server = server
		dbServerStats.CreatedAt = dbMeta.CreatedAt
		db.Create(&dbServerStats)
		if db.Error != nil {
			return db.Error
		}
		dbMeta.ServerStats = append(dbMeta.ServerStats, dbServerStats)
	}

	db.Updates(&dbMeta)

	return db.Error
}

func GetNHackMetadata(db *gorm.DB, count int) ([]*HackMetadata, error) {
	res := make([]*HackMetadata, 0)
	db.Order("created_at desc").Limit(count).Find(&res)
	return res, db.Error
}

func GetTargetsByIDs(db *gorm.DB, ids []uint) ([]*HackTargetServer, error) {
	res := make([]*HackTargetServer, 0)
	db.Where("ID in ?", ids).Order("created_at desc").Find(&res)
	return res, db.Error
}

func GetServerStatsByIDs(db *gorm.DB, ids []uint) ([]*ServerStats, error) {
	res := make([]*ServerStats, 0)
	db.Where("ID in ?", ids).Order("created_at desc").Find(&res)
	return res, db.Error
}
