"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollButtons() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showBottomBtn, setShowBottomBtn] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // If we've scrolled down a bit, only show the Top button
      if (window.scrollY > 300) {
        setShowTopBtn(true);
        setShowBottomBtn(false);
      } else {
        // We're near the top. Show the Bottom button (unless the page is very short)
        setShowTopBtn(false);
        const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
        setShowBottomBtn(!isNearBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all hover:-translate-y-1 focus:outline-none"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      
      {showBottomBtn && (
        <button
          onClick={scrollToBottom}
          className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 hover:shadow-xl transition-all hover:translate-y-1 focus:outline-none"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
