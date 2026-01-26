import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { useParams, Link, useLocation } = ReactRouterDom as any;
import { CheckCircle2, Clock, MapPin, Truck, CreditCard, ChevronLeft, Loader2, AlertCircle, PackageCheck, XCircle, Users, Phone, Mail, QrCode } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OrderDetails: React.FC = () => {
  // Fix: Move type assertion to the result of useParams to avoid generic parameter error on untyped function
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const location = useLocation();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Check if the order was just placed to show the confirmation message
    if (location.state?.justPlaced) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [id, location.state]);

  const deliverHandler = async () => {
    if (!id) return;
    try {
      setUpdateLoading(true);
      await orderService.markAsDelivered(id);
      await fetchOrder(); // Refresh data to get deliveredAt timestamp
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const markAsPaidHandler = async () => {
    if (!id) return;
    if (window.confirm('Verify that the customer has successfully completed the online payment?')) {
      try {
        setPaymentLoading(true);
        await orderService.markAsPaid(id);
        await fetchOrder();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to update payment status');
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  const cancelHandler = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        setUpdateLoading(true);
        await orderService.cancelOrder(id);
        await fetchOrder(); // Refresh data
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to cancel order');
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const getUnitLabel = (category: string) => {
    const kgCategories = ['Vegetables', 'Fruits', 'Nuts & Dry Fruits'];
    return kgCategories.includes(category) ? '/ Kg' : '/ Unit';
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Finding your order details...</p>
    </div>
  );

  if (error || !order) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
      <h2 className="text-2xl font-black text-gray-900 mb-4">{error || 'Order Not Found'}</h2>
      <Link to={user?.isAdmin ? "/admin/orders" : "/orders"} className="text-green-600 font-bold hover:underline">
        Back to Order List
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12 relative">
      {/* Order Confirmation Message (Toast) */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-green-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center space-x-3 border-4 border-white">
            <CheckCircle2 size={24} className="shrink-0" />
            <span className="font-black text-lg text-center leading-tight">Order Confirmed! Your order has been placed successfully.</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <Link to={user?.isAdmin ? "/admin/orders" : "/orders"} className="inline-flex items-center space-x-2 text-gray-400 font-bold hover:text-green-600 mb-8 transition-colors">
          <ChevronLeft size={20} />
          <span>{user?.isAdmin ? 'Back to Order Management' : 'Back to My Orders'}</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Order Summary</h1>
            <p className="text-gray-500 font-medium tracking-tight">ID: #{order._id.toUpperCase()}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {order.isCancelled && (
              <div className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-red-600 text-white shadow-lg">
                <XCircle size={18} />
                <span>Cancelled</span>
              </div>
            )}
            <div className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {order.isPaid ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              <span>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
            </div>
            {order.isDelivered && !order.isCancelled && (
              <div className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-blue-100 text-blue-600">
                <CheckCircle2 size={18} />
                <span>Delivered</span>
              </div>
            )}
            {!order.isDelivered && !order.isCancelled && (
              <div className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest bg-orange-100 text-orange-600">
                <Clock size={18} />
                <span>Pending</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Status Steps */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-widest text-xs opacity-40">Delivery Progress</h3>
              <div className="relative space-y-10">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                
                <div className="relative flex items-center space-x-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-lg ${order.isCancelled ? 'bg-red-500 shadow-red-100' : 'bg-green-600 shadow-green-100'} text-white`}>
                    {order.isCancelled ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{order.isCancelled ? 'Order Cancelled' : 'Order Placed'}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {!order.isCancelled && (
                  <>
                    <div className="relative flex items-center space-x-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${order.isPaid ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400'}`}>
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className={`font-black ${order.isPaid ? 'text-gray-900' : 'text-gray-300'}`}>Payment Confirmed</p>
                        {order.isPaid && <p className="text-sm text-gray-500">{new Date(order.paidAt).toLocaleString() || 'Verified'}</p>}
                      </div>
                    </div>

                    <div className="relative flex items-center space-x-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${order.isDelivered ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-400'}`}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className={`font-black ${order.isDelivered ? 'text-gray-900' : 'text-gray-300'}`}>Final Delivery</p>
                        {order.isDelivered && <p className="text-sm text-gray-500">{new Date(order.deliveredAt).toLocaleString()}</p>}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Actions Section */}
              <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
                {/* Admin Actions */}
                {user?.isAdmin && !order.isCancelled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mark as Paid Action for QR orders */}
                    {!order.isPaid && order.paymentMethod === 'ONLINE_QR' && (
                      <button 
                        onClick={markAsPaidHandler}
                        disabled={paymentLoading}
                        className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95"
                      >
                        {paymentLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                        <span>Mark as Paid</span>
                      </button>
                    )}
                    
                    {/* Deliver Action */}
                    {!order.isDelivered && (
                      <button 
                        onClick={deliverHandler}
                        disabled={updateLoading}
                        className={`w-full bg-green-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 ${(!order.isPaid && order.paymentMethod === 'ONLINE_QR') ? '' : 'sm:col-span-2'}`}
                      >
                        {updateLoading ? <Loader2 className="animate-spin" /> : <PackageCheck size={20} />}
                        <span>Mark as Delivered</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Customer Cancel Action - ONLY if Pending */}
                {!user?.isAdmin && !order.isDelivered && !order.isCancelled && (
                  <button 
                    onClick={cancelHandler}
                    disabled={updateLoading}
                    className="w-full bg-white text-red-500 border-2 border-red-500 font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-red-50 transition-all active:scale-95"
                  >
                    {updateLoading ? <Loader2 className="animate-spin" /> : <XCircle size={20} />}
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-8">Items Ordered</h3>
              <div className="divide-y divide-gray-50">
                {order.orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="py-6 flex items-center space-x-6">
                    <img 
                      src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:5000${item.image}`} 
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 bg-gray-50"
                      alt={item.name}
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                      <p className="text-gray-500 font-medium">₹{item.price}{getUnitLabel(item.category)} × {item.qty}</p>
                    </div>
                    <p className="text-xl font-black text-gray-900">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Order Total</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.itemsPrice || (order.totalPrice - order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery</span>
                  <span className={order.shippingPrice > 0 ? "text-gray-900 font-bold" : "text-green-600 font-black"}>
                    {order.shippingPrice > 0 ? `₹${order.shippingPrice}` : 'FREE'}
                  </span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="text-3xl font-black text-orange-500">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="text-green-600" size={20} />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Info</h3>
              </div>
              <p className="font-bold text-gray-900 mb-1">
                Method: {order.paymentMethod === 'ONLINE_QR' ? 'Online QR' : order.paymentMethod === 'Razorpay' ? 'Online' : 'Cash on Delivery'}
              </p>
              <p className={`text-sm font-bold ${order.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                Status: {order.isPaid ? 'Paid' : 'Unpaid'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="text-green-600" size={20} />
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Shipping Address</h3>
              </div>
              <p className="font-bold text-gray-900 leading-relaxed">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city} - {order.shippingAddress.postalCode}
              </p>
            </div>

            {user?.isAdmin && (
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="text-blue-600" size={20} />
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Identity</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                    <p className="font-bold text-gray-900">{order.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                    <div className="flex items-center space-x-2 text-sm font-medium text-blue-600">
                      <Mail size={14} />
                      <span className="truncate">{order.user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                    <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                      <Phone size={14} className="text-green-600" />
                      <span>{order.user?.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;