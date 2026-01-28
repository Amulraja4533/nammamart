
import React from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link, useNavigate } = ReactRouterDom as any;
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQty, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const getUnitLabel = (category: string) => {
    const kgCategories = ['Vegetables', 'Fruits', 'Nuts & Dry Fruits'];
    return kgCategories.includes(category) ? '/ Kg' : '/ Unit';
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <div className="bg-green-50 w-32 h-32 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-green-600 rotate-12 transition-transform hover:rotate-0">
          <ShoppingBag size={56} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">Your Cart feels light...</h2>
        <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">Explore our fresh grocery collection and start filling your cart with healthy choices!</p>
        <Link to="/products" className="inline-flex items-center space-x-3 bg-green-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95">
          <span>Start Shopping Now</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black text-gray-900">Your <span className="text-green-600">Basket</span></h1>
          <Link to="/products" className="hidden md:flex items-center space-x-2 text-gray-400 font-bold hover:text-green-600 transition-colors">
            <ChevronLeft size={20} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-grow space-y-6">
            {cart.map(item => (
              <div key={item._id} className="bg-white p-6 md:p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                  <img 
                    src={item.image.startsWith('http') ? item.image : `https://nammamart-backend.onrender.com${item.image}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded mb-1 inline-block">{item.category}</span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2 bg-gray-50 rounded-xl hover:bg-red-50"
                      title="Remove Item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                      <button 
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 disabled:opacity-30"
                        disabled={item.qty <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-black text-lg text-gray-900">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        className="p-2 hover:bg-white rounded-xl transition-all text-gray-500 disabled:opacity-30"
                        disabled={item.qty >= item.countInStock}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price: ₹{item.price}{getUnitLabel(item.category)}</p>
                      <p className="text-2xl font-black text-orange-500">₹{item.price * item.qty}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-2xl shadow-gray-200/50 sticky top-28">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Summary</h2>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Delivery Charge</span>
                  <span className="text-green-600 font-black uppercase tracking-widest text-xs bg-green-50 px-2 py-1 rounded">FREE</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Taxes (GST)</span>
                  <span>₹0.00</span>
                </div>
                <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">Final Total</span>
                  <span className="text-4xl font-black text-green-600">₹{totalPrice}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-green-600 text-white font-black py-6 rounded-3xl flex items-center justify-center space-x-3 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95 group"
                >
                  <span className="text-lg">Checkout Now</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Secure 256-bit SSL encrypted checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
