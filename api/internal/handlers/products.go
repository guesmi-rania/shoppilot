package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"shoppilot/config"
	"shoppilot/internal/models"
)

func GetProducts(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var products []models.Product
	config.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&products)
	c.JSON(http.StatusOK, products)
}

func CreateProduct(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	uid, _ := uuid.Parse(userID)
	input.ID = uuid.New()
	input.UserID = uid
	config.DB.Create(&input)
	c.JSON(http.StatusCreated, input)
}

func UpdateProduct(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	id := c.Param("id")
	var product models.Product
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produit non trouvé"})
		return
	}
	c.ShouldBindJSON(&product)
	config.DB.Save(&product)
	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	id := c.Param("id")
	config.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Product{})
	c.JSON(http.StatusOK, gin.H{"message": "Produit supprimé"})
}

// GenerateDescription appelle l'API Claude pour générer une description produit.
func GenerateDescription(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	id := c.Param("id")

	// Récupérer le produit
	var product models.Product
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Produit non trouvé"})
		return
	}

	apiKey := os.Getenv("CLAUDE_API_KEY")
	if apiKey == "" {
		// Fallback si pas de clé configurée
		c.JSON(http.StatusOK, gin.H{
			"description": fmt.Sprintf(
				"%s — Un produit de qualité supérieure dans la catégorie %s. Idéal pour tous les usages du quotidien.",
				product.Name, product.Category,
			),
		})
		return
	}

	// Construire le prompt
	prompt := fmt.Sprintf(
		"Génère une description commerciale courte (2-3 phrases) et percutante pour ce produit en français.\n"+
			"Nom: %s\nCatégorie: %s\nPrix: %.2f€\n\n"+
			"Réponds uniquement avec la description, sans introduction ni guillemets.",
		product.Name, product.Category, product.Price,
	)

	// Appel API Claude
	reqBody, _ := json.Marshal(map[string]interface{}{
		"model":      "claude-haiku-4-5-20251001",
		"max_tokens": 200,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
	})

	req, err := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur création requête"})
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur appel API Claude"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result struct {
		Content []struct {
			Text string `json:"text"`
		} `json:"content"`
	}
	if err := json.Unmarshal(body, &result); err != nil || len(result.Content) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Réponse Claude invalide"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"description": result.Content[0].Text})
}

func GetLowStockAlerts(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var products []models.Product
	config.DB.Where("user_id = ? AND stock <= low_stock", userID).Find(&products)
	c.JSON(http.StatusOK, products)
}