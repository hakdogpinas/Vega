import React, { useState } from 'react';
import { X, Play, Shield, Globe, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { ScannerModule } from '../../types/vega';

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ScannerModule[];
  onToggleModule: (id: string) => void;
  onSelectAllModules: (enable: boolean) => void;
  onStartScan: (targetUrl: string) => void;
}

export const NewScanModal: React.FC<NewScanModalProps> = ({
  isOpen,
  onClose,
  modules,
  onToggleModule,
  onSelectAllModules,
  onStartScan,
}) => {
  const [targetUrl, setTargetUrl] = useState('http://testphp.vulnweb.com');
  const [activeTab, setActiveTab] = useState<'target' | 'modules'>('target');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.trim()) return;
    onStartScan(targetUrl.trim());
    onClose();
  };

  const sampleTargets = [
    { label: 'TestPHP VulnWeb (OWASP Demo)', url: 'http://testphp.vulnweb.com' },
    { label: 'Zero Bank Demo App', url: 'http://zero.webappsecurity.com' },
    { label: 'Juice Shop Local Sandbox', url: 'http://localhost:3000' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              New Web Security Scan Wizard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'target'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Target Scope & Base URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'modules'
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>2. Scanner Probing Modules ({modules.filter((m) => m.enabled).length}/{modules.length})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {activeTab === 'target' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Target Website URL or Host
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-red-500 transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Vega will initialize crawling and send automated security audit requests against this origin.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-2 uppercase tracking-wider">
                  Presets & Practice Labs:
                </label>
                <div className="space-y-2">
                  {sampleTargets.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTargetUrl(item.url)}
                      className="w-full text-left p-2.5 rounded bg-slate-950/60 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/40 transition cursor-pointer flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-200">{item.label}</span>
                      <span className="font-mono text-[11px] text-slate-400">{item.url}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded space-y-2 text-slate-300">
                <span className="font-semibold text-slate-200 block text-xs">Crawl & Scope Policy:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-red-600" />
                  <span>Stay within base domain and configured port</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-red-600" />
                  <span>Parse HTML forms and evaluate GET/POST parameters</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded accent-red-600" />
                  <span>Robots.txt & Sitemap extraction</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-400">
                  Select which vulnerability modules will test the target:
                </p>
                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => onSelectAllModules(true)}
                    className="flex items-center space-x-1 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-red-500" />
                    <span>Select All</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => onSelectAllModules(false)}
                    className="flex items-center space-x-1 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {modules.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => onToggleModule(mod.id)}
                    className={`p-2.5 rounded border transition cursor-pointer flex items-start space-x-2.5 ${
                      mod.enabled
                        ? 'bg-slate-950 border-red-900/60 hover:border-red-600'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={mod.enabled}
                      onChange={() => {}}
                      className="mt-0.5 rounded accent-red-600 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{mod.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {mod.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {activeTab === 'target' ? (
              <button
                type="button"
                onClick={() => setActiveTab('modules')}
                className="text-slate-300 hover:text-white text-xs underline cursor-pointer"
              >
                Configure Modules →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('target')}
                className="text-slate-300 hover:text-white text-xs underline cursor-pointer"
              >
                ← Back to Target
              </button>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold shadow-md shadow-red-950 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Security Scan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
