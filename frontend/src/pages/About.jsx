import React from 'react';
import { ShieldCheck, Heart, Users, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-12 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-12 text-left">
        
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">About the Platform</span>
          <h1 className="text-4xl font-black text-black mt-2">ReliefNet System</h1>
          <p className="text-zinc-650 text-sm mt-2 max-w-2xl leading-relaxed">
            ReliefNet is a full-stack humanitarian aid coordination platform designed to bridge the gap between emergency crisis centers, camp operational leaders, and volunteers.
          </p>
        </div>

        {/* Mission grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <Heart className="h-5 w-5" /> Our Mission
            </h3>
            <p className="text-zinc-600 text-xs leading-relaxed">
              We empower local communities by providing standardized open-source tools to track emergency camps, manage live inventories of food, medicine, and critical supplies, and streamline deployment of approved volunteers.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Transparency
            </h3>
            <p className="text-zinc-600 text-xs leading-relaxed">
              All volunteer application assignments and donor shipments are tracked directly via our shared dashboards. Camp operational structures remain visible to coordinate and guide response efforts.
            </p>
          </div>
        </div>

        {/* Stats segment */}
        <div className="bg-white border border-zinc-250 p-6 rounded-2xl space-y-6">
          <h4 className="font-extrabold text-sm text-zinc-900 border-b border-zinc-150 pb-2">How ReliefNet Operates</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-650">
            <div className="space-y-2">
              <strong className="text-zinc-800 block uppercase tracking-wide">1. Register Camps</strong>
              <span>Admins coordinate with local entities to establish camp geolocation coordinates and deploy operational leaders.</span>
            </div>
            <div className="space-y-2">
              <strong className="text-zinc-800 block uppercase tracking-wide">2. Inventory Audits</strong>
              <span>Deployed Camp Leaders log live stock updates for food, medicine, blankets, and coordinate volunteer assignments.</span>
            </div>
            <div className="space-y-2">
              <strong className="text-zinc-800 block uppercase tracking-wide">3. Community Action</strong>
              <span>Donors submit material supplies and local citizens request assignment to deploy on active relief tasks.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
