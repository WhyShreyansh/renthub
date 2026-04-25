const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://renthub.vercel.app" // 🔴 your actual Vercel URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/users', require('./routes/users'));


// Root route (for testing backend)
app.get('/', (req, res) => {
  res.send('API is running...');
});


//  MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(" MONGO_URI not found in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch(err => {
    console.error(' MongoDB error:', err);
    process.exit(1);
  });


//  Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
