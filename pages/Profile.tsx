import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
const { Link, useNavigate } = ReactRouterDom as any;
import { User as UserIcon, Mail, Phone, ShoppingBag, LogOut, ChevronRight, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService, orderService } from '../services/api';
import { Order, User } from '../types';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, ordersRes] = await Promise.all([
          authService.getProfile(),
          orderService.getMyOrders()
        ]);
        setProfileData(profileRes.data);
        setOrders(ordersRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch account information');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium tracking-tight">Accessing your profile...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Basic Info */}
          <div className="md:w-1/3 space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">{profileData?.name}</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">NammaMart Customer</p>
              
              <div className="space-y-4 text-left border-t border-gray-50 pt-6">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail size={18} className="text-green-600 shrink-0" />
                  <span className="text-sm font-medium truncate" title={profileData?.email}>{profileData?.email}</span>
                </div>
                {/* Phone Number Display */}
                {profileData?.phone ? (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone size={18} className="text-green-600 shrink-0" />
                    <span className="text-sm font-medium">{profileData.phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-gray-300 italic">
                    <Phone size={18} className="shrink-0" />
                    <span className="text-xs">No phone added</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full mt-10 flex items-center justify-center space-x-2 bg-red-50 text-red-500 py-4 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content / Orders */}
          <div className="md:w-2/3">
            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="text-green-600" />
                  <h3 className="text-xl font-black text-gray-900">My Orders</h3>
                </div>
                <span className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                  {orders.length} Total
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">No purchases yet</p>
                  <Link to="/products" className="text-green-600 font-bold hover:underline">Start Shopping →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <Link 
                      key={order._id} 
                      to={`/order/${order._id}`}
                      className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 border border-transparent hover:border-green-100 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${order.isDelivered ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                          {order.isDelivered ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • ₹{order.totalPrice}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                  {orders.length > 5 && (
                    <Link to="/orders" className="block text-center py-3 text-sm font-bold text-gray-400 hover:text-green-600 uppercase tracking-widest">
                      View full order history
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;