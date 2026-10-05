import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CampMap from '../components/CampMap';
import { 
  Heart, 
  User, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  Calendar
} from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState(null);

  // Camp Modal Form States
  const [showCampModal, setShowCampModal] = useState(false);
  const [campModalMode, setCampModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCampId, setEditingCampId] = useState(null);
  
  const [campName, setCampName] = useState('');
  const [campAddress, setCampAddress] = useState('');
  const [campLatitude, setCampLatitude] = useState('');
  const [campLongitude, setCampLongitude] = useState('');
  const [campLeader, setCampLeader] = useState('');
  const [campContact, setCampContact] = useState('');
  const [campDescription, setCampDescription] = useState('');
  const [campStatus, setCampStatus] = useState('ACTIVE');
  
  // Lists
  const [leaders, setLeaders] = useState([]);
  const [campFormError, setCampFormError] = useState('');
  const [campFormSubmitting, setCampFormSubmitting] = useState(false);

  const fetchCampaignDetails = async () => {
    try {
      const res = await API.get(`campaigns/${id}/`);
      setCampaign(res.data);
    } catch (err) {
      console.error("Failed to load campaign:", err);
      navigate('/campaigns');
    }
  };

  const fetchCamps = async () => {
    try {
      const res = await API.get(`camps/?campaign=${id}`);
      setCamps(res.data);
    } catch (err) {
      console.error("Failed to load camps:", err);
    }
  };

  const fetchLeaders = async () => {
    if (!user) return;
    try {
      const res = await API.get('users/?role=CAMP_LEADER');
      setLeaders(res.data);
    } catch (err) {
      console.error("Failed to load camp leaders:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCampaignDetails(), fetchCamps(), fetchLeaders()]);
      setLoading(false);
    };
    init();
  }, [id, user]);

  const handleOpenCreateCamp = () => {
    setCampModalMode('create');
    setEditingCampId(null);
    setCampName('');
    setCampAddress('');
    setCampLatitude('20.5937');
    setCampLongitude('78.9629');
    setCampLeader(leaders[0]?.id || '');
    setCampContact('');
    setCampDescription('');
    setCampStatus('ACTIVE');
    setCampFormError('');
    setShowCampModal(true);
  };

  const handleOpenEditCamp = (camp) => {
    setCampModalMode('edit');
    setEditingCampId(camp.id);
    setCampName(camp.name);
    setCampAddress(camp.address || '');
    setCampLatitude(camp.latitude ? String(camp.latitude) : '20.5937');
    setCampLongitude(camp.longitude ? String(camp.longitude) : '78.9629');
    setCampLeader(camp.leader || '');
    setCampContact(camp.contact_number || '');
    setCampDescription(camp.description || '');
    setCampStatus(camp.status);
    setCampFormError('');
    setShowCampModal(true);
  };

  const handleMapClick = (lat, lng) => {
    setCampLatitude(lat.toFixed(6));
    setCampLongitude(lng.toFixed(6));
  };

  const handleCampSubmit = async (e) => {
    e.preventDefault();
    if (!campName || !campAddress || !campLatitude || !campLongitude) {
      setCampFormError('Please fill out all required fields and select a location.');
      return;
    }

    setCampFormSubmitting(true);
    setCampFormError('');

    const payload = {
      campaign: parseInt(id),
      name: campName,
      address: campAddress,
      latitude: parseFloat(campLatitude),
      longitude: parseFloat(campLongitude),
      leader: campLeader ? parseInt(campLeader) : null,
      contact_number: campContact,
      description: campDescription,
      status: campStatus,
    };

    try {
      if (campModalMode === 'create') {
        await API.post('camps/', payload);
      } else {
        await API.put(`camps/${editingCampId}/`, payload);
      }
      await fetchCamps();
      setShowCampModal(false);
    } catch (err) {
      console.error(err);
      setCampFormError(err.response?.data?.detail || 'Failed to save camp. Verify parameters.');
    } finally {
      setCampFormSubmitting(false);
    }
  };

  const handleDeleteCamp = async (campId) => {
    if (window.confirm("Are you sure you want to delete this camp?")) {
      try {
        await API.delete(`camps/${campId}/`);
        setCamps(camps.filter(c => c.id !== campId));
        if (selectedCamp?.id === campId) setSelectedCamp(null);
      } catch (err) {
        console.error(err);
        alert("Failed to delete camp.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-450" />
      </div>
    );
  }

  if (!campaign) return null;

  const isAdminOrLeader = user && (user.role === 'SUPER_ADMIN' || user.role === 'CAMP_LEADER');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Back Button */}
        <div className="text-left">
          <Link to="/campaigns" className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Link>
        </div>

        {/* Campaign Banner Card */}
        <div className="grid md:grid-cols-12 gap-8 bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 items-center">
          <div className="md:col-span-5 h-64 md:h-72 w-full rounded-xl overflow-hidden bg-zinc-100 relative border border-zinc-200">
            {campaign.banner_image ? (
              <img src={campaign.banner_image} alt={campaign.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-100">
                <Heart className="h-9 w-9 mb-2 text-zinc-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">No Banner Image</span>
              </div>
            )}
            <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded border bg-white border-zinc-300 text-zinc-805 uppercase tracking-wider">
              {campaign.status}
            </span>
          </div>

          <div className="md:col-span-7 space-y-6 text-left">
            <div>
              {campaign.category_detail && (
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {campaign.category_detail.name}
                </span>
              )}
              <h1 className="text-3xl font-black text-black mt-1 leading-tight">{campaign.title}</h1>
              <p className="text-zinc-600 text-sm mt-3 leading-relaxed">{campaign.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span>Starts: {new Date(campaign.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span>Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <User className="h-4 w-4 text-zinc-400" />
                <span>Created by: <strong className="text-zinc-800">{campaign.creator_username}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Camp management / listing grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Camps list */}
          <div className="md:col-span-4 space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">Relief Camps</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Camps serving this campaign</p>
              </div>
              {isAdminOrLeader && (
                <button
                  onClick={handleOpenCreateCamp}
                  className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white transition cursor-pointer"
                  title="Add Camp"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {camps.length === 0 ? (
              <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                <p className="text-xs text-zinc-400 font-semibold">No active camps registered yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {camps.map(camp => (
                  <div
                    key={camp.id}
                    onClick={() => setSelectedCamp(camp)}
                    className={`group p-4 rounded-xl border transition cursor-pointer text-left ${
                      selectedCamp?.id === camp.id
                        ? 'bg-zinc-150 border-zinc-950'
                        : 'bg-white border-zinc-250 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:underline transition">{camp.name}</h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider shrink-0">
                        {camp.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{camp.address}</p>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-150 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="h-3 w-3" />
                        Leader: {camp.leader_username || 'N/A'}
                      </span>
                      {isAdminOrLeader && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditCamp(camp); }}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-650 hover:text-black cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCamp(camp.id); }}
                            className="p-1 rounded hover:bg-zinc-100 text-zinc-650 hover:text-red-650 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Leaflet map */}
          <div className="md:col-span-8 h-[500px] flex flex-col space-y-4">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-black">Interactive Camp Map</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Click a camp to view details or direct donations</p>
            </div>
            <CampMap camps={camps} selectedCamp={selectedCamp} />
          </div>

        </div>

        {/* Camp Create/Edit Modal */}
        {showCampModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 max-h-[90svh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h2 className="text-xl font-bold text-black text-left">
                  {campModalMode === 'create' ? 'Create New Camp' : 'Edit Camp'}
                </h2>
                <button
                  onClick={() => setShowCampModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-black transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {campFormError && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-750 p-3 rounded-xl text-left">
                  {campFormError}
                </div>
              )}

              <div className="grid md:grid-cols-12 gap-8 items-start">
                
                {/* Form fields */}
                <form onSubmit={handleCampSubmit} className="md:col-span-6 space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Camp Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="e.g. Hope Relief Station"
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={campAddress}
                      onChange={(e) => setCampAddress(e.target.value)}
                      placeholder="Street, City, State"
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={campLatitude}
                        onChange={(e) => setCampLatitude(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={campLongitude}
                        onChange={(e) => setCampLongitude(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Camp Leader
                      </label>
                      <select
                        value={campLeader}
                        onChange={(e) => setCampLeader(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="">Select Leader</option>
                        {leaders.map(l => (
                          <option key={l.id} value={l.id}>{l.username}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Status *
                      </label>
                      <select
                        value={campStatus}
                        onChange={(e) => setCampStatus(e.target.value)}
                        className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="FULL">Full</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={campContact}
                      onChange={(e) => setCampContact(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Camp Description
                    </label>
                    <textarea
                      value={campDescription}
                      onChange={(e) => setCampDescription(e.target.value)}
                      placeholder="Describe camp goals and facilities..."
                      rows={3}
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={campFormSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {campFormSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : campModalMode === 'create' ? (
                      'Create Camp'
                    ) : (
                      'Save Camp Changes'
                    )}
                  </button>
                </form>

                {/* Interactive Map Selector */}
                <div className="md:col-span-6 space-y-4">
                  <div className="text-left">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Click Map to Select Location
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Clicking anywhere on this map will set the lat/lng coordinates.</p>
                  </div>
                  <div className="h-[360px]">
                    <CampMap 
                       interactive={true} 
                       onMapClick={handleMapClick} 
                       tempLat={parseFloat(campLatitude)} 
                       tempLng={parseFloat(campLongitude)} 
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CampaignDetails;
