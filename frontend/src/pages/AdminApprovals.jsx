import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Building, 
  Check, 
  X, 
  MapPin, 
  User, 
  Clock, 
  FileText, 
  Mail, 
  Phone,
  Key
} from 'lucide-react';

const AdminApprovals = () => {
  const [activeTab, setActiveTab] = useState('volunteers'); 
  const [volunteers, setVolunteers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [camps, setCamps] = useState([]);
  const [approvedLeaderCreds, setApprovedLeaderCreds] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [assignCampId, setAssignCampId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, lRes, cRes] = await Promise.all([
        API.get('volunteers/'),
        API.get('leaders/'),
        API.get('camps/')
      ]);
      setVolunteers(vRes.data);
      setLeaders(lRes.data);
      setCamps(cRes.data);
    } catch (err) {
      console.error("Failed to load approval lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateVolunteerStatus = async (id, status, campId = null) => {
    try {
      const payload = { status };
      if (campId === 'unassign') {
        payload.assigned_camp = null;
        payload.status = 'APPROVED';
      } else if (campId) {
        payload.assigned_camp = parseInt(campId);
      }
      
      await API.patch(`volunteers/${id}/`, payload);
      await fetchData();
      setSelectedItem(null);
      setAssignCampId('');
      alert(campId === 'unassign' ? 'Volunteer successfully unassigned from camp.' : `Volunteer successfully updated.`);
    } catch (err) {
      console.error(err);
      alert('Failed to update volunteer status.');
    }
  };

  const handleUpdateLeaderStatus = async (id, status) => {
    try {
      const res = await API.patch(`leaders/${id}/`, { status });
      await fetchData();
      if (status === 'APPROVED' && res.data.temp_password) {
        setApprovedLeaderCreds(res.data);
        // Keep selected so admin can immediately deploy to camp and see temporary credentials
        setSelectedItem(res.data);
      } else {
        setSelectedItem(null);
        alert(`Leader successfully updated to ${status}.`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update leader status.');
    }
  };

  const getAssignedCampName = (leaderUserId) => {
    // Use == for type-safe comparison (c.leader could be int, leaderUserId could be string)
    const assignedCamp = camps.find(c => c.leader == leaderUserId);
    return assignedCamp ? assignedCamp.name : null;
  };

  const handleDeployLeader = async (leaderUserId, campId) => {
    try {
      await API.patch(`camps/${campId}/`, { leader: parseInt(leaderUserId) });
      await fetchData();
      setSelectedItem(null);
      setAssignCampId('');
      alert('Leader deployed to camp successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to deploy leader to camp.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6 text-left">
          <h1 className="text-3xl font-black text-black">Approvals Center</h1>
          <p className="text-sm text-zinc-500 mt-1">Review registrations, manage statuses and deploy volunteers</p>
        </div>

        {approvedLeaderCreds && (
          <div className="bg-white border-2 border-zinc-950 p-6 rounded-xl space-y-4 max-w-xl text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-zinc-900">Leader Approved & Credentials Generated</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Copy and share these credentials with the camp leader so they can log in.
                </p>
              </div>
              <button 
                onClick={() => setApprovedLeaderCreds(null)}
                className="text-zinc-400 hover:text-zinc-655 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Username:</span>
                <strong className="text-zinc-900">{approvedLeaderCreds.username}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Temporary Password:</span>
                <strong className="text-zinc-900">{approvedLeaderCreds.temp_password}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Username: ${approvedLeaderCreds.username}\nPassword: ${approvedLeaderCreds.temp_password}`);
                  alert('Credentials copied to clipboard!');
                }}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg text-xs cursor-pointer text-center"
              >
                Copy Credentials
              </button>
              <button
                onClick={() => setApprovedLeaderCreds(null)}
                className="px-4 py-2 border border-zinc-350 hover:bg-zinc-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-zinc-200 pb-px">
          <button
            onClick={() => { setActiveTab('volunteers'); setSelectedItem(null); }}
            className={`pb-4 text-sm font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
              activeTab === 'volunteers'
                ? 'border-zinc-950 text-zinc-950 font-extrabold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Volunteers ({volunteers.length})
          </button>
          <button
            onClick={() => { setActiveTab('leaders'); setSelectedItem(null); }}
            className={`pb-4 text-sm font-bold tracking-wider uppercase border-b-2 transition cursor-pointer ${
              activeTab === 'leaders'
                ? 'border-zinc-950 text-zinc-950 font-extrabold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Camp Leaders ({leaders.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-7 w-7 text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* Left Grid: Applications List */}
            <div className="md:col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-2 text-left">
              <span className="text-xs font-bold text-zinc-450 uppercase tracking-widest block mb-2">
                Pending & Existing Applications
              </span>

              {activeTab === 'volunteers' ? (
                volunteers.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                    <p className="text-sm text-zinc-400">No volunteer applications found.</p>
                  </div>
                ) : (
                  volunteers.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedItem(v)}
                      className={`group p-4 rounded-xl border transition cursor-pointer text-left ${
                        selectedItem?.id === v.id
                          ? 'bg-zinc-150 border-zinc-950'
                          : 'bg-white border-zinc-250 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 group-hover:underline transition">{v.full_name}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider shrink-0">
                          {v.status}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-2 space-y-1">
                        <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-zinc-400" /> {v.current_city}</p>
                        {v.assigned_camp_name && <p className="text-black font-extrabold">Assigned: {v.assigned_camp_name}</p>}
                      </div>
                    </div>
                  ))
                )
              ) : (
                leaders.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                    <p className="text-sm text-zinc-400">No camp leader applications found.</p>
                  </div>
                ) : (
                  leaders.map(l => (
                    <div
                      key={l.id}
                      onClick={() => setSelectedItem(l)}
                      className={`group p-4 rounded-xl border transition cursor-pointer text-left ${
                        selectedItem?.id === l.id
                          ? 'bg-zinc-150 border-zinc-950'
                          : 'bg-white border-zinc-250 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 group-hover:underline transition">{l.full_name}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-zinc-50 border-zinc-300 text-zinc-800 uppercase tracking-wider shrink-0">
                          {l.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-zinc-400" /> Req Camp: {l.camp_requested || 'None'}
                      </p>
                      {getAssignedCampName(l.user) && (
                        <p className="text-black font-extrabold text-[10px] mt-1 flex items-center gap-1">
                          Assigned: <span className="bg-zinc-100 text-zinc-800 px-1 rounded">{getAssignedCampName(l.user)}</span>
                        </p>
                      )}
                    </div>
                  ))
                )
              )}
            </div>

            {/* Right Grid: Detailed View & Action Panel */}
            <div className="md:col-span-7 bg-white border border-zinc-250 rounded-xl p-6 md:p-8 text-left min-h-[400px] flex flex-col justify-between shadow-xs">
              
              {!selectedItem ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 space-y-2 py-20">
                  <User className="h-10 w-10 text-zinc-300 animate-pulse" />
                  <p className="text-sm">Select an applicant from the list to view profile and perform actions.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1">
                  {/* Detailed Profile Header */}
                  <div className="border-b border-zinc-200 pb-4">
                    <h2 className="text-2xl font-bold text-black">{selectedItem.full_name}</h2>
                    <span className="text-xs text-zinc-500">Username: <strong className="text-zinc-700">{selectedItem.username}</strong></span>
                  </div>

                  {/* Profile info fields */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-zinc-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-400" />
                      <span>Age: <strong>{selectedItem.age} years</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span>Gov ID: <strong>{selectedItem.gov_id}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      <span>Email: <strong>{selectedItem.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-zinc-400" />
                      <span>Phone: <strong>{selectedItem.phone}</strong></span>
                    </div>
                    <div className="col-span-2 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                      <span>Address: <strong>{selectedItem.address}</strong></span>
                    </div>
                  </div>

                  {/* Unique Volunteer / Leader Fields */}
                  {activeTab === 'volunteers' ? (
                    <div className="space-y-4 pt-4 border-t border-zinc-200">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Skills</h4>
                        <p className="text-zinc-800 text-sm">{selectedItem.skills || 'None declared'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Availability</h4>
                          <p className="text-zinc-800 text-sm flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            {selectedItem.availability}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">City</h4>
                          <p className="text-zinc-800 text-sm">{selectedItem.current_city}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Reason for Volunteering</h4>
                        <p className="text-zinc-650 text-sm italic">"{selectedItem.reason_for_volunteering || 'Not provided'}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-zinc-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Camp Requested</h4>
                          <p className="text-zinc-850 text-sm flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-zinc-400" />
                            {selectedItem.camp_requested || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Reason for Applying</h4>
                        <p className="text-zinc-650 text-sm italic">"{selectedItem.reason_for_applying || 'Not provided'}"</p>
                      </div>

                      {/* Super Admin only credentials view */}
                      {selectedItem.temp_password && (
                        <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-2 mt-2">
                          <h4 className="font-extrabold text-zinc-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                            <Key className="h-3.5 w-3.5 text-zinc-500" />
                            Temporary Account Credentials
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-xs mt-1">
                            <div>
                              <span className="text-zinc-400 block mb-0.5">Username:</span>
                              <strong className="text-zinc-900 select-all font-mono">
                                {selectedItem.username || 'N/A'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-zinc-400 block mb-0.5">Temporary Password:</span>
                              <strong className="text-zinc-900 select-all font-mono">
                                {selectedItem.temp_password}
                              </strong>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 block mt-1 leading-relaxed">
                            Provide these credentials to the leader so they can log in. They will be prompted to change their password on first sign-in.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Panel */}
                  <div className="pt-6 border-t border-zinc-200 flex flex-col gap-4 mt-auto">
                    {/* Approve / Reject Controls */}
                    {selectedItem.status === 'PENDING' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => activeTab === 'volunteers' 
                            ? handleUpdateVolunteerStatus(selectedItem.id, 'APPROVED')
                            : handleUpdateLeaderStatus(selectedItem.id, 'APPROVED')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 font-bold text-white transition cursor-pointer"
                        >
                          <Check className="h-4.5 w-4.5" />
                          Approve Application
                        </button>
                        <button
                          onClick={() => activeTab === 'volunteers'
                            ? handleUpdateVolunteerStatus(selectedItem.id, 'REJECTED')
                            : handleUpdateLeaderStatus(selectedItem.id, 'REJECTED')
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-350 text-zinc-800 font-bold transition cursor-pointer"
                        >
                          <X className="h-4.5 w-4.5" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Deploy / Assign Volunteer Control */}
                    {activeTab === 'volunteers' && (selectedItem.status === 'APPROVED' || selectedItem.status === 'ASSIGNED') && (
                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3.5">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          {selectedItem.status === 'ASSIGNED' ? 'Change Camp Deployment' : 'Deploy to Camp'}
                        </div>
                        <div className="flex gap-3">
                          <select
                            value={assignCampId}
                            onChange={(e) => setAssignCampId(e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                          >
                            <option value="">Select Target Camp</option>
                            {camps.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateVolunteerStatus(selectedItem.id, 'ASSIGNED', assignCampId)}
                            disabled={!assignCampId}
                            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                          >
                            Deploy
                          </button>
                        </div>
                        {selectedItem.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateVolunteerStatus(selectedItem.id, 'APPROVED', 'unassign')}
                            className="w-full bg-white border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition mt-2"
                          >
                            Remove / Unassign from Camp
                          </button>
                        )}
                      </div>
                    )}

                    {/* Deploy / Assign Leader Control */}
                    {activeTab === 'leaders' && selectedItem.status === 'APPROVED' && (
                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3.5">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          {getAssignedCampName(selectedItem.user) ? 'Change Camp Deployment' : 'Deploy to Camp'}
                        </div>
                        {getAssignedCampName(selectedItem.user) && (
                          <div className="text-xs text-zinc-650">
                            Currently assigned to: <strong className="text-zinc-900">{getAssignedCampName(selectedItem.user)}</strong>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <select
                            value={assignCampId}
                            onChange={(e) => setAssignCampId(e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-250 bg-white py-2.5 px-4 text-xs text-zinc-800 outline-none focus:border-zinc-400 cursor-pointer"
                          >
                            <option value="">Select Target Camp</option>
                            {camps.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeployLeader(selectedItem.user, assignCampId)}
                            disabled={!assignCampId}
                            className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-xs font-bold text-white disabled:opacity-50 transition cursor-pointer"
                          >
                            Deploy
                          </button>
                        </div>
                        {getAssignedCampName(selectedItem.user) && (
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to remove this leader from their assigned camp?")) {
                                try {
                                  const assignedCamp = camps.find(c => c.leader == selectedItem.user);
                                  if (assignedCamp) {
                                    await API.patch(`camps/${assignedCamp.id}/`, { leader: null });
                                    await fetchData();
                                    setSelectedItem(null);
                                    setAssignCampId('');
                                    alert('Leader successfully unassigned from camp!');
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert('Failed to unassign leader.');
                                }
                              }
                            }}
                            className="w-full bg-white border border-red-200 text-red-650 hover:bg-red-50 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition mt-2"
                          >
                            Remove / Unassign from Camp
                          </button>
                        )}
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

export default AdminApprovals;
