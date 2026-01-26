
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { 
  ListOrdered, 
  Search, 
  Eye, 
  Loader2, 
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck
} from 'lucide-react';
import { orderService } from '../../services/api';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deliverHandler = async (id: string) => {
    try {
      setActionLoading(id);
      await orderService.markAsDelivered(id);
      // Update local state instead of full fetch for snappier UI
      setOrders(prev => prev.map(o => o._id === id ? { 
        ...o, 
        isDelivered: true, 
        deliveredAt: new Date().toISOString(),
        isPaid: true,
        paidAt: new Date().toISOString()
      } : o));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.user && o.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center space-x-2 text-gray-400 font-bold hover:text-green-600 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Control Center</span>
        </Link>
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <ListOrdered className="text-orange-500" />
          <span>Order Management</span>
        </h1>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading platform sales activity...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-10 rounded-[40px] text-center border border-red-100">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-red-700 font-bold text-xl">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Order ID</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Method</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Total</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Paid</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-400 text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{order.user ? order.user.name : 'Unknown User'}</span>
                        <span className="text-xs text-gray-400">{order.user ? order.user.email : '-'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {order.paymentMethod === 'Razorpay' ? 'Online' : 'COD'}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900">₹{order.totalPrice}</td>
                    <td className="px-8 py-6">
                      {order.isPaid ? (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                          <XCircle size={12} />
                          <span>Unpaid</span>
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {order.isCancelled ? (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-2.5 py-1 rounded-full shadow-sm">
                          <XCircle size={12} />
                          <span>Cancelled</span>
                        </span>
                      ) : order.isDelivered ? (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Delivered</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                          <Clock size={12} />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-4">
                        {!order.isDelivered && !order.isCancelled && (
                          <button 
                            onClick={() => deliverHandler(order._id)}
                            disabled={actionLoading === order._id}
                            className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-green-600 border-2 border-green-600 px-4 py-2 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {actionLoading === order._id ? <Loader2 size={14} className="animate-spin" /> : <PackageCheck size={16} />}
                            <span>Mark as Delivered</span>
                          </button>
                        )}
                        <Link 
                          to={`/order/${order._id}`}
                          className="inline-flex items-center space-x-1 text-gray-400 font-bold hover:text-green-600 transition-colors"
                        >
                          <Eye size={18} />
                          <span className="hidden sm:inline">View Details</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white">
              <ListOrdered className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-lg">No orders found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderList;
