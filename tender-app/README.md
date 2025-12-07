# Tender Management System

A blockchain-inspired transparent tender and fund allocation system built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

### 🔐 Authentication & Roles
- **JWT-based authentication** with secure password hashing
- **Role-based access control**: Admin and Public/Contractor roles
- **Registration** for Public users
- **Protected routes** with middleware

### 👨‍💼 Admin Dashboard
- **Publish new tenders** with complete details
- **View all tenders** with status management
- **Delete tenders** when necessary
- **View bidding details** for each tender
- **Update tender status** (Open → Closed → Awarded → Completed)

### 👷 Public/Contractor Dashboard
- **View active tenders** (status: Open only)
- **Submit competitive bids** with proposals
- **Track personal bidding status** per tender

### 🎨 User Interface
- **Clean, modern design** with blue/white theme
- **Responsive layout** for mobile and desktop
- **Real-time status updates** and notifications
- **Form validations** and user feedback

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with responsive design
- **Vanilla JavaScript** - Client-side functionality
- **Fetch API** - HTTP requests

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'public'])
}
```

### Tenders Collection
```javascript
{
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  status: String (enum: ['Open', 'Closed', 'Awarded', 'Completed']),
  createdBy: ObjectId (ref: 'User')
}
```

### Bids Collection
```javascript
{
  contractorId: ObjectId (ref: 'User'),
  tenderId: ObjectId (ref: 'Tender'),
  bidAmount: Number,
  proposalText: String,
  bidStatus: String (enum: ['Submitted', 'Accepted', 'Rejected'])
}
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **Git** (optional, for cloning)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   cd your-projects-directory
   # If cloning from git
   git clone <repository-url>
   cd tender-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env` file and update the values:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/tenderapp
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

5. **Run the Application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the Application**
   - Open your browser and go to: `http://localhost:3000`
   - Register as a Public user or login with Admin credentials

## 👤 Default Accounts

### Creating Admin Account
Since admin registration is restricted, you'll need to create an admin account manually in MongoDB:

```javascript
// Connect to MongoDB and run this in mongo shell
db.users.insertOne({
  name: "System Admin",
  email: "admin@tendersystem.com",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash a password
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use an online bcrypt generator to hash your password.

## 📱 Usage Guide

### For Public Users/Contractors:
1. **Register** with your name, email, and password
2. **Login** to access the dashboard
3. **Browse Active Tenders** in the main section
4. **Submit Bids** by clicking "Submit Bid" on open tenders
5. **Track Your Bids** in the "My Bids" section

### For Administrators:
1. **Login** with admin credentials
2. **Add New Tenders** using the form in the dashboard
3. **Manage Tenders** - view, update status, or delete
4. **Review Bids** submitted by contractors
5. **Update Tender Status** as the project progresses

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Tenders (Admin)
- `GET /api/tenders` - Get all tenders
- `POST /api/tenders` - Create new tender
- `PUT /api/tenders/:id/status` - Update tender status
- `DELETE /api/tenders/:id` - Delete tender

### Tenders (Public)
- `GET /api/tenders/active` - Get active tenders only

### Bids
- `POST /api/bids` - Submit new bid
- `GET /api/bids/my-bids` - Get user's bids
- `GET /api/bids/tender/:tenderId` - Get bids for tender (admin)
- `PUT /api/bids/:id/status` - Update bid status (admin)

## 🔒 Security Features

- **Password Hashing** with bcrypt
- **JWT Tokens** with expiration
- **Role-based Authorization** middleware
- **Input Validation** and sanitization
- **CORS Protection**
- **Environment Variables** for sensitive data

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop computers** (1200px+)
- **Tablets** (768px - 1199px)
- **Mobile phones** (320px - 767px)

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port

3. **JWT Token Errors**
   - Check JWT_SECRET in .env file
   - Clear localStorage and login again

4. **CORS Errors**
   - Ensure frontend is accessing the correct API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

