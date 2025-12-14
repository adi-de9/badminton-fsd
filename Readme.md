# SmashPoint - Badminton Court Booking System

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or Atlas connection string)

### 2. Installation
Clone the repository and install dependencies for both backend and frontend.

```bash
# Backend Setup
cd backend
npm install

# Frontend Setup
cd ../frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/badminton_db
JWT_SECRET=your_super_secret_key_change_this_in_prod
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Database Seeding
Populate the database with initial courts, equipment, pricing rules, and test users.

```bash
cd backend
npm run seed
```

### 5. Running the Application
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Test Credentials

Use these accounts to explore the Role-Based Access Control (RBAC) features:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@gmail.com` | `admin@gmail.com` | Full System Control (Users, Courts, Rules) |
| **Store Owner** | `owner@gmail.com` | `owner@gmail.com` | Facility Management & Stats |
| **Standard User**| `user@gmail.com` | `user@gmail.com` | Booking & History |

---

## 📝 Assumptions Made

1.  **Fixed Slots**: Booking slots are standardized to 1-hour durations to simplify the user interface and scheduling logic.
2.  **Currency**: The system uses INR (₹) as the base currency.
3.  **Timezone**: The server and facility are assumed to be in the same timezone. All date-time inputs are treated as local time to avoid confusion ("what you see is what you book").
4.  **Inventory**: Equipment stock is global across all courts (e.g., 20 rackets total, not per court).
5.  **Payment**: Payment gateway integration is simulated. Bookings are confirmed instantly.

---

## 🏗️ Technical Architecture & Design

### Database Design (MongoDB)
The system uses a document-oriented schema designed for flexibility and read performance.

-   **Users & Auth**: Stores profile data and `role` (Admin/Owner/User). Authentication is secure, using HTTP-only cookies and JWTs.
-   **Facilities (Courts/Coaches/Equipment)**:
    -   `Court`: Stores type (Indoor/Outdoor) and base hourly rate.
    -   `EquipmentCatalog` & `Inventory`: Separates product details from stock levels.
    -   `CoachAvailability`: Tracks specific busy slots for coaches to prevent double-booking.
-   **Booking Core**: Only stores the snapshot of the transaction. A booking document embeds the selected equipment and calculated price breakdown. This ensures that changing a price rule today doesn't alter the financial records of past bookings.
-   **Pricing Rules**: A dedicated collection for storing dynamic logic (e.g., "Weekend Surcharge").

**Why MongoDB?**
The flexible schema allows us to easily embed metadata (like "reason for waitlist") and pricing breakdowns without rigorous migrations. The nature of booking availability requires complex range queries (`start < requestedEnd AND end > requestedStart`), which MongoDB handles efficiently with compound indexes.

### 💰 Pricing Engine Approach
Instead of hardcoding prices, we built a **Dynamic Strategy-Based Pricing Engine**.

**How it works:**
1.  **Base Layer**: The system extracts the base rate from the selected Court.
2.  **Add-on Layer**: Fees for Coaches and Equipment are calculated linearly.
3.  **Rule Layer (The Engine)**:
    -   The system fetches active `PricingRules` from the database.
    -   It parses conditions against the booking context (e.g., `dayOfWeek === 'Saturday'`, `hour >= 18`).
    -   **Multipliers**: Applied to the base rate (e.g., 1.2x Peak Hour).
    -   **Flat Modifiers**: Added to the total (e.g., +₹50 Cleaning Fee).
    
**Advantages:**
-   **Flexibility**: An admin can create a "Friday Night Special" via the dashboard without any developer intervention.
-   **Transparency**: The frontend "Receipt" component calls the `previewPricing` API in real-time, showing the user exactly *why* the price is what it is (e.g., displaying "Weekend Surcharge: ₹50").

This separation of concerns—Data (Courts), Logic (Rules), and Transaction (Bookings)—creates a robust, scalable architecture.
