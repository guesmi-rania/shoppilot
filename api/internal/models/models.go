package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type Product struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Price       float64   `gorm:"not null" json:"price"`
	Stock       int       `json:"stock"`
	LowStock    int       `gorm:"default:5" json:"low_stock"`
	Category    string    `json:"category"`
	SKU         string    `json:"sku"`
	Source      string    `gorm:"default:'manual'" json:"source"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Order struct {
	ID            uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	OrderNumber   string      `gorm:"uniqueIndex" json:"order_number"`
	Status        string      `gorm:"default:'pending'" json:"status"`
	Total         float64     `json:"total"`
	CustomerName  string      `json:"customer_name"`
	CustomerEmail string      `json:"customer_email"`
	Items         []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
	Source        string      `gorm:"default:'manual'" json:"source"`
	CreatedAt     time.Time   `json:"created_at"`
}

type OrderItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	ProductID uuid.UUID `gorm:"type:uuid" json:"product_id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Quantity  int       `json:"quantity"`
}