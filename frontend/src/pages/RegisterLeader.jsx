import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Building, User, Mail, Phone, Shield, MapPin, CheckCircle, Loader2 } from 'lucide-react';

const RegisterLeader = () => {
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [govId, setGovId] = useState('');
  const [address, setAddress] = useState('');
  const [campRequested, setCampRequested] = useState('');
  const [reason, setReason] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !fullName || !age || !email || !phone || !govId || !address) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      username,
      password,
      full_name: fullName,
      age: parseInt(age),
      email,
      phone,
      gov_id: govId,
      address,
      camp_requested: campRequested,
      reason_for_applying: reason
    };

    try {
      await API.post('auth/register/leader/', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          const messages = [];
          for (const [key, value] of Object.entries(data)) {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
            if (Array.isArray(value)) {
              messages.push(`${fieldName}: ${value.join(', ')}`);
            } else {
              messages.push(`${fieldName}: ${value}`);
            }
          }
          setError(messages.join(' | '));
        }
      } else {
        setError('Failed to submit leader application. Username might be taken or server is offline.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 font-['Inter',sans-serif]">
        <div className="w-full max-w-md bg-white border border-zinc-250 rounded-2xl p-8 text-center space-y-6 shadow-xs">
          <div className="h-16 w-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-900 mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-black">Application Submitted Successfully.</h1>
            <p className="text-sm text-zinc-500">
              Status: <strong className="text-black">Pending</strong>
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              An administrator will verify your credentials shortly. Once approved, you will be able to log in to access your camp leader dashboard workspace.
            </p>
          </div>
          <Link
            to="/login"
            className="block w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-semibold text-white transition text-sm text-center cursor-pointer"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-955 py-12 px-6 md:px-12 flex items-center justify-center font-['Inter',sans-serif]">
      <div className="w-full max-w-2xl bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 space-y-8 relative shadow-xs">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-black mx-auto">
            <Building className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-black">Camp Leader Application</h1>
          <p className="text-sm text-zinc-500">Apply to manage emergency shelters and coordinate inventory</p>
        </div>

        {error && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* Section 1: Account Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest border-b border-zinc-200 pb-1">Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Username *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter account username"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Shield className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create security password"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-widest border-b border-zinc-200 pb-1">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Age *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Government ID Number *</label>
              <input
                type="text"
                required
                value={govId}
                onChange={(e) => setGovId(e.target.value)}
                placeholder="Passport, Aadhaar Card, ID Number"
                className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Full Address *</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State"
                rows={2}
                className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          {/* Section 3: Professional / Request Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-widest border-b border-zinc-200 pb-1">Camp Preferences</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Camp Requested</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  value={campRequested}
                  onChange={(e) => setCampRequested(e.target.value)}
                  placeholder="Which camp or location do you prefer to lead?"
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Reason for Applying</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your qualifications, organization background, or reasons to apply..."
                rows={3}
                className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Submit Leader Application'
            )}
          </button>
          
          <div className="text-center text-xs text-zinc-500 font-semibold">
            Already registered?{' '}
            <Link to="/login" className="text-black font-extrabold hover:underline">
              Log in here
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterLeader;
