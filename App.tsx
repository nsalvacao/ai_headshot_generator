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
import Footer from './components/Footer';
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
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {!baseImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-screen min-h-screen flex items-start sm:items-center justify-center bg-gray-50 p-4 pb-20"
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
            className="relative flex flex-col h-screen bg-white overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden">
              <div className="w-full h-full flex-grow flex items-center justify-center bg-gray-50/50 relative">
                <ImageGallery 
                  baseImage={baseImageUrl}
                  generatedImages={generatedImages}
                  onStartOver={handleStartOver}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>

              <aside className="md:flex-shrink-0 w-full md:w-1/3 md:max-w-sm bg-white flex flex-col border-t md:border-t-0 md:border-l border-gray-200/60">
                <div className="p-4 md:p-6 pb-20 overflow-y-auto flex-grow flex flex-col gap-8">
                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                      <p className="font-bold">Error</p>
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
                  className="fixed inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Spinner />
                  <p className="text-lg font-serif text-gray-700 mt-4 text-center px-4">Generating...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer isOnDressingScreen={!!baseImageUrl} />
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