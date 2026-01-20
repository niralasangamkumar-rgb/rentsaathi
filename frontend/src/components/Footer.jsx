import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-gray-100 py-6 mt-8 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center">
        <div className="text-lg font-bold text-blue-700 mb-1">RentSaathi</div>
        <div className="text-sm text-gray-600 mb-3">India’s simple rental platform</div>
        <nav className="w-full flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
          <Link to="/privacy-policy" className="text-gray-700 hover:text-blue-600 text-sm">Privacy Policy</Link>
          <Link to="/terms" className="text-gray-700 hover:text-blue-600 text-sm">Terms &amp; Conditions</Link>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600 text-sm">Contact Us</Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
