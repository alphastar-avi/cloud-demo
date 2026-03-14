package models

import (
	"time"
)

type Transaction struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"index;not null" json:"user_id"`
	Type            string    `gorm:"not null" json:"type"` // "income" or "expense"
	Amount          float64   `gorm:"not null" json:"amount"`
	Category        string    `gorm:"not null" json:"category"` // "Food", "Snacks", "Travel", "Others", "Health", "Gifts" etc. or source for income
	Description     string    `json:"description"`
	Title           string    `json:"title"` // only for income usually
	TransactionDate time.Time `gorm:"not null" json:"transaction_date"`
	CreatedAt       time.Time `json:"created_at"`
}
