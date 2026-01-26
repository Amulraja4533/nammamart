
import React from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link, useNavigate } = ReactRouterDom as any;
import { ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Handle local image paths from backend uploads
  const imageUrl = product.image.startsWith('http') 
    ? product.image 
    : `http://localhost:5000${product.image}`;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const getUnitLabel = (category: string) => {
    const kgCategories = ['Vegetables', 'Fruits', 'Nuts & Dry Fruits'];
    return kgCategories.includes(category) ? '/ Kg' : '/ Unit';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
      <Link to={`/product/${product._id}`} className="block aspect-square overflow-hidden bg-gray-50">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-auto">
          <Link to={`/product/${product._id}`}>
            <h3 className="font-bold text-gray-900 truncate hover:text-green-600">{product.name}</h3>
          </Link>
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">{getUnitLabel(product.category)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBuyNow}
              disabled={product.countInStock === 0}
              className="px-3 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-600 disabled:bg-gray-200 transition-colors"
            >
              Buy Now
            </button>
            <button 
              onClick={() => addToCart(product, 1)}
              disabled={product.countInStock === 0}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-200"
              title="Add to Cart"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
