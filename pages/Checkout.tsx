
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { useNavigate } = ReactRouterDom as any;
import { Truck, CreditCard, ShoppingBag, MapPin, CheckCircle, ArrowRight, Loader2, Phone, QrCode, CloudRain } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService, paymentService, authService, settingsService, BASE_IMAGE_URL} from '../services/api';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice: itemsPrice, clearCart } = useCart();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD' | 'ONLINE_QR'>('ONLINE_QR');
  const [adminQr, setAdminQr] = useState('');

  // Delivery Charges State
  const [baseDelivery, setBaseDelivery] = useState(0);
  const [rainSurcharge, setRainSurcharge] = useState(0);
  const [rainEnabled, setRainEnabled] = useState(false);

  // Fetch Admin Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [qrRes, bdRes, rsRes, reRes] = await Promise.all([
          settingsService.getSetting('PAYMENT_QR').catch(() => ({ data: { value: '' } })),
          settingsService.getSetting('DELIVERY_CHARGE').catch(() => ({ data: { value: '0' } })),
          settingsService.getSetting('RAIN_CHARGE_AMOUNT').catch(() => ({ data: { value: '0' } })),
          settingsService.getSetting('RAIN_CHARGE_ENABLED').catch(() => ({ data: { value: 'false' } }))
        ]);
        setAdminQr(qrRes.data.value);
        setBaseDelivery(Number(bdRes.data.value) || 0);
        setRainSurcharge(Number(rsRes.data.value) || 0);
        setRainEnabled(reRes.data.value === 'true');
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    };
    fetchSettings();
  }, []);

  const totalDelivery = baseDelivery + (rainEnabled ? rainSurcharge : 0);
  const finalTotal = itemsPrice + totalDelivery;

  // Pre-fill from user profile and skip step 1 if details exist
  useEffect(() => {
    if (user) {
      const initialAddress = {
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        phone: user.phone || '',
      };
      setShippingAddress(initialAddress);

      // Skip to step 2 if all shipping info is already present
      if (user.address && user.city && user.postalCode && user.phone) {
        setStep(2);
      }
    }
  }, [user]);

  // Fix: Move navigation logic to useEffect to prevent state updates during render
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (cart.length === 0) {
    return null;
  }

  const handleNextStep = async () => {
    if (step === 1) {
      // Save details to profile for future use
      setSavingProfile(true);
      try {
        const { data } = await authService.updateProfile({
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          phone: shippingAddress.phone,
        });
        updateUser(data);
        setStep(2);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to save shipping details.');
      } finally {
        setSavingProfile(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cart,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        },
        paymentMethod,
        itemsPrice: itemsPrice,
        taxPrice: 0,
        shippingPrice: totalDelivery,
        totalPrice: finalTotal,
      };

      if (paymentMethod === 'Razorpay') {
        // Step 1: Create Razorpay Order first
        const { data: rzpOrder } = await paymentService.createRazorpayOrder(finalTotal);
        
        const options = {
          key: (window as any).VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
          amount: rzpOrder.amount,
          currency: 'INR',
          name: 'NammaMart',
          description: 'Grocery Purchase',
          order_id: rzpOrder.id,
          handler: async (response: any) => {
            try {
              // Step 2: Create internal order ONLY after successful payment trigger
              const { data: order } = await orderService.create(orderData);
              
              // Step 3: Verify signature and mark as paid
              await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id
              });
              
              clearCart();
              // Pass state to show success message
              navigate(`/order/${order._id}`, { state: { justPlaced: true } });
            } catch (err) {
              alert('Payment successful, but order recording failed. Please contact support.');
              setLoading(false);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: '#16a34a',
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else if (paymentMethod === 'ONLINE_QR') {
        // Online QR path: create order, mark as unpaid (Pending verification)
        const { data: order } = await orderService.create(orderData);
        clearCart();
        navigate(`/order/${order._id}`, { state: { justPlaced: true } });
      } else {
        // COD Path: Create order immediately with Unpaid status
        const { data: order } = await orderService.create(orderData);
        clearCart();
        // Pass state to show success message
        navigate(`/order/${order._id}`, { state: { justPlaced: true } });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 text-gray-900">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Secure <span className="text-green-600">Checkout</span>
          </h1>
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= i ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' : 'bg-white border-gray-200 text-gray-400'}`}>
                {step > i ? <CheckCircle size={20} /> : i}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Checkout Steps Column */}
          <div className="lg:col-span-2 space-y-8">
            {step === 1 && (
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><MapPin size={24} /></div>
                  <h2 className="text-2xl font-black text-gray-900">Shipping Details</h2>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">Full Address</label>
                    <textarea 
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none h-32 resize-none transition-all"
                      placeholder="Street name, Apartment, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">City</label>
                      <input 
                        type="text" 
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">PIN Code</label>
                      <input 
                        type="text" 
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                        placeholder="560001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-400 ml-1 tracking-widest">Phone Number</label>
                    <div className="relative">
                       <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <input 
                        type="tel" 
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone || savingProfile}
                    onClick={handleNextStep}
                    className="w-full bg-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-700 shadow-xl shadow-green-100 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {savingProfile ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>Next: Payment Method</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><CreditCard size={24} /></div>
                  <h2 className="text-2xl font-black text-gray-900">Payment Options</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-green-50 rounded-3xl border border-green-100 mb-4">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-black text-green-700 uppercase tracking-widest">Delivering To</h4>
                        <button onClick={() => setStep(1)} className="text-xs font-bold text-green-600 hover:underline">Change Address</button>
                     </div>
                     <p className="text-sm font-bold text-gray-800">{shippingAddress.address}, {shippingAddress.city} - {shippingAddress.postalCode}</p>
                     <p className="text-xs text-gray-500 mt-1 font-medium">Contact: {shippingAddress.phone}</p>
                  </div>

                  {/* Online QR Option */}
                  <button 
                    onClick={() => setPaymentMethod('ONLINE_QR')}
                    className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'ONLINE_QR' ? 'border-green-600 bg-green-50 text-green-700 shadow-md shadow-green-50' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <QrCode className={paymentMethod === 'ONLINE_QR' ? 'text-green-600' : 'text-gray-400'} />
                      <div>
                        <p className="font-bold text-lg">Online Payment (Scan QR)</p>
                        <p className="text-sm opacity-70">Scan QR using GPay / PhonePe / Paytm</p>
                      </div>
                    </div>
                    {paymentMethod === 'ONLINE_QR' && <CheckCircle className="text-green-600" />}
                  </button>

                  {/* COD Option */}
                  <button 
                    onClick={() => setPaymentMethod('COD')}
                    className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50 text-green-700 shadow-md shadow-green-50' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center space-x-4 text-left">
                      <Truck className={paymentMethod === 'COD' ? 'text-green-600' : 'text-gray-400'} />
                      <div>
                        <p className="font-bold text-lg">Cash on Delivery</p>
                        <p className="text-sm opacity-70">Pay when your order reaches you</p>
                      </div>
                    </div>
                    {paymentMethod === 'COD' && <CheckCircle className="text-green-600" />}
                  </button>

                  <div className="pt-8 flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors">Back</button>
                    <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-100 active:scale-95 transition-all">Review Order</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShoppingBag size={24} /></div>
                  <h2 className="text-2xl font-black text-gray-900">Final Confirmation</h2>
                </div>
                <div className="space-y-6">
                  {paymentMethod === 'ONLINE_QR' && (
                    <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 text-center">
                       <h4 className="font-black text-orange-700 mb-4 uppercase tracking-widest text-xs">Payment QR Code</h4>
                       {adminQr ? (
                         <div className="max-w-[200px] mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-orange-200">
                          <img src={http://127.0.0.1:5000${adminQr}} alt="Scan to Pay" className="w-full h-full object-contain" />
                         </div>
                       ) : (
                         <div className="py-10 text-orange-300 font-bold italic">QR code not configured by store</div>
                       )}
                       <p className="text-orange-900 font-bold mb-2">Scan this QR using GPay / PhonePe / Paytm</p>
                       <p className="text-orange-600 text-xs font-medium">Please click the button below after completing the transaction</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-3xl grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Deliver To</h4>
                      <p className="font-bold text-gray-900 leading-tight">{shippingAddress.address}, {shippingAddress.city} - {shippingAddress.postalCode}</p>
                      <p className="text-xs text-gray-500 mt-1">Phone: {shippingAddress.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Payment Method</h4>
                      <p className="font-bold text-gray-900">
                        {paymentMethod === 'ONLINE_QR' ? 'Online QR Payment' : paymentMethod === 'Razorpay' ? 'Secure Online Payment' : 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    onClick={handlePlaceOrder}
                    className="w-full bg-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>{paymentMethod === 'ONLINE_QR' ? 'I Have Completed Payment' : 'Confirm & Place Order'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <button onClick={() => setStep(2)} className="w-full py-4 text-gray-400 font-bold hover:text-green-600 transition-colors">Modify Options</button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm sticky top-28">
              <div className="flex items-center space-x-2 mb-6">
                <ShoppingBag className="text-green-600" size={20} />
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Cart Summary</h2>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <img 
                      src={item.image.startsWith('http') ? item.image : `${BASE_IMAGE_URL}${item.image}`} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-50" 
                    />
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 font-medium">Qty: {item.qty} × ₹{item.price}</p>
                    </div>
                    <p className="font-bold text-gray-900">₹{item.qty * item.price}</p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{itemsPrice}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Delivery Charge</span>
                  <span className={baseDelivery > 0 ? "text-gray-900 font-bold" : "text-green-600 font-bold"}>
                    {baseDelivery > 0 ? `₹${baseDelivery}` : 'FREE'}
                  </span>
                </div>
                
                {rainEnabled && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-right-2">
                    <div className="flex items-center space-x-2 text-orange-700">
                      <CloudRain size={16} />
                      <span className="text-sm font-bold">Rain Surcharge</span>
                    </div>
                    <span className="text-orange-700 font-black">₹{rainSurcharge}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2 border-t border-gray-50">
                  <span>Total</span>
                  <span className="text-orange-500">₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
