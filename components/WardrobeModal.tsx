/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { WandIcon, SlidersIcon, ChevronDownIcon } from './icons';
import Spinner from './Spinner';
import { FineTuneAdjustments } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import FineTunePanel from './FineTunePanel';

interface StylePanelProps {
  onGenerate: (prompt: string, title: string) => void;
  isLoading: boolean;
  isGeneratorConfigured: boolean;
}

const PREDEFINED_STYLES = [
    { name: 'Professional Headshot', prompt: 'A professional corporate headshot, wearing a dark business suit, in a modern office with a blurred background. The lighting is soft and flattering.' },
    { name: 'Casual Half-Body', prompt: 'A casual, friendly half-body photo, smiling warmly, wearing a simple t-shirt or sweater, with a soft, out-of-focus outdoor background.' },
    { name: 'Fashion Full-Body', prompt: 'A stylish full-body shot, standing confidently in a fashionable outfit, in an urban city street setting.' },
    { name: 'Social Media Profile', prompt: 'A clean and confident photo for a social media profile, looking approachable and friendly, against a simple, neutral background.' },
    { name: 'Profile Picture', prompt: 'A clear, well-lit headshot suitable for a professional profile picture, with a neutral background and friendly expression.' },
    { name: 'Artistic Side-View', prompt: 'An artistic and creative side-profile portrait, with dramatic studio lighting against a dark background.' },
    { name: 'Classic B&W', prompt: 'A timeless, classic black and white portrait, high contrast, focused on expression and character.' },
    { name: 'Vintage Photo', prompt: 'A vintage-style portrait, sepia-toned, resembling a photograph from the 1940s. The clothing and background should match the era.' },
    { name: 'Cyberpunk', prompt: 'A cyberpunk-style portrait, set in a futuristic city with neon lights. The person should have futuristic clothing or subtle cybernetic enhancements.' },
    { name: 'Fantasy Art', prompt: 'A fantasy art portrait, reimagining the person as a fantasy character like an elf or a warrior, with ornate armor, in an enchanted forest setting.' }
];

const ASPECT_RATIOS = [
    { name: 'Square', value: '1:1' },
    { name: 'Portrait', value: '4:5' },
    { name: 'Widescreen', value: '16:9' },
];

const initialAdjustments: FineTuneAdjustments = { smile: 0, hair: 0, age: 0, gaze: 0 };

const buildAdjustmentPrompt = (adjustments: FineTuneAdjustments): string => {
    const prompts: string[] = [];
    if (adjustments.smile > 0) prompts.push(`- Increase the smile slightly. Intensity: ${adjustments.smile}%.`);
    if (adjustments.smile < 0) prompts.push(`- Decrease the smile slightly. Intensity: ${-adjustments.smile}%.`);
    if (adjustments.hair > 0) prompts.push(`- Make the hair slightly longer. Intensity: ${adjustments.hair}%.`);
    if (adjustments.hair < 0) prompts.push(`- Make the hair slightly shorter. Intensity: ${-adjustments.hair}%.`);
    if (adjustments.age > 0) prompts.push(`- Make the person appear slightly older. Intensity: ${adjustments.age}%.`);
    if (adjustments.age < 0) prompts.push(`- Make the person appear slightly younger. Intensity: ${-adjustments.age}%.`);
    if (adjustments.gaze > 0) prompts.push(`- Shift the gaze slightly to the person's right. Intensity: ${adjustments.gaze}%.`);
    if (adjustments.gaze < 0) prompts.push(`- Shift the gaze slightly to the person's left. Intensity: ${-adjustments.gaze}%.`);
    
    if (prompts.length === 0) {
        return "";
    }

    return "\n**Subtle Adjustments:** Also apply the following subtle adjustments to the person's features, ensuring they look natural:\n" + prompts.join("\n");
};


