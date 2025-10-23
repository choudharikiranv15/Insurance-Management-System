# Insurance Management System - Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Common Issues](#common-issues)

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software
- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **npm** (v8.x or higher) - Comes with Node.js
- **MongoDB** (v5.x or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### Optional (Recommended)
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing tool
- **VS Code** - Code editor

---

## Technology Stack

### Backend
- **Node.js** with Express.js 5.1.0
- **MongoDB** with Mongoose 8.18.2
- **JWT** authentication
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **Express Rate Limit** for API protection
- **Multer** for file uploads
- **Nodemailer** for email services
- **Stripe** for payment processing
- **Twilio** for SMS notifications (optional)

### Frontend (frontend_backup)
- **React** 19.1.1
- **React Router DOM** 7.9.2
- **Material-UI** (MUI) 7.3.2
- **Axios** 1.12.2 for API calls
- **Recharts** 3.2.1 for data visualization
- **date-fns** for date formatting
- **React Toastify** for notifications
- **Stripe React** for payment integration
- **React Icons** for additional icons

---

## Project Structure

```
Insurance_Management/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Mongoose models
│   │   ├── middleware/        # Custom middleware
│   │   ├── routes/            # API routes (11 files)
│   │   ├── scripts/           # Utility scripts (seeding, etc.)
│   │   ├── services/          # Business services (notifications, recommendations)
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Entry point
│   ├── tests/                 # Backend tests
│   ├── uploads/               # File upload directory
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend_backup/           # React frontend (ACTIVE)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Chatbot, NotificationCenter, PrivateRoute
│   │   │   ├── analytics/     # Charts and analytics components
│   │   │   ├── users/         # User management components
│   │   │   └── profile/       # Profile components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── agent/         # Agent dashboard
│   │   │   ├── customer/      # Customer dashboard
│   │   │   └── auth/          # Login/Register
│   │   ├── services/          # API services (apiService.js)
│   │   ├── context/           # AuthContext
│   │   └── utils/             # Utilities
│   ├── public/                # Static files
│   └── package.json
│
├── frontend/                  # Alternate frontend (INACTIVE)
├── shared/                    # Shared utilities
├── config/                    # Project-wide config
├── docs/                      # Documentation
└── package.json               # Root package.json (workspace)
```

---

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Insurance_Management
```

### 2. Install Dependencies

#### Option A: Install All (Recommended)
```bash
npm run install:all
```

#### Option B: Install Individually
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend_backup
npm install
cd ..
```

---

## Environment Configuration

### Backend Environment Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. The `.env` file is already present with default configurations. Review and update the following:

#### Required Configuration
```env
# Database
MONGODB_URI=mongodb://localhost:27017/insurance_management

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-256-bit-key
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production-256-bit-key

# Email Configuration (for notifications)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_EMAIL=your-ethereal-email@ethereal.email
SMTP_PASSWORD=your-ethereal-password
```

#### Get Free SMTP Credentials (Ethereal)
1. Visit [https://ethereal.email/](https://ethereal.email/)
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials to your `.env` file

#### Optional: Payment Gateway (for production)
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Twilio (SMS Notifications - Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Setup

The frontend connects to `http://localhost:5000` by default. If your backend runs on a different port, update the API configuration in:

```
frontend_backup/src/config/api.js
```

---

## Database Setup

### 1. Start MongoDB

#### Windows
```bash
# Start MongoDB service
net start MongoDB
```

#### macOS/Linux
```bash
# Start MongoDB
mongod
```

Or use MongoDB as a background service (if installed as a service).

### 2. Verify MongoDB Connection

Open MongoDB Compass and connect to:
```
mongodb://localhost:27017
```

### 3. Seed Database (Optional)

To populate the database with sample data:
```bash
cd backend
npm run seed
```

This will create:
- Sample users (admin, agents, customers)
- Sample policies (Life, Health, Auto)
- Sample claims (Various types)
- Sample payments
- Welcome notifications

---

## Running the Application

### Option 1: Run Both Servers Concurrently (Recommended)

From the **root directory**:
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Option 2: Run Servers Individually

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend_backup
npm start
```

### Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Default Credentials

After seeding, you can use these credentials:

### Admin
- Email: `admin@insurance.com`
- Password: `Admin@123`

### Agent
- Email: `agent@insurance.com`
- Password: `Agent@123`

### Customer
- Email: `customer@insurance.com`
- Password: `Customer@123`

---

## Available Scripts

### Root Level
```bash
npm run dev                 # Run backend + frontend concurrently
npm run start               # Start both in production mode
npm run start:backend       # Start backend only
npm run start:frontend      # Start frontend only
npm run dev:backend         # Start backend in dev mode
npm run dev:frontend        # Start frontend in dev mode
npm run build:frontend      # Build frontend for production
npm run install:all         # Install all dependencies
```

### Backend
```bash
npm start                   # Start server (production)
npm run dev                 # Start server with nodemon (dev)
npm run seed                # Seed database with sample data
npm test                    # Run tests
```

### Frontend
```bash
npm start                   # Start development server
npm run build               # Build for production
npm test                    # Run tests
npm run eject               # Eject from Create React App
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend_backup
npm test
```

---

## Common Issues

### Issue 1: MongoDB Connection Error
**Error**: `MongoNetworkError: failed to connect to server`

**Solution**:
- Ensure MongoDB is running
- Check if MongoDB is running on port 27017
- Verify `MONGODB_URI` in `.env`

### Issue 2: Port Already in Use
**Error**: `Port 5000 is already in use`

**Solution**:
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Issue 3: Module Not Found
**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: JWT Secret Warning
**Warning**: Token verification failures

**Solution**:
- Ensure `JWT_SECRET` is set in `backend/.env`
- Use a strong, unique secret key (minimum 32 characters)

### Issue 5: CORS Errors
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Verify `CORS_ORIGIN` in `backend/.env` includes your frontend URL
- Default: `http://localhost:3000,http://localhost:3001`

### Issue 6: File Upload Errors
**Error**: Upload directory not found

**Solution**:
```bash
cd backend
mkdir -p uploads/documents
mkdir -p uploads/profile-images
```

---

## Production Deployment

### Environment Variables
Before deploying to production, update:
- All JWT secrets with strong random values
- MongoDB connection string (use MongoDB Atlas or production DB)
- SMTP credentials (use production email service)
- Payment gateway keys (use live keys)
- Set `NODE_ENV=production`

### Build Frontend
```bash
npm run build:frontend
```

### Security Checklist
- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable security headers (Helmet)
- [ ] Implement backup strategy

---

## Support

For issues or questions:
1. Check the [docs/](./docs/) directory
2. Review API documentation in [docs/api/](./docs/api/)
3. Open an issue on the project repository

---

## License

ISC

---

## New Features Implemented

### 1. AI Chatbot Assistant 🤖
**Location**: Bottom-right floating button on all pages

**Features**:
- Natural language conversation
- Context-aware responses
- Real-time data integration (shows policies, claims, payments)
- Quick suggestion chips
- FAQ support

**Usage**:
```javascript
// Test questions to ask:
- "What insurance policies do you offer?"
- "Show my policies"
- "Check my claim status"
- "When is my next payment due?"
- "How do I file a claim?"
```

**API Endpoints**:
- `POST /api/chatbot` - Send message to chatbot
- `GET /api/chatbot/suggestions` - Get quick suggestions
- `GET /api/chatbot/faqs` - Get FAQs

### 2. Smart Policy Recommendations 💡
**Location**: Customer Dashboard

**Features**:
- Personalized policy recommendations based on user profile
- AI-powered scoring algorithm (0-100 score)
- Considers 10+ factors:
  - Age, Income, Health (BMI, chronic conditions)
  - Family status (marital, dependents)
  - Occupation and employment type
  - Medical and family history
  - Lifestyle factors (smoking, drinking)
- Premium estimation
- Priority indicators (high/medium/low)
- Detailed benefits and reasons

**API Endpoints**:
- `GET /api/recommendations` - Get all personalized recommendations
- `GET /api/recommendations/:policyType` - Get specific policy recommendation

**Recommendation Categories**:
- Life Insurance
- Health Insurance
- Auto Insurance
- Home Insurance
- Travel Insurance
- Business Insurance

### 3. Notification & Reminder System 🔔
**Location**: Bell icon in top-right corner

**Features**:
- Multi-channel notifications (Email, SMS, Push, In-App)
- 14 notification types:
  - Payment due, overdue, received
  - Claim submitted, updated, approved, rejected
  - Policy created, expiring, renewed, cancelled
  - System alerts, account updates, document required
- Real-time unread count badge
- Priority levels (urgent, high, medium, low)
- Mark as read/unread functionality
- Email templates with beautiful HTML
- SMS notifications via Twilio (optional)
- Scheduled notifications support
- Delivery status tracking

**API Endpoints**:
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/preferences` - Get notification preferences
- `POST /api/notifications/test` - Send test notification

**Automatic Notifications**:
- Payment reminders (3 days before due)
- Overdue payment alerts
- Claim status updates
- Policy expiry reminders (30, 15, 7 days before)
- Document requirement notices

### 4. Enhanced Analytics Dashboard 📊
**Location**: Admin Dashboard → Analytics Tab

**Features**:
- Revenue analytics with trends
- Policy distribution charts
- Claim approval rate analysis
- Customer growth metrics
- Interactive charts using Recharts
- Data export capabilities
- Time-based filtering
- Real-time data aggregation

**API Endpoints**:
- `GET /api/analytics/dashboard` - Overall dashboard stats
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/policies` - Policy analytics
- `GET /api/analytics/claims` - Claims analytics
- `GET /api/analytics/customers` - Customer analytics
- `GET /api/analytics/export` - Export data

**Charts Available**:
- Revenue trend chart (line)
- Policy distribution (pie chart)
- Claims by status (bar chart)
- Monthly growth (area chart)
- Customer acquisition (line chart)

### 5. Comprehensive Payment Integration 💳
**Packages Installed**:
- Stripe (`stripe` package)
- Stripe React components

**Features**:
- 8 payment methods supported
- 5 payment gateways integrated
- Secure payment processing
- Receipt generation
- Refund processing
- Payment history tracking
- Overdue payment detection
- Auto-reminders

**Supported Payment Methods**:
- Credit Card, Debit Card
- Bank Transfer
- UPI
- Net Banking
- Wallet (Paytm, PhonePe, etc.)
- Cash
- Cheque

**Supported Gateways**:
- Stripe
- Razorpay
- PayU
- PayPal
- Paytm

---

## API Documentation Summary

### Complete API Endpoints List

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-password` - Change password

#### Users
- `GET /api/users` - List all users (with search/filter)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/dashboard-stats` - Dashboard statistics

#### Policies
- `GET /api/policies` - List all policies
- `GET /api/policies/:id` - Get policy details
- `POST /api/policies` - Create policy
- `PUT /api/policies/:id` - Update policy
- `DELETE /api/policies/:id` - Delete policy
- `PUT /api/policies/:id/status` - Update policy status
- `GET /api/policies/expiring-soon` - Get expiring policies
- `GET /api/policies/dashboard-stats` - Policy statistics

#### Claims
- `GET /api/claims` - List all claims
- `GET /api/claims/:id` - Get claim details
- `POST /api/claims` - Submit claim (with file upload)
- `PUT /api/claims/:id` - Update claim
- `PUT /api/claims/:id/status` - Update claim status
- `PUT /api/claims/:id/assign` - Assign claim to agent
- `POST /api/claims/:id/documents` - Upload claim documents
- `GET /api/claims/dashboard-stats` - Claim statistics

#### Payments
- `GET /api/payments` - List all payments
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id/status` - Update payment status
- `POST /api/payments/:id/refund` - Process refund
- `GET /api/payments/:id/receipt` - Get payment receipt
- `GET /api/payments/overdue` - Get overdue payments

#### Notifications (NEW)
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-multiple-read` - Mark multiple as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/test` - Send test notification
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

#### Recommendations (NEW)
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/:policyType` - Get specific recommendation

#### Chatbot (NEW)
- `POST /api/chatbot` - Chat with AI assistant
- `GET /api/chatbot/suggestions` - Get quick suggestions
- `GET /api/chatbot/faqs` - Get FAQs (public)

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/policies` - Policy analytics
- `GET /api/analytics/claims` - Claim analytics
- `GET /api/analytics/customers` - Customer analytics
- `GET /api/analytics/export` - Export data

---

## Testing the New Features

### Test Chatbot
1. Login as any user
2. Click the blue chat button (bottom-right)
3. Type: "What policies do you offer?"
4. Try: "Show my policies"
5. Ask: "How do I file a claim?"

### Test Notifications
1. Login as customer
2. Click the bell icon (top-right)
3. View notifications
4. Click on a notification to mark as read
5. Click "Mark all read" button

### Test Recommendations
1. Login as customer
2. View dashboard
3. Navigate to Recommendations section
4. See personalized policy suggestions
5. View estimated premiums and benefits

### Test Analytics
1. Login as admin
2. Go to Analytics tab
3. View revenue charts
4. Check policy distribution
5. Review claim approval rates

### API Testing with Postman/Curl

**Test Chatbot**:
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"What insurance policies do you offer?"}'
```

**Test Recommendations**:
```bash
curl http://localhost:5000/api/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Test Notifications**:
```bash
curl http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Schema Updates

### New Collections

#### notifications
```javascript
{
  recipient: ObjectId (User),
  type: String (14 types),
  title: String,
  message: String,
  data: {
    policyId: ObjectId,
    claimId: ObjectId,
    paymentId: ObjectId,
    additionalInfo: Mixed
  },
  priority: String (low, medium, high, urgent),
  channels: {
    email: Boolean,
    sms: Boolean,
    push: Boolean,
    inApp: Boolean
  },
  status: String (pending, sent, failed, read),
  isRead: Boolean,
  readAt: Date,
  sentAt: Date,
  metadata: {
    emailSent: Boolean,
    smsSent: Boolean,
    pushSent: Boolean
  },
  timestamps: true
}
```

**Indexes**:
- recipient + isRead
- recipient + createdAt
- status + scheduledFor
- type + createdAt

---

## Frontend Components Created

### New Components
1. **Chatbot.js** (`src/components/common/Chatbot.js`)
   - Floating action button
   - Collapsible chat window
   - Message history
   - Quick suggestions
   - Context-aware responses

2. **NotificationCenter.js** (`src/components/common/NotificationCenter.js`)
   - Notification dropdown menu
   - Badge with unread count
   - Mark as read functionality
   - Priority indicators
   - Real-time updates

3. **apiService.js** (`src/services/apiService.js`)
   - Centralized API service
   - Methods for all endpoints
   - Axios interceptors
   - Error handling

### Updated Components
1. **App.js**
   - Added ToastContainer for notifications
   - Integrated Chatbot component
   - Global notification setup

---

## Performance & Security

### Security Features
- JWT authentication on all protected routes
- Role-based authorization
- Input validation on all endpoints
- Rate limiting (7 different strategies)
- File upload validation
- Password hashing with bcryptjs
- CORS configuration
- Helmet security headers

### Performance Features
- Database indexes on frequently queried fields
- Pagination support on list endpoints
- Efficient aggregation queries
- Connection pooling
- Response caching (ready for Redis)

---

## Troubleshooting New Features

### Chatbot Not Responding
**Solution**:
- Check if backend is running
- Verify authentication token
- Check browser console for errors
- Test chatbot endpoint directly

### Notifications Not Showing
**Solution**:
- Check if user is logged in
- Verify backend `/api/notifications` endpoint
- Check browser console
- Clear local storage and re-login

### Recommendations Empty
**Solution**:
- Ensure user profile is complete
- Check if profile has required fields
- Verify backend `/api/recommendations` endpoint
- Profile must have age, income, health info

### Email Notifications Not Sending
**Solution**:
- Check SMTP configuration in `.env`
- Use Ethereal email for testing
- Check backend logs for email errors
- Verify Nodemailer configuration

---

**Last Updated**: October 2025
**Version**: 2.0 (With AI Features)
