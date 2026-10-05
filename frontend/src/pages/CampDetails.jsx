import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import CampMap from '../components/CampMap';
import { 
  Building, 
  MapPin, 
  Phone, 
  User, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  Package
} from 'lucide-react';

const CampDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [camp, setCamp] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inventory Modal Form States
  const [showInvModal, setShowInvModal] = useState(false);
  const [invModalMode, setInvModalMode] = useState('create'); // 'create' or 'edit'
  const [editingInvId, setEditingInvId] = useState(null);
  
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('');
  const [invFormError, setInvFormError] = useState('');
  const [invFormSubmitting, setInvFormSubmitting] = useState(false);

  const fetchCampDetails = async () => {
    try {
      const res = await API.get(`camps/${id}/`);
      setCamp(res.data);
    } catch (err) {
      console.error("Failed to load camp details:", err);
      navigate('/camps');
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await API.get(`inventory/?camp=${id}`);
      setInventory(res.data);
    } catch (err) {
      console.error("Failed to load camp inventory:", err);
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
      await Promise.all([fetchCampDetails(), fetchInventory(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const handleOpenCreateInv = () => {
    setInvModalMode('create');
    setEditingInvId(null);
    setProductName('');
    setQuantity('');
    setUnit('pcs');
    setCategory(categories[0]?.id || '');
    setInvFormError('');
    setShowInvModal(true);
  };

  const handleOpenEditInv = (item) => {
    setInvModalMode('edit');
    setEditingInvId(item.id);
    setProductName(item.product_name);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setCategory(item.category || '');
    setInvFormError('');
    setShowInvModal(true);
  };

  const handleInvSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !quantity || !unit) {
      setInvFormError('Please fill out all required fields.');
      return;
    }

    setInvFormSubmitting(true);
    setInvFormError('');

    const payload = {
      camp: parseInt(id),
      product_name: productName,
      quantity: parseInt(quantity),
      unit: unit,
      category: category ? parseInt(category) : null
    };

    try {
      if (invModalMode === 'create') {
        await API.post('inventory/', payload);
      } else {
        await API.put(`inventory/${editingInvId}/`, payload);
      }
      await fetchInventory();
      setShowInvModal(false);
    } catch (err) {
      console.error(err);
      setInvFormError(err.response?.data?.detail || 'Failed to save inventory item.');
    } finally {
      setInvFormSubmitting(false);
    }
  };

  const handleDeleteInv = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item from inventory?")) {
      try {
        await API.delete(`inventory/${itemId}/`);
        setInventory(inventory.filter(item => item.id !== itemId));
      } catch (err) {
        console.error(err);
        alert("Failed to delete inventory item.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-55">
        <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!camp) return null;

  const canManageInventory = user && (user.role === 'SUPER_ADMIN' || user.role === 'CAMP_LEADER');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Button */}
        <div className="text-left">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        {/* Main Details Card */}
        <div className="bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 space-y-8 text-left shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-black" />
                <h1 className="text-3xl font-black text-black">{camp.name}</h1>
              </div>
              
              {camp.campaign_detail && (
                <p className="text-xs text-zinc-500 mt-2">
                  Part of Campaign:{' '}
                  <Link to={`/campaigns/${camp.campaign}`} className="text-black hover:underline font-bold">
                    {camp.campaign_detail.title}
                  </Link>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <span className="text-xs font-bold px-3 py-1 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider">
                {camp.status}
              </span>
              <Link
                to={`/donate?campId=${camp.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-bold text-xs text-white shadow-xs transition"
              >
                Offer a Donation
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 border-b border-zinc-200 pb-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-zinc-700 text-sm leading-relaxed">
                  {camp.description || 'No description provided for this relief camp.'}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-200 pb-1">Contact & Management</h3>
                <div className="space-y-3.5 text-sm text-zinc-650">
                  <div className="flex items-center gap-3">
                    <User className="h-4.5 w-4.5 text-zinc-400" />
                    <span>Leader: <strong className="text-zinc-900">{camp.leader_username || 'N/A'}</strong></span>
                  </div>
                  {camp.contact_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4.5 w-4.5 text-zinc-400" />
                      <span>Phone: <strong className="text-zinc-900">{camp.contact_number}</strong></span>
                    </div>
                  )}
                  {camp.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4.5 w-4.5 text-zinc-400 mt-0.5 shrink-0" />
                      <span>Address: <strong className="text-zinc-900">{camp.address}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map Panel */}
            <div className="flex flex-col h-[280px]">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Location Map</h3>
              <div className="flex-1">
                <CampMap 
                  camps={[camp]} 
                  selectedCamp={camp} 
                  initialCenter={[camp.latitude || 20.5937, camp.longitude || 78.9629]}
                  initialZoom={14}
                />
              </div>
            </div>
          </div>

          {/* Camp Inventory Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-black" />
                <h2 className="text-2xl font-bold text-zinc-950">Camp Inventory</h2>
              </div>
              {canManageInventory && (
                <button
                  onClick={handleOpenCreateInv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-white transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Stock Item
                </button>
              )}
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-12 bg-zinc-50 border border-zinc-200 rounded-xl">
                <p className="text-sm text-zinc-450">No inventory registered for this camp yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <table className="w-full border-collapse text-left text-sm text-zinc-700">
                  <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Quantity</th>
                      <th className="px-6 py-4">Unit</th>
                      {canManageInventory && <th className="px-6 py-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                        <td className="px-6 py-4 font-semibold text-zinc-900">
                          <span className="block">{item.product_name}</span>
                          {item.category_name && (
                            <span className="inline-block mt-0.5 text-[8.5px] font-bold text-zinc-600 uppercase tracking-widest bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-250">
                              {item.category_name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-800">{item.quantity}</td>
                        <td className="px-6 py-4 text-zinc-500">{item.unit}</td>
                        {canManageInventory && (
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleOpenEditInv(item)}
                                className="p-1.5 rounded bg-white border border-zinc-250 hover:border-zinc-400 text-zinc-700 hover:text-black transition cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteInv(item.id)}
                                className="p-1.5 rounded bg-white border border-zinc-250 hover:border-red-450 text-zinc-755 hover:text-red-650 transition cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Inventory Edit/Create Modal */}
        {showInvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 overflow-y-auto">
            <div className="relative w-full max-w-md bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h2 className="text-xl font-bold text-black text-left">
                  {invModalMode === 'create' ? 'Add Inventory Item' : 'Edit Inventory Item'}
                </h2>
                <button
                  onClick={() => setShowInvModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-black transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {invFormError && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-750 p-3 rounded-xl text-left">
                  {invFormError}
                </div>
              )}

              <form onSubmit={handleInvSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Bottled Water Cases"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 150"
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                      Unit *
                    </label>
                    <input
                      type="text"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. boxes, kg, packets"
                      className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
                    Category
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

                <button
                  type="submit"
                  disabled={invFormSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {invFormSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : invModalMode === 'create' ? (
                    'Add Inventory'
                  ) : (
                    'Save Item Changes'
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

export default CampDetails;
