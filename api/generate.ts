
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

/**
 * Edge function to handle AI image editing requests.
 */
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { imageBase64, prompt } = await req.json();
    // Use the mandatory named parameter for API key as per SDK guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Request content generation using gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            inlineData: { 
              data: imageBase64, 
              mimeType: 'image/png' 
            } 
          },
          { text: prompt }
        ]
      }
    });

    // Iterate through all response parts to find the generated image, as per SDK guidelines.
    // Do not assume the first part is an image.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return new Response(JSON.stringify({ 
            imageData: `data:image/png;base64,${base64EncodeString}` 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    return new Response(JSON.stringify({ error: 'No image generated' }), { status: 500 });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
