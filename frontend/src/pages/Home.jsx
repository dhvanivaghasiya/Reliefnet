import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Activity, ShieldCheck, Heart, Users, MapPin, Building, ArrowRight, Loader2 } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({ campaigns: 0, camps: 0, activeCamps: 0 });
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, campsRes] = await Promise.all([
          API.get('campaigns/'),
          API.get('camps/')
        ]);

        const campaigns = campaignsRes.data;
        const camps = campsRes.data;

        setStats({
          campaigns: campaigns.length,
          camps: camps.length,
          activeCamps: camps.filter(c => c.status === 'ACTIVE').length
        });

        setFeaturedCampaigns(campaigns.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-12 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 border border-zinc-300 text-zinc-800">
            <Activity className="h-3.5 w-3.5" />
            Active Relief Coordination Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black leading-tight">
            Connecting Hearts, Coordinating Relief.
          </h1>
          <p className="text-zinc-650 text-base md:text-lg leading-relaxed">
            ReliefNet provides emergency response teams, campaign creators, and camp leaders with standard tools to organize, track resources, and direct donations to where they are needed most.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              to="/campaigns"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 font-bold text-white shadow-sm transition"
            >
              Explore Campaigns
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/camps"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-350 text-black shadow-xs transition"
            >
              View Camps Map
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="bg-white border border-zinc-250 rounded-2xl p-6 text-center space-y-2 shadow-xs">
            <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
              <Heart className="h-5 w-5" />
            </div>
            <span className="block text-3xl font-black text-black">{stats.campaigns}</span>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-widest">Total Campaigns</span>
          </div>

          <div className="bg-white border border-zinc-250 rounded-2xl p-6 text-center space-y-2 shadow-xs">
            <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
              <Building className="h-5 w-5" />
            </div>
            <span className="block text-3xl font-black text-black">{stats.camps}</span>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-widest">Total Relief Camps</span>
          </div>

          <div className="bg-white border border-zinc-250 rounded-2xl p-6 text-center space-y-2 shadow-xs">
            <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="block text-3xl font-black text-black">{stats.activeCamps}</span>
            <span className="text-xs font-bold text-zinc-550 uppercase tracking-widest">Active Camps</span>
          </div>
        </div>

        {/* Featured Campaigns */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="text-left">
              <h2 className="text-2xl font-black text-black">Featured Campaigns</h2>
              <p className="text-xs text-zinc-555">Support active emergency fundraising campaigns</p>
            </div>
            <Link to="/campaigns" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
            </div>
          ) : featuredCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-white border border-zinc-250 rounded-2xl">
              <p className="text-zinc-500 text-sm">No campaigns found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <div key={campaign.id} className="group bg-white border border-zinc-250 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-400 transition shadow-xs">
                  {/* Banner Image */}
                  <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                    {campaign.banner_image ? (
                      <img
                        src={campaign.banner_image}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100">
                        <Heart className="h-8 w-8 mb-2 text-zinc-300" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-550">No Banner Image</span>
                      </div>
                    )}
                    <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded border bg-white border-zinc-300 text-zinc-800 uppercase tracking-wider">
                      {campaign.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1 space-y-4 text-left">
                    {campaign.category_detail && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {campaign.category_detail.name}
                      </span>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-black group-hover:underline transition line-clamp-1">
                        {campaign.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                        {campaign.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-150 flex items-center justify-between mt-auto">
                      <span className="text-xs text-zinc-455">
                        Ends {new Date(campaign.end_date).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="text-xs font-bold text-zinc-950 hover:underline flex items-center gap-1"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
