package main

import (
	"fmt"
	"log"

	"github.com/avinash/expense-tracker/database"
	"github.com/avinash/expense-tracker/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists, but don't fail if it doesn't 
	// (since env vars might be injected directly)
	godotenv.Load()

	// Initialize Database connection
	database.ConnectDB()

	r := gin.Default()
	
	// Disable trailing slash redirects which cause CORS issues
	r.RedirectTrailingSlash = false
	r.RedirectFixedPath = false

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // In production, replace with specific origins
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Register Routes
	routes.RegisterRoutes(r)

	fmt.Println("Starting server on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
