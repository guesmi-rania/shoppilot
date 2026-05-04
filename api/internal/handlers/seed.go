package handlers

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"shoppilot/config"
	"shoppilot/internal/models"
)

func SeedUserData(userID uuid.UUID) {
	log.Info().Msg("Création des données de démo...")

	categories := []string{"Électronique", "Mode", "Maison", "Beauté", "Sport"}
	productNames := []string{
		"Casque Bluetooth Pro", "T-shirt Premium", "Lampe Design LED",
		"Crème Hydratante", "Tapis de Yoga", "Montre Connectée",
		"Sac à Dos Urban", "Chargeur Rapide USB-C", "Plante Artificielle",
		"Sneakers Running",
	}

	products := make([]models.Product, 0, len(productNames))
	for i, name := range productNames {
		sku := fmt.Sprintf("SKU-%04d", i+1)
		p := models.Product{
			ID:       uuid.New(),
			UserID:   userID,
			Name:     name,
			Description: fmt.Sprintf("Produit de qualité supérieure — %s. Idéal pour tous les jours.", name),
			Price:    float64(15+rand.Intn(150)) + 0.99,
			Stock:    rand.Intn(50),
			LowStock: 5,
			Category: categories[i%len(categories)],
			SKU:      sku,
			Source:   "manual",
		}
		products = append(products, p)
	}
	config.DB.Create(&products)

	// Générer 30 commandes sur les 30 derniers jours
	statuses := []string{"completed", "completed", "completed", "processing", "pending", "cancelled"}
	customerNames := []string{"Marie Dubois", "Jean Martin", "Sophie Bernard", "Pierre Leroy", "Emma Wilson"}

	for i := 0; i < 30; i++ {
		daysAgo := rand.Intn(30)
		createdAt := time.Now().AddDate(0, 0, -daysAgo)

		numItems := 1 + rand.Intn(3)
		var total float64
		items := make([]models.OrderItem, 0, numItems)

		for j := 0; j < numItems; j++ {
			p := products[rand.Intn(len(products))]
			qty := 1 + rand.Intn(3)
			items = append(items, models.OrderItem{
				ID:        uuid.New(),
				ProductID: p.ID,
				Name:      p.Name,
				Price:     p.Price,
				Quantity:  qty,
			})
			total += p.Price * float64(qty)
		}

		customerName := customerNames[rand.Intn(len(customerNames))]
		order := models.Order{
			ID:            uuid.New(),
			UserID:        userID,
			OrderNumber:   fmt.Sprintf("ORD-%05d", i+1),
			Status:        statuses[rand.Intn(len(statuses))],
			Total:         total,
			CustomerName:  customerName,
			CustomerEmail: fmt.Sprintf("client%d@example.com", i+1),
			Items:         items,
			Source:        "manual",
			CreatedAt:     createdAt,
		}
		config.DB.Create(&order)
	}

	log.Info().Msg("Données de démo créées avec succès")
}