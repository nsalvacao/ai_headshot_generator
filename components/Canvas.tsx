/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { RotateCcwIcon, DownloadIcon, SettingsIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { GeneratedImage } from '../types';

interface ImageGalleryProps {
  baseImage: string;
  generatedImages: GeneratedImage[];
  onStartOver: () => void;
  onOpenSettings: () => void;
}

const ImageCard: React.FC<{
  image: GeneratedImage | {id: string, url: string, status: 'done', prompt: string},
}> = ({ image }) => {
  const { id, url, status, prompt } = image;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any other click events
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    // Sanitize prompt for filename
    const fileName = `ai-portrait-${prompt.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}.png`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative aspect-square w-full rounded-2xl shadow-lg overflow-hidden group bg-slate-900/40 border border-white/10"
    >
      {status === 'loading' && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Spinner />
          <p className="text-xs text-slate-300 mt-2 text-center px-1">Generating...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="w-full h-full flex items-center justify-center bg-rose-900/30">
          <p className="text-xs text-rose-200 text-center p-2">Generation failed</p>
        </div>
      )}
      {url && status !== 'loading' && (
        <img src={url} alt={prompt} className="w-full h-full object-cover" />
      )}
      
      {/* Hover Overlay for actions and info */}
      {status === 'done' && url && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2">
          {/* Action Buttons (Top Right) */}
          <div className="self-end flex items-center gap-1.5">
              {id !== 'base' && (
                <>
                  <button 
                    onClick={handleDownload}
                    className="bg-white/20 backdrop-blur-sm text-white rounded-full p-1.5 transition-colors hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white"
                    title="Download image"
                    aria-label="Download image"
                  >
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                </>
              )}
          </div>

          {/* Prompt Text (Bottom Left) */}
          <div className="text-white text-xs self-start">
            <p className="font-semibold truncate">{prompt}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ baseImage, generatedImages, onStartOver, onOpenSettings }) => {
  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 text-slate-100">
      <header className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif text-slate-100">Your Gallery</h1>
        <div className="flex items-center gap-2">
            <button 
                onClick={onOpenSettings}
                className="flex items-center justify-center text-center bg-slate-900/30 border border-white/10 text-slate-100 font-semibold py-2 px-2 rounded-full transition-all duration-200 ease-in-out hover:border-white/40 hover:bg-slate-900/60 active:scale-95 text-sm"
                title="Settings"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={onStartOver}
                className="flex items-center justify-center text-center bg-slate-900/30 border border-white/10 text-slate-100 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:border-white/40 hover:bg-slate-900/60 active:scale-95 text-sm"
            >
                <RotateCcwIcon className="w-4 h-4 mr-2" />
                Start Over
            </button>
        </div>
      </header>
      
      <div className="flex-grow overflow-y-auto">
        <AnimatePresence>
          {generatedImages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-300 mb-6 p-5 bg-slate-900/30 rounded-2xl border border-white/10"
            >
              <p className="font-serif text-lg">Ready to create?</p>
              <p className="text-sm">Your generated portraits will appear here.</p>
              <p className="text-sm">Use the panel to select a style or write your own prompt.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((img) => (
                <ImageCard key={img.id} image={img} />
            ))}
            <ImageCard image={{id: 'base', url: baseImage, status: 'done', prompt: 'Original Photo'}} />
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
