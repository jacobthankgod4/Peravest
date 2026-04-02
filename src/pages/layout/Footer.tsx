import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PropertyInvest</h3>
            <p className="text-gray-300">Secure property investment platform</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/properties" className="block text-gray-300 hover:text-white">Properties</Link>
              <Link to="/terms" className="block text-gray-300 hover:text-white">Terms</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-300">support@propertyinvest.com</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-300">
          © 2024 PropertyInvest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;