package config

import (
	"os"

	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"shoppilot/internal/models"
)

var DB *gorm.DB

func ConnectDB() {
	// 🔥 ON FORCE DATABASE_URL (Render / Prod / Local)
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		log.Fatal().Msg("DATABASE_URL manquant (PostgreSQL non configuré)")
	}

	var err error

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})

	if err != nil {
		log.Fatal().
			Err(err).
			Msg("Impossible de se connecter à PostgreSQL (vérifie DATABASE_URL)")
	}

	// Migrations automatiques
	err = DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
	)

	if err != nil {
		log.Fatal().Err(err).Msg("Erreur migration DB")
	}

	log.Info().Msg("PostgreSQL connecté et migrations appliquées")
}