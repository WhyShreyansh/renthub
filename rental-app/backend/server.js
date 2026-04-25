const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

/* =======================
   ✅ CORS CONFIG (FINAL)
======================= */
const allowedOrigins = [
  "http://localhost:3000",
  "https://renthub-git-main-whyshreyanshs-projects.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

/* =======================
   ✅ MIDDLEWARE
======================= */
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   ✅ ROUTES
======================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/users', require('./routes/users'));

/* =======================
   ✅ ROOT ROUTE
======================= */
app.get('/', (req, res) => {
  res.send('API is running...');
});

/* =======================
   ✅ MONGODB CONNECTION
======================= */
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });

/* =======================
   ✅ START SERVER
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
