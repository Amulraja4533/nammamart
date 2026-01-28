import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { ShoppingBag, ChevronRight, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { orderService } from '../services/api';
import { Order } from '../types';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getMyOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Retrieving your order history...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-black text-gray-900 mb-10">My <span className="text-green-600">Orders</span></h1>

      {error ? (
        <div className="bg-red-50 p-8 rounded-[32px] border border-red-100 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center">
          <ShoppingBag className="mx-auto text-gray-200 mb-6" size={64} />
          <h2 className="text-2xl font-black text-gray-900 mb-4">No Orders Yet</h2>
          <p className="text-gray-500 mb-8">Start shopping our fresh collection of groceries!</p>
          <Link to="/products" className="inline-block px-10 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all">
            Go to Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Link 
              key={order._id} 
              to={`/order/${order._id}`}
              className="block bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                  
                    <img src={order.orderItems[0].image.startsWith('http') ? order.orderItems[0].image : `https://nammamart-backend.onrender.com${order.orderItems[0].image}`} className="w-full h-full object-cover" alt="Product" />
                    
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-3">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center space-x-3">
                      {order.isCancelled ? (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full">
                          <XCircle size={12} />
                          <span>Cancelled</span>
                        </span>
                      ) : order.isDelivered ? (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600 px-3 py-1 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                          <Clock size={12} />
                          <span>Pending</span>
                        </span>
                      )}
                      {order.isPaid ? (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-3 py-1 rounded-full">Paid</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-3 py-1 rounded-full">Unpaid</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end md:space-x-12 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Grand Total</p>
                    <p className="text-2xl font-black text-orange-500">₹{order.totalPrice}</p>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
