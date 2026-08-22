// client/src/pages/artisan/ArtisanSettings.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function ArtisanSettings() {
  const { user, updateArtisanProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [region, setRegion] = useState(user?.region || 'Bihar');
  const [accountNumber, setAccountNumber] = useState(user?.bank_details_mock?.account_number || '');
  const [ifscCode, setIfscCode] = useState(user?.bank_details_mock?.ifsc_code || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.bank_details_mock?.profile_photo_url || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateArtisanProfile({
        name,
        phone,
        region,
        accountNumber,
        ifscCode,
        profilePhotoUrl
      });
      toast.success('Artisan profile settings updated successfully!');
    } catch {
      toast.error('Failed to save profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen font-inter p-8 md:p-12">
      <div className="max-w-xl mx-auto bg-white rounded-xl border border-outline-variant p-8 shadow-sm">
        
        {/* Header */}
        <div className="border-b border-outline-variant pb-6 mb-6">
          <h1 className="font-hanken text-primary text-3xl font-bold">Profile & Settings</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage your artisan identity, payout bank accounts, and languages.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Avatar Settings */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline-variant bg-surface-container flex items-center justify-center flex-shrink-0">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">person</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">Artisan Profile Photo URL</label>
              <input
                type="text"
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
                placeholder="Paste profile photo URL..."
                className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
              />
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">State / Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
            />
          </div>

          {/* Bank Details */}
          <div className="border-t border-outline-variant pt-6 mt-6">
            <h3 className="text-primary font-hanken font-bold text-lg mb-4">Payout Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 123456789012"
                  className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
                />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="e.g. PYTM0123456"
                  className="w-full bg-surface-lowest border border-outline-variant rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-action-cyan focus:ring-1 focus:ring-action-cyan"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-outline-variant pt-6 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-trust-blue text-on-primary py-2.5 px-6 rounded-lg font-bold hover:bg-primary transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
