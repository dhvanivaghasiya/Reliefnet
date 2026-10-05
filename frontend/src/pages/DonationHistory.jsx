import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Gift, Calendar, User, Mail, Phone, Truck, Check, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const DonationHistory = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await API.get('donations/');
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.patch(`donations/${id}/`, { status: newStatus });
      await fetchDonations();
      setSelectedDonation(null);
      alert(`Donation status updated to ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6 text-left">
          <h1 className="text-3xl font-black text-black">Donation Board</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {user?.role === 'SUPER_ADMIN' 
              ? 'Manage and approve relief goods donated across all camps'
              : user?.role === 'CAMP_LEADER'
              ? 'Review and update donation offers submitted for your camp'
              : 'Track the status and delivery of your contributions'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left Grid: Donations List */}
            <div className="md:col-span-6 space-y-4 max-h-[600px] overflow-y-auto pr-2 text-left">
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-widest block mb-2">
                Donation Offers ({donations.length})
              </span>

              {donations.length === 0 ? (
                <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                  <Gift className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">No donation offers recorded yet.</p>
                </div>
              ) : (
                donations.map(d => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDonation(d)}
                    className={`group p-5 rounded-xl border transition cursor-pointer text-left ${
                      selectedDonation?.id === d.id
                        ? 'bg-zinc-150 border-zinc-950'
                        : 'bg-white border-zinc-250 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900 group-hover:underline transition">
                          {d.product_name || d.other_item || `Donation #${d.id}`}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">
                          Qty: <strong className="text-zinc-800">{d.quantity} {d.unit || 'pcs'}</strong>
                        </p>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider shrink-0">
                        {d.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500 mt-4 flex items-center justify-between border-t border-zinc-150 pt-3">
                      <span className="text-zinc-900 font-extrabold">To: {d.camp_name || 'Generic Camp'}</span>
                      <span className="flex items-center gap-1 font-semibold"><Calendar className="h-3.5 w-3.5 text-zinc-400" /> {new Date(d.donation_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Grid: Detailed View & Action Panel */}
            <div className="md:col-span-6 bg-white border border-zinc-250 rounded-xl p-6 md:p-8 text-left min-h-[400px] flex flex-col justify-between shadow-xs">
              
              {!selectedDonation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 space-y-2 py-20">
                  <Gift className="h-10 w-10 text-zinc-300 animate-pulse" />
                  <p className="text-sm">Select a donation offer from the list to view particulars and update logs.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  
                  {/* Detailed Profile Header */}
                  <div className="border-b border-zinc-200 pb-4">
                    <h2 className="text-xl font-bold text-black">
                      {selectedDonation.product_name || selectedDonation.other_item || 'Custom Goods'}
                    </h2>
                    <span className="text-xs text-zinc-500 font-semibold block mt-1">
                      Destined Camp: {selectedDonation.camp_name}
                    </span>
                  </div>

                  {/* Quantity and Category Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-zinc-650">
                    <div>
                      <span className="text-xs text-zinc-400 block">Quantity</span>
                      <strong className="text-base text-zinc-900">{selectedDonation.quantity} {selectedDonation.unit || 'pcs'}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">Category</span>
                      <strong className="text-base text-zinc-900">{selectedDonation.category_name || 'Other/Custom'}</strong>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-3 pt-4 border-t border-zinc-200">
                    <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Donor Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-zinc-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        <span>Name: <strong>{selectedDonation.full_name || selectedDonation.donor_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <span>Email: <strong>{selectedDonation.email || selectedDonation.donor_email || 'N/A'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span>Phone: <strong>{selectedDonation.phone || 'N/A'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-zinc-400" />
                        <span>Delivery: <strong>{selectedDonation.delivery_method === 'SELF_DELIVERY' ? 'Self Delivery' : 'Pickup Request'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-2 pt-4 border-t border-zinc-200">
                    <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Item Description / Delivery Notes</h4>
                    <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200 leading-relaxed">
                      {selectedDonation.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions Panel */}
                  <div className="pt-6 border-t border-zinc-200 flex flex-col gap-3 mt-auto">
                    {(user?.role === 'SUPER_ADMIN' || user?.role === 'CAMP_LEADER') ? (
                      selectedDonation.status === 'PENDING' ? (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleUpdateStatus(selectedDonation.id, 'ACCEPTED')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-bold text-white transition cursor-pointer text-sm"
                          >
                            <Check className="h-4 w-4" />
                            Accept Donation
                          </button>
                        </div>
                      ) : selectedDonation.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleUpdateStatus(selectedDonation.id, 'COMPLETED')}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-bold text-white transition cursor-pointer text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Completed (Add to Inventory)
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-300 text-zinc-800 p-3 rounded-xl justify-center text-xs font-semibold">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          Donation completed and added to shelter inventory logs.
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-300 text-zinc-700 p-3.5 rounded-xl justify-center text-xs font-semibold">
                        <AlertCircle className="h-4.5 w-4.5" />
                        Status: <strong className="text-zinc-900 uppercase">{selectedDonation.status}</strong>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DonationHistory;
