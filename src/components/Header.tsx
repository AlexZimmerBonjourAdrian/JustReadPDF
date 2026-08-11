'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" onClick={closeMobileMenu} className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-all duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              JustReadPDF
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium text-sm tracking-wide">
              Home
            </Link>
            <Link href="#" className="text-gray-700 hover:text-red-600 transition-colors font-medium text-sm tracking-wide">
              Tools
            </Link>
            <Link href="#" className="text-gray-700 hover:text-red-600 transition-colors font-medium text-sm tracking-wide">
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <HiX size={26} className="text-gray-700" /> : <HiMenu size={26} className="text-gray-700" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link href="/" onClick={closeMobileMenu} className="text-gray-700 hover:text-red-600 transition-colors font-medium text-lg py-2">
                Home
              </Link>
              <Link href="#" onClick={closeMobileMenu} className="text-gray-700 hover:text-red-600 transition-colors font-medium text-lg py-2">
                Tools
              </Link>
              <Link href="#" onClick={closeMobileMenu} className="text-gray-700 hover:text-red-600 transition-colors font-medium text-lg py-2">
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
