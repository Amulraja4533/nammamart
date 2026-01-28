
import React, { useState, useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import { Truck, ShieldCheck, Clock, Award, Loader2 } from 'lucide-react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { Product } from '../types';
import { productService } from '../services/api';
import ProductCard from '../components/products/ProductCard';

/**
 * STRICTLY MANUALLY CONTROLLED CATEGORIES
 * These are hardcoded as per the project requirements for consistent home page display.
 */
const SHOP_CATEGORIES = [
  { 
    name: 'Vegetables', 
    img: 'https://media.istockphoto.com/id/1448794844/photo/fresh-vegetables-for-sale-on-market-stall.jpg?b=1&s=612x612&w=0&k=20&c=MxGrPZFNIRLeBg82lS20K7ehJXxfcKoOkpmGQFsi228=' 
  },
  { 
    name: 'Fruits', 
    img: 'https://img.freepik.com/free-photo/top-view-composition-delicious-autumn-fruits_23-2148634414.jpg?semt=ais_hybrid&w=740&q=80' 
  },
  { 
    name: 'Snacks', 
    img: 'https://www.kindpng.com/picc/m/99-993678_pepsico-all-snacks-transparent-hd-png-download.png' 
  },
  { 
    name: 'Nuts & Dry Fruits', 
    img: 'https://media.istockphoto.com/id/183803376/photo/mixed-nuts-and-dried-fruits.jpg?s=612x612&w=0&k=20&c=C7BlDHRlNQMTCMrAWcCg59PaA18bAuGXVcU0estWhGY=' 
  },
  { 
    name: 'Dairy', 
    img: 'https://media.istockphoto.com/id/910881428/photo/dairy-products-shot-on-rustic-wooden-table.jpg?s=612x612&w=0&k=20&c=Xh_dDL7XsV0Rff_aIrLOQJ1ZoapugiatmXUxWdo7q2s=' 
  },
  { 
    name: 'Grocery Essentials', 
    img: 'https://www.kindpng.com/picc/m/241-2413612_grocery-png-image-high-quality-indian-grocery-transparent.png' 
  },
];

const Index: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await productService.getAll();
        // Featured products remain dynamic (top 4 latest)
        setFeaturedProducts(data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      <HeroSection />

      {/* Manual Shop Categories Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {SHOP_CATEGORIES.map((c, i) => (
            <Link 
              to={`/products?category=${encodeURIComponent(c.name)}`} 
              key={i} 
              className="group text-center block"
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-50 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                <img 
                  src={c.img} 
                  alt={c.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-green-600 transition-colors">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-green-600 font-bold">View All</Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={32} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
