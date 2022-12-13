package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect() (*gorm.DB, error) {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Silent,
			Colorful:      false,
		},
	)

	dsn := "host=localhost user=bitburner password=bitburner dbname=bitburner port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: newLogger})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(HackMetadata{})
	if err != nil {
		fmt.Println(err)
	}
	err = db.AutoMigrate(HackTargetServer{})
	if err != nil {
		fmt.Println(err)
	}
	err = db.AutoMigrate(ServerStats{})
	if err != nil {
		fmt.Println(err)
	}

	return db, nil
}
