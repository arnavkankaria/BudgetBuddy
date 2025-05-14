# BudgetBuddy

Managing finances as a college student can be challenging, with tuition fees, rent, groceries, social events, and unexpected expenses creating financial strain. BudgetBuddy is an intelligent expense tracking and budgeting application designed specifically to help college students manage their finances efficiently and develop responsible spending habits.

The primary goal of BudgetBuddy is to provide students with an AI-powered financial management tool that tracks expenses, suggests personalized savings strategies, and streamlines shared expense management for roommates and friends. Unlike generic budgeting applications, BudgetBuddy is tailored for student life, offering features such as automated roommate bill-splitting, event expense planning, and customized budgeting based on financial aid, scholarships, and part-time jobs.

By digitizing financial tracking, BudgetBuddy eliminates the hassle of manual budget management, encourages smart financial decisions, and empowers students to take control of their money. The system integrates AI-driven spending insights, automated reminders for upcoming payments, and real-time deal recommendations to help students save more and spend wisely. With a user-friendly interface and student-centric features, BudgetBuddy serves as a practical financial tool that simplifies expense tracking, promotes financial literacy, and enhances money management for college students.

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

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Git

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/arnavkankaria/BudgetBuddy.git
cd BudgetBuddy
```

2. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration

3. Set up environment variables:
   - In the `client` directory, create a `.env` file:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
   - In the `budgetbuddy-backend-service` directory, create a `.env` file:
   ```
   FIREBASE_ADMIN_SDK_KEY=your_admin_sdk_key
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

### Running the Client

1. Install dependencies:
```bash
cd client
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on your device:
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code from the terminal or Expo Dev Tools
   - Or press 'i' for iOS simulator or 'a' for Android emulator

### Running the Backend

1. Install Python dependencies:
```bash
cd budgetbuddy-backend-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. Start the Flask server:
```bash
python app.py
```

The backend server will run on `http://localhost:5000` by default.

### Development

- The client is built with React Native/Expo
- The backend is built with Python Flask
- Firebase is used for authentication and database
- Real-time updates are handled through Firestore listeners

### Project Structure

```
BudgetBuddy/
├── client/                 # React Native/Expo client
│   ├── app/               # Main application screens
│   ├── context/           # React Context providers
│   ├── src/               # Source code
│   │   ├── services/      # Firebase and API services
│   │   └── types/         # TypeScript type definitions
│   └── package.json       # Client dependencies
│
└── budgetbuddy-backend-service/  # Python Flask backend
    ├── services/          # Backend services
    ├── tests/             # Unit tests
    ├── app.py            # Main application file
    └── requirements.txt   # Python dependencies
```

### Known Issues and Compatibility

#### Version Requirements
- This project uses Expo SDK 49.0.0
- React Native version: 0.72.6
- React version: 18.2.0

#### iOS Compatibility
- iOS Simulator: Version 18.2 or below is required
  - Higher iOS versions have known network connection issues with the simulator
  - If you're using a newer iOS version, you may experience connection problems
- Physical iOS Devices:
  - The app may not run on newer versions of Expo Go due to React version compatibility
  - Consider using an older version of Expo Go or building a development client

#### Android Compatibility
- The app has been tested on Android 13 and below
- Some features may not work as expected on newer Android versions

#### Development Environment
- Newer versions of Expo SDK have documented bugs with iOS simulator
- If you encounter simulator issues, try:
  1. Using a physical device
  2. Downgrading your iOS simulator version
  3. Using an Android emulator instead

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


