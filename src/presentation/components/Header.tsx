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
    <header className="bg-[#FAFAF8] border-b border-[#E6E2DB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-[68px]">
          {/* Logo - editorial solid, no gradient */}
          <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 group">
            <div className="bg-[#C0392B] p-[9px] rounded-[10px] group-hover:bg-[#A93226] transition-colors duration-200">
              <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h7l3 3v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 7v3h3" />
              </svg>
            </div>
            <div className="flex items-baseline gap-[7px]">
              <span className="text-[19px] font-bold tracking-[-0.02em] text-[#111214] font-serif">JustReadPDF</span>
              <span className="hidden sm:inline text-[10px] tracking-[0.14em] uppercase text-[#9A9590] font-medium">Privado · Local</span>
            </div>
          </Link>
          
          {/* Desktop Navigation - underline, no color hover */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="relative text-[13px] tracking-[0.08em] uppercase font-medium text-[#111214] py-1 after:absolute after:left-0 after:-bottom-[3px] after:h-px after:w-full after:bg-[#111214] after:opacity-100">
              Inicio
            </Link>
            <Link href="#" className="relative text-[13px] tracking-[0.08em] uppercase font-medium text-[#6B6560] hover:text-[#111214] transition-colors py-1 after:absolute after:left-0 after:-bottom-[3px] after:h-px after:w-0 hover:after:w-full after:bg-[#111214] after:transition-all after:duration-200">
              Herramientas
            </Link>
            <Link href="#" className="relative text-[13px] tracking-[0.08em] uppercase font-medium text-[#6B6560] hover:text-[#111214] transition-colors py-1">
              Acerca
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
