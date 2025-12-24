
import React, { useState } from 'react';
import { PosterState, PosterImage, ContentSection, TextStyle, PosterLayout } from './types';
import PosterPreview from './components/PosterPreview';
import domtoimage from 'dom-to-image-more';

const BG_PRESETS = [
  { name: '纯白空间', url: '' },
  { name: '微光噪点', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1200' },
  { name: '极简灰度', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200' },
  { name: '抽象线条', url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200' },
  { name: '哑光织物', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=1200' },
  { name: '深夜炭黑', url: 'https://images.unsplash.com/photo-1504333638930-c8787321eee0?auto=format&fit=crop&q=80&w=1200' },
];

const FONT_FAMILIES = [
  { name: '黑体 (Sans)', value: "'Noto Sans SC', sans-serif" },
  { name: '宋体 (Serif)', value: "'Noto Serif SC', serif" },
  { name: '马善政 (Calligraphy)', value: "'Ma Shan Zheng', cursive" },
  { name: '小薇 (Decorative)', value: "'ZCOOL XiaoWei', serif" },
  { name: '黄油 (Modern)', value: "'ZCOOL QingKe HuangYou', sans-serif" },
];

const LAYOUT_DEFAULTS: Record<PosterLayout, Partial<Record<keyof PosterState['styles'], number>>> = {
  classic: {
    title: 65,
    sectionTitle: 18,
    sectionContent: 14,
    intro: 18,
  },
  magazine: {
    title: 65,
    sectionTitle: 24,
    sectionContent: 23,
    intro: 18,
  },
  minimal: {
    title: 40,
    sectionTitle: 14,
    sectionContent: 12,
    intro: 14,
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<PosterState>({
    layout: 'classic',
    title: 'CN.',
    // subtitle: '视觉艺术家', 
    intro: '这里是简介 \n今日的风甚是喧嚣',
    sections: [
      { id: '1', title: 'ciallo(∠・ω)/这里是标题', content: '这里可以写定价哦' },
      { id: '2', title: 'ciallo(∠・ω)/这里是标题2', content: '这里可以写联系方式哦' },
      { id: '3', title: 'ciallo(∠・ω)/这里是标题3', content: '这里可以写行程哦' }
    ],
    watermark: '这里我也不知道写什么',
    footerLocation: '这里可以写所在城市',
    footerYear: '这里可以写日期',
    footerSuffix: 'ciallo(∠・ω)',
    footerSlogan: '"ciallo(∠・ω)ciallo(∠・ω)ciallo(∠・ω)"',
    showFooter: true,
    bgBlur: 10,
    images: [],
    watermarkPos: { x: 0, y: 0 },
    styles: {
      title: { size: 65, color: '#18181b', fontFamily: "'Noto Serif SC', serif", bold: true },
      intro: { size: 18, color: '#27272a', fontFamily: "'Noto Sans SC', sans-serif" },
      watermark: { size: 160, color: '#f4f4f5', opacity: 0.3, fontFamily: "'Noto Serif SC', serif", bold: true },
      sectionTitle: { size: 18, color: '#18181b', fontFamily: "'Noto Serif SC', serif", bold: true },
      sectionContent: { size: 14, color: '#52525b', fontFamily: "'Noto Sans SC', sans-serif" },
      footer: { size: 10, color: '#a1a1aa', fontFamily: "'Noto Sans SC', sans-serif", bold: true },
    }
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const updateStateValue = (key: keyof PosterState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleLayoutChange = (newLayout: PosterLayout) => {
    const defaults = LAYOUT_DEFAULTS[newLayout];
    setState(prev => {
      const newStyles = { ...prev.styles };
      Object.entries(defaults).forEach(([key, size]) => {
        if (newStyles[key as keyof PosterState['styles']]) {
          newStyles[key as keyof PosterState['styles']].size = size as number;
        }
      });
      return { ...prev, layout: newLayout, styles: newStyles };
    });
  };

  const updateStyle = (target: keyof PosterState['styles'], field: keyof TextStyle, value: any) => {
    setState(prev => ({
      ...prev,
      styles: { ...prev.styles, [target]: { ...prev.styles[target], [field]: value } }
    }));
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setState(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addSection = () => {
    const newSection: ContentSection = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'NEW SECTION / 新版块',
      content: '点击此处编辑内容'
    };
    setState(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const removeSection = (id: string) => {
    setState(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  const clearImages = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000);
      return;
    }
    setState(prev => ({ ...prev, images: [] }));
    setIsConfirmingClear(false);
  };

  const removeImage = (id: string) => {
    setState(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
  };

  const applyGlobalColor = (color: string) => {
    setState(prev => ({
      ...prev,
      styles: Object.keys(prev.styles).reduce((acc, key) => ({
        ...acc,
        [key]: { ...prev.styles[key as keyof PosterState['styles']], color }
      }), {} as PosterState['styles'])
    }));
  };

  const StyleControls = ({ target }: { target: keyof PosterState['styles'] }) => {
    const s = state.styles[target];
    return (
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex gap-1 items-center">
          <input 
            type="number" 
            value={s.size} 
            onChange={(e) => updateStyle(target, 'size', parseInt(e.target.value))} 
            className="w-12 p-1 bg-black/40 border border-white/10 text-[10px] rounded text-white outline-none" 
            title="字体大小"
          />
          <button 
            onClick={() => updateStyle(target, 'bold', !s.bold)}
            className={`flex-1 py-1 text-[10px] rounded border ${s.bold ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500'}`}
          >B</button>
          <button 
            onClick={() => updateStyle(target, 'italic', !s.italic)}
            className={`flex-1 py-1 text-[10px] rounded border ${s.italic ? 'bg-white text-black border-white italic' : 'border-white/10 text-zinc-500'}`}
          >I</button>
          <button 
            onClick={() => updateStyle(target, 'underline', !s.underline)}
            className={`flex-1 py-1 text-[10px] rounded border ${s.underline ? 'bg-white text-black border-white underline' : 'border-white/10 text-zinc-500'}`}
          >U</button>
          <input type="color" value={s.color} onChange={(e) => updateStyle(target, 'color', e.target.value)} className="w-8 h-6 bg-transparent rounded cursor-pointer border-none" />
        </div>
        <select 
          value={s.fontFamily} 
          onChange={(e) => updateStyle(target, 'fontFamily', e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-[9px] p-1 rounded outline-none text-white"
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value} className="text-black bg-white">{f.name}</option>)}
        </select>
      </div>
    );
  };

  const handleExport = async (type: '2k' | 'hd' | '8k') => {
    const node = document.getElementById('poster-to-export');
    if (!node) return;
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      let scale = 2;
      if (type === 'hd') scale = 4;
      if (type === '8k') scale = 8;

      const dataUrl = await domtoimage.toPng(node, {
        width: node.offsetWidth * scale,
        height: node.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: node.offsetWidth + 'px',
          height: node.offsetHeight + 'px'
        }
      });

      const now = new Date();
      const dateStr = now.getFullYear().toString() + 
                      (now.getMonth() + 1).toString().padStart(2, '0') + 
                      now.getDate().toString().padStart(2, '0');
      
      const link = document.createElement('a');
      link.download = `${state.title}_${type.toUpperCase()}_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
      alert('渲染失败，请确保所有图片已加载完成。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImg: PosterImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: url,
          type: 'square' 
        };
        setState(prev => ({ ...prev, images: [...prev.images, newImg] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setState(prev => ({ ...prev, bgImageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row font-sans text-white">
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-20 h-20 border-b-4 border-white rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-serif-sc tracking-[0.6em] uppercase text-center px-4">正在进行渲染</h2>
          <p className="mt-4 text-xs text-zinc-500 uppercase tracking-widest">请保持当前标签页处于活动状态</p>
        </div>
      )}

      <aside className="w-full md:w-[380px] bg-[#111] border-r border-white/10 p-6 flex flex-col h-screen md:sticky top-0 overflow-y-auto scrollbar-thin">
        <div className="mb-8">
          <h2 className="text-2xl font-serif-sc font-black tracking-widest mb-1 uppercase">白木海报工作台</h2>
          <p className="text-[10px] text-zinc-500 tracking-[0.5em] uppercase border-t border-white/10 pt-2">Whitree DESIGN SYSTEM</p>
        </div>

        <section className="mb-10 space-y-3">
          <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">选择排版布局</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'classic', name: '经典海报' },
              { id: 'magazine', name: '复古相册' },
              // { id: 'minimal', name: '黑白漫画' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => handleLayoutChange(l.id as PosterLayout)}
                className={`py-2 text-[10px] rounded-lg border font-bold transition-all ${state.layout === l.id ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-zinc-500 border-white/10 hover:border-white/30'}`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6 pb-12">
          <section className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
            <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">全局色调调整</h3>
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest">全局文字色</label>
              <input 
                type="color" 
                value={state.styles.title.color} 
                onChange={(e) => applyGlobalColor(e.target.value)} 
                className="w-12 h-6 bg-transparent rounded cursor-pointer border-none" 
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">头部与个人简介</h3>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase">CN(昵称)</label>
              <input type="text" value={state.title} onChange={(e) => updateStateValue('title', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-xs rounded mb-2 text-white outline-none" />
              <StyleControls target="title" />
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <label className="block text-[10px] text-zinc-500 mb-1 uppercase">个人简介</label>
              <textarea value={state.intro} onChange={(e) => updateStateValue('intro', e.target.value)} className="w-full h-20 p-2 bg-black/20 border border-white/5 text-xs rounded mb-2 resize-none text-white outline-none" />
              <StyleControls target="intro" />
            </div>
          </section>

          <section className="border-t border-white/5 pt-6 space-y-4">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">版块样式配置</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <label className="text-[9px] text-zinc-500 uppercase">版块标题</label>
                <StyleControls target="sectionTitle" />
              </div>
              <div className="p-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <label className="text-[9px] text-zinc-500 uppercase">版块正文</label>
                <StyleControls target="sectionContent" />
              </div>
            </div>
          </section>

          <section className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">正文内容管理</h3>
              <button onClick={addSection} className="text-[10px] bg-white text-black px-2 py-1 rounded font-bold hover:bg-zinc-200 transition-colors tracking-widest">+ 新增</button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {state.sections.map((section) => (
                <div key={section.id} className="p-3 bg-white/5 border border-white/10 rounded-lg relative group transition-all hover:border-white/20">
                  <button onClick={() => removeSection(section.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-[10px] transition-opacity">删除</button>
                  <input 
                    type="text" 
                    value={section.title} 
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    className="w-full bg-black/20 text-[10px] font-black tracking-widest text-white/90 border-b border-white/10 p-2 mb-2 outline-none rounded"
                    placeholder="标题"
                  />
                  <textarea 
                    value={section.content} 
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    className="w-full bg-black/20 text-[10px] text-zinc-400 h-16 resize-none outline-none leading-relaxed p-2 rounded"
                    placeholder="内容..."
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-white/5 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">页脚管理</h3>
              {!state.showFooter && (
                <button onClick={() => updateStateValue('showFooter', true)} className="text-[10px] bg-white text-black px-2 py-1 rounded font-bold hover:bg-zinc-200 transition-colors tracking-widest">+ 启用</button>
              )}
            </div>
            {state.showFooter ? (
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-3 relative group">
                <button 
                  onClick={() => updateStateValue('showFooter', false)} 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-[10px] transition-opacity"
                >删除</button>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={state.footerYear} onChange={(e) => updateStateValue('footerYear', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-[10px] rounded text-white outline-none" placeholder="2025" />
                  <input type="text" value={state.title} onChange={(e) => updateStateValue('title', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-[10px] rounded text-white outline-none" placeholder="CN.白木" title="主标题 / 名称" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={state.footerLocation} onChange={(e) => updateStateValue('footerLocation', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-[10px] rounded text-white outline-none" placeholder="地点信息" />
                  <input type="text" value={state.footerSuffix} onChange={(e) => updateStateValue('footerSuffix', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-[10px] rounded text-white outline-none" placeholder="STUDIO" />
                </div>
                <input type="text" value={state.footerSlogan} onChange={(e) => updateStateValue('footerSlogan', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-[10px] rounded text-white outline-none" placeholder="Slogan" />
                <StyleControls target="footer" />
              </div>
            ) : (
              <div className="p-4 border border-dashed border-white/10 rounded text-center">
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest">页脚模块已禁用</p>
              </div>
            )}
          </section>

          <section className="border-t border-white/5 pt-6 space-y-6">
            <div>
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">背景与效果</h3>
              <div className="grid grid-cols-6 gap-1 mb-4">
                {BG_PRESETS.map((p) => (
                  <button 
                    key={p.name}
                    onClick={() => updateStateValue('bgImageUrl', p.url)}
                    className={`w-full aspect-square border-2 ${state.bgImageUrl === p.url ? 'border-white' : 'border-white/10'} rounded overflow-hidden bg-center bg-cover`}
                    style={{ background: p.url ? `url(${p.url}) center/cover` : '#eee' }}
                    title={p.name}
                  />
                ))}
              </div>
              <div className="space-y-3">
                <div className="relative group">
                  <input type="file" onChange={handleBgUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                  <div className="py-2 border border-dashed border-white/20 text-center bg-white/5 rounded text-[10px] text-zinc-400 uppercase tracking-widest">上传背景图</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-zinc-500 uppercase tracking-widest">
                    <span>背景模糊度</span>
                    <span>{state.bgBlur}px</span>
                  </div>
                  <input type="range" min="0" max="100" step="1" value={state.bgBlur} onChange={(e) => updateStateValue('bgBlur', parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">水印调节</h3>
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-3">
                <input type="text" value={state.watermark} onChange={(e) => updateStateValue('watermark', e.target.value)} className="w-full p-2 bg-black/20 border border-white/5 text-xs rounded text-white outline-none" placeholder="水印文字" />
                <StyleControls target="watermark" />
              </div>
            </div>
          </section>

          <section className="border-t border-white/5 pt-6 space-y-4">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">摄影作品管理</h3>
            <div className="relative group">
              <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="py-8 border-2 border-dashed border-white/10 text-center bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                <span className="text-[10px] text-zinc-400 tracking-[0.3em] uppercase block">批量导入摄影图</span>
              </div>
            </div>
            <button 
              onClick={clearImages} 
              className={`w-full py-3 ${isConfirmingClear ? 'bg-red-800' : 'bg-red-600'} text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-red-500 transition-colors rounded shadow-lg`}
            >
              {isConfirmingClear ? '确认清空所有作品？' : '清空作品'}
            </button>
          </section>

          <div className="pt-6 border-t border-white/10 space-y-3 pb-12">
            <button onClick={() => handleExport('2k')} className="w-full py-3 bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-zinc-700 transition-colors rounded border border-zinc-500">导出 2K 设计样图</button>
            <button onClick={() => handleExport('hd')} className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-zinc-200 transition-colors rounded shadow-2xl">导出 4K 高清海报</button>
            <button onClick={() => handleExport('8k')} className="w-full py-4 text-white font-black text-xs uppercase tracking-[0.4em] transition-all duration-300 rounded border border-white/20 shadow-xl bg-[rgb(135,135,255)] hover:bg-[rgb(110,110,230)] hover:scale-[1.02]">导出 8K 无损海报 (原画品质)</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-2 md:p-3 overflow-y-auto bg-[#0a0a0a]">
        <PosterPreview 
          state={state} 
          onUpdateState={updateStateValue}
          onUpdateSection={updateSection}
          onRemoveImage={removeImage}
          onUploadImages={handleFileUpload}
          onReorderImages={(dragged, target) => {
             setState(prev => {
                const newImgs = [...prev.images];
                const fromIdx = newImgs.findIndex(i => i.id === dragged);
                const toIdx = newImgs.findIndex(i => i.id === target);
                const [moved] = newImgs.splice(fromIdx, 1);
                newImgs.splice(toIdx, 0, moved);
                return { ...prev, images: newImgs };
              });
          }}
        />
      </main>
    </div>
  );
};

export default App;
