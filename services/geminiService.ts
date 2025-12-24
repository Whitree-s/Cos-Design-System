
export async function editImageWithAI(imageBase64: string, prompt: string): Promise<string | null> {
  try {
    // 提取纯 base64 数据
    const pureBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    
    // 请求我们自己的 Vercel API 路由
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: pureBase64,
        prompt: `Please edit this image based on the following instruction: ${prompt}. Maintain the high-quality professional photography look of this COS (Cosplay) shot. Return the edited image.`
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Server Error');
    }

    const data = await response.json();
    return data.imageData;
  } catch (error) {
    console.error("AI Editing failed:", error);
    throw error;
  }
}
