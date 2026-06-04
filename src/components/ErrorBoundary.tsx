import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, RefreshCw, Home, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isUpdating?: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isUpdating: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    const errorMsg = error.message || '';
    const isUpdating = 
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('loading chunk') ||
      errorMsg.includes('dynamic import') ||
      errorMsg.includes('Dynamic import');
      
    return { hasError: true, error, isUpdating };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NEXORA CRITICAL ERROR:', error, errorInfo);
    
    if (this.state.isUpdating) {
      console.warn("NEXORA SEAMLESS SELF-HEAL: Dynamic import failed due to live app deployment update. Fetching latest assets...");
      const reloadKey = 'nexora_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      
      // Auto-reboot at most once every 15 seconds to avoid recursive infinite reload loops
      if (!lastReload || now - parseInt(lastReload) > 15000) {
        sessionStorage.setItem(reloadKey, String(now));
        // Force a hard reload by adding a cache-busting timestamp parameter
        const url = new URL(window.location.href);
        url.searchParams.set('reload', String(now));
        window.location.href = url.toString();
      }
    }
  }

  private handleReset = () => {
    localStorage.clear(); // Extreme recovery
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.state.isUpdating) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6 font-sans">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw size={32} className="animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-blue-900 mb-2">Downloading Update...</h2>
              <p className="text-blue-900/60 font-bold">Hold tight bro, getting the latest features!</p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F4F8] p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 text-center border-4 border-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldAlert size={40} />
            </div>

            <h1 className="text-3xl font-black text-blue-900 uppercase tracking-tight mb-4">PROTOCOL BREACH</h1>
            
            <p className="text-blue-900/60 font-bold mb-8 leading-relaxed">
              Nexora encountered a critical system error. Don't worry, bro, your data is safe. We just need to recalibrate.
            </p>

            <div className="bg-blue-50 rounded-2xl p-5 mb-8 text-left border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Error Logs:</p>
              <code className="text-[11px] text-red-500 font-mono break-all font-bold">
                {this.state.error?.message || 'Unknown Protocol Violation'}
              </code>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <RefreshCw size={20} />
                REBOOT SYSTEM
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white border-2 border-blue-100 text-blue-600 font-black py-5 px-6 rounded-2xl transition-all hover:bg-blue-50 flex items-center justify-center gap-3 active:scale-95"
              >
                <Home size={20} />
                RETURN TO HQ
              </button>

              <div className="pt-4">
                <button
                  onClick={this.handleReset}
                  className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] hover:text-red-600 transition-colors"
                >
                  Hard Reset (Wipes Cache)
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-blue-900/20">
              <MessageSquare size={14} />
               <span className="text-[9px] font-black uppercase tracking-widest">HQ Shield Active</span>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
