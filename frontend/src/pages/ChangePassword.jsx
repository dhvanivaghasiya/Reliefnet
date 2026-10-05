import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const ChangePassword = () => {
  const { changePassword, logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setSuccessMsg('Password changed successfully! You will be redirected.');
      } else {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 font-['Inter',sans-serif]">
      <div className="w-full max-w-md bg-white border border-zinc-250 rounded-[20px] p-8 shadow-xs text-left">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-9 w-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-black">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-lg font-black text-black">Security Protocol</span>
        </div>

        <h2 className="text-2xl font-black text-black tracking-tight mb-2">
          Update Password
        </h2>
        <p className="text-zinc-500 text-sm mb-6">
          This account was created with a temporary password. For security reasons, you must update your password before proceeding.
        </p>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-750 mb-6">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-350 p-4 text-sm text-zinc-800 mb-6">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-250 bg-white py-3 pl-11 pr-11 text-sm text-zinc-900 outline-none focus:border-zinc-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-700"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-250 bg-white py-3 pl-11 pr-11 text-sm text-zinc-900 outline-none focus:border-zinc-400 transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={logout}
              className="flex-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 py-3 text-sm font-bold text-zinc-900 transition cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!successMsg}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 py-3 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
