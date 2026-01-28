
import React, { useState, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { useParams, useNavigate, Link } = ReactRouterDom as any;
import { 
  ChevronLeft, 
  Upload, 
  Save, 
  Package, 
  Loader2, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { productService, uploadService } from '../../services/api';

const ProductEdit: React.FC = () => {
  // Fix: Move type assertion to the result of useParams to avoid generic parameter error on untyped function
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    image: '',
    category: '',
    countInStock: 0,
    description: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProduct = async () => {
        try {
          const { data } = await productService.getById(id);
          setFormData({
            name: data.name,
            price: data.price,
            image: data.image,
            category: data.category,
            countInStock: data.countInStock,
            description: data.description,
          });
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch product');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);

    try {
      const { data } = await uploadService.uploadImage(fd);
      setFormData({ ...formData, image: data });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && id) {
        await productService.update(id, formData);
      } else {
        await productService.create(formData);
      }
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Preparing product editor...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/admin/products" className="inline-flex items-center space-x-2 text-gray-400 font-bold hover:text-green-600 mb-8 transition-colors">
          <ChevronLeft size={20} />
          <span>Back to Product List</span>
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-10">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
              <Package size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. Organic Tomatoes"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all appearance-none"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Nuts & Dry Fruits">Nuts & Dry Fruits</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Grocery Essentials">Grocery Essentials</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Price (₹)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Stock Quantity</label>
                <input 
                  type="number" 
                  value={formData.countInStock}
                  onChange={(e) => setFormData({...formData, countInStock: Number(e.target.value)})}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all h-32 resize-none"
                placeholder="Describe the product quality, benefits, etc."
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Product Image</label>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-40 h-40 bg-gray-100 rounded-[32px] overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200">
                  {formData.image ? (
                    <img 
                      src={formData.image.startsWith('http') ? formData.image : ` https://nammamart-backend.onrender.com${formData.image}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-gray-300" size={48} />
                  )}
                </div>
                <div className="flex-grow space-y-4">
                  <input 
                    type="text" 
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-green-500 outline-none transition-all"
                    placeholder="Image path or URL"
                    readOnly
                  />
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={uploadFileHandler}
                      className="hidden" 
                      id="image-upload"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="flex items-center justify-center space-x-2 bg-orange-100 text-orange-600 px-8 py-4 rounded-2xl font-bold cursor-pointer hover:bg-orange-200 transition-all"
                    >
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                      <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Recommended: 800x800px square image. JPG, PNG supported.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button 
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-green-600 text-white font-black py-5 rounded-3xl flex items-center justify-center space-x-2 hover:bg-green-700 shadow-2xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                <span className="text-lg">{isEditMode ? 'Update Product Details' : 'Publish Product to Store'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
