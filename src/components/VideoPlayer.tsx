import React, { useState, useEffect } from 'react';

const getEmbedData = (url: string) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  
  // Check for local storage videos
  if (lowerUrl.startsWith('local://') || lowerUrl.startsWith('blob:')) {
    return { type: 'local', id: url.replace('local://', '') };
  }
  
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

export const VideoPlayer = ({ url, fullScreen = false, mediaSequence, audioUrl }: { url: string, fullScreen?: boolean, mediaSequence?: any[], audioUrl?: string }) => {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const activeMediaSequence = mediaSequence && mediaSequence.length > 0 ? mediaSequence : null;
  const currentUrl = activeMediaSequence ? activeMediaSequence[currentClipIndex].url : url;
  
  const embedData = getEmbedData(currentUrl);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Sync seek when clip changes on same source
  useEffect(() => {
    if (activeMediaSequence && videoRef.current) {
      const clip = activeMediaSequence[currentClipIndex];
      if (clip) {
        const targetTime = clip.trimStart || 0;
        // If we are on the same URL, we just seek instead of reloading
        if (Math.abs(videoRef.current.currentTime - targetTime) > 0.5) {
          videoRef.current.currentTime = targetTime;
        }
      }
    }
  }, [currentClipIndex, activeMediaSequence]);

  useEffect(() => {
    // Sync audio with video play/pause
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
    }
  }, [audioUrl]);

  useEffect(() => {
    // Reset index if sequence changes
    setCurrentClipIndex(0);
  }, [mediaSequence]);

  useEffect(() => {
    if (embedData?.type === 'local' || currentUrl.startsWith('blob:')) {
      if (currentUrl.startsWith('blob:')) {
        setLocalUrl(currentUrl);
      } else if (embedData?.type === 'local') {
        const loadLocal = async () => {
          try {
            const { getMediaFromLocal } = await import('../lib/localMedia');
            const blob = await getMediaFromLocal(embedData.id);
            if (blob) {
              setLocalUrl(URL.createObjectURL(blob));
            }
          } catch (e) {
            console.error("Error loading local media:", e);
          }
        };
        loadLocal();
      }
    }
  }, [currentUrl, embedData?.type, embedData?.id]);

  const onVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!activeMediaSequence) return;
    const video = e.currentTarget;
    const clip = activeMediaSequence[currentClipIndex];
    if (!clip) return;
    
    const endTime = (clip.trimStart || 0) + (clip.duration || video.duration);
    if (video.currentTime >= endTime) {
      setCurrentClipIndex((currentClipIndex + 1) % activeMediaSequence.length);
    }
  };

  const onVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setHasError(false);
    const video = e.currentTarget;
    const clip = activeMediaSequence ? activeMediaSequence[currentClipIndex] : null;
    if (clip?.trimStart) {
      video.currentTime = clip.trimStart;
    }
    video.play().catch(() => {});
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const onVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video Player Load Error:", e);
    setHasError(true);
  };

  const onVideoPlay = () => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const onVideoPause = () => {
    if (audioRef.current) audioRef.current.pause();
  };

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

  if ((embedData.type === 'local' && localUrl) || embedData.type === 'raw' || activeMediaSequence) {
    const videoSrc = localUrl || embedData.url || currentUrl;
    return (
      <div className={`${fullScreen ? 'aspect-[9/16]' : 'aspect-video'} w-full rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-white/10 relative`}>
        {audioUrl && (
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            loop 
            className="hidden"
          />
        )}
        <video 
          ref={videoRef}
          key={videoSrc} // ONLY re-mount if the source file changed
          src={videoSrc} 
          controls={!fullScreen}
          autoPlay 
          muted={fullScreen || !!audioUrl} // Mute video if we have custom background audio
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onTimeUpdate={onVideoTimeUpdate}
          onLoadedMetadata={onVideoLoadedMetadata}
          onError={onVideoError}
          onPlay={onVideoPlay}
          onPause={onVideoPause}
          onEnded={() => {
            if (activeMediaSequence) {
              setCurrentClipIndex((currentClipIndex + 1) % activeMediaSequence.length);
            }
          }}
        />

        {hasError && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center">
            <RefreshCw className="text-orange-500 mb-2 animate-pulse" size={32} />
            <p className="text-sm font-bold text-white mb-2">Signal Connection Lost</p>
            <button 
              onClick={() => {
                setHasError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="px-4 py-1.5 bg-orange-500 text-black text-xs font-black uppercase tracking-widest rounded-full"
            >
              Re-Sync
            </button>
          </div>
        )}
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
