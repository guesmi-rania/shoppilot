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
    dsn := os.Getenv("DATABASE_URL")

    if dsn == "" {
        log.Fatal().Msg("DATABASE_URL manquant")
    }

    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal().Err(err).Msg("Impossible de se connecter à PostgreSQL")
    }

    err = DB.AutoMigrate(
        &models.User{},
        &models.Product{},
        &models.Order{},
        &models.OrderItem{},
    )

    if err != nil {
        log.Fatal().Err(err).Msg("Erreur migration DB")
    }

    log.Info().Msg("PostgreSQL connecté")
}