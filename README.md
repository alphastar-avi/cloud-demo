# Expense Tracker

Full-stack expense tracker with Sankey cash flow visualization.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Nivo (Sankey charts), Axios
- **Backend**: Go, Gin, GORM
- **Database**: PostgreSQL (Azure Flexible Server)

## Features

- User authentication (register/login with JWT)
- Add income sources with title and amount
- Add expenses under categories: Food, Snacks, Travel, Others, Gifts, Health
- Sankey diagram showing cash flow from income to expense categories
- Month/Year selector to filter transactions
- Transaction list with delete functionality
- CSV export of monthly transactions

## Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/    # Auth and transaction handlers
│   ├── database/       # PostgreSQL connection setup
│   ├── middlewares/     # JWT auth middleware
│   ├── models/         # User and Transaction models
│   ├── routes/         # API route definitions
│   ├── main.go         # Entry point
│   └── .env            # Environment variables (not committed)
└── frontend/
    └── src/
        ├── components/ # SankeyChart, IncomeForm, ExpenseForm, TransactionList
        ├── context/    # AuthContext
        ├── pages/      # Login, Dashboard
        ├── api.ts      # Axios instance
        └── types.ts    # TypeScript interfaces
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # Add your DB credentials and JWT secret
go run main.go
```

Required environment variables:
- `PGHOST`, `PGUSER`, `PGPORT`, `PGDATABASE`, `PGPASSWORD`
- `JWT_SECRET`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| POST   | /api/auth/register        | Create account           |
| POST   | /api/auth/login           | Login, returns JWT       |
| GET    | /api/transactions         | List transactions (filtered by month/year) |
| POST   | /api/transactions         | Add income or expense    |
| DELETE | /api/transactions/:id     | Delete a transaction     |
| GET    | /api/transactions/export  | Download CSV             |
