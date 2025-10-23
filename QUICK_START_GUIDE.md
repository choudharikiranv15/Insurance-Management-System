# Insurance Management System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git

---

## Step 1: Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Or use MongoDB Compass/Atlas cloud database.

---

## Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

✅ **Backend should now be running on:** http://localhost:5000

**Check health:** http://localhost:5000/api/health

---

## Step 3: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend folder
cd frontend_backup

# Install dependencies (if not already done)
npm install

# Start the React app
npm start
```

✅ **Frontend should now be running on:** http://localhost:3000

Browser should automatically open. If not, visit: http://localhost:3000

---

## Step 4: Seed Database (Optional)

To populate the database with sample data:

```bash
# In backend folder
cd backend
npm run seed
```

This creates:
- 3 users (Admin, Agent, Customer)
- Sample policies
- Sample claims
- Sample payments

---

## Step 5: Login

### Test Accounts

**Admin Login:**
- Email: `admin@insurance.com`
- Password: `Admin@123`

**Agent Login:**
- Email: `agent@insurance.com`
- Password: `Agent@123`

**Customer Login:**
- Email: `customer@insurance.com`
- Password: `Customer@123`

---

## 📋 Features to Test

### 1. **AI Chatbot** 🤖
- Click the blue chat button (bottom right)
- Try asking: "What insurance policies do you offer?"
- Ask: "Show my policies"

### 2. **Notifications** 🔔
- Click the bell icon in the top right
- View notifications
- Mark as read

### 3. **Smart Recommendations** 💡
- Customer dashboard will show personalized policy recommendations
- Based on profile data and risk factors

### 4. **Policy Management** 📄
- Admin/Agent can create policies
- Customer can view and purchase policies
- Status tracking

### 5. **Claim Management** 📋
- Submit claims with documents
- Track claim status
- Admin can approve/reject

### 6. **Payment System** 💳
- View payment history
- Track overdue payments
- Generate receipts

### 7. **Analytics Dashboard** 📊
- Admin has full analytics
- Revenue charts
- Policy distribution
- Claim approval rates

---

## 🎯 Quick Testing Workflow

### As Customer:
1. Login as customer
2. Chat with the bot: "Recommend insurance for me"
3. View dashboard → see policies, claims, payments
4. Click "File Claim" → upload documents
5. Check notifications

### As Agent:
1. Login as agent
2. View all customers
3. Assist with policy selection
4. Help with claim submission
5. Send payment reminders

### As Admin:
1. Login as admin
2. View analytics dashboard
3. Manage users (create/update/delete)
4. Approve/reject claims
5. Oversee payments
6. Generate reports

---

## 🐛 Troubleshooting

### Backend won't start:
- Check if MongoDB is running
- Check port 5000 is not in use
- Verify `.env` file exists in backend folder

### Frontend won't start:
- Check port 3000 is not in use
- Delete `node_modules` and run `npm install` again
- Clear browser cache

### Database connection error:
- Verify MongoDB is running
- Check MONGODB_URI in `.env`
- Default: `mongodb://localhost:27017/insurance_management`

### Can't login:
- Run seed script: `npm run seed` in backend folder
- Check console for errors
- Verify backend is running

---

## 📁 Project Structure

```
Insurance_Management/
├── backend/
│   ├── src/
│   │   ├── models/          # Database schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business services
│   │   ├── middleware/      # Auth, validation, etc.
│   │   └── server.js        # Entry point
│   ├── uploads/             # File uploads
│   └── package.json
│
├── frontend_backup/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # Auth context
│   │   └── App.js           # Main app
│   └── package.json
│
└── PROJECT_COMPLETION_SUMMARY.md
```

---

## 🔑 Important Endpoints

### Backend API
- Health Check: `GET /api/health`
- Login: `POST /api/auth/login`
- Policies: `GET /api/policies`
- Claims: `GET /api/claims`
- Payments: `GET /api/payments`
- Notifications: `GET /api/notifications`
- Recommendations: `GET /api/recommendations`
- Chatbot: `POST /api/chatbot`
- Analytics: `GET /api/analytics/dashboard`

### Test Endpoints with Curl:

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@insurance.com","password":"Customer@123"}'
```

---

## 🎨 UI Features

### Material-UI Components:
- Modern, responsive design
- Dark/Light theme support
- Mobile-friendly
- Professional cards and layouts

### Toast Notifications:
- Success messages (green)
- Error messages (red)
- Info messages (blue)
- Auto-dismiss after 3 seconds

### Chatbot Widget:
- Always accessible (bottom right)
- Real-time responses
- Quick suggestions
- Context-aware

### Notification Center:
- Badge count
- Real-time updates
- Mark as read
- Priority indicators

---

## 📊 Sample Data Overview

After seeding, you'll have:
- **3 Users**: Admin, Agent, Customer
- **Sample Policies**: Life, Health, Auto insurance examples
- **Claims**: Various claim types and statuses
- **Payments**: Payment history and due dates
- **Notifications**: Welcome messages and alerts

---

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control
- Rate limiting on APIs
- Input validation
- File upload validation
- CORS protection
- Helmet security headers

---

## 💻 Development Tips

### Backend Development:
- Server auto-restarts on file changes (nodemon)
- Logs shown in terminal
- Check MongoDB compass for data
- Use Postman for API testing

### Frontend Development:
- Hot reload enabled
- Check browser console for errors
- React DevTools recommended
- Network tab for API debugging

---

## 📝 Common Tasks

### Create a new user:
```javascript
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "1234567890",
  "role": "customer"
}
```

### Submit a claim:
```javascript
POST /api/claims
(with form-data for file uploads)
{
  "policy": "policyId",
  "claimType": "medical",
  "claimAmount": 50000,
  "description": "Medical emergency",
  "documents": [files]
}
```

### Get recommendations:
```javascript
GET /api/recommendations
(requires authentication token)
```

---

## 🎓 Learning Resources

### Technologies Used:
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Mongoose](https://mongoosejs.com/)

---

## ✅ Checklist for First Run

- [ ] MongoDB is running
- [ ] Backend installed and started (port 5000)
- [ ] Frontend installed and started (port 3000)
- [ ] Database seeded with sample data
- [ ] Can login as customer/agent/admin
- [ ] Chatbot responds to messages
- [ ] Notifications appear
- [ ] Dashboard loads correctly

---

## 🚀 Production Deployment Tips

1. **Environment Variables:**
   - Set production MongoDB URI
   - Use real SMTP credentials
   - Add Stripe production keys
   - Configure Twilio for SMS

2. **Build Frontend:**
   ```bash
   cd frontend_backup
   npm run build
   ```

3. **Use PM2 for Backend:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name insurance-api
   ```

4. **Set up Nginx** as reverse proxy

5. **Use HTTPS** (Let's Encrypt)

6. **Set up Monitoring** (PM2, New Relic, etc.)

---

## 📞 Support

If you encounter any issues:

1. Check the terminal for error messages
2. Review `PROJECT_COMPLETION_SUMMARY.md`
3. Verify all environment variables
4. Check MongoDB connection
5. Clear browser cache
6. Restart both servers

---

## 🎉 You're All Set!

The Insurance Management System is now running with:
- ✅ Complete backend with 50+ APIs
- ✅ React frontend with Material-UI
- ✅ AI Chatbot
- ✅ Smart Recommendations
- ✅ Notification System
- ✅ Analytics Dashboard
- ✅ Full CRUD operations
- ✅ File uploads
- ✅ Payment integration

**Happy Testing! 🚀**
