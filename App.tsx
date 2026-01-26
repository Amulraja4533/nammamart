import React from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { HashRouter, Routes, Route, Navigate, useLocation } = ReactRouterDom as any;
const Router = HashRouter;
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Index from './pages/Index';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import ProductEdit from './pages/admin/ProductEdit';
import OrderList from './pages/admin/OrderList';

/**
 * Guard for routes that require authentication.
 * Optional adminOnly flag restricts access to administrators.
 */
const ProtectedRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-green-600">Verifying access...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

/**
 * Guard for customer-only pages.
 * Redirects Admins to the Admin Dashboard to enforce strict role separation.
 */
const CustomerRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // If user is Admin, they are NOT allowed on customer pages. Redirect to Admin Hub.
  if (user && user.isAdmin) return <Navigate to="/admin" />;
  return <>{children}</>;
};

/**
 * Guard for public/auth pages like Login/Register.
 * Prevents logged-in users from seeing these pages.
 */
const GuestRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.isAdmin ? "/admin" : "/"} />;
  return <>{children}</>;
};

/**
 * AppLayout handles the conditional visibility of layout components like Footer
 * based on the current active route and user role.
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMyOrdersPage = location.pathname === '/orders';

  // Strict isolation: Footer only visible to Guests and Customers, never to Admins.
  const showFooter = !user?.isAdmin && !isMyOrdersPage;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Customer Facing Routes (Protected from Admins) */}
          <Route path="/" element={<CustomerRoute><Index /></CustomerRoute>} />
          <Route path="/products" element={<CustomerRoute><Products /></CustomerRoute>} />
          <Route path="/product/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
          <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
          
          {/* Auth Routes (Protected from Logged-in Users) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          
          {/* Private Customer Routes (Protected from both Guests and Admins) */}
          <Route path="/checkout" element={<ProtectedRoute><CustomerRoute><Checkout /></CustomerRoute></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><CustomerRoute><MyOrders /></CustomerRoute></ProtectedRoute>} />
          
          {/* Shared Order Detail Route (Accessible by both Customers and Admins for tracking) */}
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><CustomerRoute><Profile /></CustomerRoute></ProtectedRoute>} />
          
          {/* Admin Exclusive Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><ProductList /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><OrderList /></ProtectedRoute>} />
          <Route path="/admin/product/create" element={<ProtectedRoute adminOnly><ProductEdit /></ProtectedRoute>} />
          <Route path="/admin/product/:id/edit" element={<ProtectedRoute adminOnly><ProductEdit /></ProtectedRoute>} />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;