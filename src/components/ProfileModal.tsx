import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Camera, User, Phone, Globe, Mail, Check, X, Upload } from 'lucide-react';

interface ProfileModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  onClose,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [country, setCountry] = useState(currentUser.country);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customAvatarUrl.trim()) {
      setAvatar(customAvatarUrl.trim());
      setCustomAvatarUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      email,
      phone,
      country,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bento-card max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-bold font-serif text-white">Éditer mon Profil & Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white font-serif">Profil mis à jour !</h4>
            <p className="text-xs text-slate-400">Vos modifications et votre photo de profil ont été enregistrées.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Avatar & Change Controls */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Photo de Profil (Avatar)
              </label>

              <div className="flex items-center space-x-4">
                <div className="relative group shrink-0">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-lg"
                  />
                  <label className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2 flex-1">
                  <label className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-2 cursor-pointer transition w-fit">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Uploader une photo depuis l'appareil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Ou coller une URL d'image..."
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-emerald-400 hover:bg-slate-700 cursor-pointer"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Avatar Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Ou choisissez parmi nos suggestions :</span>
                <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-2">
                  {SAMPLE_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                        avatar === url ? 'border-emerald-400 scale-105 ring-2 ring-emerald-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nom complet</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Adresse Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Téléphone (Mobile Money)</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pays de résidence</span>
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
              >
                Enregistrer le Profil
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
