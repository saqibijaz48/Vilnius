import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

function ShoppingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Vilnius Shopping</h3>
            <p className="text-gray-300 mb-4">
              Your trusted online shopping destination with quality products and exceptional service.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-blue-400 cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-pink-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/shop/home" className="text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/shop/listing" className="text-gray-300 hover:text-white">Products</Link></li>
              <li><Link to="/shop/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/shop/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/shop/listing?category=men" className="text-gray-300 hover:text-white">Men's Fashion</Link></li>
              <li><Link to="/shop/listing?category=women" className="text-gray-300 hover:text-white">Women's Fashion</Link></li>
              <li><Link to="/shop/listing?category=kids" className="text-gray-300 hover:text-white">Kids</Link></li>
              <li><Link to="/shop/listing?category=accessories" className="text-gray-300 hover:text-white">Accessories</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <span className="text-gray-300">support@vilniusshopping.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span className="text-gray-300">123 Shopping St, Vilnius</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Vilnius Shopping. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ShoppingFooter;