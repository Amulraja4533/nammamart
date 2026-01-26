import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDom from 'react-router-dom';
// Fix: Use module-level destructuring to bypass environment-specific named export issues in react-router-dom
const { Link, NavLink, useNavigate } = ReactRouterDom as any;
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    'Vegetables',
    'Fruits',
    'Snacks',
    'Nuts & Dry Fruits',
    'Dairy',
    'Grocery Essentials'
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsCategoryOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `transition-colors hover:text-green-600 ${isActive ? 'text-green-600' : 'text-gray-700'}`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `block py-3 px-4 font-bold text-lg border-b border-gray-50 transition-colors ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'}`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center space-x-1 shrink-0">
          <span className="text-2xl font-black text-green-600">Namma</span>
          <span className="text-2xl font-black text-orange-500">Mart</span>
        </Link>

        {/* Navigation - Minimal for Customers */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          {!user?.isAdmin && (
            <>
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              <NavLink to="/products" className={navLinkClass}>Products</NavLink>
              
              {/* Category Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`flex items-center space-x-1 transition-colors hover:text-green-600 ${isCategoryOpen ? 'text-green-600' : 'text-gray-700'}`}
                >
                  <span>Category</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-4 w-60 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map(cat => (
                      <Link 
                        key={cat}
                        to={`/products?category=${encodeURIComponent(cat)}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="block px-6 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {user?.isAdmin && <NavLink to="/admin" className={navLinkClass}>Admin Panel</NavLink>}
        </nav>

        {/* Action Icons Area (Top-Right) */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Cart Icon - Customers Only */}
          {!user?.isAdmin && (
            <NavLink 
              to="/cart" 
              onClick={closeMenu}
              className={({ isActive }) => `relative p-2 transition-colors ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
          )}

          {user ? (
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Profile Icon - Round Avatar Style - Customers Only */}
              {!user.isAdmin && (
                <Link 
                  to="/profile" 
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm shrink-0 border border-green-200"
                  title="My Profile"
                >
                  <UserIcon size={20} />
                </Link>
              )}

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="p-2 text-gray-500 hover:text-red-500 transition-colors flex items-center space-x-1" 
                title="Logout"
              >
                <LogOut size={22} />
                <span className="hidden lg:inline text-xs font-bold uppercase tracking-widest">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <NavLink to="/login" onClick={closeMenu} className="hidden sm:inline text-sm font-bold text-gray-500 hover:text-green-600">Sign In</NavLink>
              <Link to="/register" onClick={closeMenu} className="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-700">Join</Link>
            </div>
          )}

          <button onClick={toggleMenu} className="md:hidden p-2 text-gray-600">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl z-50 overflow-y-auto max-h-[calc(100vh-80px)]">
          <nav className="flex flex-col p-2">
            {!user?.isAdmin && (
              <>
                <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink>
                <NavLink to="/products" className={mobileNavLinkClass} onClick={closeMenu}>Products</NavLink>
                
                {/* Mobile Categories Collapsible */}
                <div className="border-b border-gray-50">
                  <button 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center justify-between w-full py-3 px-4 font-bold text-lg text-gray-700 transition-colors hover:text-green-600"
                  >
                    <span>Categories</span>
                    <ChevronDown size={20} className={`transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCategoryOpen && (
                    <div className="bg-gray-50 py-2">
                      {categories.map(cat => (
                        <Link 
                          key={cat}
                          to={`/products?category=${encodeURIComponent(cat)}`}
                          onClick={closeMenu}
                          className="block py-2.5 px-10 text-sm font-bold text-gray-600 hover:text-green-600 transition-colors"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {user && <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>My Profile</NavLink>}
              </>
            )}
            {user?.isAdmin && <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMenu}>Admin Panel</NavLink>}
            {!user?.isAdmin && <NavLink to="/cart" className={mobileNavLinkClass} onClick={closeMenu}>Cart ({totalItems})</NavLink>}
            {user && <button onClick={handleLogout} className="block w-full text-left py-4 px-4 font-bold text-lg text-red-500">Logout</button>}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;