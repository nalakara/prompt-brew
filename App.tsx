import React, { useState, useEffect, useCallback } from 'react';
import { PROMPT_CONFIG, LANGUAGES, translations } from './constants';
import type { AIModelCategory, PromptData, UserProfile } from './types';
import { SelectInput } from './components/SelectInput';
import { TextInput } from './components/TextInput';
import { PromptPreview } from './components/PromptPreview';
import { refinePrompt } from './services/geminiService';
import { LoadingSpinner, WandSparklesIcon, CopyIcon, CheckIcon, ShareIcon, SettingsIcon } from './components/Icons';
import { ProfileModal } from './components/ProfileModal';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  preferredLanguage: 'id',
  favoriteCategory: Object.keys(PROMPT_CONFIG)[0] as AIModelCategory,
  customContext: '',
  customApiKey: '',
};

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [languageCode, setLanguageCode] = useState<string>('id');
  const [selectedCategory, setSelectedCategory] = useState<AIModelCategory>(Object.keys(PROMPT_CONFIG)[0] as AIModelCategory);
  const [selectedModel, setSelectedModel] = useState<string>(Object.keys(PROMPT_CONFIG[selectedCategory].models)[0]);
  const [selectedPurpose, setSelectedPurpose] = useState<string>(Object.keys(PROMPT_CONFIG[selectedCategory].purposes)[0]);
  const [promptData, setPromptData] = useState<PromptData>({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [refinedPromptCopied, setRefinedPromptCopied] = useState(false);
  const [error, setError] = useState('');

  const t = translations[languageCode];
  const currentConfig = PROMPT_CONFIG[selectedCategory];
  const currentPurpose = currentConfig.purposes[selectedPurpose];
  const currentFields = currentPurpose?.fields || [];
  const languageName = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';

  // Load profile from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prompt_brew_profile');
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setUserProfile(parsed);
        if (parsed.preferredLanguage) {
          setLanguageCode(parsed.preferredLanguage);
        }
        if (parsed.favoriteCategory) {
          setSelectedCategory(parsed.favoriteCategory);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored profile:', e);
    }
  }, []);

  const handleSaveProfile = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('prompt_brew_profile', JSON.stringify(updatedProfile));
    if (updatedProfile.preferredLanguage) {
      setLanguageCode(updatedProfile.preferredLanguage);
    }
    if (updatedProfile.favoriteCategory) {
      setSelectedCategory(updatedProfile.favoriteCategory);
    }
  }, []);

  useEffect(() => {
    const firstModel = Object.keys(currentConfig.models)[0];
    const firstPurpose = Object.keys(currentConfig.purposes)[0];
    setSelectedModel(firstModel);
    setSelectedPurpose(firstPurpose);
    setPromptData({});
    setRefinedPrompt('');
    setError('');
  }, [selectedCategory, currentConfig]);

  useEffect(() => {
    if (currentPurpose) {
      const newPrompt = currentPurpose.template(promptData, languageName);
      setGeneratedPrompt(newPrompt);
    }
  }, [promptData, currentPurpose, languageName]);
  
  const handleInputChange = useCallback((id: string, value: string) => {
    setPromptData(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleRefinePrompt = async () => {
    if (!generatedPrompt) return;
    setIsRefining(true);
    setRefinedPrompt('');
    setError('');
    try {
      const modelName = t[currentConfig.models[selectedModel].nameKey];
      const purposeName = t[currentPurpose.nameKey];
      const result = await refinePrompt(
        generatedPrompt,
        modelName,
        purposeName,
        languageName,
        userProfile.customApiKey,
        userProfile.customContext
      );
      setRefinedPrompt(result);
    } catch (e) {
      setError(t.refineError);
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyRefinedPrompt = useCallback(() => {
    if (!refinedPrompt) return;
    navigator.clipboard.writeText(refinedPrompt);
    setRefinedPromptCopied(true);
    setTimeout(() => setRefinedPromptCopied(false), 2000);
  }, [refinedPrompt]);

  const handleShareRefinedPrompt = useCallback(async () => {
    if (!refinedPrompt) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.appTitle,
          text: refinedPrompt,
        });
      } catch (error) {
        // This error is thrown if the user cancels the share dialogue.
        // We can safely ignore it as it's an expected user action, not a bug.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Share failed:', error);
      }
    }
  }, [refinedPrompt, t.appTitle]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-text flex flex-col">
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {/* Modern Navigation Header with Profile settings */}
        <nav className="flex items-center justify-between max-w-7xl mx-auto mb-8 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">PROMPT BREW</span>
            {userProfile.name && (
              <span className="hidden sm:inline-block text-xs bg-indigo-900/40 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                Hi, <strong>{userProfile.name}</strong>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-brand-border bg-brand-surface text-brand-text rounded-lg hover:border-indigo-500/40 hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200 text-sm font-semibold animate-fade-in"
          >
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            <span>{t.profileSettingsBtn}</span>
          </button>
        </nav>

        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            {t.appTitle}
          </h1>
          <p className="mt-2 text-lg text-brand-text-secondary">{t.appSubtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column: Controls */}
          <div className="bg-brand-surface rounded-xl shadow-lg p-6 space-y-6 border border-brand-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label={t.categoryLabel}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as AIModelCategory)}
                options={Object.keys(PROMPT_CONFIG).map(key => ({ value: key, label: t[PROMPT_CONFIG[key as AIModelCategory].nameKey] }))}
                Icon={PROMPT_CONFIG[selectedCategory].icon}
              />
              <SelectInput
                label={t.modelLabel}
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                options={Object.keys(currentConfig.models).map(key => ({ value: key, label: t[currentConfig.models[key].nameKey] }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <SelectInput
                label={t.purposeLabel}
                value={selectedPurpose}
                onChange={e => setSelectedPurpose(e.target.value)}
                options={Object.keys(currentConfig.purposes).map(key => ({ value: key, label: t[currentConfig.purposes[key].nameKey] }))}
              />
              <SelectInput
                label={t.languageLabel}
                value={languageCode}
                onChange={e => setLanguageCode(e.target.value)}
                options={LANGUAGES.map(lang => ({ value: lang.code, label: lang.name }))}
              />
            </div>
            
            <hr className="border-brand-border" />

            <div className="space-y-4 animate-fade-in">
              {currentFields.map(field => (
                <TextInput
                  key={field.id}
                  id={field.id}
                  label={t[field.labelKey]}
                  placeholder={t[field.placeholderKey]}
                  value={promptData[field.id] || ''}
                  onChange={handleInputChange}
                  type={field.type}
                  required={field.required}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Preview & Refinement */}
          <div className="bg-brand-surface rounded-xl shadow-lg p-6 border border-brand-border flex flex-col">
            <PromptPreview 
              prompt={generatedPrompt} 
              onCopy={() => navigator.clipboard.writeText(generatedPrompt)}
              title={t.previewTitle}
              placeholder={t.previewPlaceholder}
              copyAriaLabel={t.copyPrompt}
            />
            
            <div className="mt-4 pt-4 border-t border-brand-border">
              <button
                onClick={handleRefinePrompt}
                disabled={isRefining || !generatedPrompt}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-primary disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {isRefining ? (
                  <>
                    <LoadingSpinner />
                    {t.refiningButton}
                  </>
                ) : (
                  <>
                    <WandSparklesIcon className="w-5 h-5" />
                    {t.refineButton}
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
            
            {(isRefining || refinedPrompt) && (
              <div className="mt-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-brand-text-secondary">{t.geminiSuggestionTitle}</h3>
                    {!isRefining && refinedPrompt && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleCopyRefinedPrompt}
                          className="p-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-brand-text-secondary hover:text-white"
                          aria-label={t.copyPrompt}
                        >
                          {refinedPromptCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                        {typeof navigator !== 'undefined' && navigator.share && (
                          <button
                            onClick={handleShareRefinedPrompt}
                            className="p-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-brand-text-secondary hover:text-white"
                            aria-label={t.sharePrompt}
                          >
                            <ShareIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                   <div className="flex-grow bg-gray-900/50 p-4 rounded-md border border-brand-border min-h-[100px]">
                      {isRefining ? 
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner />
                        </div> 
                        :
                        <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{refinedPrompt}</p>
                      }
                  </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-brand-text-secondary text-sm">
        by NALAKARA
      </footer>

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
        currentProfile={userProfile}
        t={t}
        languageCode={languageCode}
      />
    </div>
  );
};

export default App;