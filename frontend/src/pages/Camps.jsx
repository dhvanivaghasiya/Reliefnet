import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import CampMap from '../components/CampMap';
import { 
  Search, 
  Filter, 
  User, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

const Camps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCamp, setSelectedCamp] = useState(null);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await API.get('camps/');
        setCamps(res.data);
      } catch (err) {
        console.error("Failed to load camps:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  const filteredCamps = camps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(search.toLowerCase()) || 
                          (camp.address && camp.address.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus ? camp.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div className="text-left">
            <h1 className="text-3xl font-black text-black">Relief Camps Directory</h1>
            <p className="text-sm text-zinc-500 mt-1">Locate active relief shelter locations and aid distribution points</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative text-left">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search camps by name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="md:col-span-4 relative text-left">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-800 outline-none transition focus:border-zinc-400 cursor-pointer"
            >
              <option value="">All Camp Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="FULL">Full</option>
            </select>
          </div>
        </div>

        {/* Map & List container */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left side: List */}
            <div className="md:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 text-left">
              <div className="text-xs font-bold text-zinc-450 uppercase tracking-widest px-1">
                Relief Camps ({filteredCamps.length})
              </div>
              
              {filteredCamps.length === 0 ? (
                <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                  <p className="text-xs text-zinc-400 font-semibold">No camps found matching selection.</p>
                </div>
              ) : (
                filteredCamps.map(camp => (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCamp(camp)}
                    className={`group p-4 rounded-xl border transition cursor-pointer ${
                      selectedCamp?.id === camp.id
                        ? 'bg-zinc-150 border-zinc-950'
                        : 'bg-white border-zinc-250 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:underline transition">
                        {camp.name}
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider shrink-0">
                        {camp.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-550 mt-2 line-clamp-2 leading-relaxed">{camp.address}</p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-150 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="h-3 w-3" />
                        Leader: {camp.leader_username || 'N/A'}
                      </span>
                      <Link
                        to={`/camps/${camp.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-extrabold text-black hover:underline flex items-center gap-0.5"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right side: Map */}
            <div className="md:col-span-8 h-[600px]">
              <CampMap camps={filteredCamps} selectedCamp={selectedCamp} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Camps;
