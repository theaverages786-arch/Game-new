import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  HelpCircle,
  Apple,
  ExternalLink
} from 'lucide-react';
import { soundService } from '../../services/sound';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');

  useEffect(() => {
    if (!isOpen) {
      setDownloadProgress(null);
      setDownloadComplete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDownload = () => {
    soundService.playClick();
    setDownloadProgress(0);
    setDownloadComplete(false);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        setDownloadProgress(100);
        setDownloadComplete(true);
        soundService.playWin();
        clearInterval(interval);
      } else {
        setDownloadProgress(current);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-[#0f1422] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto"
        id="app-download-modal-card"
      >
        {/* Close button */}
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700 transition cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 shadow-xl shadow-amber-500/20 border-2 border-amber-300 mb-2">
            <Smartphone className="w-7 h-7 text-slate-950" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            777 Premier Official App
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Android APK (v2.8.4) & iOS Web App &bull; Fast & Secure
          </p>
        </div>

        {/* Platform Switcher */}
        <div className="grid grid-cols-2 bg-slate-900/90 p-1 rounded-2xl border border-amber-500/30 mb-4">
          <button
            onClick={() => {
              soundService.playClick();
              setActivePlatform('android');
            }}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🤖 Android APK</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              setActivePlatform('ios');
            }}
            className={`py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activePlatform === 'ios'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🍏 iOS / iPhone WebApp</span>
          </button>
        </div>

        {/* Android Tab */}
        {activePlatform === 'android' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code graphic */}
              <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                <div className="w-full h-full border-2 border-slate-950 grid grid-cols-4 gap-0.5 p-1 bg-slate-950">
                  <div className="bg-white col-span-2 row-span-2"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-amber-400"></div>
                  <div className="bg-white col-span-2"></div>
                  <div className="bg-white"></div>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Direct Package Info</span>
                <h4 className="font-extrabold text-sm text-slate-100">777p999_Premier_v2.8.apk</h4>
                <div className="text-xs text-slate-400">Size: 28.4 MB &bull; Requires Android 5.0+</div>
                <div className="text-[10px] text-emerald-400 font-bold">✓ 100% Virus & Malware Free Verified</div>
              </div>
            </div>

            {/* Download Action */}
            {downloadProgress === null ? (
              <button
                onClick={handleStartDownload}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 text-sm tracking-wider flex items-center justify-center gap-2 transform active:scale-95 transition cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>DOWNLOAD ANDROID APK NOW</span>
              </button>
            ) : (
              <div className="space-y-2 bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-amber-300">
                    {downloadComplete ? '✅ Download Complete!' : 'Downloading 777 Premier APK...'}
                  </span>
                  <span className="font-mono text-amber-400">{downloadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                {downloadComplete && (
                  <div className="text-xs text-emerald-300 font-bold text-center pt-1 animate-in fade-in">
                    Click the downloaded file in your notification bar & select "Install"!
                  </div>
                )}
              </div>
            )}

            {/* Install Steps */}
            <div className="bg-[#0a0e1a] border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
              <h5 className="font-black text-amber-300 uppercase tracking-wide text-[11px]">
                Easy 3-Step Installation:
              </h5>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Tap "Download APK" above.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>If prompted, enable "Install from Unknown Sources" in phone Settings.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Open 777 Premier, login, and claim your exclusive app bonus!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* iOS Tab */}
        {activePlatform === 'ios' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Apple className="w-5 h-5" />
                <span>iOS Safari WebApp Installation</span>
              </div>
              <p className="text-xs text-slate-300">
                You can install 777 Premier directly onto your iPhone / iPad home screen with zero app store delays!
              </p>
            </div>

            <div className="bg-[#0a0e1a] border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">1</span>
                <div>
                  <div className="font-bold text-white">Open in Safari</div>
                  <div className="text-[11px] text-slate-400">Navigate to 777p999.com on your Safari browser.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">2</span>
                <div>
                  <div className="font-bold text-white">Tap Share Button [⎙]</div>
                  <div className="text-[11px] text-slate-400">Press the square icon with an upward arrow at the bottom of Safari.</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">3</span>
                <div>
                  <div className="font-bold text-white">Select "Add to Home Screen"</div>
                  <div className="text-[11px] text-slate-400">Tap "Add" in the top right to get the full-screen 777 app on your home screen.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playClick();
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
            >
              Done / Return to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
