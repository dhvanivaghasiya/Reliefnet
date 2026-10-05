import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 py-6 text-center text-xs font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} ReliefNet. All rights reserved.</span>
        <div className="flex gap-6">
          <span className="cursor-default">Version 1.0.0</span>
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms of Service</a>
          <a href="#" className="hover:text-white transition">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
