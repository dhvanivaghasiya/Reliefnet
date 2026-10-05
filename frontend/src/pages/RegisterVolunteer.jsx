import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Heart, User, Mail, Phone, Shield, MapPin, Sparkles, Clock, CheckCircle, Loader2 } from 'lucide-react';

const RegisterVolunteer = () => {
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
  const [currentCity, setCurrentCity] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('Full Time');
  const [reason, setReason] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !fullName || !age || !email || !phone || !govId || !address || !currentCity) {
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
      current_city: currentCity,
      skills,
      availability,
      reason_for_volunteering: reason
    };

    try {
      await API.post('auth/register/volunteer/', payload);
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
        setError('Failed to submit registration. Username might be taken or server is offline.');
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
              Status: <strong className="text-black">Pending Approval</strong>
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mt-2">
              An administrator will review your profile shortly. Once approved, you will be able to log in to access your volunteer dashboard workspace.
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
            <Heart className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-black">Volunteer Registration</h1>
          <p className="text-sm text-zinc-500">Join a camp team and help distribute critical aid</p>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Username *</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Password *</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Government ID Number *</label>
                <input
                  type="text"
                  required
                  value={govId}
                  onChange={(e) => setGovId(e.target.value)}
                  placeholder="Aadhaar, Passport, License, etc."
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Current City *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={currentCity}
                    onChange={(e) => setCurrentCity(e.target.value)}
                    placeholder="e.g. Guwahati"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
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

          {/* Section 3: Availability & Skills */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-widest border-b border-zinc-200 pb-1">Availability & Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Skills (free text)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Sparkles className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. First Aid, Translation, Logistics"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Availability *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Clock className="h-4.5 w-4.5" />
                  </span>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Weekends Only">Weekends Only</option>
                    <option value="On Call">On Call</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-555 mb-1.5">Reason for Volunteering</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you want to volunteer for community relief?"
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
              'Submit Volunteer Application'
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

export default RegisterVolunteer;
