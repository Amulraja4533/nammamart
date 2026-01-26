
import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();

  /**
   * STRICTRULE: Hide the entire footer for Administrator roles.
   * This ensures the Admin Dashboard looks clean and professional.
   */
  if (user?.isAdmin) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <div className="flex items-center space-x-1 mb-8">
            <span className="text-3xl font-black text-green-600">Namma</span>
            <span className="text-3xl font-black text-orange-500">Mart</span>
          </div>
          <p className="text-gray-500 mb-8 leading-relaxed">
            NammaMart is your trusted neighborhood grocery store, bringing organic freshness and household staples directly to your doorstep.
          </p>
          <div className="flex space-x-4">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="p-3 bg-gray-50 text-gray-400 hover:bg-green-600 hover:text-white rounded-xl transition-all">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-black text-gray-900 mb-8">Quick Links</h4>
          <ul className="space-y-4 text-gray-500 font-medium">
            <li><a href="#" className="hover:text-green-600">About NammaMart</a></li>
            <li><a href="#" className="hover:text-green-600">Our Products</a></li>
            <li><a href="#" className="hover:text-green-600">Special Offers</a></li>
            <li><a href="#" className="hover:text-green-600">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-black text-gray-900 mb-8">Contact Us</h4>
          <ul className="space-y-6 text-gray-500">
            <li className="flex items-start space-x-4">
              <MapPin className="text-green-600 shrink-0" size={20} />
              <span>123, Thalavoi South, Ariyalur, Tamil Nadu</span>
            </li>
            <li className="flex items-center space-x-4">
              <Phone className="text-green-600 shrink-0" size={20} />
              <span>+91 9087694768</span>
            </li>
            <li className="flex items-center space-x-4">
              <Mail className="text-green-600 shrink-0" size={20} />
              <span>support@nammamart.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-black text-gray-900 mb-8">Newsletter</h4>
          <p className="text-gray-500 mb-6">Subscribe for daily deals and coupons.</p>
          <div className="flex flex-col space-y-3">
            <input type="email" placeholder="Email address" className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500" />
            <button className="bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 border-t border-gray-100 pt-10 text-center">
        <p className="text-gray-400 text-sm font-medium">
          © {new Date().getFullYear()} NammaMart E-Commerce. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
