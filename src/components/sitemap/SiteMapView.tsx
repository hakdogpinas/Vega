import React, { useState } from 'react';
import { DiscoveredEndpoint, TargetScopeRule } from '../../types/vega';
import { 
  Network, 
  Folder, 
  FileCode, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Send, 
  Search, 
  Trash2, 
  Globe 
} from 'lucide-react';

interface SiteMapViewProps {
  endpoints: DiscoveredEndpoint[];
  scopeRules: TargetScopeRule[];
  onToggleScopeRule: (id: string) => void;
  onAddScopeRule: (pattern: string, type: 'include' | 'exclude') => void;
  onRemoveScopeRule: (id: string) => void;
  onSendToEditor: (method: string, url: string, headers: Record<string, string>) => void;
}

export const SiteMapView: React.FC<SiteMapViewProps> = ({
  endpoints,
  scopeRules,
  onToggleScopeRule,
  onAddScopeRule,
  onRemoveScopeRule,
  onSendToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'scope'>('endpoints');
  const [search, setSearch] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newType, setNewType] = useState<'include' | 'exclude'>('include');

  const filteredEndpoints = endpoints.filter((ep) =>
    ep.path.toLowerCase().includes(search.toLowerCase()) ||
    ep.host.toLowerCase().includes(search.toLowerCase()) ||
    ep.params.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim()) return;
    onAddScopeRule(newPattern.trim(), newType);
    setNewPattern('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-xs">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              activeTab === 'endpoints'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Discovered Endpoints ({endpoints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('scope')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              activeTab === 'scope'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Scope Rules ({scopeRules.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'endpoints' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-2.5 bg-slate-900/60 border-b border-slate-800">
            <div className="relative max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter endpoints by path or parameter..."
                className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Scope</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Host</th>
                  <th className="py-2 px-3">Path</th>
                  <th className="py-2 px-3">Parameters</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEndpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                        IN SCOPE
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-200">{ep.method}</td>
                    <td className="py-2 px-3 text-slate-400">{ep.host}</td>
                    <td className="py-2 px-3 text-slate-100 font-semibold">{ep.path}</td>
                    <td className="py-2 px-3">
                      {ep.params.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ep.params.map((p, idx) => (
                            <span key={idx} className="bg-slate-800 text-red-400 px-1.5 py-0.5 rounded text-[10px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-400 font-bold">{ep.statusCode}</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onSendToEditor(ep.method, `http://${ep.host}${ep.path}`, {})}
                        className="p-1 hover:text-white text-slate-400 rounded hover:bg-slate-800 cursor-pointer inline-flex items-center space-x-1"
                        title="Send to Repeater"
                      >
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px]">Repeater</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Add Scope Rule Form */}
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Define Target Scope Filter</h3>
            <p className="text-slate-400 text-xs">
              Configure regex match patterns for target URLs included or excluded from spidering and fuzzing.
            </p>

            <form onSubmit={handleAddRule} className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>

              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="^https?://testphp\.vulnweb\.com/.*$"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scope</span>
              </button>
            </form>
          </div>

          {/* Scope Rules List */}
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 font-semibold text-slate-300">
              Active Scope Evaluation Rules
            </div>
            <div className="divide-y divide-slate-800">
              {scopeRules.map((rule) => (
                <div key={rule.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => onToggleScopeRule(rule.id)}
                      className="rounded accent-red-600 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mr-2 uppercase ${
                          rule.type === 'include'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            : 'bg-red-950 text-red-400 border border-red-900'
                        }`}
                      >
                        {rule.type}
                      </span>
                      <span className="font-mono text-slate-200 text-xs">{rule.pattern}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveScopeRule(rule.id)}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
