package routes

import (
	"github.com/avinash/expense-tracker/controllers"
	"github.com/avinash/expense-tracker/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	
	auth := api.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	transactions := api.Group("/transactions")
	transactions.Use(middlewares.RequireAuth)
	{
		transactions.GET("", controllers.GetTransactions)
		transactions.POST("", controllers.AddTransaction)
		transactions.DELETE("/:id", controllers.DeleteTransaction)
		transactions.GET("/export", controllers.ExportTransactionsCSV)
	}
}
