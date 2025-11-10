/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    if (!mimeMatch?.[1]) throw new Error("Could not parse MIME type from data URL");
    const data = arr[1];
    if (!data) throw new Error("Missing data in URL");
    return { mimeType: mimeMatch[1], data };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

const model = 'gemini-2.5-flash-image';

export const generatePortrait = async (baseImageUrl: string, fullPrompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is missing. Please set your API Key in the settings.");
    }
    const baseImagePart = dataUrlToPart(baseImageUrl);
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [baseImagePart, { text: fullPrompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return handleApiResponse(response);
};
