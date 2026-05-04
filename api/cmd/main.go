package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"shoppilot/config"
	"shoppilot/internal/handlers"
	"shoppilot/internal/middleware"
)

func main() {
	// Logger lisible en dev
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// Charger .env si présent
	_ = godotenv.Load()

	// Connexion DB + migrations auto
	config.ConnectDB()

	// Mode Gin
	if os.Getenv("ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())

	// CORS — autorise le frontend React
	r.Use(cors.New(cors.Config{
    AllowOrigins: []string{
       	"http://localhost:5173",
		"https://shoppilot-qpyj.vercel.app",
    },
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))

	// Health check (Railway l'utilise pour savoir si l'app est ok)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "shoppilot-api"})
	})

	// Routes publiques
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Routes protégées par JWT
	api := r.Group("/api")
	api.Use(middleware.AuthRequired())
	{
		// Dashboard
		api.GET("/dashboard/stats", handlers.GetStats)

		// Produits
		api.GET("/products", handlers.GetProducts)
		api.POST("/products", handlers.CreateProduct)
		api.PUT("/products/:id", handlers.UpdateProduct)
		api.DELETE("/products/:id", handlers.DeleteProduct)
		api.POST("/products/:id/generate-description", handlers.GenerateDescription)

		// Commandes
		api.GET("/orders", handlers.GetOrders)
		api.PUT("/orders/:id/status", handlers.UpdateOrderStatus)

		// Alertes stock
		api.GET("/alerts/low-stock", handlers.GetLowStockAlerts)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Info().Msgf("ShopPilot API démarrée sur :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal().Err(err).Msg("Impossible de démarrer le serveur")
	}
}