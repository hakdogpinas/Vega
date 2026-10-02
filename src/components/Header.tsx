import React from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Send, 
  Network, 
  FileText, 
  Play, 
  Sliders, 
  FolderGit2
} from 'lucide-react';

export type Perspective = 'scanner' | 'proxy' | 'editor' | 'sitemap' | 'reports';

interface HeaderProps {
  currentPerspective: Perspective;
  onSelectPerspective: (p: Perspective) => void;
  onOpenNewScan: () => void;
  alertCount: number;
  highAlertCount: number;
  isProxyIntercepting: boolean;
  scanStatus: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
}

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSelectPerspective,
  onOpenNewScan,
  alertCount,
  highAlertCount,
  isProxyIntercepting,
  scanStatus,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-200 select-none">
      {/* Top Application Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-wider text-white">VEGA</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded font-mono font-semibold">
                  WEB EDITION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5">Web Security Testing Platform</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 mx-2" />

          {/* Quick Scanner Action */}
          <button
            onClick={onOpenNewScan}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>New Scan</span>
          </button>

          {/* Status Badge */}
          {scanStatus === 'running' && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-[11px]">SCAN RUNNING...</span>
            </div>
          )}
        </div>

        {/* Right Info info: Workspace & Alerts summary */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded font-mono text-[11px]">
            <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Workspace:</span>
            <span className="text-slate-200 font-semibold">default-workspace</span>
          </div>

          {highAlertCount > 0 && (
            <div className="flex items-center space-x-1 bg-red-950/70 border border-red-800 px-2.5 py-1 rounded text-red-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{highAlertCount} HIGH</span>
            </div>
          )}
        </div>
      </div>

      {/* Perspective / Mode Tabs */}
      <nav className="flex items-center px-4 bg-slate-950/90 border-t border-slate-800/60 space-x-1 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectPerspective('scanner')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
            currentPerspective === 'scanner'
              ? 'border-red-500 text-white bg-slate-900/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Scanner & Alerts</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {alertCount}
          </span>
        </button>

        <button
          onClick={() => onSelectPerspective('proxy')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
            currentPerspective === 'proxy'
              ? 'border-red-500 text-white bg-slate-900/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Proxy & Intercept</span>
          {isProxyIntercepting && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => onSelectPerspective('editor')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
            currentPerspective === 'editor'
              ? 'border-red-500 text-white bg-slate-900/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Request Editor (Repeater)</span>
        </button>

        <button
          onClick={() => onSelectPerspective('sitemap')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
            currentPerspective === 'sitemap'
              ? 'border-red-500 text-white bg-slate-900/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Network className="w-4 h-4 text-purple-400" />
          <span>Site Map & Scope</span>
        </button>

        <button
          onClick={() => onSelectPerspective('reports')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium transition cursor-pointer ${
            currentPerspective === 'reports'
              ? 'border-red-500 text-white bg-slate-900/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Security Report</span>
        </button>
      </nav>
    </header>
  );
};
