# BudgetBuddy Backend Service

BudgetBuddy is a comprehensive personal finance management application that helps users track expenses, manage budgets, and gain insights into their spending habits.

## Features

### Authentication & Security
- **Firebase Authentication**: Secure user registration and login
- **JWT Token Management**: Secure API access with token-based authentication
- **Role-based Access Control**: Different permission levels for users
- **Session Management**: Secure session handling and timeout

### Expense Management
- **Expense Tracking**: Record and categorize daily expenses
- **Smart Categorization**: Automatic expense categorization using NLP
- **Receipt Scanning**: Upload and process receipt images
- **Multi-currency Support**: Handle expenses in different currencies
- **Expense Search**: Advanced search and filtering capabilities

### Budget Planning
- **Monthly Budgets**: Create and manage monthly spending limits
- **Category-wise Budgets**: Set budgets for different expense categories
- **Budget Alerts**: Get notified when approaching budget limits
- **Budget Analytics**: Track spending against budget goals
- **Budget Templates**: Save and reuse budget templates

### Reports & Analytics
- **Custom Reports**: Generate detailed spending reports
- **Visual Analytics**: Charts and graphs for spending patterns
- **Export Options**: Export data in PDF, CSV, and Excel formats
- **Trend Analysis**: Track spending trends over time
- **Category Analysis**: Breakdown of spending by categories

### Recurring Expenses
- **Subscription Management**: Track recurring bills and subscriptions
- **Payment Scheduling**: Set up automatic payment reminders
- **Recurring Patterns**: Support for daily, weekly, monthly, and yearly patterns
- **Subscription Analytics**: Track subscription costs and usage

### Reminders & Notifications
- **Payment Reminders**: Get notified about upcoming payments
- **Budget Alerts**: Receive alerts for budget thresholds
- **Custom Notifications**: Set up personalized notification preferences
- **Email Notifications**: Receive important updates via email

### Data Management
- **Data Export**: Export financial data in multiple formats
- **Data Import**: Import data from other financial applications
- **Backup & Restore**: Automatic and manual backup options
- **Data Migration**: Tools for migrating between different versions

## Project Structure

```
budgetbuddy-backend-service/
├── app.py                 # Main application entry point
├── controllers/          # Route handlers and business logic
├── models/              # Data models and schemas
├── services/           # Business logic and external service integrations
├── tests/              # Test suite
├── utils/              # Utility functions and helpers
├── scripts/            # Maintenance and utility scripts
├── requirements.txt    # Project dependencies
└── firebase_key.json   # Firebase service account credentials
```


## Development Environment Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git
- Firebase project setup
- Firebase service account key (`firebase_key.json`)
- wkhtmltopdf (for PDF generation)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd budgetbuddy-backend-service
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Firebase:
   - Create a Firebase project in the Firebase Console
   - Enable Authentication and Firestore
   - Download your service account key and save it as `firebase_key.json` in the project root


### Configuration

Create a `.env` file in the project root with the following variables:
```env
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1
FIREBASE_CREDENTIALS=firebase_key.json
```

## Testing Environment

### Test Setup

1. Install test dependencies:
```bash
pip install coverage
```

2. Create a test configuration file `tests/config.py`:
```python
TEST_CONFIG = {
    'TESTING': True,
    'FIREBASE_CREDENTIALS': 'tests/firebase_test_key.json'
}
```

### Running Tests

1. Run all tests:
```bash
python -m unittest discover -s tests
```

2. Run tests with coverage:
```bash
coverage run --source=services -m unittest discover -s tests
coverage report
coverage html  
```

3. Run specific test categories:
```bash
# Run unit tests
python -m unittest discover -s tests/unit

```

### Test Categories

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **API Tests**: Test API endpoints and responses
- **Firebase Tests**: Test Firebase integration


## API Documentation

### Authentication (`/auth`)
- User registration and login
- Token management

### Expenses (`/expenses`)
- Create, read, update, and delete expenses
- Categorize expenses
- Search and filter expenses

### Budget (`/budget`)
- Create and manage budgets
- Track budget progress
- Set budget alerts

### Reports (`/reports`)
- Generate spending reports
- Export data in various formats
- View analytics and insights

### Recurring Expenses (`/recurring`)
- Manage recurring bills
- Set up payment schedules
- Track subscription expenses

### Reminders (`/reminders`)
- Create payment reminders
- Set up notifications
- Manage alert preferences








