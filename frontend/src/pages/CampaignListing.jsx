import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Heart, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Loader2, 
  Calendar, 
  Trash2, 
  Edit3, 
  Image as ImageIcon 
} from 'lucide-react';

const CampaignListing = () => {
  const { user } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bannerImage, setBannerImage] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await API.get('campaigns/');
      setCampaigns(res.data);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('categories/');
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCampaigns(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory(categories[0]?.id || '');
    setStatus('ACTIVE');
    setStartDate('');
    setEndDate('');
    setBannerImage(null);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (campaign) => {
    setModalMode('edit');
    setEditingId(campaign.id);
    setTitle(campaign.title);
    setDescription(campaign.description);
    setCategory(campaign.category || '');
    setStatus(campaign.status);
    setStartDate(campaign.start_date ? campaign.start_date.substring(0, 16) : '');
    setEndDate(campaign.end_date ? campaign.end_date.substring(0, 16) : '');
    setBannerImage(null);
    setFormError('');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_date', new Date(startDate).toISOString());
    formData.append('end_date', new Date(endDate).toISOString());
    formData.append('status', status);
    if (category) {
      formData.append('category', category);
    }
    if (bannerImage) {
      formData.append('banner_image', bannerImage);
    }

    try {
      if (modalMode === 'create') {
        await API.post('campaigns/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await API.patch(`campaigns/${editingId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      await fetchCampaigns();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'Failed to save campaign. Check parameters.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign? All linked camps will be affected.")) {
      try {
        await API.delete(`campaigns/${id}/`);
        setCampaigns(campaigns.filter(c => c.id !== id));
      } catch (err) {
        console.error("Failed to delete campaign:", err);
        alert("Failed to delete campaign.");
      }
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? c.category === parseInt(selectedCategory) : true;
    const matchesStatus = selectedStatus ? c.status === selectedStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isSuperAdmin = user && user.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div className="text-left">
            <h1 className="text-3xl font-black text-black">Relief Campaigns</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage, monitor and support community relief campaigns</p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative text-left">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400"
            />
          </div>

          <div className="md:col-span-3 relative text-left">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-800 outline-none transition focus:border-zinc-400 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 relative text-left">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 pl-11 pr-4 text-sm text-zinc-800 outline-none transition focus:border-zinc-400 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl">
            <p className="text-zinc-550 text-sm">No campaigns found matching the criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="group relative bg-white border border-zinc-250 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-400 transition shadow-xs">
                {/* Admin controls */}
                {isSuperAdmin && (
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(campaign)}
                      className="p-2 rounded-lg bg-white/95 border border-zinc-250 hover:border-zinc-400 text-zinc-700 hover:text-black transition cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="p-2 rounded-lg bg-white/95 border border-zinc-250 hover:border-red-400 text-zinc-700 hover:text-red-650 transition cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Banner image */}
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
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">No Banner Image</span>
                    </div>
                  )}
                  <span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded border bg-white border-zinc-300 text-zinc-800 uppercase tracking-wider">
                    {campaign.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 space-y-4 text-left">
                  {campaign.category_detail && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
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
                    <span className="text-xs text-zinc-455 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      Ends {new Date(campaign.end_date).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="text-xs font-extrabold text-black hover:underline"
                    >
                      Details & Camps &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 max-h-[90svh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h2 className="text-xl font-bold text-black text-left">
                  {modalMode === 'create' ? 'Create New Campaign' : 'Edit Campaign'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-black transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-750 p-3 rounded-xl text-left">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter campaign title"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the campaign..."
                    rows={4}
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Status *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50 text-xs font-semibold text-zinc-650 hover:text-black cursor-pointer transition">
                      <ImageIcon className="h-4 w-4" />
                      <span>{bannerImage ? bannerImage.name : 'Choose File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : modalMode === 'create' ? (
                    'Create Campaign'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CampaignListing;
