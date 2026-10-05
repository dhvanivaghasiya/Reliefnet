import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CampMap from '../components/CampMap';
import { 
  Layers, 
  MapPin, 
  Users, 
  Building, 
  Package, 
  Gift, 
  Search, 
  Loader2, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Check, 
  X, 
  Clipboard, 
  ArrowLeft, 
  User, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash, 
  BarChart, 
  Map, 
  FileText,
  Mail,
  Phone,
  Clock,
  Compass
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect or guard roles
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-['Inter']">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (user.role === 'SUPER_ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'CAMP_LEADER') {
    return <LeaderDashboard />;
  } else {
    return <VolunteerDashboard />;
  }
};

/* ==========================================================================
   1. SUPER ADMIN DASHBOARD
   ========================================================================== */
const AdminDashboard = () => {
  // Navigation & View Mode
  // Modes: 'overview', 'campaigns', 'volunteers', 'donations', 'analytics'
  const [activeView, setActiveView] = useState('overview');

  // Core Data States
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [globalVolunteers, setGlobalVolunteers] = useState([]);
  const [globalDonations, setGlobalDonations] = useState([]);
  const [globalCamps, setGlobalCamps] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Workflow states
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [activeCamp, setActiveCamp] = useState(null);

  // Forms Visibility
  // Forms Visibility
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateCamp, setShowCreateCamp] = useState(false);
  const [showAssignLeader, setShowAssignLeader] = useState(false);

  // Created Leader credentials display box
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Approved Leaders List & Selection
  const [approvedLeaders, setApprovedLeaders] = useState([]);
  const [selectedExistingLeaderId, setSelectedExistingLeaderId] = useState('');
  const [assignLeaderMode, setAssignLeaderMode] = useState('existing'); // 'existing' | 'new'

  // Forms Fields
  const [newCampaignData, setNewCampaignData] = useState({
    title: '',
    description: '',
    banner: '',
    category: '',
    custom_category: '',
    status: 'ACTIVE',
    start_date: '',
    end_date: ''
  });

  const [newCampData, setNewCampData] = useState({
    name: '',
    address: '',
    contact_number: '',
    latitude: '',
    longitude: '',
    description: '',
    status: 'ACTIVE'
  });

  const [newLeaderData, setNewLeaderData] = useState({
    full_name: '',
    age: '',
    email: '',
    phone: '',
    gov_id: '',
    address: ''
  });

  // Load Admin Data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, campsRes, campaignsRes, catsRes, volRes, donRes, leadersRes] = await Promise.all([
        API.get('dashboard/stats/'),
        API.get('camps/'),
        API.get('campaigns/'),
        API.get('categories/'),
        API.get('volunteers/'),
        API.get('donations/'),
        API.get('leaders/?status=APPROVED')
      ]);
      setStats(statsRes.data);
      setGlobalCamps(campsRes.data);
      setCampaigns(campaignsRes.data);
      setCategories(catsRes.data);
      setGlobalVolunteers(volRes.data);
      setGlobalDonations(donRes.data);
      setApprovedLeaders(leadersRes.data);
    } catch (err) {
      console.error("Failed to load operations data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const delay = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await API.get(`search/?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 450);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Campaign Detail Open
  const handleOpenCampaign = async (campaign) => {
    setActiveCampaign(campaign);
    setActiveCamp(null);
    setShowCreateCamp(false);
    setShowCreateCampaign(false);
    // Reload camps to get updated lists
    try {
      const campsRes = await API.get('camps/');
      setGlobalCamps(campsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Camp Detail Open
  const handleOpenCamp = (camp) => {
    setActiveCamp(camp);
    setShowAssignLeader(false);
    setCreatedCredentials(null);
  };

  // Submit Create Campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      let categoryId = newCampaignData.category;
      if (categoryId === 'OTHERS') {
        if (!newCampaignData.custom_category || !newCampaignData.custom_category.trim()) {
          alert("Please enter a custom category name.");
          return;
        }
        // Check if category already exists (case-insensitive)
        const catRes = await API.get('categories/');
        const existingCat = catRes.data.find(
          c => c.name.toLowerCase() === newCampaignData.custom_category.trim().toLowerCase()
        );
        if (existingCat) {
          categoryId = existingCat.id;
        } else {
          const newCatRes = await API.post('categories/', { name: newCampaignData.custom_category.trim() });
          categoryId = newCatRes.data.id;
        }
      }

      const payload = {
        title: newCampaignData.title,
        description: newCampaignData.description,
        category: categoryId ? parseInt(categoryId) : null,
        status: newCampaignData.status,
        target_amount: 0,
        raised_amount: 0,
        start_date: newCampaignData.start_date ? `${newCampaignData.start_date}T00:00:00Z` : null,
        end_date: newCampaignData.end_date ? `${newCampaignData.end_date}T23:59:59Z` : null
      };
      if (newCampaignData.banner) {
        payload.banner_image = newCampaignData.banner;
      }

      const res = await API.post('campaigns/', payload);
      alert('Campaign created successfully!');
      setShowCreateCampaign(false);
      setNewCampaignData({
        title: '',
        description: '',
        banner: '',
        category: '',
        custom_category: '',
        status: 'ACTIVE',
        start_date: '',
        end_date: ''
      });
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to create campaign. Check parameters.'));
    }
  };

  // Submit Create Camp
  const handleCreateCamp = async (e) => {
    e.preventDefault();
    if (!activeCampaign) return;
    const payload = {
      ...newCampData,
      campaign: activeCampaign.id
    };
    try {
      const res = await API.post('camps/', payload);
      alert('Camp created successfully!');
      setShowCreateCamp(false);
      setNewCampData({
        name: '',
        address: '',
        contact_number: '',
        latitude: '',
        longitude: '',
        description: '',
        status: 'ACTIVE'
      });
      // Refresh
      const campsRes = await API.get('camps/');
      setGlobalCamps(campsRes.data);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to create camp.'));
    }
  };

  // Submit Assign Leader (Autocreates Account)
  const handleAssignLeader = async (e) => {
    e.preventDefault();
    if (!activeCamp) return;
    try {
      const res = await API.post(`camps/${activeCamp.id}/assign-leader/`, newLeaderData);
      setCreatedCredentials(res.data);
      setNewLeaderData({
        full_name: '',
        age: '',
        email: '',
        phone: '',
        gov_id: '',
        address: ''
      });
      // Refresh current active camp details
      const campsRes = await API.get('camps/');
      setGlobalCamps(campsRes.data);
      const updatedCamp = campsRes.data.find(c => c.id === activeCamp.id);
      if (updatedCamp) {
        setActiveCamp(updatedCamp);
      }
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to assign leader.'));
    }
  };

  // Submit Assign Existing Approved Leader
  const handleAssignExistingLeader = async (e) => {
    e.preventDefault();
    if (!activeCamp) return;
    if (!selectedExistingLeaderId) {
      alert('Please select a leader before submitting.');
      return;
    }
    // Look up the actual user ID from the approvedLeaders list using the CampLeader ID
    const selectedLeader = approvedLeaders.find(l => String(l.id) === String(selectedExistingLeaderId));
    if (!selectedLeader || !selectedLeader.user) {
      alert('Selected leader does not have a valid user account. Please choose another leader or create a new one.');
      return;
    }
    try {
      await API.patch(`camps/${activeCamp.id}/`, { leader: selectedLeader.user });
      alert('Leader assigned successfully!');
      // Refresh camp details
      const campsRes = await API.get('camps/');
      setGlobalCamps(campsRes.data);
      const updatedCamp = campsRes.data.find(c => c.id === activeCamp.id);
      if (updatedCamp) {
        setActiveCamp(updatedCamp);
      }
      setShowAssignLeader(false);
      setSelectedExistingLeaderId('');
      // Refresh approved leaders list to reflect status updates
      const leadersRes = await API.get('leaders/?status=APPROVED');
      setApprovedLeaders(leadersRes.data);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to assign leader.'));
    }
  };

  // Remove Leader from Camp
  const handleRemoveLeader = async (campId) => {
    if (!window.confirm("Are you sure you want to remove the leader from this camp?")) {
      return;
    }
    try {
      await API.patch(`camps/${campId}/`, { leader: null });
      alert('Leader removed from camp successfully!');
      // Refresh camp details
      const campsRes = await API.get('camps/');
      setGlobalCamps(campsRes.data);
      if (activeCamp && activeCamp.id === campId) {
        const updatedCamp = campsRes.data.find(c => c.id === campId);
        setActiveCamp(updatedCamp || null);
      }
      // Refresh approved leaders list to reflect status updates
      const leadersRes = await API.get('leaders/?status=APPROVED');
      setApprovedLeaders(leadersRes.data);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to remove leader.'));
    }
  };

  // Approve/Reject Volunteer
  const handleVolunteerStatus = async (id, status, campId = null) => {
    try {
      const payload = { status };
      if (campId === 'unassign') {
        payload.assigned_camp = null;
        payload.status = 'APPROVED';
      } else if (campId) {
        payload.assigned_camp = parseInt(campId);
      }
      await API.patch(`volunteers/${id}/`, payload);
      alert(campId === 'unassign' ? 'Volunteer unassigned successfully.' : `Volunteer updated successfully.`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update volunteer status.');
    }
  };

  // Approve/Reject Donation
  const handleDonationStatus = async (id, status) => {
    try {
      await API.patch(`donations/${id}/`, { status });
      alert(`Donation status updated to ${status}.`);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update donation status.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const { cards = {}, analytics = {} } = stats || {};
  const activeCampaignCamps = globalCamps.filter(c => c.campaign === activeCampaign?.id);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* TOP LEVEL NAVIGATION HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-zinc-800" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Super Admin Workspace</span>
            </div>
            <h1 className="text-3xl font-black text-black mt-1">Command Control Center</h1>
          </div>

          {/* Quick Tab Select */}
          <div className="flex border border-zinc-300 rounded-xl bg-white p-1 overflow-x-auto shrink-0">
            <button
              onClick={() => { setActiveView('overview'); setActiveCampaign(null); setActiveCamp(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeView === 'overview' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Overview
            </button>
            <button
              onClick={() => { setActiveView('campaigns'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeView === 'campaigns' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Campaigns & Camps
            </button>
            <button
              onClick={() => { setActiveView('volunteers'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeView === 'volunteers' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Volunteers
            </button>
            <button
              onClick={() => { setActiveView('donations'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeView === 'donations' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Donations
            </button>
            <button
              onClick={() => { setActiveView('analytics'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeView === 'analytics' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* ==================== VIEW 1: OVERVIEW ==================== */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Quick stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-left">
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <Layers className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Campaigns</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.campaigns}</h3>
              </div>
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <MapPin className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Camps</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.camps}</h3>
              </div>
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <Users className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Volunteers</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.volunteers}</h3>
              </div>
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <Building className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Leaders</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.leaders}</h3>
              </div>
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <Package className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Inventory</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.inventory}</h3>
              </div>
              <div className="bg-white border border-zinc-250 p-5 rounded-xl shadow-xs">
                <Gift className="h-5 w-5 text-zinc-700 mb-3" />
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Donations</span>
                <h3 className="text-3xl font-black text-black mt-1">{cards.donations}</h3>
              </div>
            </div>

            {/* Campaign Quick Launch Center */}
            <div className="grid md:grid-cols-3 gap-8 items-start text-left">
              <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black uppercase tracking-wider">Active Campaigns</h3>
                  <button 
                    onClick={() => { setActiveView('campaigns'); setShowCreateCampaign(true); }}
                    className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 px-3 rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Campaign
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {campaigns.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => { setActiveView('campaigns'); handleOpenCampaign(c); }}
                      className="bg-white border border-zinc-250 p-5 rounded-xl hover:border-zinc-450 transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase border border-zinc-250 px-2 py-0.5 rounded-full bg-zinc-50 inline-block mb-3">{c.category_name || 'General'}</span>
                        <h4 className="font-bold text-base text-zinc-900 group-hover:underline">{c.title}</h4>
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-4 text-[11px] text-zinc-400">
                        <span>Status: <strong className="text-zinc-800 uppercase">{c.status}</strong></span>
                        <span className="flex items-center gap-1 text-black font-bold">Open Workspace <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Action Center */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-black uppercase tracking-wider">Action Requests</h3>
                <div className="bg-white border border-zinc-250 rounded-xl p-5 space-y-4">
                  
                  {/* Volunteers Pending count */}
                  <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                    <div>
                      <h5 className="text-xs font-bold text-zinc-800">Pending Volunteers</h5>
                      <p className="text-[11px] text-zinc-400">Awaiting deployment review</p>
                    </div>
                    <span className="bg-zinc-100 border border-zinc-250 text-zinc-900 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                      {globalVolunteers.filter(v => v.status === 'PENDING').length}
                    </span>
                  </div>

                  {/* Donations Pending count */}
                  <div className="flex justify-between items-center pb-1">
                    <div>
                      <h5 className="text-xs font-bold text-zinc-800">Pending Donations</h5>
                      <p className="text-[11px] text-zinc-450">Material offers pending accept</p>
                    </div>
                    <span className="bg-zinc-100 border border-zinc-250 text-zinc-900 px-2.5 py-1 rounded-lg text-xs font-extrabold">
                      {globalDonations.filter(d => d.status === 'PENDING').length}
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveView('volunteers')}
                      className="w-full text-center bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer transition"
                    >
                      Go to Approvals
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: CAMPAIGNS & CAMPS (CONNECTED WORKFLOW) ==================== */}
        {activeView === 'campaigns' && (
          <div className="grid md:grid-cols-12 gap-8 text-left items-start">
            
            {/* LEFT COLUMN: Campaign Listing / Create Form */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                <h3 className="text-base font-bold text-black uppercase tracking-wider">Campaign Hub</h3>
                <button
                  onClick={() => { setShowCreateCampaign(!showCreateCampaign); setActiveCampaign(null); }}
                  className="inline-flex items-center gap-1 text-zinc-950 border border-zinc-350 hover:bg-zinc-50 py-1.5 px-2.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {showCreateCampaign ? 'Close' : 'Create Campaign'}
                </button>
              </div>

              {showCreateCampaign ? (
                <form onSubmit={handleCreateCampaign} className="bg-white border border-zinc-250 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-black uppercase tracking-wider mb-2">Create New Campaign</h4>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Campaign Title</label>
                    <input
                      type="text" required placeholder="Gujarat Earthquake Relief"
                      value={newCampaignData.title}
                      onChange={(e) => setNewCampaignData({...newCampaignData, title: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                    <textarea
                      required placeholder="Provide details about campaign mission..."
                      value={newCampaignData.description}
                      onChange={(e) => setNewCampaignData({...newCampaignData, description: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Banner Image URL</label>
                    <input
                      type="text" placeholder="https://image-source.com/earthquake.jpg"
                      value={newCampaignData.banner}
                      onChange={(e) => setNewCampaignData({...newCampaignData, banner: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Category</label>
                      <select
                        required
                        value={newCampaignData.category}
                        onChange={(e) => setNewCampaignData({...newCampaignData, category: e.target.value})}
                        className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none bg-white cursor-pointer"
                      >
                        <option value="">Select</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        <option value="OTHERS">Others (Write Custom Category)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</label>
                      <select
                        required
                        value={newCampaignData.status}
                        onChange={(e) => setNewCampaignData({...newCampaignData, status: e.target.value})}
                        className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none bg-white cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                  {newCampaignData.category === 'OTHERS' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Custom Category Name</label>
                      <input
                        type="text" required placeholder="e.g. Winter Warmth, Flood Relief"
                        value={newCampaignData.custom_category || ''}
                        onChange={(e) => setNewCampaignData({...newCampaignData, custom_category: e.target.value})}
                        className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Start Date</label>
                      <input
                        type="date" required
                        value={newCampaignData.start_date}
                        onChange={(e) => setNewCampaignData({...newCampaignData, start_date: e.target.value})}
                        className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">End Date</label>
                      <input
                        type="date" required
                        value={newCampaignData.end_date}
                        onChange={(e) => setNewCampaignData({...newCampaignData, end_date: e.target.value})}
                        className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    Save Campaign
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleOpenCampaign(c)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${activeCampaign?.id === c.id ? 'bg-zinc-150 border-zinc-950' : 'bg-white border-zinc-250 hover:border-zinc-400'}`}
                    >
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 px-1.5 py-0.5 rounded-full bg-zinc-50 inline-block mb-2">{c.category_name}</span>
                      <h4 className="font-bold text-sm text-zinc-900">{c.title}</h4>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-3 pt-2.5 border-t border-zinc-100">
                        <span>Camps: {globalCamps.filter(cmp => cmp.campaign === c.id).length}</span>
                        <span className="font-bold text-zinc-850 uppercase">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Interactive Workspaces */}
            <div className="md:col-span-8">
              {!activeCampaign ? (
                <div className="bg-white border border-zinc-250 rounded-xl p-10 text-center text-zinc-400 min-h-[400px] flex flex-col items-center justify-center">
                  <Layers className="h-10 w-10 text-zinc-300 mb-2" />
                  <h4 className="font-bold text-zinc-700 text-sm">Select a Campaign</h4>
                  <p className="text-xs max-w-sm mt-1">Please select an active campaign workspace from the left list to manage relief camps, leader deployments, and live inventories.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Campaign Workspace Header */}
                  <div className="bg-white border border-zinc-250 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-zinc-100 border border-zinc-300 text-zinc-900 px-2 py-0.5 rounded-lg">{activeCampaign.category_name}</span>
                        <h2 className="text-2xl font-black text-black mt-2">{activeCampaign.title}</h2>
                        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">{activeCampaign.description}</p>
                      </div>

                      <button
                        onClick={() => { setShowCreateCamp(!showCreateCamp); setActiveCamp(null); }}
                        className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl shrink-0 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Camp
                      </button>
                    </div>
                  </div>

                  {/* ADD CAMP WORKFLOW & MAP INTERACTION */}
                  {showCreateCamp && (
                    <div className="bg-white border border-zinc-250 rounded-xl p-6 space-y-6">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-black">New Camp Details</h3>
                        <button onClick={() => setShowCreateCamp(false)} className="text-zinc-400 hover:text-black"><X className="h-4.5 w-4.5" /></button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Map Picker Column */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Pick Location on Map</label>
                          <div className="h-[280px] w-full rounded-xl overflow-hidden border border-zinc-300">
                            <CampMap
                              camps={[]}
                              interactive={true}
                              onMapClick={(lat, lng) => {
                                setNewCampData({
                                  ...newCampData,
                                  latitude: lat.toFixed(6),
                                  longitude: lng.toFixed(6)
                                });
                              }}
                              tempLat={newCampData.latitude ? parseFloat(newCampData.latitude) : null}
                              tempLng={newCampData.longitude ? parseFloat(newCampData.longitude) : null}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400 italic block mt-1">Click anywhere on the map to autofill latitude and longitude coordinates.</span>
                        </div>

                        {/* Fields Column */}
                        <form onSubmit={handleCreateCamp} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Camp Name</label>
                            <input
                              type="text" required placeholder="Ahmedabad Relief Camp"
                              value={newCampData.name}
                              onChange={(e) => setNewCampData({...newCampData, name: e.target.value})}
                              className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Address</label>
                            <input
                              type="text" required placeholder="Satellite Road, Ahmedabad"
                              value={newCampData.address}
                              onChange={(e) => setNewCampData({...newCampData, address: e.target.value})}
                              className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Latitude</label>
                              <input
                                type="text" required placeholder="23.0225"
                                value={newCampData.latitude}
                                onChange={(e) => setNewCampData({...newCampData, latitude: e.target.value})}
                                className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Longitude</label>
                              <input
                                type="text" required placeholder="72.5714"
                                value={newCampData.longitude}
                                onChange={(e) => setNewCampData({...newCampData, longitude: e.target.value})}
                                className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Contact Phone</label>
                              <input
                                type="text" required placeholder="9999988888"
                                value={newCampData.contact_number}
                                onChange={(e) => setNewCampData({...newCampData, contact_number: e.target.value})}
                                className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Status</label>
                              <select
                                required
                                value={newCampData.status}
                                onChange={(e) => setNewCampData({...newCampData, status: e.target.value})}
                                className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none bg-white cursor-pointer"
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="FULL">FULL</option>
                                <option value="INACTIVE">INACTIVE</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                            <textarea
                              required placeholder="Brief summary of camp facilities..."
                              value={newCampData.description}
                              onChange={(e) => setNewCampData({...newCampData, description: e.target.value})}
                              className="w-full border border-zinc-250 rounded-lg p-2 text-xs outline-none focus:border-zinc-400 bg-white h-16"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer"
                          >
                            Save Camp Location
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* CAMPS LIST & DETAILS SECTION */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">Active Relief Camps ({activeCampaignCamps.length})</h3>
                    {activeCampaignCamps.length === 0 ? (
                      <div className="bg-white border border-zinc-200 rounded-xl py-12 text-center text-zinc-400 text-xs">
                        No camp locations registered for this campaign yet.
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {activeCampaignCamps.map(camp => (
                          <div
                            key={camp.id}
                            onClick={() => handleOpenCamp(camp)}
                            className={`p-5 rounded-xl border text-left cursor-pointer transition ${activeCamp?.id === camp.id ? 'bg-zinc-150 border-zinc-950' : 'bg-white border-zinc-250 hover:border-zinc-400'}`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm text-zinc-900">{camp.name}</h4>
                              <span className="text-[9px] font-extrabold border bg-white border-zinc-300 text-zinc-800 px-1.5 py-0.5 rounded uppercase tracking-wider">{camp.status}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {camp.address}</p>
                            
                            {/* Leader status snippet */}
                            <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center text-[10px]">
                              <span className="text-zinc-500">Leader Assigned:</span>
                              <strong className="text-zinc-800">
                                {camp.leader_full_name 
                                  ? `${camp.leader_full_name} (@${camp.leader_username})` 
                                  : camp.leader_username 
                                    ? `@${camp.leader_username}` 
                                    : '❌ Unassigned'}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CAMP CONTROL HUB (SELECTED CAMP OPERATIONS) */}
                  {activeCamp && (
                    <div className="bg-white border border-zinc-250 rounded-xl p-6 space-y-6">
                      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Selected Location Control</span>
                          <h3 className="text-lg font-black text-black">{activeCamp.name}</h3>
                        </div>
                        <button onClick={() => setActiveCamp(null)} className="text-zinc-400 hover:text-black"><X className="h-4.5 w-4.5" /></button>
                      </div>

                      {/* LEADER ASSIGNMENT AND AUTO-CREDENTIALS DISPLAY */}
                      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-650 flex items-center gap-1.5">
                            <User className="h-4 w-4" /> Camp Leader Account
                          </h4>
                          <button
                            onClick={() => { setShowAssignLeader(!showAssignLeader); setCreatedCredentials(null); }}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
                          >
                            {showAssignLeader ? 'Cancel' : activeCamp.leader ? 'Change Leader' : 'Assign Leader'}
                          </button>
                        </div>

                        {activeCamp.leader ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-zinc-400 block mb-0.5">Leader Profile:</span>
                                <strong className="text-zinc-800 text-sm">
                                  {activeCamp.leader_full_name || activeCamp.leader_username}
                                </strong>
                                {activeCamp.leader_full_name && activeCamp.leader_username && (
                                  <span className="text-zinc-400 text-[10px] block">@{activeCamp.leader_username}</span>
                                )}
                              </div>
                              <div>
                                <span className="text-zinc-400 block mb-0.5">Phone:</span>
                                <strong className="text-zinc-800">{activeCamp.contact_number || 'N/A'}</strong>
                              </div>
                            </div>
                            {!showAssignLeader && (
                              <div className="pt-2 border-t border-zinc-200 flex gap-2">
                                <button
                                  onClick={() => handleRemoveLeader(activeCamp.id)}
                                  className="bg-white border border-red-200 text-red-650 hover:bg-red-50 text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition"
                                >
                                  Remove Leader
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          !showAssignLeader && (
                            <div className="text-xs text-zinc-500 py-2">
                              No leader assigned. Deploy a leader to automate inventory tracking and approval requests.
                            </div>
                          )
                        )}                        {/* Leader Registration Form */}
                        {showAssignLeader && !createdCredentials && (
                          <div className="space-y-4 pt-3 border-t border-zinc-200 text-left">
                            {/* Mode toggle */}
                            <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg max-w-xs mb-3">
                              <button
                                type="button"
                                onClick={() => setAssignLeaderMode('existing')}
                                className={`flex-1 py-1.5 px-2.5 text-[10px] font-bold rounded-md transition cursor-pointer ${assignLeaderMode === 'existing' ? 'bg-white text-black shadow-xs' : 'text-zinc-550 hover:text-zinc-700'}`}
                              >
                                Existing Approved
                              </button>
                              <button
                                type="button"
                                onClick={() => setAssignLeaderMode('new')}
                                className={`flex-1 py-1.5 px-2.5 text-[10px] font-bold rounded-md transition cursor-pointer ${assignLeaderMode === 'new' ? 'bg-white text-black shadow-xs' : 'text-zinc-555 hover:text-zinc-700'}`}
                              >
                                Create New
                              </button>
                            </div>

                            {assignLeaderMode === 'existing' ? (
                              <form onSubmit={handleAssignExistingLeader} className="space-y-4">
                                <span className="text-xs font-bold text-zinc-800 block">Select Approved Leader</span>
                                <div className="space-y-2">
                                  <select
                                    required
                                    value={selectedExistingLeaderId}
                                    onChange={(e) => setSelectedExistingLeaderId(e.target.value)}
                                    className="w-full border border-zinc-250 rounded-lg p-2.5 text-xs bg-white outline-none cursor-pointer"
                                  >
                                    <option value="">Select an Approved Leader</option>
                                    {approvedLeaders.map(leader => {
                                      const assignedCamp = globalCamps.find(c => c.leader === leader.user);
                                      const assignmentSuffix = assignedCamp ? ` (Currently: ${assignedCamp.name})` : '';
                                      return (
                                        <option key={leader.id} value={leader.id}>
                                          {leader.full_name}{leader.username ? ` (@${leader.username})` : ''}{assignmentSuffix}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                                <button
                                  type="submit"
                                  disabled={!selectedExistingLeaderId}
                                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50 transition"
                                >
                                  Assign Selected Leader
                                </button>
                              </form>
                            ) : (
                              <form onSubmit={handleAssignLeader} className="space-y-4">
                                <span className="text-xs font-bold text-zinc-800 block">Deploy New Leader Profile</span>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                                    <input
                                      type="text" required placeholder="John Doe"
                                      value={newLeaderData.full_name}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, full_name: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Age</label>
                                    <input
                                      type="number" required placeholder="32"
                                      value={newLeaderData.age}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, age: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Email</label>
                                    <input
                                      type="email" required placeholder="john@reliefnet.com"
                                      value={newLeaderData.email}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, email: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Phone</label>
                                    <input
                                      type="text" required placeholder="9999900000"
                                      value={newLeaderData.phone}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, phone: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Government ID</label>
                                    <input
                                      type="text" required placeholder="Aadhar / SSN"
                                      value={newLeaderData.gov_id}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, gov_id: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Address</label>
                                    <input
                                      type="text" required placeholder="123 Street, City"
                                      value={newLeaderData.address}
                                      onChange={(e) => setNewLeaderData({...newLeaderData, address: e.target.value})}
                                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                                >
                                  Create Leader & Auto-Generate Credentials
                                </button>
                              </form>
                            )}
                          </div>
                        )}

                        {/* SUCCESSBOX: GENERATED LEADER CREDENTIALS */}
                        {createdCredentials && (
                          <div className="border-2 border-dashed border-zinc-950 bg-white p-5 rounded-xl space-y-4">
                            <div className="flex items-center gap-1.5 text-zinc-900">
                              <ShieldCheck className="h-5 w-5" />
                              <h5 className="font-extrabold text-sm">Leader Account Created Successfully!</h5>
                            </div>
                            <p className="text-xs text-zinc-500">Provide these temporary credentials to the leader. They will be forced to change the password on their first login.</p>
                            
                            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-2 text-xs text-left">
                              <div className="flex justify-between items-center">
                                <span>Username:</span>
                                <strong className="font-mono text-zinc-900">{createdCredentials.username}</strong>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Temporary Password:</span>
                                <strong className="font-mono text-zinc-900">{createdCredentials.password}</strong>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyToClipboard(`Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`)}
                              className="w-full inline-flex items-center justify-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                            >
                              <Clipboard className="h-4 w-4" />
                              Copy Credentials
                            </button>
                          </div>
                        )}
                      </div>

                      {/* CAMP INVENTORY DETAILS TABLE */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-650">Current Camp Inventory</h4>
                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-zinc-50 border-b border-zinc-200 font-bold uppercase tracking-wider text-zinc-500">
                              <tr>
                                <th className="p-3">Category</th>
                                <th className="p-3">Product Name</th>
                                <th className="p-3">Quantity</th>
                                <th className="p-3">Unit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                              {activeCamp.inventory && activeCamp.inventory.length > 0 ? (
                                activeCamp.inventory.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50">
                                    <td className="p-3 font-semibold text-zinc-800">{item.category_name}</td>
                                    <td className="p-3 font-semibold text-zinc-900">{item.product_name}</td>
                                    <td className="p-3 text-zinc-650">{item.quantity}</td>
                                    <td className="p-3 text-zinc-650">{item.unit}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="4" className="p-4 text-center text-zinc-400 italic">No inventory products registered.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== VIEW 3: GLOBAL VOLUNTEERS APPROVAL & DEPLOYMENT ==================== */}
        {activeView === 'volunteers' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider">Volunteer Deployment center</h3>
              <p className="text-xs text-zinc-550 mt-1">Verify general applications and deploy volunteers to active relief camp stations.</p>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Age</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Skills</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Assigned Camp</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {globalVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-zinc-400 italic">No volunteer registrations found.</td>
                    </tr>
                  ) : (
                    globalVolunteers.map(v => (
                      <tr key={v.id} className="hover:bg-zinc-50">
                        <td className="p-3.5 font-bold text-zinc-900">{v.full_name}</td>
                        <td className="p-3.5 text-zinc-650">{v.age}</td>
                        <td className="p-3.5 text-zinc-650">{v.current_city}</td>
                        <td className="p-3.5 text-zinc-650 italic max-w-[200px] truncate">{v.skills || 'N/A'}</td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            v.status === 'PENDING' ? 'bg-zinc-50 text-zinc-500 border-zinc-250' : 
                            v.status === 'APPROVED' ? 'bg-zinc-100 text-zinc-800 border-zinc-300' :
                            v.status === 'ASSIGNED' ? 'bg-zinc-150 text-zinc-900 border-zinc-400' :
                            'bg-red-50 text-red-750 border-red-200'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-zinc-800">{v.assigned_camp_name || 'Unassigned'}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            {v.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleVolunteerStatus(v.id, 'APPROVED')}
                                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVolunteerStatus(v.id, 'REJECTED')}
                                  className="bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {(v.status === 'APPROVED' || v.status === 'ASSIGNED') && (
                              <div className="flex gap-1.5 items-center">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value === 'unassign') {
                                      handleVolunteerStatus(v.id, 'APPROVED', 'unassign');
                                    } else if (e.target.value) {
                                      handleVolunteerStatus(v.id, 'ASSIGNED', e.target.value);
                                    }
                                  }}
                                  value=""
                                  className="border border-zinc-250 bg-white p-1 rounded text-[10px] outline-none max-w-[120px] cursor-pointer"
                                >
                                  <option value="" disabled>Deploy to...</option>
                                  {globalCamps.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                  {v.status === 'ASSIGNED' && (
                                    <option value="unassign" className="text-red-650 font-bold">Unassign / Recall</option>
                                  )}
                                </select>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== VIEW 4: GLOBAL DONATIONS ==================== */}
        {activeView === 'donations' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider">Donations Approval Center</h3>
              <p className="text-xs text-zinc-550 mt-1">Review material offers registered by the community and verify delivery tracking.</p>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Donor</th>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Target Camp</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {globalDonations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-zinc-400 italic">No donations registered.</td>
                    </tr>
                  ) : (
                    globalDonations.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-50">
                        <td className="p-3.5">
                          <strong className="text-zinc-900 block">{d.full_name}</strong>
                          <span className="text-[10px] text-zinc-400">{d.phone}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-zinc-800">{d.product_name || d.other_item}</td>
                        <td className="p-3.5 text-zinc-700">{d.quantity} {d.unit}</td>
                        <td className="p-3.5 font-bold text-zinc-800">{d.camp_name || 'N/A'}</td>
                        <td className="p-3.5 text-zinc-600 font-mono text-[10px]">{d.delivery_method}</td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            d.status === 'PENDING' ? 'bg-zinc-50 text-zinc-500 border-zinc-250' : 
                            d.status === 'ACCEPTED' ? 'bg-zinc-100 text-zinc-800 border-zinc-300' :
                            'bg-zinc-155 text-zinc-900 border-zinc-450'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {d.status === 'PENDING' && (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleDonationStatus(d.id, 'ACCEPTED')}
                                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDonationStatus(d.id, 'REJECTED')}
                                className="bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {d.status === 'ACCEPTED' && (
                            <button
                              onClick={() => handleDonationStatus(d.id, 'COMPLETED')}
                              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== VIEW 5: ANALYTICS ==================== */}
        {activeView === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Chart 1: Volunteers by Campaign */}
            <div className="bg-white border border-zinc-250 rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-4">
                <TrendingUp className="h-5 w-5 text-black" />
                <h3 className="text-base font-bold text-black uppercase tracking-wider">Volunteers by Campaign</h3>
              </div>
              <div className="space-y-4">
                {analytics.volunteers_by_campaign?.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-10">No campaign records.</p>
                ) : (
                  analytics.volunteers_by_campaign.map((item, idx) => {
                    const maxVal = Math.max(...analytics.volunteers_by_campaign.map(x => x.count), 1);
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700">
                          <span>{item.campaign_title}</span>
                          <span>{item.count} Vol.</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                          <div className="h-full bg-zinc-950 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chart 2: Donations by Campaign */}
            <div className="bg-white border border-zinc-250 rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-4">
                <Gift className="h-5 w-5 text-black" />
                <h3 className="text-base font-bold text-black uppercase tracking-wider">Material Donations by Campaign</h3>
              </div>
              <div className="space-y-4">
                {analytics.donations_by_campaign?.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-10">No donation records.</p>
                ) : (
                  analytics.donations_by_campaign.map((item, idx) => {
                    const maxVal = Math.max(...analytics.donations_by_campaign.map(x => x.count), 1);
                    const pct = (item.count / maxVal) * 100;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700">
                          <span>{item.campaign_title}</span>
                          <span>{item.count} offers</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                          <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ==========================================================================
   2. CAMP LEADER DASHBOARD
   ========================================================================== */
const LeaderDashboard = () => {
  const { user } = useAuth();

  // Navigation: 'overview', 'inventory', 'volunteers', 'donations', 'profile'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [camp, setCamp] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);

  // Loadings
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Modals
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Add Product State
  const [newProductData, setNewProductData] = useState({
    category: '',
    product_name: '',
    quantity: '',
    unit: 'Kg'
  });

  // Edit Product State
  const [editProductQty, setEditProductQty] = useState('');
  const [editProductUnit, setEditProductUnit] = useState('');

  // Load Leader Profile & Camp details
  const fetchLeaderDashboardData = async () => {
    try {
      // Find the camp lead by this user
      const campRes = await API.get(`camps/?leader=${user.id}`);
      if (campRes.data && campRes.data.length > 0) {
        const myCamp = campRes.data[0];
        setCamp(myCamp);

        // Fetch Inventory, Volunteers, and Donations
        const [invRes, volRes, donRes, catsRes] = await Promise.all([
          API.get(`inventory/?camp=${myCamp.id}`),
          API.get('volunteers/'),
          API.get(`donations/?camp=${myCamp.id}`),
          API.get('categories/')
        ]);
        setInventory(invRes.data);
        setVolunteers(volRes.data);
        setDonations(donRes.data);
        setCategories(catsRes.data);
      }
    } catch (err) {
      console.error("Failed to load leader workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderDashboardData();
  }, [user]);

  // Submit Add Inventory Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!camp) return;
    const payload = {
      camp: camp.id,
      category: parseInt(newProductData.category),
      product_name: newProductData.product_name,
      quantity: parseFloat(newProductData.quantity),
      unit: newProductData.unit
    };
    try {
      setActionLoading(true);
      await API.post('inventory/', payload);
      alert('Product added successfully!');
      setShowAddProduct(false);
      setNewProductData({ category: '', product_name: '', quantity: '', unit: 'Kg' });
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err.response?.data || 'Failed to add product.'));
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit Inventory Product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setActionLoading(true);
      await API.patch(`inventory/${editingItem.id}/`, {
        quantity: parseFloat(editProductQty),
        unit: editProductUnit
      });
      alert('Inventory updated successfully!');
      setEditingItem(null);
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update inventory item.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Delete Inventory Product
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product from inventory?')) return;
    try {
      await API.delete(`inventory/${id}/`);
      alert('Item deleted.');
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item.');
    }
  };

  // Claim/Accept volunteer to this camp
  const handleAcceptVolunteer = async (id) => {
    if (!camp) return;
    try {
      await API.patch(`volunteers/${id}/`, {
        status: 'ASSIGNED',
        assigned_camp: camp.id
      });
      alert('Volunteer accepted and assigned to your camp!');
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to accept volunteer.');
    }
  };

  // Reject volunteer application
  const handleRejectVolunteer = async (id) => {
    try {
      await API.patch(`volunteers/${id}/`, { status: 'REJECTED' });
      alert('Volunteer rejected.');
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to reject volunteer.');
    }
  };

  // Accept Donation
  const handleDonationStatus = async (id, status) => {
    try {
      await API.patch(`donations/${id}/`, { status });
      alert(`Donation status updated to ${status}.`);
      await fetchLeaderDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to update donation.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center font-['Inter']">
        <div className="max-w-md bg-white border border-zinc-250 rounded-2xl p-8 space-y-4">
          <Activity className="h-10 w-10 text-zinc-400 mx-auto" />
          <h2 className="text-xl font-bold text-zinc-800">Awaiting Camp Deployment</h2>
          <p className="text-xs text-zinc-500">Your account is active, but you have not been assigned to lead any active relief camps yet. Please contact the administrator to deploy you.</p>
        </div>
      </div>
    );
  }

  // Filter volunteer list for assigned ones, and pending applications that are unassigned
  const myAssignedVolunteers = volunteers.filter(v => v.assigned_camp === camp.id && v.status === 'ASSIGNED');
  const globalPendingVolunteers = volunteers.filter(v => v.status === 'PENDING');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER WORKSPACE INFO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-6 text-left">
          <div>
            <div className="flex items-center gap-2">
              <Building className="h-4.5 w-4.5 text-zinc-800" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Camp Leader Workspace</span>
            </div>
            <h1 className="text-3xl font-black text-black mt-1">{camp.name}</h1>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-400" /> {camp.address}</p>
          </div>

          {/* Leader navigation tabs */}
          <div className="flex border border-zinc-300 rounded-xl bg-white p-1 overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'overview' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'inventory' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('volunteers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'volunteers' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Volunteers ({myAssignedVolunteers.length})
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'donations' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Donation Requests ({donations.filter(d => d.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'profile' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* ==================== TAB 1: CAMP OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-8 text-left items-start">
            
            {/* Main Stats Column */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-base font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">Camp Health Overview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-zinc-250 p-5 rounded-xl">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Camp Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-zinc-950 border border-zinc-800 text-white mt-3 uppercase">
                    {camp.status}
                  </span>
                </div>
                <div className="bg-white border border-zinc-250 p-5 rounded-xl">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Assigned Volunteers</span>
                  <h3 className="text-3xl font-black text-black mt-2">{myAssignedVolunteers.length} Deployed</h3>
                </div>
                <div className="bg-white border border-zinc-250 p-5 rounded-xl">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Inventory Items</span>
                  <h3 className="text-3xl font-black text-black mt-2">{inventory.length} Categories</h3>
                </div>
                <div className="bg-white border border-zinc-250 p-5 rounded-xl">
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider block">Donations Pending</span>
                  <h3 className="text-3xl font-black text-black mt-2">{donations.filter(d => d.status === 'PENDING').length} Requests</h3>
                </div>
              </div>

              {/* Camp Details description block */}
              <div className="bg-white border border-zinc-250 p-6 rounded-xl space-y-4">
                <h4 className="font-bold text-sm text-zinc-900 border-b border-zinc-150 pb-2">Camp Description</h4>
                <p className="text-xs text-zinc-650 leading-relaxed italic">"{camp.description || 'No description recorded.'}"</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs text-zinc-550 pt-2 border-t border-zinc-100">
                  <div>
                    <span>Latitude:</span>
                    <strong className="text-zinc-800 block font-mono">{camp.latitude}</strong>
                  </div>
                  <div>
                    <span>Longitude:</span>
                    <strong className="text-zinc-800 block font-mono">{camp.longitude}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Camp Map Column */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">Camp Geo Location</h3>
              <div className="h-[280px] w-full rounded-xl overflow-hidden border border-zinc-300">
                <CampMap
                  camps={[camp]}
                  initialCenter={[parseFloat(camp.latitude) || 20.5937, parseFloat(camp.longitude) || 78.9629]}
                  initialZoom={13}
                  selectedCamp={camp}
                />
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: INVENTORY MANAGER ==================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black uppercase tracking-wider">Camp Inventory Stock</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Manage materials, food allocations, medical stocks, and daily products.</p>
              </div>

              <button
                onClick={() => { setShowAddProduct(!showAddProduct); setEditingItem(null); }}
                className="inline-flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Product
              </button>
            </div>

            {/* ADD PRODUCT FORM MODAL CONTAINER */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-white border border-zinc-250 rounded-xl p-5 max-w-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">Register New Inventory Material</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Category</label>
                    <select
                      required
                      value={newProductData.category}
                      onChange={(e) => setNewProductData({...newProductData, category: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Product Name</label>
                    <input
                      type="text" required placeholder="Rice / Blankets / Paracetamol"
                      value={newProductData.product_name}
                      onChange={(e) => setNewProductData({...newProductData, product_name: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Quantity</label>
                    <input
                      type="number" step="any" required placeholder="250"
                      value={newProductData.quantity}
                      onChange={(e) => setNewProductData({...newProductData, quantity: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Unit of Measure</label>
                    <input
                      type="text" required placeholder="Kg / Liters / Boxes / Pieces"
                      value={newProductData.unit}
                      onChange={(e) => setNewProductData({...newProductData, unit: e.target.value})}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Save Inventory Item'}
                </button>
              </form>
            )}

            {/* EDIT PRODUCT QUANTITY MODAL CONTAINER */}
            {editingItem && (
              <form onSubmit={handleUpdateProduct} className="bg-white border border-zinc-250 rounded-xl p-5 max-w-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">Update Quantity: {editingItem.product_name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Quantity</label>
                    <input
                      type="number" step="any" required
                      value={editProductQty}
                      onChange={(e) => setEditProductQty(e.target.value)}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Unit</label>
                    <input
                      type="text" required
                      value={editProductUnit}
                      onChange={(e) => setEditProductUnit(e.target.value)}
                      className="w-full border border-zinc-250 rounded-lg p-2 text-xs bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 bg-white border border-zinc-300 text-zinc-700 py-2 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* INVENTORY LIST TABLE */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Unit</th>
                    <th className="p-3.5">Last Updated</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-zinc-400 italic">No inventory products registered yet. Click Add Product to begin.</td>
                    </tr>
                  ) : (
                    inventory.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="p-3.5 font-semibold text-zinc-750">{item.category_name}</td>
                        <td className="p-3.5 font-bold text-zinc-900">{item.product_name}</td>
                        <td className="p-3.5 font-semibold text-zinc-800">{item.quantity}</td>
                        <td className="p-3.5 text-zinc-500">{item.unit}</td>
                        <td className="p-3.5 text-zinc-500">{new Date(item.last_updated).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setEditProductQty(item.quantity);
                                setEditProductUnit(item.unit);
                                setShowAddProduct(false);
                              }}
                              className="text-zinc-650 hover:text-black hover:bg-zinc-100 p-1.5 rounded-lg border border-transparent transition cursor-pointer"
                              title="Edit Quantity"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="text-red-650 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg border border-transparent transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: VOLUNTEERS ==================== */}
        {activeTab === 'volunteers' && (
          <div className="space-y-8 text-left">
            
            {/* Active Deployed Volunteers */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2">Deployed Volunteers ({myAssignedVolunteers.length})</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myAssignedVolunteers.length === 0 ? (
                  <div className="sm:col-span-2 md:col-span-3 bg-white border border-zinc-200 rounded-xl py-12 text-center text-zinc-400 text-xs">
                    No active volunteers deployed to your camp location.
                  </div>
                ) : (
                  myAssignedVolunteers.map(v => (
                    <div key={v.id} className="bg-white border border-zinc-250 p-4 rounded-xl space-y-2">
                      <h4 className="font-bold text-sm text-zinc-900">{v.full_name}</h4>
                      <p className="text-xs text-zinc-500">Skills: <strong className="text-zinc-800">{v.skills || 'General Helper'}</strong></p>
                      <p className="text-[10px] text-zinc-450 flex items-center gap-1"><Phone className="h-3 w-3" /> {v.phone}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Claimable/Pending Volunteer Applications */}
            <div className="space-y-4">
              <div className="border-b border-zinc-200 pb-2">
                <h3 className="text-base font-bold text-black uppercase tracking-wider">Pending Volunteer Registrations ({globalPendingVolunteers.length})</h3>
                <p className="text-[11px] text-zinc-450 mt-0.5">Volunteers waiting for station assignment. You can accept them directly to deploy them to your camp.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {globalPendingVolunteers.length === 0 ? (
                  <div className="sm:col-span-2 bg-white border border-zinc-200 rounded-xl py-10 text-center text-zinc-400 text-xs">
                    No pending volunteer registration requests.
                  </div>
                ) : (
                  globalPendingVolunteers.map(v => (
                    <div key={v.id} className="bg-white border border-zinc-250 p-5 rounded-xl flex flex-col justify-between">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-zinc-900">{v.full_name}</h4>
                          <span className="text-[10px] text-zinc-500">Age: {v.age}</span>
                        </div>
                        <p className="text-zinc-650"><strong className="text-zinc-800">Skills:</strong> {v.skills || 'N/A'}</p>
                        <p className="text-zinc-600 italic">"{v.reason_for_volunteering || 'Not provided'}"</p>
                      </div>
                      
                      <div className="flex gap-2 border-t border-zinc-100 pt-3.5 mt-4">
                        <button
                          onClick={() => handleAcceptVolunteer(v.id)}
                          className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer"
                        >
                          Accept to Camp
                        </button>
                        <button
                          onClick={() => handleRejectVolunteer(v.id)}
                          className="flex-1 bg-white border border-zinc-300 text-zinc-700 py-2 rounded-lg text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: DONATION REQUESTS ==================== */}
        {activeTab === 'donations' && (
          <div className="space-y-6 text-left">
            <div className="border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-bold text-black uppercase tracking-wider">Donations Log</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Approve incoming product supplies registered specifically for your relief station.</p>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Donor Name</th>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Delivery Method</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-zinc-400 italic">No donations registered for this camp location.</td>
                    </tr>
                  ) : (
                    donations.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-50">
                        <td className="p-3.5">
                          <strong className="text-zinc-900 block">{d.full_name}</strong>
                          <span className="text-[10px] text-zinc-400">{d.phone}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-zinc-800">{d.product_name || d.other_item}</td>
                        <td className="p-3.5 text-zinc-700">{d.quantity} {d.unit}</td>
                        <td className="p-3.5 font-mono text-[10px] text-zinc-500">{d.delivery_method}</td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            d.status === 'PENDING' ? 'bg-zinc-50 text-zinc-500 border-zinc-250' : 
                            d.status === 'ACCEPTED' ? 'bg-zinc-100 text-zinc-850 border-zinc-300' :
                            'bg-zinc-950 text-white border-zinc-950'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {d.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleDonationStatus(d.id, 'ACCEPTED')}
                                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDonationStatus(d.id, 'REJECTED')}
                                  className="bg-white border border-zinc-300 text-zinc-750 py-1 px-2 rounded text-[10px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {d.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleDonationStatus(d.id, 'COMPLETED')}
                                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: MY PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto text-left">
            <h3 className="text-base font-bold text-black uppercase tracking-wider border-b border-zinc-200 pb-2 mb-6">Camp Leader Account Profile</h3>
            
            <div className="bg-white border border-zinc-250 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Username</span>
                <strong className="text-zinc-800 text-sm">{user.username}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Role</span>
                <strong className="text-zinc-800 text-sm">{user.role}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Email Address</span>
                <strong className="text-zinc-800 text-sm">{user.email || 'N/A'}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Phone</span>
                <strong className="text-zinc-800 text-sm">{user.phone || 'N/A'}</strong>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Mailing Address</span>
                <strong className="text-zinc-700 text-xs leading-relaxed">{user.address || 'N/A'}</strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ==========================================================================
   3. VOLUNTEER DASHBOARD
   ========================================================================== */
const VolunteerDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-12 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-2xl mx-auto space-y-8 text-left">
        <div className="border-b border-zinc-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Volunteer Workspace</span>
          <h1 className="text-3xl font-black text-black mt-1">Volunteer Portal</h1>
        </div>

        <div className="bg-white border border-zinc-250 p-6 md:p-8 rounded-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-zinc-900">Hello, {user.username}!</h3>
            <p className="text-xs text-zinc-500">Thank you for joining ReliefNet to support disaster response and camp coordination.</p>
          </div>

          <div className="border-t border-zinc-150 pt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Approval Status</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wider mt-1 ${
                user.volunteer_status === 'PENDING' ? 'bg-zinc-50 text-zinc-500 border-zinc-250' : 
                user.volunteer_status === 'APPROVED' ? 'bg-zinc-100 text-zinc-800 border-zinc-300' :
                user.volunteer_status === 'ASSIGNED' ? 'bg-zinc-950 text-white border-zinc-950' :
                'bg-red-50 text-red-750 border-red-200'
              }`}>
                {user.volunteer_status || 'PENDING'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Assigned Station</span>
              <strong className="text-sm text-zinc-900 block mt-1">
                {user.assigned_camp_name || 'Not yet deployed'}
              </strong>
            </div>
          </div>

          {user.volunteer_status === 'ASSIGNED' ? (
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl text-white space-y-3">
              <h4 className="font-bold text-sm">Station Deployment Active</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                You have been deployed to <strong>{user.assigned_camp_name}</strong>. Please report to the camp station location as soon as possible and consult the Camp Leader for task delegation.
              </p>
            </div>
          ) : user.volunteer_status === 'APPROVED' ? (
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-zinc-800">Application Approved</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Your volunteer application has been approved by the administrators! You are currently on the standby list awaiting camp deployment. We will notify you once you are assigned to a camp.
              </p>
            </div>
          ) : user.volunteer_status === 'REJECTED' ? (
            <div className="bg-red-50 border border-red-100 p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-red-800">Application Status: Rejected</h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Unfortunately, your application to volunteer could not be approved at this time. Please contact support if you believe this was an error.
              </p>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl space-y-3">
              <h4 className="font-bold text-sm text-zinc-700">Application Pending Review</h4>
              <p className="text-xs text-zinc-550 leading-relaxed">
                Your volunteer profile is currently pending administrator verification. Keep an eye on your dashboard; once approved or assigned to a relief center, your station details will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
