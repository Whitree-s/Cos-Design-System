
export type ImageType = 'square' | 'vertical' | 'wide';
export type PosterLayout = 'classic' | 'magazine' | 'minimal';

export interface TextStyle {
  size: number;
  color: string;
  opacity?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
}

export interface PosterImage {
  id: string;
  url: string;
  type: ImageType;
  label?: string;
}

export interface PosterState {
  layout: PosterLayout;
  title: string; 
  subtitle: string;
  intro: string;
  sections: ContentSection[]; 
  watermark: string;      
  footerLocation: string; 
  footerYear: string;    
  footerSuffix: string;  
  footerSlogan: string;
  showFooter: boolean;
  bgImageUrl?: string;    
  bgBlur: number;         
  images: PosterImage[];
  qrCodeUrl?: string;
  watermarkPos: { x: number; y: number };
  styles: {
    title: TextStyle;
    intro: TextStyle;
    watermark: TextStyle;
    sectionTitle: TextStyle;
    sectionContent: TextStyle;
    footer: TextStyle;
  };
}

export enum LayoutType {
  Waterfall = 'waterfall',
}
