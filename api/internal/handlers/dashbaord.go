package handlers

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"shoppilot/config"
)

func GetStats(c *gin.Context) {
	userID := c.MustGet("userID").(string)

	var totalProducts int64
	var totalOrders int64
	var revenue float64
	var lowStock int64

	config.DB.Table("products").Where("user_id = ?", userID).Count(&totalProducts)
	config.DB.Table("orders").Where("user_id = ?", userID).Count(&totalOrders)
	config.DB.Table("orders").
		Where("user_id = ? AND status = 'completed' AND created_at >= ?", userID, time.Now().AddDate(0, -1, 0)).
		Select("COALESCE(SUM(total), 0)").Scan(&revenue)
	config.DB.Table("products").
		Where("user_id = ? AND stock <= low_stock", userID).Count(&lowStock)

	c.JSON(http.StatusOK, gin.H{
		"total_products": totalProducts,
		"total_orders":   totalOrders,
		"monthly_revenue": revenue,
		"low_stock_count": lowStock,
	})
}