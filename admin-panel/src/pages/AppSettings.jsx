import React, { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, Save, Smartphone, Loader2, ShieldCheck
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const AppSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    announcementBanner: '',
    telegramLink: 'https://t.me/mrx4u',
    minAppVersion: '1.0.8',
    contentVersion: '2.4.0',
    supportEmail: 'samumcqs@gmail.com',
    upiId: 'mrx4u@ybl',
    defaultPrice: 49,
    defaultValidityDays: 90,
    autoVerifyEnabled: false,
    autoVerificationConfigured: false,
    webhookConfigured: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    axiosInstance.get('/admin/settings')
      .then(({ data }) => setSettings(prev => ({ ...prev, ...data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const { data } = await axiosInstance.put('/admin/settings', settings);
      setSettings(prev => ({ ...prev, ...data }));
      setToast({ type: 'success', msg: 'Global configuration saved & synced to live website!' });
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.error || 'Failed to save settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
        <p className="text-sm font-bold">Loading global settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl text-sm font-bold text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">App Control &amp; Payment Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">All changes persist on the backend and automatically update the live Student Web &amp; Profile pages.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${settings.maintenanceMode ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">App Maintenance Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">Notify apps when database updates are running.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-300 justify-start'}`}
          >
            <div className="bg-white w-6 h-6 rounded-full shadow-md" />
          </button>
        </div>

        {/* Global Announcement Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Global Student Announcement Banner</h3>
          </div>
          <p className="text-xs text-slate-500">Shown in Student Profile Notifications &amp; Announcements section.</p>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            value={settings.announcementBanner}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
          />
        </div>

        {/* Payment & Verification Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Direct UPI &amp; Subscription Defaults (Super Admin)</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              <ShieldCheck size={13} />
              {settings.autoVerificationConfigured ? 'Provider Auto-Verify Ready' : 'Manual Admin Verification Active'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Merchant UPI ID</label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Default Plan Price (INR ₹)</label>
              <input
                type="number"
                min="0"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.defaultPrice}
                onChange={(e) => setSettings({ ...settings, defaultPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block mb-1">Default Validity (Days)</label>
              <input
                type="number"
                min="1"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.defaultValidityDays}
                onChange={(e) => setSettings({ ...settings, defaultValidityDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 pt-2">
            <div>
              <label className="block mb-1">Telegram Support Link</label>
              <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={settings.telegramLink} onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Official Support Email</label>
              <input type="email" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
            </div>
          </div>
        </div>

        {/* App Versioning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Android App Versioning</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Minimum Supported Native Version</label>
              <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={settings.minAppVersion} onChange={(e) => setSettings({ ...settings, minAppVersion: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1">Academic Content Bundle Version</label>
              <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={settings.contentVersion} onChange={(e) => setSettings({ ...settings, contentVersion: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Saving...' : 'Save Global Configurations'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppSettings;
