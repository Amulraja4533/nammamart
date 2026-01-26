
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { useSearchParams, Link } = ReactRouterDom as any;
import { Search, Filter, AlertCircle, Loader2, X } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import { productService } from '../services/api';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook to handle URL parameters for category filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await productService.getAll();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtering Logic: Category (from URL) + Search Term (from local state)
  const filtered = products.filter(p => {
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const clearCategory = () => {
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            NammaMart <span className="text-green-600">Store</span>
          </h1>
          {categoryFilter ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Showing:</span>
              <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                <span>{categoryFilter}</span>
                <button onClick={clearCategory} className="ml-2 hover:text-green-900 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <button onClick={clearCategory} className="text-xs text-gray-400 font-bold hover:text-green-600 underline underline-offset-4 decoration-gray-200">
                Show All Products
              </button>
            </div>
          ) : (
            <p className="text-gray-500 font-medium">Browse our full collection of fresh groceries</p>
          )}
        </div>
        
        <div className="flex w-full md:w-auto items-center space-x-4">
          <div className="relative flex-grow md:min-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={`Search in ${categoryFilter || 'store'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <button className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:text-green-600">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Fetching fresh products for you...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filtered.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
              <p className="text-gray-400 text-xl font-black uppercase tracking-widest mb-2">No results found</p>
              <p className="text-gray-500 mb-8">Try adjusting your search or category filter.</p>
              <button 
                onClick={clearCategory}
                className="px-8 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
