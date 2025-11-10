/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';
import { ModelConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
  initialConfig: ModelConfig | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [provider, setProvider] = useState<'gemini' | 'custom'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setProvider(initialConfig.provider || 'gemini');
      setApiKey(initialConfig.apiKey || '');
      setCustomUrl(initialConfig.customUrl || '');
      setCustomModel(initialConfig.customModel || '');
    }
  }, [initialConfig, isOpen]);

  const handleSave = () => {
    const config: ModelConfig = {
      provider,
      apiKey: provider === 'gemini' ? apiKey : '',
      customUrl: provider === 'custom' ? customUrl : '',
      customModel: provider === 'custom' ? customModel : '',
    };
    onSave(config);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-slate-950 rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg relative text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-serif text-slate-100">Settings</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors rounded-full p-1"
                aria-label="Close settings"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </header>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Model Provider</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="provider" value="gemini" checked={provider === 'gemini'} onChange={() => setProvider('gemini')} className="form-radio text-slate-100 focus:ring-indigo-400/70"/>
                    <span>Google Gemini</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="provider" value="custom" checked={provider === 'custom'} onChange={() => setProvider('custom')} className="form-radio text-slate-100 focus:ring-indigo-400/70"/>
                    <span>Custom (Ollama, etc.)</span>
                  </label>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {provider === 'gemini' ? (
                  <motion.div
                    key="gemini"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">API Configuration</h3>
                    <label htmlFor="api-key" className="block text-sm font-medium text-slate-300">
                      Your Gemini API Key
                    </label>
                    <div className="relative mt-1">
                      <input id="api-key" type={isKeyVisible ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-3 py-2 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-transparent pr-10" placeholder="Enter your API key"/>
                      <button type="button" onClick={() => setIsKeyVisible(!isKeyVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200" aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {isKeyVisible ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Google AI Studio</a>. By default, the app uses <span className="font-mono bg-slate-900/40 border border-white/10 px-1.5 py-0.5 rounded">gemini-2.5-flash-image</span>.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">Custom Model Configuration</h3>
                      <label htmlFor="custom-url" className="block text-sm font-medium text-slate-300">Model API URL</label>
                      <input id="custom-url" type="text" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} className="mt-1 w-full px-3 py-2 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-transparent" placeholder="e.g., http://localhost:11434/api/generate"/>
                      <p className="text-xs text-slate-400 mt-1">The endpoint for your custom model.</p>
                    </div>
                    <div>
                      <label htmlFor="custom-model" className="block text-sm font-medium text-slate-300">Model Name</label>
                      <input id="custom-model" type="text" value={customModel} onChange={(e) => setCustomModel(e.target.value)} className="mt-1 w-full px-3 py-2 border border-white/10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/70 focus:border-transparent" placeholder="e.g., llava"/>
                      <p className="text-xs text-slate-400 mt-1">The name of the model to use (e.g., as used by Ollama).</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <footer className="flex items-center justify-end p-4 bg-slate-900/30 border-t border-white/10 rounded-b-2xl">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-200 bg-slate-900/40 border border-white/10 rounded-md hover:border-white/30 hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400/70 focus:ring-offset-slate-950">
                Cancel
              </button>
              <button onClick={handleSave} className="ml-3 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 border border-transparent rounded-md hover:shadow-[0_20px_45px_rgba(79,70,229,0.35)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400/70 focus:ring-offset-slate-950">
                Save Settings
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
