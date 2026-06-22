import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface PromptPreviewProps {
  prompt: string;
  onCopy: () => void;
  title: string;
  placeholder: string;
  copyAriaLabel: string;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ prompt, onCopy, title, placeholder, copyAriaLabel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-brand-text">{title}</h2>
        <button
          onClick={handleCopyClick}
          className="p-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-brand-text-secondary hover:text-white"
          aria-label={copyAriaLabel}
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-grow bg-gray-900/50 p-4 rounded-md border border-brand-border min-h-[200px]">
        {prompt ? (
            <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{prompt}</p>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-brand-text-secondary">{placeholder}</p>
            </div>
        )}
      </div>
    </div>
  );
};