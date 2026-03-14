package database

import (
	"fmt"
	"log"
	"os"

	"github.com/avinash/expense-tracker/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	host := os.Getenv("PGHOST")
	user := os.Getenv("PGUSER")
	password := os.Getenv("PGPASSWORD")
	dbname := os.Getenv("PGDATABASE")
	portStr := os.Getenv("PGPORT")

	if host == "" || user == "" || password == "" || dbname == "" || portStr == "" {
		log.Println("Database connection string variables are missing from environment.")
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require",
		host, user, password, dbname, portStr)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB = db
	log.Println("Database connection established.")

	// Auto Migrate
	err = db.AutoMigrate(&models.User{}, &models.Transaction{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}
