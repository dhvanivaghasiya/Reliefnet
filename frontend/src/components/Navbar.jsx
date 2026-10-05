import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Activity, LogOut, ShieldAlert, Building, Users, Home, MapPin, Layers, Gift, BarChart3, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => {
    return location.pathname === path ? 'text-black font-extrabold border-b-2 border-black' : 'text-zinc-650 hover:text-black font-semibold';
  };

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await API.get('notifications/');
        const count = res.data.filter(n => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load notifications for navbar:", err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200 py-3.5 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-black">
            ReliefNet
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 md:gap-8 flex-wrap">
          {!user ? (
            <>
              <Link to="/" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/')}`}>
                <span>Home</span>
              </Link>
              <Link to="/campaigns" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/campaigns')}`}>
                <span>Campaigns</span>
              </Link>
              <Link to="/volunteer/register" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/volunteer/register')}`}>
                <span>Volunteer</span>
              </Link>
              <Link to="/leader/register" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/leader/register')}`}>
                <span>Become Camp Leader</span>
              </Link>
              <Link to="/donate" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/donate')}`}>
                <span>Donate</span>
              </Link>
              <Link to="/about" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/about')}`}>
                <span>About</span>
              </Link>
              <Link to="/contact" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/contact')}`}>
                <span>Contact</span>
              </Link>
            </>
          ) : user.role === 'CAMP_LEADER' ? (
            <Link to="/dashboard" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/dashboard')}`}>
              <BarChart3 className="h-4 w-4" />
              <span>Leader Dashboard</span>
            </Link>
          ) : user.role === 'VOLUNTEER' ? (
            <Link to="/dashboard" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/dashboard')}`}>
              <BarChart3 className="h-4 w-4" />
              <span>Volunteer Dashboard</span>
            </Link>
          ) : (
            <>
              <Link to="/" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/')}`}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link to="/dashboard" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/dashboard')}`}>
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link to="/campaigns" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/campaigns')}`}>
                <Layers className="h-4 w-4" />
                <span>Campaigns</span>
              </Link>
              <Link to="/camps" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/camps')}`}>
                <MapPin className="h-4 w-4" />
                <span>Camps</span>
              </Link>
              <Link to="/history" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/history')}`}>
                <Gift className="h-4 w-4" />
                <span>Donations</span>
              </Link>
              <Link to="/approvals" className={`flex items-center gap-1.5 text-xs pb-1 transition ${isActive('/approvals')}`}>
                <Users className="h-4 w-4" />
                <span>Approvals</span>
              </Link>
            </>
          )}
        </div>

        {/* User Info / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Profile Details */}
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-900">{user.username}</span>
                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border self-end mt-0.5 ${
                  user.role === 'SUPER_ADMIN' 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-300' 
                    : user.role === 'CAMP_LEADER' 
                    ? 'bg-zinc-105 text-zinc-900 border-zinc-300' 
                    : 'bg-zinc-50 text-zinc-650 border-zinc-200'
                }`}>
                  {user.role === 'SUPER_ADMIN' && <ShieldAlert className="h-2.5 w-2.5" />}
                  {user.role === 'CAMP_LEADER' && <Building className="h-2.5 w-2.5" />}
                  {user.role === 'VOLUNTEER' && <Users className="h-2.5 w-2.5" />}
                  {user.role}
                </span>
              </div>
              
              {/* Notifications Button with Badge */}
              <Link
                to="/notifications"
                className="group flex items-center justify-center p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-250 border border-zinc-250 text-zinc-650 hover:text-black transition relative"
                title="Notifications"
              >
                <Bell className="h-4.5 w-4.5 animate-none group-hover:scale-105 transition" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="group flex items-center justify-center p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-900 transition"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
