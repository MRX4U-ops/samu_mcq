import React, { useState } from 'react';
import { 
  Settings, Bell, AlertTriangle, Shield, 
  Send, Save, CheckCircle2, MessageCircle, Smartphone
} from 'lucide-react';

const AppSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    announcementBanner: '🔥 FREE THIS MONTH: Use coupon TRH100 for 100% discount!',
    telegramLink: 'https://t.me/mrx4u',
    minAppVersion: '1.0.8',
    contentVersion: '2.4.0',
    supportEmail: 'samumcqs@gmail.com',
    upiId: 'mrx4u@ybl',
    standardPrice: 49
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('ssmu_app_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {saved && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold bg-emerald-600 text-white animate-in slide-in-from-top duration-200">
          <span>App configuration saved successfully!</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">App Control & Global Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage live mobile application parameters, maintenance, and announcements</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Maintenance Mode Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              settings.maintenanceMode ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">App Maintenance Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">When active, students see a maintenance screen while database updates occur.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              settings.maintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
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
          <p className="text-xs text-slate-500">Displayed at the top of the Home Dashboard across Student Web and Android App.</p>
          <input
            type="text"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={settings.announcementBanner}
            onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
          />
        </div>

        {/* Payment & Subscription Defaults */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Payment Gateway Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Default UPI ID</label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Standard Plan Price (INR)</label>
              <input
                type="number"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.standardPrice}
                onChange={(e) => setSettings({ ...settings, standardPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block mb-1">Telegram Help Community</label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.telegramLink}
                onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Official Support Email</label>
              <input
                type="email"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* App Versioning */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">Android App Versioning & OTA</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1">Minimum Supported Native Version</label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.minAppVersion}
                onChange={(e) => setSettings({ ...settings, minAppVersion: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1">Academic Content Bundle Version</label>
              <input
                type="text"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={settings.contentVersion}
                onChange={(e) => setSettings({ ...settings, contentVersion: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Save size={16} />
            <span>Save Global Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppSettings;
