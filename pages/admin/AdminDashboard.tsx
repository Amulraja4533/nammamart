
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { LayoutGrid, Package, ListOrdered, Users, TrendingUp, ChevronRight, Loader2, XCircle, CheckCircle2, Clock, QrCode, Upload, Save, Truck, CloudRain } from 'lucide-react';
import { productService, orderService, authService, settingsService, uploadService, BASE_IMAGE_URL } from '../../services/api';
import { Product, Order, User } from '../../types';

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // QR Code State
  const [qrCodePath, setQrCodePath] = useState('');
  const [qrUploading, setQrUploading] = useState(false);
  const [qrSaving, setQrSaving] = useState(false);

  // Delivery Config State
  const [deliveryCharge, setDeliveryCharge] = useState('0');
  const [rainCharge, setRainCharge] = useState('0');
  const [rainEnabled, setRainEnabled] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [pRes, oRes, uRes, qrRes, dcRes, rcRes, reRes] = await Promise.all([
          productService.getAll(),
          orderService.getAllOrders(),
          authService.getUsers(),
          settingsService.getSetting('PAYMENT_QR').catch(() => ({ data: { value: '' } })),
          settingsService.getSetting('DELIVERY_CHARGE').catch(() => ({ data: { value: '0' } })),
          settingsService.getSetting('RAIN_CHARGE_AMOUNT').catch(() => ({ data: { value: '0' } })),
          settingsService.getSetting('RAIN_CHARGE_ENABLED').catch(() => ({ data: { value: 'false' } }))
        ]);
        setProducts(pRes.data);
        setOrders(oRes.data);
        setUsers(uRes.data);
        setQrCodePath(qrRes.data.value);
        setDeliveryCharge(dcRes.data.value);
        setRainCharge(rcRes.data.value);
        setRainEnabled(reRes.data.value === 'true');
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);
    setQrUploading(true);

    try {
      const { data } = await uploadService.uploadImage(fd);
      setQrCodePath(data);
    } catch (err) {
      alert('QR Code upload failed');
    } finally {
      setQrUploading(false);
    }
  };

  const handleSaveQr = async () => {
    setQrSaving(true);
    try {
      await settingsService.updateSetting({ key: 'PAYMENT_QR', value: qrCodePath });
      alert('Payment QR Code updated successfully!');
    } catch (err) {
      alert('Failed to save QR code setting');
    } finally {
      setQrSaving(false);
    }
  };

  const handleSaveDeliveryConfig = async () => {
    setConfigSaving(true);
    try {
      await Promise.all([
        settingsService.updateSetting({ key: 'DELIVERY_CHARGE', value: deliveryCharge }),
        settingsService.updateSetting({ key: 'RAIN_CHARGE_AMOUNT', value: rainCharge }),
        settingsService.updateSetting({ key: 'RAIN_CHARGE_ENABLED', value: rainEnabled.toString() })
      ]);
      alert('Delivery configuration updated!');
    } catch (err) {
      alert('Failed to update delivery configuration');
    } finally {
      setConfigSaving(false);
    }
  };

  const totalSales = orders
    .filter(o => o.isPaid && !o.isCancelled)
    .reduce((acc, order) => acc + order.totalPrice, 0);

  const stats = [
    { title: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'Total Orders', value: orders.length.toString(), icon: ListOrdered, color: 'bg-orange-500' },
    { title: 'Inventory', value: products.length.toString(), icon: Package, color: 'bg-green-500' },
    { title: 'Total Users', value: users.length.toString(), icon: Users, color: 'bg-purple-500' },
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 font-bold">Synchronizing control center data...</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center space-x-3 mb-10">
        <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
          <LayoutGrid size={28} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Admin Control Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${s.color} opacity-10 rounded-full group-hover:scale-150 transition-transform`}></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`${s.color} text-white p-3 rounded-2xl`}>
                <s.icon size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 font-bold mb-1 uppercase tracking-wider text-xs">{s.title}</h3>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          {/* Manage Store Card */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Manage Store</h2>
            <div className="space-y-4">
              <Link to="/admin/products" className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-green-50 hover:text-green-600 transition-all border border-transparent hover:border-green-100 group">
                <div className="flex items-center space-x-4">
                  <Package size={24} />
                  <span className="font-bold text-lg">Product Management</span>
                </div>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/admin/orders" className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-100 group">
                <div className="flex items-center space-x-4">
                  <ListOrdered size={24} />
                  <span className="font-bold text-lg">Order Tracking</span>
                </div>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Truck className="text-green-600" size={24} />
              <h2 className="text-2xl font-black text-gray-900">Delivery Settings</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Base Delivery Charge (₹)</label>
                  <input 
                    type="number" 
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Rain Surcharge (₹)</label>
                  <input 
                    type="number" 
                    value={rainCharge}
                    onChange={(e) => setRainCharge(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center space-x-3">
                  <CloudRain className="text-orange-500" size={24} />
                  <div>
                    <p className="font-black text-orange-900 leading-tight">Rain Time Mode</p>
                    <p className="text-xs text-orange-700 font-medium">Enable to apply rain surcharge to all orders</p>
                  </div>
                </div>
                <button 
                  onClick={() => setRainEnabled(!rainEnabled)}
                  className={`w-14 h-8 rounded-full relative transition-colors ${rainEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${rainEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <button 
                onClick={handleSaveDeliveryConfig}
                disabled={configSaving}
                className="w-full bg-green-600 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-700 transition-all active:scale-95"
              >
                {configSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                <span>Save Delivery Config</span>
              </button>
            </div>
          </div>

          {/* Payment QR Code Management */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <QrCode className="text-orange-500" size={24} />
              <h2 className="text-2xl font-black text-gray-900">Payment QR Code</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8 font-medium">Upload your static UPI QR code (GPay, PhonePe, etc.) for online payments.</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-48 h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {qrCodePath ? (
                  // Fix: Use BASE_IMAGE_URL instead of import.meta.env to avoid TypeScript errors and ensure consistency
                   <img src={`${BASE_IMAGE_URL}${qrCodePath}`} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode size={48} className="text-gray-200" />
                )}
              </div>
              <div className="flex-grow space-y-4 w-full">
                <input 
                  type="file" 
                  id="qr-upload" 
                  className="hidden" 
                  onChange={handleQrUpload}
                  accept="image/*"
                />
                <label 
                  htmlFor="qr-upload"
                  className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl cursor-pointer hover:bg-gray-200 transition-all"
                >
                  {qrUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                  <span>{qrUploading ? 'Uploading...' : 'Update QR Image'}</span>
                </label>
                <button 
                  onClick={handleSaveQr}
                  disabled={!qrCodePath || qrSaving}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {qrSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  <span>Save QR Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Recent Orders</h2>
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).length > 0 ? orders.slice(0, 5).map(order => (
              <div key={order._id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{order.orderItems.length} Items • {order.user?.name || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{order.totalPrice}</p>
                  <span className={`flex items-center justify-end space-x-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${
                    order.isCancelled 
                      ? 'bg-red-600 text-white' 
                      : order.isDelivered 
                        ? 'bg-blue-100 text-blue-600' 
                        : order.isPaid 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-orange-100 text-orange-600'
                  }`}>
                    {order.isCancelled ? <XCircle size={10} /> : order.isDelivered ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    <span>{order.isCancelled ? 'Cancelled' : order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}</span>
                  </span>
                </div>
              </div>
            )) : (
              <p className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest">No recent orders</p>
            )}
          </div>
          <Link to="/admin/orders" className="block w-full mt-6 text-center text-sm font-bold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
            View All Sales Activity
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
