import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePortrait } from './geminiService';

// Mock the @google/genai module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn(),
    },
  })),
  Modality: {
    IMAGE: 'IMAGE',
  },
}));

describe('geminiService', () => {
  describe('generatePortrait', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should throw error if API key is missing', async () => {
      const baseImageUrl = 'data:image/png;base64,validBase64';
      const prompt = 'Test prompt';
      const apiKey = '';

      await expect(
        generatePortrait(baseImageUrl, prompt, apiKey)
      ).rejects.toThrow('API Key is missing');
    });

    it('should throw error for invalid data URL (no comma)', async () => {
      const baseImageUrl = 'invalid-url-without-comma';
      const prompt = 'Test prompt';
      const apiKey = 'test-key';

      await expect(
        generatePortrait(baseImageUrl, prompt, apiKey)
      ).rejects.toThrow('Invalid data URL');
    });

    it('should throw error for invalid data URL (no MIME type)', async () => {
      const baseImageUrl = 'data:,base64data';
      const prompt = 'Test prompt';
      const apiKey = 'test-key';

      await expect(
        generatePortrait(baseImageUrl, prompt, apiKey)
      ).rejects.toThrow('Could not parse MIME type');
    });

    it('should throw error for data URL with no base64 data', async () => {
      const baseImageUrl = 'data:image/png;base64,';
      const prompt = 'Test prompt';
      const apiKey = 'test-key';

      await expect(
        generatePortrait(baseImageUrl, prompt, apiKey)
      ).rejects.toThrow('Missing data in URL');
    });
  });
});
