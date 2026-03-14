package controllers

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/avinash/expense-tracker/database"
	"github.com/avinash/expense-tracker/models"
	"github.com/gin-gonic/gin"
)

func AddTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var body struct {
		Type            string    `json:"type"`   // "income" or "expense"
		Amount          float64   `json:"amount"` 
		Category        string    `json:"category"`
		Description     string    `json:"description"`
		Title           string    `json:"title"`
		TransactionDate time.Time `json:"transaction_date"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	tx := models.Transaction{
		UserID:          userID.(uint),
		Type:            body.Type,
		Amount:          body.Amount,
		Category:        body.Category,
		Description:     body.Description,
		Title:           body.Title,
		TransactionDate: body.TransactionDate,
		CreatedAt:       time.Now(),
	}

	if result := database.DB.Create(&tx); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction added successfully", "transaction": tx})
}

func GetTransactions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	yearStr := c.Query("year")
	monthStr := c.Query("month")

	var transactions []models.Transaction
	query := database.DB.Where("user_id = ?", userID)

	if yearStr != "" && monthStr != "" {
		year, _ := strconv.Atoi(yearStr)
		month, _ := strconv.Atoi(monthStr)
		
		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0).Add(-time.Nanosecond)
		
		query = query.Where("transaction_date BETWEEN ? AND ?", startDate, endDate)
	}

	query.Order("transaction_date DESC").Find(&transactions)

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

func DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	database.DB.Delete(&transaction)
	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

func ExportTransactionsCSV(c *gin.Context) {
	userID, _ := c.Get("user_id")

	yearStr := c.Query("year")
	monthStr := c.Query("month")

	var transactions []models.Transaction
	query := database.DB.Where("user_id = ?", userID)

	if yearStr != "" && monthStr != "" {
		year, _ := strconv.Atoi(yearStr)
		month, _ := strconv.Atoi(monthStr)
		
		startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endDate := startDate.AddDate(0, 1, 0).Add(-time.Nanosecond)
		
		query = query.Where("transaction_date BETWEEN ? AND ?", startDate, endDate)
	}

	query.Order("transaction_date DESC").Find(&transactions)

	b := &bytes.Buffer{}
	writer := csv.NewWriter(b)
	writer.Write([]string{"Date", "Type", "Title", "Category", "Amount", "Description"})

	for _, tx := range transactions {
		writer.Write([]string{
			tx.TransactionDate.Format("2006-01-02"),
			tx.Type,
			tx.Title,
			tx.Category,
			fmt.Sprintf("%.2f", tx.Amount),
			tx.Description,
		})
	}
	writer.Flush()

	c.Header("Content-Disposition", "attachment;filename=transactions.csv")
	c.Data(http.StatusOK, "text/csv", b.Bytes())
}
