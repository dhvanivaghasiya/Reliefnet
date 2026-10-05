import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-12 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-8 text-left items-start">
        
        {/* Info Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="border-b border-zinc-200 pb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contact Us</span>
            <h1 className="text-3xl font-black text-black mt-2">Get in Touch</h1>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Have questions about camp deployments, volunteer status, or larger corporate donations? Contact the administration center.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 bg-white border border-zinc-250 rounded-xl">
              <Phone className="h-5 w-5 text-zinc-800 shrink-0" />
              <div>
                <span className="text-zinc-400 block mb-0.5 font-bold uppercase tracking-wider">Emergency Hotline</span>
                <strong className="text-zinc-800 text-sm font-semibold">+91 99999 88888</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white border border-zinc-250 rounded-xl">
              <Mail className="h-5 w-5 text-zinc-800 shrink-0" />
              <div>
                <span className="text-zinc-400 block mb-0.5 font-bold uppercase tracking-wider">Email Address</span>
                <strong className="text-zinc-800 text-sm font-semibold">support@reliefnet.org</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white border border-zinc-250 rounded-xl">
              <MapPin className="h-5 w-5 text-zinc-800 shrink-0" />
              <div>
                <span className="text-zinc-400 block mb-0.5 font-bold uppercase tracking-wider">Administration Headquarters</span>
                <strong className="text-zinc-800 text-sm font-semibold">Central Disaster Management Complex, Sector 4</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form Column */}
        <div className="md:col-span-7 bg-white border border-zinc-250 p-6 md:p-8 rounded-2xl">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <h3 className="text-lg font-bold text-zinc-900">Message Sent Successfully!</h3>
              <p className="text-xs text-zinc-550">Thank you for reaching out. An administrator will review your message shortly.</p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }}
                className="mt-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-black">Submit Inquiry</h3>
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input
                  type="text" required placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-zinc-250 rounded-lg p-2.5 text-xs bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email Address</label>
                <input
                  type="email" required placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-zinc-250 rounded-lg p-2.5 text-xs bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Message Details</label>
                <textarea
                  required placeholder="Enter details of your inquiry..."
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-zinc-250 rounded-lg p-2.5 text-xs bg-white outline-none h-28"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Contact;
