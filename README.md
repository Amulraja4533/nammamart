
# NammaMart - MERN Stack Grocery E-Commerce

## 1. Complete Folder Structure
```text
nammamart/
├── backend/                # Node.js/Express Server
│   ├── config/            # DB & Razorpay config
│   ├── controllers/       # Route logic
│   ├── middleware/        # Auth & Role validation
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   ├── uploads/           # Product images
│   └── server.js          # Entry point
└── frontend/               # React (Vite) Application
    ├── public/
    ├── src/
    │   ├── components/    # Reusable UI parts
    │   ├── contexts/      # Auth & Cart State
    │   ├── pages/         # View components
    │   ├── services/      # Axios API calls
    │   └── App.tsx        # Routing & Main logic
```

## 2. Required Libraries & Install Commands
### Frontend
`npm install axios react-router-dom lucide-react clsx tailwind-merge`
### Backend
`npm install express mongoose jsonwebtoken bcryptjs cors dotenv multer razorpay`

## 3. Environment Variables (.env)
### Frontend
`VITE_API_URL=http://localhost:5000/api`
`VITE_RAZORPAY_KEY_ID=your_key_id`

### Backend
`PORT=5000`
`MONGO_URI=mongodb+srv://...`
`JWT_SECRET=your_jwt_secret`
`RAZORPAY_KEY_ID=your_key_id`
`RAZORPAY_KEY_SECRET=your_key_secret`

## 4. Backend API Architecture
- **Auth**: JWT based. Tokens stored in client local storage/headers.
- **MVC Pattern**: Controllers handle business logic; Routes handle entry; Models handle data structure.
- **Security**: Password hashing via Bcrypt; Protected routes via custom `auth` and `admin` middleware.

## 5. Frontend Responsibilities
- **Contexts**: `AuthContext` manages user sessions and roles. `CartContext` manages local shopping state.
- **Pages**: 
  - `Index`: High-impact landing page (Reference: Template Monster Demo).
  - `AdminDashboard`: Centralized management for Products/Orders.
  - `Checkout`: Step-based process for Payment/COD.

## 6. Authentication Flow
1. User submits Login form.
2. Backend validates credentials, returns JWT + User details.
3. Frontend stores JWT in LocalStorage and sets Axios Auth Header.
4. AuthContext updates state, granting access to protected routes.

## 7. Razorpay Payment Flow
1. Customer clicks "Pay Now".
2. Frontend requests `/api/payment/create-order` from backend.
3. Backend calls Razorpay API to generate `order_id`.
4. Frontend opens Razorpay Checkout modal.
5. On success, Razorpay returns `payment_id`, `order_id`, and `signature`.
6. Frontend calls `/api/payment/verify` to confirm signature on backend.
7. Backend updates Order status to "Paid".

## 8. Deployment Steps
1. **Database**: Create a cluster on MongoDB Atlas and get the URI.
2. **Backend**: Host on Render. Add all Environment Variables. Connect the Github repo.
3. **Frontend**: Host on Vercel. Set `VITE_API_URL` to the Render URL.
