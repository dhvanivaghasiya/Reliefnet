import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Bell, Check, Trash2, Calendar, Loader2 } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.post(`notifications/${id}/mark_read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.post('notifications/mark_all_read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notification?")) {
      try {
        await API.delete(`notifications/${id}/`);
        setNotifications(notifications.filter(n => n.id !== id));
      } catch (err) {
        console.error("Failed to delete notification:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 py-10 px-6 md:px-12 font-['Inter',sans-serif]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              <Bell className="h-6 w-6 text-zinc-900" />
              Notifications
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Stay updated with status approvals, camp updates, and donation actions.</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl">
            <Bell className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition ${
                  n.is_read ? 'bg-white border-zinc-200 text-zinc-650' : 'bg-zinc-100 border-zinc-300 text-zinc-950 font-semibold'
                }`}
              >
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-zinc-950 shrink-0" />}
                    <h3 className="font-bold text-sm text-zinc-900">{n.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-zinc-400 block pt-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-red-600 transition cursor-pointer"
                    title="Delete Notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;
