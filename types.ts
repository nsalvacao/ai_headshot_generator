/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface GeneratedImage {
  id: string;
  url: string | null;
  status: 'loading' | 'done' | 'error';
  prompt: string;
}

export interface FineTuneAdjustments {
  smile: number;
  hair: number;
  age: number;
  gaze: number;
}

export interface ModelConfig {
  provider: 'gemini' | 'custom';
  apiKey?: string;
  customUrl?: string;
  customModel?: string;
}