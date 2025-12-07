// server.js - Main server file for Tender Management System
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./models/User');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected to Atlas successfully!');
    await createDefaultAdmin();   // ⬅️ ensure admin exists
  })
  .catch(err => console.error('MongoDB connection error:', err));



// Import routes
const authRoutes = require('./routes/auth');
const tenderRoutes = require('./routes/tenderRoutes');
const bidRoutes = require('./routes/bids');
//chesking error
console.log('authRoutes type:', typeof authRoutes);
console.log('tenderRoutes type:', typeof tenderRoutes);
console.log('bidRoutes type:', typeof bidRoutes);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/bids', bidRoutes);
// Create or update default admin user
async function createDefaultAdmin() {
  try {
    const adminEmail = 'admin@gmail.com';

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      // Update existing admin: reset password and role
      adminUser.password = 'admin123'; // will be hashed by pre('save') hook
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Default admin updated: admin@gmail.com / admin123');
    } else {
      // Create new admin
      adminUser = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123', // will be hashed by pre('save') hook
        role: 'admin'
      });
      await adminUser.save();
      console.log('Default admin created: admin@gmail.com / admin123');
    }
  } catch (err) {
    console.error('Error creating/updating default admin:', err.message);
  }
}


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
