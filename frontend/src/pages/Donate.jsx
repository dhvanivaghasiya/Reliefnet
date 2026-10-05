import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { Gift, CheckCircle, Loader2 } from 'lucide-react';

const Donate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campIdParam = searchParams.get('campId');

  // Camps & Categories for dropdowns
  const [camps, setCamps] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Form Fields
  const [campId, setCampId] = useState(campIdParam || '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [otherItem, setOtherItem] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('SELF_DELIVERY');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [campsRes, catsRes] = await Promise.all([
          API.get('camps/'),
          API.get('categories/')
        ]);
        setCamps(campsRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error("Failed to load camps or categories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campId || !fullName || !email || !phone || (!categoryId && !otherItem)) {
      setError('Please fill in all required fields. You must select a Category or enter an Other Item.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      camp: parseInt(campId),
      full_name: fullName,
      email,
      phone,
      category: categoryId ? parseInt(categoryId) : null,
      product_name: productName || null,
      quantity: parseInt(quantity),
      unit,
      other_item: otherItem || null,
      description,
      delivery_method: deliveryMethod,
      status: 'PENDING'
    };

    try {
      await API.post('donations/', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6 font-['Inter',sans-serif]">
        <div className="w-full max-w-md bg-white border border-zinc-250 rounded-2xl p-8 text-center space-y-6 shadow-xs">
          <div className="h-16 w-16 bg-zinc-100 border border-zinc-200 rounded-2xl flex items-center justify-center text-black mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2 text-center text-left">
            <h1 className="text-2xl font-bold text-black">Thank You for Your Donation!</h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Your donation offer has been registered successfully. The camp team will review the details. You can view progress in the Donation History board.
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="block w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-semibold text-white transition text-sm cursor-pointer text-center"
          >
            View Donation History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-955 py-12 px-6 md:px-12 flex items-center justify-center font-['Inter',sans-serif]">
      <div className="w-full max-w-2xl bg-white border border-zinc-250 rounded-2xl p-6 md:p-8 space-y-8 shadow-xs relative">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-black mx-auto">
            <Gift className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-black">Offer a Donation</h1>
          <p className="text-sm text-zinc-500">Contribute materials or goods directly to relief camps</p>
        </div>

        {error && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl text-left">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            
            {/* Camp selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Target Relief Camp *</label>
              <select
                required
                value={campId}
                onChange={(e) => setCampId(e.target.value)}
                className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
              >
                <option value="">Select Camp</option>
                {camps.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Section 1: Contact details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest border-b border-zinc-200 pb-1">Donor Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Product details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-widest border-b border-zinc-200 pb-1">Product Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Category (For standard items)</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="">Other / Custom Item</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Rice, Blankets, Cough Syrup"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pcs, kgs, cases, boxes"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Other Item Description</label>
                  <input
                    type="text"
                    value={otherItem}
                    onChange={(e) => setOtherItem(e.target.value)}
                    placeholder="Describe custom items here"
                    className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 mb-1.5">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expiry date, size, condition, or any special notes..."
                  rows={2.5}
                  className="block w-full rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {/* Section 3: Delivery Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-455 uppercase tracking-widest border-b border-zinc-200 pb-1">Delivery Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer text-left transition ${
                  deliveryMethod === 'SELF_DELIVERY'
                    ? 'bg-zinc-100 border-zinc-950 text-zinc-950 font-bold'
                    : 'bg-white border-zinc-250 hover:border-zinc-400 text-zinc-500'
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="SELF_DELIVERY"
                    checked={deliveryMethod === 'SELF_DELIVERY'}
                    onChange={() => setDeliveryMethod('SELF_DELIVERY')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-zinc-900">Self Delivery</span>
                  <span className="text-xs text-zinc-500 mt-1">You will drop off the items at the shelter camp location.</span>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer text-left transition ${
                  deliveryMethod === 'PICKUP_REQUEST'
                    ? 'bg-zinc-100 border-zinc-950 text-zinc-950 font-bold'
                    : 'bg-white border-zinc-250 hover:border-zinc-400 text-zinc-500'
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="PICKUP_REQUEST"
                    checked={deliveryMethod === 'PICKUP_REQUEST'}
                    onChange={() => setDeliveryMethod('PICKUP_REQUEST')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-zinc-900">Pickup Request</span>
                  <span className="text-xs text-zinc-500 mt-1">Request a volunteer driver to pick up from your address.</span>
                </label>
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
                'Submit Donation Offer'
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default Donate;
