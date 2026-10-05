import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 font-['Inter',sans-serif]">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-black">404 - Page Not Found</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 py-3 text-sm font-semibold text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Operations
        </button>
      </div>
    </div>
  );
};

export default NotFound;
