
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link } = ReactRouterDom as any;
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Package,
  ChevronLeft
} from 'lucide-react';
import { productService } from '../../services/api';
import { Product } from '../../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await productService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteHandler = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center space-x-2 text-gray-400 font-bold hover:text-green-600 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Control Center</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Package className="text-green-600" />
            <span>Product Inventory</span>
          </h1>
          <Link 
            to="/admin/product/create"
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search inventory by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Scanning inventory...</p>
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
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Product</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Price</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Stock</th>
                  <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <span className="font-bold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-orange-500">₹{product.price}</td>
                    <td className="px-8 py-6">
                      <span className={`font-bold ${product.countInStock < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <Link 
                          to={`/admin/product/${product._id}/edit`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => deleteHandler(product._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white">
              <Package className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-500 font-bold text-lg">No products found in the database.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
