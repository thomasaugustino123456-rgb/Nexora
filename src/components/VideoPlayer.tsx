import React from 'react';

const getEmbedData = (url: string) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  
  // Check for direct video files
  if (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') || lowerUrl.endsWith('.mov') || lowerUrl.includes('video/upload')) {
    return { type: 'raw', url };
  }

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = url.match(ytRegex);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1], isShort: url.includes('/shorts/') };
  
  const ttRegex = /(?:tiktok\.com\/.*video\/(\d+))|(?:tiktok\.com\/t\/([a-zA-Z0-9_-]+))|(?:tiktok\.com\/@[\w.-]+\/video\/(\d+))|(?:[v|vm|vt]\.tiktok\.com\/([a-zA-Z0-9_-]+))|(?:m\.tiktok\.com\/v\/(\d+))/i;
  const ttMatch = url.match(ttRegex);
  if (ttMatch) {
    const id = ttMatch[1] || ttMatch[3] || ttMatch[5] || ttMatch[4] || ttMatch[2];
    if (id) return { type: 'tiktok', id };
  }

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { type: 'youtube', id: 'manual', rawUrl: url };
  if (lowerUrl.includes('tiktok.com')) return { type: 'tiktok', id: 'manual', rawUrl: url };
  
  return null;
};

export const VideoPlayer = ({ url, fullScreen = false }: { url: string, fullScreen?: boolean }) => {
  const embedData = getEmbedData(url);
  
  const ExternalFallback = () => (
    <div className="p-8 bg-blue-50/50 border-2 border-blue-100 rounded-3xl text-center space-y-4 shadow-inner">
      <div className="text-4xl">🎥</div>
      <div>
        <p className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none">Video Direct Link</p>
        <p className="text-[10px] text-blue-900/60 font-bold mb-4 leading-relaxed px-4">
          This clip is playing hard to catch, bro! Jump straight to the source to vibe.
        </p>
      </div>
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer" 
        className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700"
      >
        Watch Source 🚀
      </a>
    </div>
  );

  if (!embedData || embedData.id === 'manual') return <ExternalFallback />;

  if (embedData.type === 'raw') {
    return (
      <div className={`${fullScreen ? 'aspect-[9/16]' : 'aspect-video'} w-full rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-white/10 relative`}>
        <video 
          src={embedData.url} 
          controls 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  if (embedData.type === 'youtube') {
    return (
      <div className={`${fullScreen || embedData.isShort ? 'aspect-[9/16]' : 'aspect-video'} w-full rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-white/10 relative`}>
        <iframe 
           src={`https://www.youtube.com/embed/${embedData.id}?autoplay=0&rel=0&modestbranding=1`}
           className="absolute inset-0 w-full h-full border-0" 
           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
           allowFullScreen 
           referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  if (embedData.type === 'tiktok') {
    return (
      <div className="aspect-[9/16] w-full max-w-[360px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white/5 relative">
        <iframe 
          src={`https://www.tiktok.com/embed/v2/${embedData.id}`} 
          className="absolute inset-0 w-full h-full border-0" 
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return null;
};
