
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { useParams, Link, useNavigate } = ReactRouterDom as any;
import { ChevronLeft, Plus, Minus, ShoppingBag, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';
import { productService } from '../services/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data } = await productService.getById(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (error || !product) return <div className="text-center py-20">{error || 'Product not found'}</div>;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  const getUnitLabel = (category: string) => {
    const kgCategories = ['Vegetables', 'Fruits','Snacks' 'Nuts & Dry Fruits'];
    return kgCategories.includes(category) ? '/ Kg' : '/ Unit';
  };

  const imageUrl = product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-8 hover:text-green-600 transition-colors">
        <ChevronLeft /> <span>Back to results</span>
      </button>
      <div className="bg-white rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row gap-12 border border-gray-100 shadow-sm overflow-hidden">
        <div className="md:w-1/2 aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-50">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="md:w-1/2 flex flex-col">
          <div className="mb-auto">
            <span className="inline-block bg-green-50 text-green-600 font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            <p className="text-gray-500 mb-8 leading-relaxed text-lg">{product.description}</p>
            <div className="flex items-baseline space-x-2 mb-10">
              <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
              <span className="text-gray-400 font-bold text-sm">{getUnitLabel(product.category)}</span>
            </div>
          </div>
          
          {product.countInStock > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-white rounded-xl transition-all text-gray-500"><Minus size={18} /></button>
                  <span className="w-12 text-center font-black text-xl text-gray-900">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} className="p-3 hover:bg-white rounded-xl transition-all text-gray-500"><Plus size={18} /></button>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Availability</span>
                  <span className="text-sm font-bold text-green-600">{product.countInStock} units in stock</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart} 
                  className={`w-full py-5 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all active:scale-95 border-2 ${added ? 'bg-green-50 border-green-600 text-green-600' : 'bg-white border-green-600 text-green-600 hover:bg-green-50'}`}
                >
                  <ShoppingBag size={20} /> 
                  <span>{added ? 'Added to Basket!' : 'Add to Cart'}</span>
                </button>
                <button 
                  onClick={handleBuyNow} 
                  className="w-full bg-green-600 text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95"
                >
                  <Zap size={20} /> 
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center space-x-4 text-red-600">
              <AlertCircle size={24} />
              <span className="font-bold">Currently Out of Stock</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
