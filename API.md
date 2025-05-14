# BudgetBuddy API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All API endpoints require authentication using Firebase ID tokens. Include the token in the request header:
```
Authorization: <firebase_id_token>
```

## Endpoints

### Authentication

#### Verify Token
```http
GET /auth/verify
```
Verifies the Firebase ID token and returns user information.

**Response**
```json
{
  "uid": "user_id",
  "email": "user@example.com"
}
```

### Transactions

#### Get All Transactions
```http
GET /transactions
```
Retrieves all transactions for the authenticated user.

**Response**
```json
[
  {
    "id": "transaction_id",
    "amount": 50.00,
    "category": "Food",
    "date": "2024-03-20T00:00:00Z",
    "description": "Grocery shopping",
    "type": "expense"
  }
]
```

#### Add Transaction
```http
POST /transactions
```
Creates a new transaction.

**Request Body**
```json
{
  "amount": 50.00,
  "category": "Food",
  "date": "2024-03-20",
  "description": "Grocery shopping",
  "type": "expense"
}
```

**Response**
```json
{
  "id": "new_transaction_id",
  "message": "Transaction created successfully"
}
```

#### Update Transaction
```http
PUT /transactions/{transaction_id}
```
Updates an existing transaction.

**Request Body**
```json
{
  "amount": 55.00,
  "description": "Updated grocery shopping"
}
```

**Response**
```json
{
  "message": "Transaction updated successfully"
}
```

#### Delete Transaction
```http
DELETE /transactions/{transaction_id}
```
Deletes a transaction.

**Response**
```json
{
  "message": "Transaction deleted successfully"
}
```

### Budgets

#### Get All Budgets
```http
GET /budgets
```
Retrieves all budgets for the authenticated user.

**Response**
```json
[
  {
    "id": "budget_id",
    "category": "Food",
    "amount": 500.00,
    "period": "monthly",
    "startDate": "2024-03-01T00:00:00Z"
  }
]
```

#### Add Budget
```http
POST /budgets
```
Creates a new budget.

**Request Body**
```json
{
  "category": "Food",
  "amount": 500.00,
  "period": "monthly",
  "startDate": "2024-03-01"
}
```

**Response**
```json
{
  "id": "new_budget_id",
  "message": "Budget created successfully"
}
```

#### Update Budget
```http
PUT /budgets/{budget_id}
```
Updates an existing budget.

**Request Body**
```json
{
  "amount": 550.00,
  "period": "monthly"
}
```

**Response**
```json
{
  "message": "Budget updated successfully"
}
```

#### Delete Budget
```http
DELETE /budgets/{budget_id}
```
Deletes a budget.

**Response**
```json
{
  "message": "Budget deleted successfully"
}
```

### Shared Expenses

#### Get Shared Groups
```http
GET /shared/groups
```
Retrieves all shared expense groups for the authenticated user.

**Response**
```json
[
  {
    "id": "group_id",
    "name": "Roommates",
    "members": ["user1", "user2"],
    "expenses": [
      {
        "id": "expense_id",
        "name": "Rent",
        "amount": 1000.00,
        "paidBy": "user1",
        "split": [500.00, 500.00]
      }
    ]
  }
]
```

#### Create Shared Group
```http
POST /shared/groups
```
Creates a new shared expense group.

**Request Body**
```json
{
  "name": "Roommates",
  "members": ["user1", "user2"]
}
```

**Response**
```json
{
  "id": "new_group_id",
  "message": "Group created successfully"
}
```

#### Add Shared Expense
```http
POST /shared/groups/{group_id}/expenses
```
Adds an expense to a shared group.

**Request Body**
```json
{
  "name": "Rent",
  "amount": 1000.00,
  "paidBy": "user1",
  "split": [500.00, 500.00]
}
```

**Response**
```json
{
  "id": "new_expense_id",
  "message": "Expense added successfully"
}
```

### Analytics

#### Get Spending Insights
```http
GET /analytics/insights
```
Retrieves AI-generated spending insights.

**Response**
```json
{
  "suggestions": [
    "Your Food spending is 25% higher this month than your 3-month average.",
    "You have multiple active subscriptions. Consider cancelling unused ones to save money."
  ]
}
```

### Reminders

#### Set Reminder
```http
POST /reminders
```
Creates a new payment reminder.

**Request Body**
```json
{
  "title": "Rent Due",
  "day": 1,
  "message": "Rent payment is due tomorrow"
}
```

**Response**
```json
{
  "message": "Reminder created successfully"
}
```

#### Set Notification Preferences
```http
POST /reminders/preferences
```
Updates notification preferences.

**Request Body**
```json
{
  "email_enabled": true,
  "sms_enabled": false
}
```

**Response**
```json
{
  "message": "Preferences saved successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "error": "Not found or unauthorized"
}
```

### Bad Request (400)
```json
{
  "error": "Missing required fields"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## Data Types

### Transaction
```typescript
interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Budget
```typescript
interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### SharedGroup
```typescript
interface SharedGroup {
  id: string;
  name: string;
  members: string[];
  expenses: SharedExpense[];
}

interface SharedExpense {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  split: number[];
}
``` 
