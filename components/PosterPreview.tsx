
import React, { useState, useMemo, useRef } from 'react';
import { PosterState, PosterImage, TextStyle } from '../types';

interface PosterPreviewProps {
  state: PosterState;
  onUpdateState: (key: keyof PosterState, value: any) => void;
  onUpdateSection: (id: string, field: 'title' | 'content', value: string) => void;
  onRemoveImage: (id: string) => void;
  onReorderImages: (draggedId: string, targetId: string) => void;
  onUploadImages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageItem: React.FC<{ 
  image: PosterImage; 
  onRemove: (id: string) => void; 
  onDragStart: any; 
  onDrop: any;
  showIndex?: string;
  layout: 'classic' | 'magazine' | 'minimal';
  transformData?: { rotate: number; translateX: number; translateY: number };
}> = ({ image, onRemove, onDragStart, onDrop, showIndex, layout, transformData }) => {
  const [isOver, setIsOver] = useState(false);
  const isLayout2 = layout === 'magazine';
  
  const style = isLayout2 && transformData ? {
    transform: `rotate(${transformData.rotate}deg) translate(${transformData.translateX}px, ${transformData.translateY}px)`,
  } : {};

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, image.id)}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => { setIsOver(false); onDrop(e, image.id); }}
      className={`group relative transition-all duration-700 cursor-move ${
        isLayout2 
          ? 'p-1.5 bg-white border border-black/10 shadow-[5px_5px_15_rgba(0,0,0,0.1)] hover:z-50 hover:scale-[1.08] hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2)]' 
          : 'mb-6 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
      } ${isOver ? 'ring-2 ring-black scale-[0.98]' : ''}`}
      style={style}
    >
      <div className="overflow-hidden bg-zinc-50">
        <img src={image.url} alt="work" className="w-full h-auto block transition-transform duration-1000 group-hover:scale-110 pointer-events-none" />
      </div>
      
      {isLayout2 && (
        <div className="mt-1.5 flex items-center justify-between px-0.5">
           <div className="text-[5px] text-black/30 font-mono tracking-tighter uppercase italic">FILM_P.ST_0{showIndex}</div>
           <div className="text-[5px] text-black/30 font-mono tracking-tighter uppercase">SAFETY_CHECK</div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none no-print">
        <button onClick={(e) => { e.stopPropagation(); onRemove(image.id); }} className="bg-red-500 text-white w-8 h-8 rounded-full pointer-events-auto flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

const PosterPreview: React.FC<PosterPreviewProps> = ({ state, onUpdateState, onUpdateSection, onRemoveImage, onReorderImages, onUploadImages }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const placeholderInputRef = useRef<HTMLInputElement>(null);

  const photoTransforms = useMemo(() => {
    return state.images.map(() => ({
      rotate: (Math.random() * 6 - 3),
      translateX: (Math.random() * 20 - 10),
      translateY: (Math.random() * 20 - 10),
    }));
  }, [state.images.length]);

  const handleBlurText = (key: keyof PosterState, e: React.FocusEvent<HTMLElement>) => {
    onUpdateState(key, e.currentTarget.innerText);
  };

  const handleBlurSection = (id: string, field: 'title' | 'content', e: React.FocusEvent<HTMLElement>) => {
    onUpdateSection(id, field, e.currentTarget.innerText);
  };

  const handleQrClick = () => {
    qrInputRef.current?.click();
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateState('qrCodeUrl', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceholderClick = () => {
    placeholderInputRef.current?.click();
  };

  const getStyleObject = (s: TextStyle) => ({
    fontSize: `${s.size}px`,
    color: s.color,
    opacity: s.opacity ?? 1,
    fontWeight: s.bold ? '900' : 'normal',
    fontStyle: s.italic ? 'italic' : 'normal',
    textDecoration: s.underline ? 'underline' : 'none',
    fontFamily: s.fontFamily || 'inherit',
    lineHeight: '1.2'
  });

  const EditableText = ({ value, stateKey, className, tag: Tag = 'div', target, forceColor }: any) => {
    const s = state.styles[target as keyof PosterState['styles']];
    const styleObj = getStyleObject(s);
    if (forceColor) styleObj.color = forceColor;
    
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        onBlur={(e: any) => handleBlurText(stateKey, e)}
        className={`${className} outline-none transition-colors px-1 -mx-1 rounded cursor-text whitespace-pre-wrap relative z-20`}
        style={styleObj}
      >
        {value}
      </Tag>
    );
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      onReorderImages(draggedId, targetId);
    }
    setDraggedId(null);
  };

  const EmptyPlaceholder = ({ layout }: { layout: string }) => {
    const isClassic = layout === 'classic';
    const isMag = layout === 'magazine';
    
    return (
      <div 
        onClick={handlePlaceholderClick}
        className={`col-span-full py-32 border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group/placeholder hover:bg-black/5 ${
        isClassic ? 'border-zinc-200 rounded-lg mx-2 md:mx-4' : 
        isMag ? 'border-black/10 bg-white/40 shadow-inner rounded-sm' : 
        'border-zinc-100 rounded-lg'
      }`}>
        <input 
          type="file" 
          multiple 
          ref={placeholderInputRef} 
          onChange={onUploadImages} 
          className="hidden" 
          accept="image/*" 
        />
        <div className={`mb-6 w-16 h-16 flex items-center justify-center rounded-full border transition-transform group-hover/placeholder:scale-110 ${isClassic ? 'border-zinc-300 text-zinc-300' : 'border-black/20 text-black/20'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </div>
        <p className={`text-sm tracking-[0.5em] uppercase font-black transition-colors group-hover/placeholder:text-black/60 ${isClassic ? 'text-zinc-400 font-serif-sc' : 'text-black/30 font-mono'}`}>
          {isClassic ? '点击此处上传作品' : 'CLICK TO IMPORT PORTFOLIO...'}
        </p>
      </div>
    );
  };

  const renderClassic = () => {
    const columns: PosterImage[][] = [[], [], []];
    state.images.forEach((img, index) => columns[index % 3].push(img));

    return (
      <div className="flex flex-col flex-1 gap-6 min-h-full">
        <header className="relative z-10 flex flex-col gap-6 pb-6 border-b border-zinc-900/10 px-2 md:px-4">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[120px]">
            <div className="flex flex-col items-start md:pr-12 relative z-20">
              <EditableText tag="h1" stateKey="title" value={state.title} target="title" className="tracking-tight leading-none" />
              <div className="h-2 w-32 bg-zinc-900 mt-4 opacity-90 shadow-sm" style={{ backgroundColor: state.styles.title.color }}></div>
            </div>
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[1.5px] bg-zinc-900/10 z-10"></div>
            <div className="flex flex-col items-start md:pl-20 relative z-20 mt-6 md:mt-0">
              <EditableText stateKey="intro" value={state.intro} target="intro" className="leading-relaxed tracking-wide whitespace-pre-wrap" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4 relative z-10 pt-2">
            {state.sections.map((section) => (
              <div key={section.id} className="group/sec space-y-2 border-l-[4px] border-zinc-900/10 pl-5 transition-all hover:border-zinc-900/40">
                <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(section.id, 'title', e)} className="tracking-[0.4em] uppercase pb-1 border-b border-zinc-900/[0.04] outline-none focus:bg-zinc-100/10 rounded cursor-text" style={getStyleObject(state.styles.sectionTitle)}>{section.title}</div>
                <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(section.id, 'content', e)} className="leading-relaxed whitespace-pre-wrap outline-none focus:bg-zinc-100/10 rounded cursor-text" style={getStyleObject(state.styles.sectionContent)}>{section.content}</div>
              </div>
            ))}
          </div>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10 px-2 md:px-4 flex-1 items-start">
          {state.images.length === 0 ? (
            <EmptyPlaceholder layout="classic" />
          ) : (
            columns.map((col, i) => (
              <div key={i} className="flex flex-col">
                {col.map((img, idx) => <ImageItem key={img.id} image={img} onRemove={onRemoveImage} onDragStart={onDragStart} onDrop={onDrop} layout="classic" showIndex={`${idx * 3 + i + 1}`} />)}
              </div>
            ))
          )}
        </div>

        {state.showFooter && (
          <footer className="relative z-10 pt-4 border-t border-zinc-900/10 px-4 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-2">
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-6" style={getStyleObject(state.styles.footer)}>
                  <span className="font-black tracking-[0.3em]">{state.footerYear}</span>
                  <span className="w-8 h-[1px] bg-zinc-300"></span>
                  <span className="tracking-[0.5em]">{state.title}</span>
                  <span className="tracking-[0.5em]">{state.footerSuffix}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 text-right">
                <div style={getStyleObject(state.styles.footer)} className="opacity-60 tracking-[0.2em] uppercase whitespace-nowrap">{state.footerLocation}</div>
                <div className="hidden md:block w-px h-3 bg-zinc-900/20"></div>
                <div className="italic opacity-40 font-serif-sc whitespace-nowrap" style={{ fontSize: '12px' }}>{state.footerSlogan}</div>
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  };

  const renderMagazine = () => {
    return (
      <div className="flex flex-col relative z-10 min-h-screen bg-[rgb(255,247,219)] text-black overflow-visible p-6 border-[15px] border-white shadow-2xl">
        <header className="relative z-[100] flex flex-col lg:flex-row items-start gap-[20px] mb-12">
           <div className="flex items-start no-print group/id-tags transition-all duration-700 hover:scale-[1.01] flex-nowrap shrink-0 lg:-ml-16 relative w-fit z-[130]">
              <div className="flex flex-col items-start relative">
                {/* 名称卡片 */}
                <div className="bg-[#000000] text-white flex flex-col items-center shadow-[25px_25px_60px_rgba(0,0,0,0.5)] transform -rotate-3 group-hover/id-tags:-rotate-1 z-[150] shrink-0 mt-2 ml-4 border border-white/5 rounded-[1.5px] relative overflow-hidden transition-all duration-500 w-fit min-w-[150px]">
                  <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between py-2 text-[4px] font-mono text-zinc-600 z-10 select-none">
                      <span className="opacity-60">▸ 24A</span>
                      <div className="flex flex-col gap-0.5 opacity-30">
                        <div className="w-1 h-[1.5px] bg-cyan-400"></div>
                        <div className="w-1 h-[1.5px] bg-magenta-400"></div>
                        <div className="w-1 h-[1.5px] bg-yellow-400"></div>
                      </div>
                      <span className="opacity-60">25</span>
                  </div>
                  <div className="w-full flex justify-around py-1 bg-black/80 border-b border-white/5">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className="w-[5px] h-[3.5px] bg-white rounded-[0.5px] shadow-[0_0.5px_1px_rgba(255,255,255,0.4),inset_0_1px_1px_rgba(0,0,0,0.4)]"></div>
                      ))}
                  </div>
                  <div className="px-8 py-0.5 flex flex-col items-center relative min-w-full bg-gradient-to-r from-transparent via-white/5 to-transparent">
                      <div className="absolute right-2 top-0 bottom-0 flex gap-[0.5px] opacity-[0.05] scale-y-150 h-full py-2">
                        {[1,2,1,1,3,1,2,1,4,1,1,2,1].map((w, i) => <div key={i} className="bg-white" style={{ width: `${w}px` }}></div>)}
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="text-[9.5px] font-mono text-[#FFB000] tracking-[0.4em] uppercase font-black leading-none">PANCHROMATIC SAFETY</div>
                      </div>
                      <EditableText tag="h1" stateKey="title" value={state.title} target="title" forceColor="#ffffff" className="text-[30px] font-black tracking-[-0.08em] uppercase leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,1)] whitespace-nowrap" />
                      <div className="mt-1 flex items-center gap-3">
                        <div className="text-[8.5px] font-mono opacity-50 tracking-[0.2em] uppercase italic font-black">FILM.A0{state.images.length}</div>
                        <div className="w-[1px] h-3 bg-white/30"></div>
                        <div className="text-[8px] font-mono text-[#FFB000]/90 font-black tracking-widest leading-none">K-PRO ISO 400</div>
                      </div>
                  </div>
                  <div className="w-full flex justify-around py-1 bg-black/80 border-t border-white/5">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className="w-[5px] h-[3.5px] bg-white rounded-[0.5px] shadow-[0_0.5px_1px_rgba(255,255,255,0.4),inset_0_1px_1px_rgba(0,0,0,0.4)]"></div>
                      ))}
                  </div>
                </div>

                {/* 二维码卡片 */}
                <div 
                  onClick={handleQrClick}
                  className="absolute bottom-[-130px] left-12 w-[150px] h-[150px] bg-white p-2 shadow-2xl border border-black/5 transform rotate-6 hover:rotate-3 hover:scale-105 transition-all duration-300 z-[160] cursor-pointer group/qr rounded-[1px]"
                >
                  <div className="w-full h-full border border-black/5 flex items-center justify-center bg-zinc-50 overflow-hidden relative">
                    {state.qrCodeUrl ? (
                      <img src={state.qrCodeUrl} alt="QR Code" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 px-2 text-center">
                        <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        <span className="text-[14px] font-mono text-zinc-400 tracking-tighter uppercase font-black leading-tight">点击上传二维码</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center">
                       <span className="text-[12px] text-white font-black tracking-widest uppercase">更换二维码</span>
                    </div>
                  </div>
                  <input type="file" ref={qrInputRef} onChange={handleQrFileChange} className="hidden" accept="image/*" />
                </div>
              </div>
              
              {/* 简介卡片 */}
              <div className="bg-white pl-0 pr-4 py-3 w-fit shadow-[30px_30px_70px_rgba(0,0,0,0.05)] border border-black/[0.02] transform rotate-1 -ml-4 group-hover/id-tags:rotate-0 z-[120] flex flex-col transition-all duration-500 overflow-visible shrink-0 relative">
                 <div className="flex items-center gap-5 mb-3 pl-6">
                    <div className="text-[6px] font-mono opacity-25 tracking-[1em] uppercase whitespace-nowrap">Visual Archive .02</div>
                    <div className="h-[0.5px] bg-black/[0.04] flex-1"></div>
                 </div>
                 <div className="flex-1 w-full overflow-visible">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleBlurText('intro', e)}
                      className="outline-none transition-colors rounded cursor-text relative z-20 text-[11px] font-serif-sc opacity-90 border-l-[4px] border-black/10 pl-6 italic whitespace-nowrap w-fit" 
                      style={getStyleObject(state.styles.intro)}
                    >
                      <span className="inline-block whitespace-pre">{state.intro}</span>
                    </div>
                 </div>
                 <div className="mt-5 pt-3 border-t border-black/[0.015] flex justify-between items-center w-full pl-6">
                    <div className="flex gap-2.5 items-center">
                       <div className="w-1 h-1 bg-black/10 rounded-full animate-pulse"></div>
                       <div className="text-[5px] font-mono opacity-20 tracking-[0.4em] uppercase">Document Verified</div>
                    </div>
                    <div className="text-[5.5px] font-mono opacity-40 font-black tracking-widest italic">{state.footerYear} EDITION</div>
                 </div>
              </div>
           </div>

           <div className="flex flex-wrap justify-start gap-x-[20px] gap-y-7 text-left w-fit mt-6 lg:mt-0 relative z-[110]">
              {state.sections.map((s, idx) => (
                <div key={s.id} className="group/sec w-fit min-w-[120px]">
                   <div className="text-[7px] font-mono opacity-30 mb-1 tracking-[0.5em] uppercase italic">MOD.0{idx+1}</div>
                   <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(s.id, 'title', e)} className="text-[14px] font-black uppercase tracking-tight border-b-2 border-black/5 pb-1.5 mb-2 outline-none group-hover/sec:border-black transition-all whitespace-nowrap" style={getStyleObject(state.styles.sectionTitle)}>{s.title}</div>
                   <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(s.id, 'content', e)} className="text-[12px] font-bold opacity-75 leading-relaxed outline-none whitespace-pre-wrap break-words" style={getStyleObject(state.styles.sectionContent)}>{s.content}</div>
                </div>
              ))}
           </div>
        </header>

        <main className="relative z-10 flex-1 mt-0">
           {state.images.length === 0 ? (
             <EmptyPlaceholder layout="magazine" />
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 lg:gap-6">
                {state.images.map((img, idx) => (
                  <div key={img.id} className="relative">
                     <ImageItem 
                       image={img} 
                       onRemove={onRemoveImage} 
                       onDragStart={onDragStart} 
                       onDrop={onDrop} 
                       layout="magazine"
                       showIndex={`${idx + 1}`}
                       transformData={photoTransforms[idx]}
                     />
                  </div>
                ))}
             </div>
           )}
        </main>

        {state.showFooter && (
          <footer className="mt-8 pt-4 px-10 bg-[#fdfaf0] border border-[#eeeadd] shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
             <div className="flex items-center gap-8 pb-3">
                <div className="flex items-baseline gap-3">
                   <div className="text-xl font-black tracking-tighter italic text-black/90 drop-shadow-sm font-serif-sc uppercase leading-none">
                      {state.title}
                   </div>
                   <div className="text-[7px] tracking-[0.4em] font-mono opacity-30 uppercase font-black">{state.footerSuffix}</div>
                </div>
                <div className="h-4 w-[1px] bg-black/10"></div>
                <div className="flex items-center gap-6">
                   <div className="text-[9px] tracking-[0.3em] font-bold text-black/50 uppercase">{state.footerLocation}</div>
                   <div className="text-[8px] font-mono opacity-25 tracking-[0.4em] font-black">{state.footerYear}</div>
                </div>
             </div>
             <div className="flex items-center gap-6 pb-3">
                <div className="text-[11px] font-serif-sc italic opacity-60 tracking-tight leading-none">
                   {state.footerSlogan}
                </div>
             </div>
          </footer>
        )}
      </div>
    );
  };

  const renderMinimal = () => {
    return (
      <div className="flex flex-col gap-8 max-w-[1000px] mx-auto relative z-10 px-4 text-center flex-1 min-h-full">
        <header className="space-y-3 py-6">
          <EditableText tag="h1" stateKey="title" value={state.title} target="title" className="tracking-widest uppercase text-xl font-black" />
          <div className="w-10 h-px bg-black mx-auto"></div>
          <EditableText stateKey="intro" value={state.intro} target="intro" className="max-w-md mx-auto leading-relaxed text-[10px] opacity-60 font-serif-sc whitespace-pre-wrap break-words" />
        </header>

        <div className="flex flex-col gap-12 flex-1">
          {state.images.length === 0 ? (
            <EmptyPlaceholder layout="minimal" />
          ) : (
            state.images.map((img, idx) => (
              <div key={img.id} className="group flex flex-col items-center w-full">
                <div className="w-full">
                  <ImageItem image={img} onRemove={onRemoveImage} onDragStart={onDragStart} onDrop={onDrop} layout="minimal" />
                </div>
                {idx % 3 === 0 && state.sections[Math.floor(idx / 3)] && (
                  <div className="mt-8 mb-4 space-y-3 max-w-sm mx-auto border-y border-zinc-100 py-6 w-full">
                     <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(state.sections[Math.floor(idx / 3)].id, 'title', e)} className="text-[9px] uppercase tracking-[0.5em] font-black opacity-30">{state.sections[Math.floor(idx / 3)].title}</div>
                     <div contentEditable suppressContentEditableWarning onBlur={(e) => handleBlurSection(state.sections[Math.floor(idx / 3)].id, 'content', e)} className="text-[11px] leading-loose opacity-60 whitespace-pre-wrap break-words">{state.sections[Math.floor(idx / 3)].content}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {state.showFooter && (
          <footer className="relative z-10 pt-4 border-t border-zinc-900/10 px-4 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-4">
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-6" style={getStyleObject(state.styles.footer)}>
                  <span className="font-black tracking-[0.3em]">{state.footerYear}</span>
                  <span className="w-8 h-[1px] bg-zinc-300"></span>
                  <span className="tracking-[0.5em]">{state.title}</span>
                  <span className="tracking-[0.5em]">{state.footerSuffix}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 text-right">
                <div style={getStyleObject(state.styles.footer)} className="opacity-60 tracking-[0.2em] uppercase whitespace-nowrap">{state.footerLocation}</div>
                <div className="hidden md:block w-px h-3 bg-zinc-900/20"></div>
                <div className="italic opacity-40 font-serif-sc whitespace-nowrap" style={{ fontSize: '12px' }}>{state.footerSlogan}</div>
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  };

  return (
    <div id="poster-to-export" className="max-w-[1400px] mx-auto bg-white text-zinc-900 shadow-2xl p-2 md:p-4 lg:p-6 flex flex-col gap-8 min-h-screen relative overflow-hidden transition-all duration-300">
      {state.bgImageUrl && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-500"
          style={{ 
            backgroundImage: `url(${state.bgImageUrl})`,
            filter: `blur(${state.bgBlur}px)`,
            transform: `scale(${1 + (state.bgBlur / 400)})`,
          }}
        />
      )}

      <div className="absolute inset-0 z-[1] pointer-events-none select-none flex items-center justify-center overflow-hidden">
        <span className="whitespace-nowrap tracking-tighter w-full text-center transition-all duration-300 ease-out" style={getStyleObject(state.styles.watermark)}>{state.watermark}</span>
      </div>

      <div className="flex-1 flex flex-col">
        {state.layout === 'classic' && renderClassic()}
        {state.layout === 'magazine' && renderMagazine()}
        {state.layout === 'minimal' && renderMinimal()}
      </div>
    </div>
  );
};

export default PosterPreview;
