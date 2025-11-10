import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateWithCustomModel } from './customModelService';

// Mock fetch globally
global.fetch = vi.fn();

describe('customModelService', () => {
  describe('generateWithCustomModel', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should throw error for invalid data URL (no comma)', async () => {
      const baseImageUrl = 'invalid-url';
      const prompt = 'Test prompt';
      const apiUrl = 'http://localhost:11434/api/generate';
      const modelName = 'llava';

      await expect(
        generateWithCustomModel(baseImageUrl, prompt, apiUrl, modelName)
      ).rejects.toThrow('Invalid data URL');
    });

    it('should throw error for data URL with no base64 data', async () => {
      const baseImageUrl = 'data:image/png;base64,';
      const prompt = 'Test prompt';
      const apiUrl = 'http://localhost:11434/api/generate';
      const modelName = 'llava';

      await expect(
        generateWithCustomModel(baseImageUrl, prompt, apiUrl, modelName)
      ).rejects.toThrow('Missing base64 data in URL');
    });

    it('should throw error when API request fails', async () => {
      const baseImageUrl = 'data:image/png;base64,validBase64Data';
      const prompt = 'Test prompt';
      const apiUrl = 'http://localhost:11434/api/generate';
      const modelName = 'llava';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(
        generateWithCustomModel(baseImageUrl, prompt, apiUrl, modelName)
      ).rejects.toThrow('Custom model API request failed with status 500');
    });

    it('should throw error when response does not contain image', async () => {
      const baseImageUrl = 'data:image/png;base64,validBase64Data';
      const prompt = 'Test prompt';
      const apiUrl = 'http://localhost:11434/api/generate';
      const modelName = 'llava';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: 'No image generated' }),
      });

      await expect(
        generateWithCustomModel(baseImageUrl, prompt, apiUrl, modelName)
      ).rejects.toThrow('Custom model response did not contain a valid image');
    });

    it('should successfully generate image with valid inputs', async () => {
      const baseImageUrl = 'data:image/png;base64,validBase64Data';
      const prompt = 'Test prompt';
      const apiUrl = 'http://localhost:11434/api/generate';
      const modelName = 'llava';
      const mockImageBase64 = 'generatedImageBase64';

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ image: mockImageBase64 }),
      });

      const result = await generateWithCustomModel(
        baseImageUrl,
        prompt,
        apiUrl,
        modelName
      );

      expect(result).toBe(`data:image/png;base64,${mockImageBase64}`);
      expect(global.fetch).toHaveBeenCalledWith(
        apiUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });
});
