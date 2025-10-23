# ClaimEase - Insurance Management System

**Making insurance claims easy and hassle-free**

## Project Structure

```
ClaimEase/
├── backend/                    # Backend API server
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic services
│   │   ├── middleware/       # Custom middleware
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   └── config/           # Configuration files
│   ├── tests/                # Backend tests
│   └── uploads/              # File uploads
│       ├── documents/        # Claim documents
│       └── profile-images/   # User profile images
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── common/       # Shared components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── agent/        # Agent-specific components
│   │   │   └── customer/     # Customer-specific components
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── agent/        # Agent pages
│   │   │   ├── customer/     # Customer pages
│   │   │   └── auth/         # Authentication pages
│   │   ├── services/         # API service functions
│   │   ├── utils/            # Utility functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # React context providers
│   │   └── assets/           # Static assets
│   │       ├── images/       # Image files
│   │       └── styles/       # CSS/SCSS files
│   ├── public/               # Public static files
│   └── tests/                # Frontend tests
│
├── shared/                     # Shared code between frontend and backend
│   ├── types/                # TypeScript type definitions
│   ├── constants/            # Shared constants
│   ├── validators/           # Validation schemas
│   └── utils/                # Shared utility functions
│
├── config/                     # Configuration files
│   ├── database/             # Database configuration
│   ├── docker/               # Docker configuration
│   └── nginx/                # Nginx configuration
│
└── docs/                       # Documentation
    ├── api/                  # API documentation
    ├── deployment/           # Deployment guides
    └── user-manual/          # User documentation
```

## Core Features

1. **User Management**: Customer registration/login & admin/agent roles
2. **Policy Management**: Create, update, delete policies
3. **Premium Payment & Billing**: Integration with Stripe/Razorpay
4. **Claim Management**: Raise claim request, track, upload documents
5. **Dashboard**: For customers - policies, claims, upcoming premium due

## User Roles

### Admin Role
- Manage customers, agents, policies, and claims
- Approve or reject claim requests
- Oversee premium payment records and system transactions
- Generate analytical reports on revenue, policies, and claims
- Ensure system security and manage overall configurations

### Agent Role
- Assist customers in selecting suitable insurance policies
- Guide customers through the registration and policy purchase process
- Help customers initiate claims and upload supporting documents
- Remind customers about premium payments and due dates
- Act as an intermediary between customers and admins for issue resolution

### Customer Role
- Register and manage personal profile details
- Search and purchase insurance policies
- Pay premiums online via integrated payment gateways
- Raise and track claim requests with necessary documents
- View dashboard for policies, claims, and upcoming premium dues

## Unique Features

1. **Smart Recommendations**: Suggest best-fit insurance policies using customer data
2. **AI Chatbot Assistant**: Provides instant support and answers to user queries
3. **Notification & Reminder System**: Email/SMS/Push notifications for due payments, claim updates
4. **Analytics Dashboard**: Graphs & charts showing total policies sold, claim approval rates, revenue growth