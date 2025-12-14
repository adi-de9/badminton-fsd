# Sports Court Booking Platform - Backend API Documentation

A comprehensive Node.js backend for managing sports court bookings with multi-resource atomic transactions, dynamic pricing, and waitlist management.

## 🚀 Tech Stack

- **Node.js** + **Express** (v4.18.2)
- **MongoDB** + **Mongoose** (v8.0.3)
- **JWT** Authentication
- **bcryptjs** - Password hashing

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running on `localhost:27017` or MongoDB Atlas)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (see .env example below)

# Seed database
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/badminton_fsd
JWT_SECRET=supersecretkey_change_in_production
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

## 📚 API Endpoints

Base URL: `http://localhost:5000`

---

## 🔐 Authentication

### 1. User Signup
**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "6584a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2025-12-13T10:30:00.000Z"
    }
  }
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "6584a1b2c3d4e5f6a7b8c9d0",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

## 🎾 User APIs

### 3. Check Availability
**GET** `/api/availability`

**Query Parameters:**
- `courtId` (required)
- `start` (required) - ISO date string
- `end` (required) - ISO date string
- `coachId` (optional)

**Example:**
```
GET /api/availability?courtId=6584a1b2c3d4e5f6a7b8c9d0&start=2025-12-15T10:00:00Z&end=2025-12-15T12:00:00Z
```

**Response:**
```json
{
  "success": true,
  "data": {
    "court": true,
    "coach": true
  }
}
```

### 4. Preview Pricing
**POST** `/api/pricing/preview`

**Request Body:**
```json
{
  "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
  "coachId": "6584a1b2c3d4e5f6a7b8c9d1",
  "equipment": [
    {
      "inventoryId": "6584a1b2c3d4e5f6a7b8c9d2",
      "qty": 2
    }
  ],
  "startTime": "2025-12-15T10:00:00Z",
  "endTime": "2025-12-15T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "finalPrice": 290,
    "breakdown": {
      "baseCourt": 200,
      "coach": 100,
      "equipment": 40,
      "subtotal": 340,
      "adjustments": [
        {
          "name": "Weekend Surcharge",
          "type": "multiplier",
          "value": 1.2,
          "amount": 68
        }
      ]
    }
  }
}
```

### 5. Create Booking
**POST** `/api/bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
  "coachId": "6584a1b2c3d4e5f6a7b8c9d1",
  "equipment": [
    {
      "inventoryId": "6584a1b2c3d4e5f6a7b8c9d2",
      "qty": 2
    }
  ],
  "startTime": "2025-12-15T10:00:00Z",
  "endTime": "2025-12-15T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6584a1b2c3d4e5f6a7b8c9d9",
    "userId": "6584a1b2c3d4e5f6a7b8c9d0",
    "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
    "coachId": "6584a1b2c3d4e5f6a7b8c9d1",
    "equipment": [...],
    "startTime": "2025-12-15T10:00:00.000Z",
    "endTime": "2025-12-15T12:00:00.000Z",
    "totalPrice": 290,
    "status": "confirmed",
    "createdAt": "2025-12-13T10:30:00.000Z"
  }
}
```

### 6. Get Booking by ID
**GET** `/api/bookings/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6584a1b2c3d4e5f6a7b8c9d9",
    "userId": "6584a1b2c3d4e5f6a7b8c9d0",
    "courtId": {
      "_id": "6584a1b2c3d4e5f6a7b8c9d0",
      "name": "Indoor 1",
      "type": "indoor",
      "basePricePerHour": 100
    },
    "coachId": {
      "_id": "6584a1b2c3d4e5f6a7b8c9d1",
      "name": "John Doe",
      "hourlyRate": 50
    },
    "equipment": [...],
    "startTime": "2025-12-15T10:00:00.000Z",
    "endTime": "2025-12-15T12:00:00.000Z",
    "totalPrice": 290,
    "status": "confirmed"
  }
}
```

### 7. Get User Bookings
**GET** `/api/users/:id/bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "_id": "6584a1b2c3d4e5f6a7b8c9d9",
      "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
      "startTime": "2025-12-15T10:00:00.000Z",
      "endTime": "2025-12-15T12:00:00.000Z",
      "totalPrice": 290,
      "status": "confirmed"
    }
  ]
}
```

### 8. Cancel Booking
**PATCH** `/api/bookings/:id/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6584a1b2c3d4e5f6a7b8c9d9",
    "status": "cancelled",
    "totalPrice": 290
  }
}
```

