/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Generates a portrait using a custom model endpoint (e.g., an Ollama server).
 * Assumes the endpoint accepts a JSON payload with a model name, prompt, and a base64 encoded image.
 * Assumes the endpoint returns a JSON response with a base64 encoded image.
 */

const dataUrlToBase64 = (dataUrl: string): string => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    return arr[1];
}

export const generateWithCustomModel = async (
    baseImageUrl: string,
    fullPrompt: string,
    apiUrl: string,
    modelName: string
): Promise<string> => {
    
    const base64Image = dataUrlToBase64(baseImageUrl);

    const requestBody = {
        model: modelName,
        prompt: fullPrompt,
        images: [base64Image],
        stream: false
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Custom model API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();
    
    // Ollama's image-to-image with LLaVA might return the new image in a different field.
    // We'll assume the response contains a field `image` with the base64 data.
    // This part may need to be adjusted based on the specific custom model's output format.
    if (responseData && responseData.image) {
        // Assuming the response is a base64 string, prepend with data URI scheme
        return `data:image/png;base64,${responseData.image}`;
    }

    throw new Error('Custom model response did not contain a valid image. The response was: ' + JSON.stringify(responseData));
};