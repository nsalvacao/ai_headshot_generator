/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { FineTuneAdjustments } from '../types';

interface FineTunePanelProps {
    adjustments: FineTuneAdjustments;
    onAdjustmentsChange: (adjustments: FineTuneAdjustments) => void;
    onReset: () => void;
}

const ControlSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    minLabel: string;
    maxLabel: string;
    id: string;
}> = ({ label, value, onChange, minLabel, maxLabel, id }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 text-center">
            {label}
        </label>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-10 text-center">{minLabel}</span>
            <input
                id={id}
                type="range"
                min="-50"
                max="50"
                step="10"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500 w-10 text-center">{maxLabel}</span>
        </div>
    </div>
);

const FineTunePanel: React.FC<FineTunePanelProps> = ({ adjustments, onAdjustmentsChange, onReset }) => {
    const handleAdjustmentChange = (key: keyof FineTuneAdjustments, value: number) => {
        onAdjustmentsChange({ ...adjustments, [key]: value });
    };

    const hasAdjustments = Object.values(adjustments).some(v => v !== 0);

    return (
        <div className="bg-gray-50 p-4 mt-2 rounded-lg border border-gray-200 flex flex-col gap-4">
            <ControlSlider
                id="smile-slider"
                label="Expression"
                value={adjustments.smile}
                onChange={(v) => handleAdjustmentChange('smile', v)}
                minLabel="Less Smile"
                maxLabel="More Smile"
            />
            <ControlSlider
                id="hair-slider"
                label="Hair Style"
                value={adjustments.hair}
                onChange={(v) => handleAdjustmentChange('hair', v)}
                minLabel="Shorter"
                maxLabel="Longer"
            />
             <ControlSlider
                id="age-slider"
                label="Perceived Age"
                value={adjustments.age}
                onChange={(v) => handleAdjustmentChange('age', v)}
                minLabel="Younger"
                maxLabel="Older"
            />
            <ControlSlider
                id="gaze-slider"
                label="Gaze Direction"
                value={adjustments.gaze}
                onChange={(v) => handleAdjustmentChange('gaze', v)}
                minLabel="Left"
                maxLabel="Right"
            />
            <div className="pt-2 mt-2 border-t border-gray-200">
                <button 
                    onClick={onReset}
                    disabled={!hasAdjustments}
                    className="w-full text-center text-xs text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Reset Adjustments
                </button>
            </div>
        </div>
    );
}

export default FineTunePanel;