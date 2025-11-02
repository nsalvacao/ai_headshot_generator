/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon } from './icons';
import Spinner from './Spinner';

interface StartScreenProps {
  onImageUploaded: (imageUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onImageUploaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageUploaded(dataUrl);
        setIsLoading(false);
    };
    reader.onerror = () => {
        setError('Failed to read the image file.');
        setIsLoading(false);
    }
    reader.readAsDataURL(file);
  }, [onImageUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner />
          <p className="mt-4 text-lg font-serif text-gray-700">Processing your photo...</p>
        </div>
      ) : (
        <>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
            Generate Professional Portraits Instantly.
          </h1>
          <p className="mt-4 text-lg max-w-2xl text-gray-600">
            Upload a photo and our AI will generate a variety of portraits in different styles. Perfect for LinkedIn, resumes, or social media.
          </p>
          <hr className="my-8 border-gray-200 w-1/4" />
          <div className="flex items-center justify-center w-full max-w-xs">
            <label htmlFor="image-upload-start" className="w-full relative flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-lg cursor-pointer group hover:bg-gray-700 transition-colors">
              <UploadCloudIcon className="w-5 h-5 mr-3" />
              Upload Photo
            </label>
            <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
          </div>
          <p className="text-gray-500 text-sm mt-4">Select a clear, well-lit photo of your face.</p>
          <p className="text-gray-500 text-xs mt-1">By uploading, you agree not to create harmful, explicit, or unlawful content. This service is for creative and responsible use only.</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};

export default StartScreen;