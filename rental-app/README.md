# 🏠 RentaHub — Full-Stack Rental Marketplace

A complete rent & buy marketplace where users can list, rent, and purchase items.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MongoDB URI:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/rentalapp
JWT_SECRET=your_super_secret_here
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev   # requires: npm i -g nodemon
```

Server runs at: `http://localhost:5000`

---

### 2. Frontend Setup

Simply open `frontend/index.html` in a browser, **or** serve it with a simple HTTP server:

```bash
# Option 1: VS Code Live Server extension (recommended)

# Option 2: Python
cd frontend
python3 -m http.server 3000

# Option 3: Node.js
npx serve frontend -p 3000
```

Visit: `http://localhost:3000`

---

## 📁 Project Structure

```
rental-app/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── Item.js         # Item/listing schema
│   │   └── Rental.js       # Rental/purchase request schema
│   ├── routes/
│   │   ├── auth.js         # Login, register, profile
│   │   ├── items.js        # CRUD for listings
│   │   ├── rentals.js      # Rental requests & management
│   │   └── users.js        # User profiles
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── uploads/            # Uploaded images (auto-created)
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── css/style.css       # Full stylesheet
    ├── js/
    │   ├── api.js          # API utility functions
    │   ├── auth.js         # Auth management
    │   └── app.js          # Main app logic
    ├── pages/
    │   ├── dashboard.html  # User dashboard
    │   ├── post-item.html  # Post/edit listings
    │   └── profile.html    # User profile
    └── index.html          # Home / explore page
```

---

## ✨ Features

### For Buyers/Renters
- 🔍 Browse & search items with filters (category, price, location, sort)
- 📋 View detailed item info with pricing breakdown
- 📅 Request items for rent (with date picker & auto price calculation)
- 🛒 Request items to buy
- 💬 Send messages with requests
- 📊 Track all your rentals/purchases in dashboard
- ⭐ Leave reviews after completing rentals
- ❌ Cancel pending requests

### For Owners/Sellers
- 📸 Post items with up to 5 photos
- 💰 Set rental (per day/week/month) AND/OR sale prices
- 📥 Receive and manage rental requests
- ✅ Approve or reject requests with a message
- 🗑️ Edit or delete listings
- 📈 View listing stats (views, ratings)

### Platform
- 🔐 JWT authentication (register/login)
- 🖼️ Image upload with multer
- 🔎 Full-text search via MongoDB
- 📱 Fully responsive design
- 🎨 Modern UI with animations

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List all (with filters) |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create item (auth) |
| PUT | `/api/items/:id` | Update item (auth, owner) |
| DELETE | `/api/items/:id` | Delete item (auth, owner) |
| GET | `/api/items/user/:userId` | Get user's items |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rentals` | Create request (auth) |
| GET | `/api/rentals/my-rentals` | My rental requests |
| GET | `/api/rentals/my-requests` | Requests for my items |
| PUT | `/api/rentals/:id/status` | Approve/reject (owner) |
| PUT | `/api/rentals/:id/cancel` | Cancel (renter) |
| POST | `/api/rentals/:id/review` | Add review |

---

## 🌐 Using MongoDB Atlas (Cloud)

Replace `MONGO_URI` in `.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rentalapp
```

---

## 🔧 Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
**Backend:** Node.js, Express.js  
**Database:** MongoDB with Mongoose  
**Auth:** JWT (jsonwebtoken), bcryptjs  
**File Upload:** Multer  
**Fonts:** Syne + DM Sans (Google Fonts)
