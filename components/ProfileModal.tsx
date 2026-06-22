import React, { useState, useEffect } from 'react';
import type { UserProfile, Translations } from '../types';
import { AIModelCategory } from '../types';
import { PROMPT_CONFIG, LANGUAGES } from '../constants';
import { CloseIcon, UserIcon } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile;
  t: Translations;
  languageCode: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  t,
  languageCode,
}) => {
  const [profile, setProfile] = useState<UserProfile>({ ...currentProfile });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile({ ...currentProfile });
      setSaveSuccess(false);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));

    if (field === 'customApiKey') {
      if (value && !value.trim().startsWith('AIzaSy')) {
        setApiKeyWarning(
          languageCode === 'id'
            ? 'Kunci API Gemini biasanya dimulai dengan "AIzaSy"'
            : 'Gemini API keys typically start with "AIzaSy"'
        );
      } else {
        setApiKeyWarning(null);
      }
    }
  };

  const handleSave = () => {
    onSave(profile);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-brand-surface border border-brand-border w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              {t.profileTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-brand-text-secondary hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              {t.profileName}
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder={t.profileNamePlaceholder}
              className="w-full px-3 py-2 bg-gray-900 border border-brand-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              {t.profileLanguage}
            </label>
            <select
              value={profile.preferredLanguage}
              onChange={(e) => handleTextChange('preferredLanguage', e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Favorite Category */}
          <div>
            <label className="block text-sm font-medium text-brand-text mb-1">
              {t.profileFavCategory}
            </label>
            <select
              value={profile.favoriteCategory}
              onChange={(e) => handleTextChange('favoriteCategory', e.target.value as AIModelCategory)}
              className="w-full px-3 py-2 bg-gray-900 border border-brand-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {Object.keys(PROMPT_CONFIG).map((key) => (
                <option key={key} value={key}>
                  {t[PROMPT_CONFIG[key as AIModelCategory].nameKey]}
                </option>
              ))}
            </select>
          </div>

          {/* Personalization Context */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-brand-text">
                {t.profileContext}
              </label>
              <span className="text-xs text-brand-text-secondary">
                {profile.customContext.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={profile.customContext}
              onChange={(e) => handleTextChange('customContext', e.target.value)}
              placeholder={t.profileContextPlaceholder}
              className="w-full px-3 py-2 bg-gray-900 border border-brand-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm leading-relaxed"
            />
          </div>

          {/* API Key */}
          <div className="pt-2 border-t border-brand-border">
            <h3 className="text-sm font-bold text-indigo-400 mb-1">
              {t.profileApiKey}
            </h3>
            <p className="text-xs text-brand-text-secondary mb-3 leading-relaxed">
              {t.customApiKeyInfo}
            </p>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={profile.customApiKey}
                onChange={(e) => handleTextChange('customApiKey', e.target.value)}
                placeholder={t.profileApiKeyPlaceholder}
                className="w-full pl-3 pr-20 py-2 bg-gray-900 border border-brand-border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-brand-text-secondary hover:text-white bg-gray-800 rounded border border-brand-border transition-colors font-medium"
              >
                {showApiKey ? (languageCode === 'id' ? 'Sembunyikan' : 'Hide') : (languageCode === 'id' ? 'Tampilkan' : 'Show')}
              </button>
            </div>
            {apiKeyWarning && (
              <p className="text-amber-400 text-xs mt-1 font-medium">{apiKeyWarning}</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-brand-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent text-brand-text-secondary hover:text-white font-semibold rounded-md border border-brand-border hover:bg-gray-800 transition-colors"
          >
            {languageCode === 'id' ? 'Batal' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className="min-w-[120px] px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-md transition-colors disabled:bg-green-600 disabled:cursor-not-allowed"
          >
            {saveSuccess ? (
              <span className="flex items-center justify-center gap-1">
                ✓ {languageCode === 'id' ? 'Tersimpan!' : 'Saved!'}
              </span>
            ) : (
              t.profileSave
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
