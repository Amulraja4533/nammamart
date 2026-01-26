
import React from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { ArrowRight, Leaf } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-green-50 py-16 md:py-24">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-orange-100/50 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 relative flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Leaf size={16} />
            <span>100% Organic & Fresh Produce</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Freshness From <span className="text-green-600">Farmers</span> To Your <span className="text-orange-500">Kitchen</span>.
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-xl">
            NammaMart brings you the finest selection of handpicked groceries, fresh vegetables, and organic staples at everyday low prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link to="/products" className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-green-700 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <span>Shop All Products</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/products?category=Vegetables" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
              Fresh Vegetables
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg md:max-w-none">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
              alt="Grocery" 
              className="rounded-3xl shadow-2xl relative z-10 w-full object-cover aspect-video"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden md:block border-t-4 border-orange-500">
              <div className="text-3xl font-black text-orange-500">50% OFF</div>
              <div className="text-gray-500 text-sm font-bold">On Your First Order</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
