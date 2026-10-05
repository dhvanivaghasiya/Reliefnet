import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Users, 
  Building,
  MapPin,
  Activity
} from 'lucide-react';

const Login = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'CAMP_LEADER') {
        navigate('/leader', { replace: true });
      } else {
        navigate('/volunteer', { replace: true });
      }
    }
  }, [user, navigate]);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 font-['Inter',sans-serif]">
        <div className="flex items-center gap-2 text-zinc-500 font-semibold text-xs">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Redirecting to your workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-55 font-['Inter',sans-serif]">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center bg-white border border-zinc-250 rounded-[24px] p-6 md:p-10 shadow-xs">
        
        {/* Left Side: Brand presentation */}
        <div className="md:col-span-5 flex flex-col justify-center h-full text-left space-y-6 md:pr-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
              <Activity className="h-6 w-6" />
            </div>
            <span className="text-xl font-black text-black">ReliefNet</span>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-black leading-tight">
              Community Relief System
            </h1>
            <p className="mt-4 text-zinc-500 text-base leading-relaxed">
              Empowering relief efforts, connecting volunteers, and managing camps with transparency and efficiency during critical times.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-200">
            <div className="flex items-center gap-3 text-sm text-zinc-700 font-semibold">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <ShieldCheck className="h-4 w-4" />
              </div>
              Role-based management & access control
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-700 font-semibold">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <MapPin className="h-4 w-4" />
              </div>
              Real-time map and camp tracking
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-700 font-semibold">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
                <Users className="h-4 w-4" />
              </div>
              Volunteer coordination & donations
            </div>
          </div>
        </div>

        {/* Right Side: Login form */}
        <div className="md:col-span-7 w-full bg-white border border-zinc-200 rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-2 text-left">
            Sign In
          </h2>
          <p className="text-zinc-500 text-sm mb-6 text-left">
            Access your dashboard and manage operations
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-750 mb-6 text-left">
              <AlertCircle className="h-5 w-5 shrink-0 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold text-zinc-555 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-555 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-3 pl-11 pr-11 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-xs text-zinc-500 px-1 font-semibold">
            <span>Apply to join:</span>
            <div className="flex gap-2">
              <Link to="/volunteer/register" className="text-black font-extrabold hover:underline">Volunteer Registry</Link>
              <span className="text-zinc-300">|</span>
              <Link to="/leader/register" className="text-black font-extrabold hover:underline">Camp Leader Registry</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
