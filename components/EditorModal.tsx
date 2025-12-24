
import React, { useState } from 'react';
import { PosterImage } from '../types';
import { editImageWithAI } from '../services/geminiService';

interface EditorModalProps {
  image: PosterImage | null;
  onClose: () => void;
  onUpdate: (updatedUrl: string) => void;
}

const EditorModal: React.FC<EditorModalProps> = ({ image, onClose, onUpdate }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!image) return null;

  const handleEdit = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    try {
      const editedUrl = await editImageWithAI(image.url, prompt);
      if (editedUrl) {
        onUpdate(editedUrl);
        onClose();
      } else {
        setError('未能生成修改后的图像，请尝试不同的描述。');
      }
    } catch (err) {
      setError('AI 编辑过程中出现错误，请检查网络或 API Key 设置。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-4">
          <img src={image.url} alt="to edit" className="max-h-[70vh] w-auto shadow-lg" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">AI 创意编辑</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              输入您的需求，让 Gemini 2.5 Flash 智能编辑您的摄影作品。
              <br/>例如：“添加怀旧复古滤镜”、“增加背景樱花特效”、“让光影更具电影感”。
            </p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all resize-none mb-4"
              placeholder="描述您想对图片进行的改动..."
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleEdit}
              disabled={loading || !prompt}
              className="flex-[2] py-3 px-6 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </>
              ) : '开始 AI 编辑'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