### 9. Join Waitlist
**POST** `/api/waitlist`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
  "startTime": "2025-12-15T10:00:00Z",
  "endTime": "2025-12-15T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6584a1b2c3d4e5f6a7b8c9da",
    "userId": "6584a1b2c3d4e5f6a7b8c9d0",
    "courtId": "6584a1b2c3d4e5f6a7b8c9d0",
    "startTime": "2025-12-15T10:00:00.000Z",
    "endTime": "2025-12-15T12:00:00.000Z",
    "status": "pending",
    "createdAt": "2025-12-13T10:30:00.000Z"
  }
}
```

---

## 👨‍💼 Admin APIs

All admin routes require:
```
Authorization: Bearer <admin_token>
```

### Courts

#### 10. Get All Courts
**GET** `/api/admin/courts`

**Response:**
```json
{
  "success": true,
  "results": 4,
  "data": [
    {
      "_id": "6584a1b2c3d4e5f6a7b8c9d0",
      "name": "Indoor 1",
      "type": "indoor",
      "basePricePerHour": 100,
      "isActive": true
    }
  ]
}
```

#### 11. Create Court
**POST** `/api/admin/courts`

**Request Body:**
```json
{
  "name": "Indoor 3",
  "type": "indoor",
  "basePricePerHour": 120
}
```

#### 12. Update Court
**PATCH** `/api/admin/courts/:id`

**Request Body:**
```json
{
  "basePricePerHour": 110,
  "isActive": false
}
```

#### 13. Delete Court
**DELETE** `/api/admin/courts/:id`

**Response:** 204 No Content

---

### Equipment

#### 14. Get All Equipment
**GET** `/api/admin/equipment`

#### 15. Create Equipment
**POST** `/api/admin/equipment`

**Request Body:**
```json
{
  "name": "Premium Racket",
  "category": "racket",
  "pricePerSession": 25,
  "description": "Carbon fiber racket"
}
```

#### 16. Update Equipment
**PATCH** `/api/admin/equipment/:id`

#### 17. Delete Equipment
**DELETE** `/api/admin/equipment/:id`

---

### Coaches

#### 18. Get All Coaches
**GET** `/api/admin/coaches`

#### 19. Create Coach
**POST** `/api/admin/coaches`

**Request Body:**
```json
{
  "name": "Sarah Williams",
  "hourlyRate": 60,
  "specialization": "Professional"
}
```

#### 20. Update Coach
**PATCH** `/api/admin/coaches/:id`

#### 21. Delete Coach
**DELETE** `/api/admin/coaches/:id`

---

### Coach Availability

#### 22. Get Coach Availability
**GET** `/api/admin/coaches/:id/availability`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6584a1b2c3d4e5f6a7b8c9db",
      "coachId": "6584a1b2c3d4e5f6a7b8c9d1",
      "date": "2025-12-15T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ]
}
```

#### 23. Create Coach Availability
**POST** `/api/admin/coaches/:id/availability`

**Request Body:**
```json
{
  "date": "2025-12-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "isAvailable": true
}
```

---

### Pricing Rules

#### 24. Get All Pricing Rules
**GET** `/api/admin/pricing-rules`

**Response:**
```json
{
  "success": true,
  "results": 2,
  "data": [
    {
      "_id": "6584a1b2c3d4e5f6a7b8c9dc",
      "name": "Weekend Surcharge",
      "type": "multiplier",
      "priority": 10,
      "condition": {
        "dayOfWeek": "Saturday"
      },
      "value": 1.2,
      "description": null
    }
  ]
}
```

#### 25. Create Pricing Rule
**POST** `/api/admin/pricing-rules`

**Request Body:**
```json
{
  "name": "Holiday Premium",
  "type": "flat",
  "priority": 8,
  "condition": {
    "day": "Sunday"
  },
  "value": 50,
  "description": "Additional charge for holidays"
}
```

#### 26. Update Pricing Rule
**PATCH** `/api/admin/pricing-rules/:id`

#### 27. Delete Pricing Rule
**DELETE** `/api/admin/pricing-rules/:id`

---

## 🔒 Core Features

### 1. Atomic Booking with Transactions
The booking engine uses **MongoDB transactions** for atomicity:
- Locks court, coach, and equipment resources
- Uses in-memory locking (suitable for single-instance development)
- Auto-rollback on failure

### 2. Dynamic Pricing Engine
- **Multiplier Rules**: e.g., 1.2x on weekends
- **Flat Rules**: e.g., $10 evening surcharge
- Priority-based rule application
- Context-aware (time, day, court type)

### 3. Availability Engine
- Real-time overlap checking for courts & coaches
- Equipment inventory aggregation
- Concurrent booking prevention

### 4. Waitlist System
- Auto-notifies users when slots free up
- FIFO processing
- Auto-booking attempts

---

## 📝 Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "results": 10  // (optional, for lists)
}
```

**Error:**
```json
{
  "success": false,
  "status": "fail",
  "message": "Error description"
}
```

---

## 🧪 Testing

### Seed Data
The seed script creates:
- 4 Courts (2 indoor, 2 outdoor)
- 3 Coaches
- 2 Equipment items with inventory
- 2 Pricing rules
- 1 Admin user (`admin@example.com` / `adminpassword123`)

### Test Flow
1. Login as admin
2. Create bookings
3. Check availability
4. Preview pricing
5. Cancel booking (triggers waitlist)

---

## 🛠 Tech Highlights

- **MVC + Services Architecture**
- **Async/await** throughout
- **JWT** authentication with role-based access
- **MongoDB Transactions** for multi-document operations
- **In-memory locking** for development
- **Clean error handling** with custom AppError class

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "helmet": "^7.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.0.3",
  "morgan": "^1.10.0"
}
```

---

## 🚧 Future Enhancements

- [ ] Email notifications for waitlist
- [ ] Payment gateway integration
- [ ] Recurring bookings
- [ ] Calendar view API
- [ ] Analytics dashboard
- [ ] Socket.io for real-time updates

---

## 📄 License

MIT

---

## 👨‍💻 Author

Sports Court Booking Platform Backend
