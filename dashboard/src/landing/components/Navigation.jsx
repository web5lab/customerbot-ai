import React, { useState, useEffect } from 'react';
import { Bot, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200' 
        : 'bg-white/70 backdrop-blur-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">CustomerBot</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Pricing
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base">
              Docs
            </a>
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm lg:text-base"
            >
              Sign in
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base"
            >
              Get started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 sm:mt-4 pb-3 sm:pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium py-2 text-base">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium py-2 text-base">
                Pricing
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium py-2 text-base">
                Docs
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="text-left text-gray-600 hover:text-gray-900 font-medium py-2 text-base"
              >
                Sign in
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="bg-gray-900 text-white px-4 py-3 rounded-lg font-medium text-left text-base mt-2"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}