const StylePanel: React.FC<StylePanelProps> = ({ onGenerate, isLoading, isGeneratorConfigured }) => {
    const [selectedStyle, setSelectedStyle] = useState(PREDEFINED_STYLES[0]);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [adjustments, setAdjustments] = useState<FineTuneAdjustments>(initialAdjustments);
    const [isFineTunePanelOpen, setIsFineTunePanelOpen] = useState(false);

    useEffect(() => {
        const adjustmentPrompt = buildAdjustmentPrompt(adjustments);
        const fullPrompt = `You are an expert AI photographer. Use the provided image of a person to generate a new, high-quality, photorealistic portrait based on the following request: "${selectedStyle.prompt}".
${adjustmentPrompt}
**Crucial Rules:**
1. **Preserve Identity:** The person's face, identity, ethnicity, and key facial features MUST be accurately preserved.
2. **Apply Style & Framing:** Change the clothing, background, lighting, pose, and framing to match the request.
3. **Aspect Ratio:** The final image must have a ${aspectRatio} aspect ratio.
4. **Photorealistic Output:** The final image must be photorealistic and high-resolution.
5. **Output:** Return ONLY the final, generated image. Do not include any text.`;
        
        setFinalPrompt(fullPrompt);
    }, [selectedStyle, aspectRatio, adjustments]);

    const handleGenerateClick = () => {
        if (!isLoading && finalPrompt.trim() && isGeneratorConfigured) {
            onGenerate(finalPrompt.trim(), selectedStyle.name);
        }
    }
    
    const handleResetAdjustments = () => {
      setAdjustments(initialAdjustments);
    }

  return (
    <div className="flex flex-col gap-6 h-full text-slate-100">
        {/* Style selection */}
        <div>
            <h2 className="text-xl font-serif tracking-wider text-slate-100 border-b border-white/10 pb-3 mb-4">1. Choose a Style</h2>
            <div className="grid grid-cols-2 gap-3">
                {PREDEFINED_STYLES.map((style) => (
                <button
                    key={style.name}
                    onClick={() => setSelectedStyle(style)}
                    disabled={isLoading}
                    className={`w-full text-center font-semibold py-2 px-3 rounded-md transition-all duration-200 ease-in-out active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedStyle.name === style.name
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white border-none shadow-[0_10px_30px_rgba(79,70,229,0.35)]'
                        : 'bg-slate-900/40 border border-white/10 text-slate-200 hover:border-white/30 hover:bg-slate-900/60'
                    }`}
                    title={style.prompt}
                >
                    {style.name}
                </button>
                ))}
            </div>
        </div>
        
        {/* Customization */}
        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-serif tracking-wider text-slate-100">2. Customize</h2>
            
            {/* Aspect Ratio */}
            <div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">Aspect Ratio</h3>
                <div className="flex items-center gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                        <button
                            key={ratio.value}
                            onClick={() => setAspectRatio(ratio.value)}
                            disabled={isLoading}
                            className={`flex-1 text-center font-semibold py-2 px-3 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                aspectRatio === ratio.value 
                                ? 'bg-slate-800 text-white border border-white/20 shadow-[0_5px_20px_rgba(15,23,42,0.5)]' 
                                : 'bg-slate-900/30 border border-white/10 text-slate-300 hover:border-white/30 hover:bg-slate-900/50'
                            }`}
                        >
                            {`${ratio.name} (${ratio.value})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Advanced Adjustments */}
            <div>
                <button 
                    onClick={() => setIsFineTunePanelOpen(!isFineTunePanelOpen)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between text-left font-semibold py-2 px-3 rounded-md transition-colors text-sm bg-slate-900/40 text-slate-200 hover:bg-slate-900/60 border border-white/10"
                >
                    <div className="flex items-center">
                        <SlidersIcon className="w-4 h-4 mr-2" />
                        Advanced Adjustments
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isFineTunePanelOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isFineTunePanelOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                           <FineTunePanel 
                              adjustments={adjustments}
                              onAdjustmentsChange={setAdjustments}
                              onReset={handleResetAdjustments}
                           />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Final Prompt */}
        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-serif tracking-wider text-slate-100">3. Review Your Prompt</h2>
            <p className="text-sm text-slate-300">This is the final prompt that will be sent to the AI. You can edit it below to refine your request.</p>
            <textarea
                id="final-prompt"
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
                placeholder="Describe the portrait you want to create..."
                disabled={isLoading}
                className="w-full p-3 border border-white/10 rounded-md bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400/70 focus:border-transparent transition-shadow resize-none disabled:opacity-60 disabled:bg-slate-900/30 text-sm"
                rows={8}
            />
        </div>

        {/* Generate Button */}
        <div className="mt-auto pt-6 border-t border-white/10 pb-8">
            <button 
                onClick={handleGenerateClick}
                disabled={isLoading || !finalPrompt.trim() || !isGeneratorConfigured}
                className="w-full flex items-center justify-center text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-white font-semibold py-3 px-4 rounded-lg transition-transform duration-200 ease-in-out hover:shadow-[0_20px_45px_rgba(79,70,229,0.35)] active:scale-95 text-base shadow-[0_10px_30px_rgba(79,70,229,0.35)] disabled:opacity-60 disabled:saturate-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Spinner />
                        <span className="ml-2">Generating...</span>
                    </>
                ) : (
                    <>
                        <WandIcon className="w-5 h-5 mr-2" />
                        Generate
                    </>
                )}
            </button>
            {!isGeneratorConfigured && (
                <p className="text-xs text-center text-rose-300 mt-2">
                    Please configure your model in the Settings menu to enable generation.
                </p>
            )}
        </div>
    </div>
  );
};

export default StylePanel;
