/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import ImageGallery from './components/Canvas';
import StylePanel from './components/WardrobeModal';
import { generatePortrait } from './services/geminiService';
import { generateWithCustomModel } from './services/customModelService';
import { GeneratedImage, ModelConfig } from './types';
import { getFriendlyErrorMessage } from './lib/utils';
import Spinner from './components/Spinner';
import SettingsModal from './components/SettingsModal';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', listener);
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};


const App: React.FC = () => {
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  useEffect(() => {
    // Load model config from local storage on initial render
    const storedConfig = localStorage.getItem('model-config');
    if (storedConfig) {
      setModelConfig(JSON.parse(storedConfig));
    } else {
      setModelConfig({ provider: 'gemini' }); // Default config
    }
  }, []);

  const handleImageUploaded = (url: string) => {
    setBaseImageUrl(url);
    setGeneratedImages([]);
  };

  const handleStartOver = () => {
    setBaseImageUrl(null);
    setGeneratedImages([]);
    setError(null);
    setIsGenerating(false);
  };

  const handleSaveSettings = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    localStorage.setItem('model-config', JSON.stringify(newConfig));
    setIsSettingsOpen(false);
  };

  const isGeneratorConfigured = useCallback(() => {
    if (!modelConfig) return false;
    if (modelConfig.provider === 'gemini') {
      return !!modelConfig.apiKey;
    }
    if (modelConfig.provider === 'custom') {
      return !!modelConfig.customUrl && !!modelConfig.customModel;
    }
    return false;
  }, [modelConfig]);

  const handleGenerate = useCallback(async (prompt: string, title: string) => {
    if (!baseImageUrl || isGenerating || !modelConfig) return;
    if (!isGeneratorConfigured()) {
      setError("Model is not configured. Please set it up in the Settings menu.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const newImageId = `img-${Date.now()}`;
    const placeholder: GeneratedImage = {
        id: newImageId,
        url: null,
        status: 'loading',
        prompt: title,
    };
    setGeneratedImages(prev => [placeholder, ...prev]);

    try {
        let imageUrl: string;
        if (modelConfig.provider === 'gemini') {
          if (!modelConfig.apiKey) throw new Error("Gemini API key is missing.");
          imageUrl = await generatePortrait(baseImageUrl, prompt, modelConfig.apiKey);
        } else if (modelConfig.provider === 'custom') {
          if (!modelConfig.customUrl || !modelConfig.customModel) throw new Error("Custom model URL or name is missing.");
          imageUrl = await generateWithCustomModel(baseImageUrl, prompt, modelConfig.customUrl, modelConfig.customModel);
        } else {
          throw new Error("Invalid model provider selected.");
        }
        
        setGeneratedImages(prev => prev.map(img =>
            img.id === newImageId ? { ...img, url: imageUrl, status: 'done' } : img
        ));
    } catch (err) {
        setError(getFriendlyErrorMessage(err, 'Failed to generate image'));
        setGeneratedImages(prev => prev.map(img =>
            img.id === newImageId ? { ...img, status: 'error' } : img
        ));
    } finally {
        setIsGenerating(false);
    }
  }, [baseImageUrl, isGenerating, modelConfig, isGeneratorConfigured]);

  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {!baseImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-full min-h-screen flex items-start sm:items-center justify-center p-4 pb-24"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <StartScreen onImageUploaded={handleImageUploaded} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="relative flex flex-col h-screen bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_25px_80px_rgba(2,6,23,0.65)] rounded-[32px] overflow-hidden mx-auto max-w-[1400px] w-full"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden gap-6 p-4 md:p-8">
              <div className="w-full h-full flex-grow flex items-center justify-center bg-gradient-to-br from-slate-900/20 via-slate-900/60 to-slate-900/20 rounded-3xl border border-white/5 relative">
                <ImageGallery 
                  baseImage={baseImageUrl}
                  generatedImages={generatedImages}
                  onStartOver={handleStartOver}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>

              <aside className="md:flex-shrink-0 w-full md:w-[420px] bg-slate-950/60 flex flex-col border-t md:border-t-0 md:border-l border-white/10 rounded-3xl md:rounded-3xl">
                <div className="p-5 md:p-8 pb-24 overflow-y-auto flex-grow flex flex-col gap-8 text-slate-100">
                  {error && (
                    <div className="bg-rose-900/30 border-l-4 border-rose-500 text-rose-100 p-4 rounded-md" role="alert">
                      <p className="font-bold text-rose-100">Error</p>
                      <p>{error}</p>
                    </div>
                  )}
                  <StylePanel
                    onGenerate={handleGenerate}
                    isLoading={isGenerating}
                    isGeneratorConfigured={isGeneratorConfigured()}
                  />
                </div>
              </aside>
            </main>
            <AnimatePresence>
              {isGenerating && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Spinner />
                  <p className="text-lg font-semibold text-slate-100 mt-4 text-center px-4">Generating...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialConfig={modelConfig}
      />
    </div>
  );
};

export default App;
