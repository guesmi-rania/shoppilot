package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"shoppilot/config"
	"shoppilot/internal/models"
)

func GetOrders(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	var orders []models.Order
	config.DB.Where("user_id = ?", userID).
		Preload("Items").
		Order("created_at desc").
		Limit(50).
		Find(&orders)
	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context) {
	userID := c.MustGet("userID").(string)
	id := c.Param("id")
	var body struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Model(&models.Order{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("status", body.Status)
	c.JSON(http.StatusOK, gin.H{"message": "Statut mis à jour"})
}