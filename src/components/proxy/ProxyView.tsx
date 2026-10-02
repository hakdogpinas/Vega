import React, { useState } from 'react';
import { 
  HttpLogRecord, 
  InterceptTransaction, 
  BreakpointRule 
} from '../../types/vega';
import { 
  Radio, 
  ArrowRight, 
  Trash2, 
  Send, 
  Sliders, 
  History, 
  Plus, 
  Search, 
  Play, 
  XCircle, 
  CheckCircle, 
  Filter 
} from 'lucide-react';

interface ProxyViewProps {
  interceptTransaction: InterceptTransaction | null;
  isInterceptEnabled: boolean;
  onToggleIntercept: () => void;
  onForwardTransaction: (modified: InterceptTransaction) => void;
  onDropTransaction: () => void;
  onGenerateTestTraffic: () => void;
  logs: HttpLogRecord[];
  onClearLogs: () => void;
  onSendToEditor: (method: string, url: string, headers: Record<string, string>, body?: string) => void;
  breakpointRules: BreakpointRule[];
  onToggleBreakpoint: (id: string) => void;
  onAddBreakpoint: (rule: Omit<BreakpointRule, 'id'>) => void;
}

export const ProxyView: React.FC<ProxyViewProps> = ({
  interceptTransaction,
  isInterceptEnabled,
  onToggleIntercept,
  onForwardTransaction,
  onDropTransaction,
  onGenerateTestTraffic,
  logs,
  onClearLogs,
  onSendToEditor,
  breakpointRules,
  onToggleBreakpoint,
  onAddBreakpoint,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'intercept' | 'history' | 'rules'>('intercept');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(logs[0]?.id ?? null);
  const [logSearch, setLogSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Intercept editing state
  const [editMethod, setEditMethod] = useState(interceptTransaction?.method || 'GET');
  const [editUrl, setEditUrl] = useState(interceptTransaction?.url || '');
  const [editHeaders, setEditHeaders] = useState(
    interceptTransaction ? Object.entries(interceptTransaction.headers).map(([k, v]) => `${k}: ${v}`).join('\n') : ''
  );
  const [editBody, setEditBody] = useState(interceptTransaction?.body || '');

  // Rule creation state
  const [newRuleType, setNewRuleType] = useState<BreakpointRule['matchType']>('url_contains');
  const [newRuleValue, setNewRuleValue] = useState('');

  // Update edit state if intercept transaction changes
  React.useEffect(() => {
    if (interceptTransaction) {
      setEditMethod(interceptTransaction.method);
      setEditUrl(interceptTransaction.url);
      setEditHeaders(Object.entries(interceptTransaction.headers).map(([k, v]) => `${k}: ${v}`).join('\n'));
      setEditBody(interceptTransaction.body || '');
    }
  }, [interceptTransaction]);

  const handleForward = () => {
    if (!interceptTransaction) return;
    const headerLines = editHeaders.split('\n');
    const parsedHeaders: Record<string, string> = {};
    headerLines.forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        parsedHeaders[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      }
    });

    onForwardTransaction({
      ...interceptTransaction,
      method: editMethod,
      url: editUrl,
      headers: parsedHeaders,
      body: editBody,
      status: 'forwarded',
    });
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleValue.trim()) return;
    onAddBreakpoint({
      matchType: newRuleType,
      value: newRuleValue.trim(),
      enabled: true,
    });
    setNewRuleValue('');
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesMethod = methodFilter === 'ALL' || log.method === methodFilter;
    const matchesSearch =
      log.path.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.host.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.statusCode.toString().includes(logSearch);
    return matchesMethod && matchesSearch;
  });

  const selectedLog = logs.find((l) => l.id === selectedLogId) || filteredLogs[0];

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    if (status >= 300 && status < 400) return 'text-sky-400 bg-sky-950/60 border-sky-800';
    if (status >= 400 && status < 500) return 'text-amber-400 bg-amber-950/60 border-amber-800';
    return 'text-red-400 bg-red-950/60 border-red-800';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-xs">
      {/* Sub navigation bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('intercept')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              activeSubTab === 'intercept'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Intercept</span>
            {interceptTransaction && (
              <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              activeSubTab === 'history'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>HTTP History ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rules')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition cursor-pointer font-medium ${
              activeSubTab === 'rules'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Interception Rules ({breakpointRules.length})</span>
          </button>
        </div>

        {/* Intercept Master Switch & Action */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onGenerateTestTraffic}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center space-x-1"
          >
            <Play className="w-3 h-3 text-sky-400" />
            <span>Generate Test Traffic</span>
          </button>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1 rounded border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">Intercept is:</span>
            <button
              onClick={onToggleIntercept}
              className={`px-2.5 py-0.5 rounded font-mono font-bold uppercase transition cursor-pointer ${
                isInterceptEnabled
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-950'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {isInterceptEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Intercept Queue & Editor */}
      {activeSubTab === 'intercept' && (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          {interceptTransaction ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 shadow-xl">
              {/* Intercept banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                    Request Paused by Interception Breakpoint
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    [{interceptTransaction.id}]
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleForward}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Forward Request</span>
                  </button>
                  <button
                    onClick={onDropTransaction}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Drop</span>
                  </button>
                </div>
              </div>

              {/* Editable Request components */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono font-bold text-red-400 focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 font-mono text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1 uppercase">
                    HTTP Request Headers (Editable):
                  </label>
                  <textarea
                    rows={6}
                    value={editHeaders}
                    onChange={(e) => setEditHeaders(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1 uppercase">
                    HTTP Request Body (Editable):
                  </label>
                  <textarea
                    rows={5}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Empty body or enter POST payload..."
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-lg p-12 text-center text-slate-400 space-y-4">
              <Radio className="w-12 h-12 text-slate-600" />
              <div>
                <h3 className="font-bold text-slate-200 text-sm">
                  {isInterceptEnabled ? 'Intercept is ON — Waiting for incoming HTTP traffic...' : 'Intercept is currently OFF'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1">
                  When enabled, any requests matching your breakpoint rules will pause here for inspection and tampering before proceeding to the server.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onGenerateTestTraffic}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-semibold transition cursor-pointer shadow"
                >
                  Intercept Sample POST /cart.php Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: HTTP History */}
      {activeSubTab === 'history' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="p-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter history by path, host, or status..."
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs focus:outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onClearLogs}
                className="px-2.5 py-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition cursor-pointer flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Top table */}
          <div className="h-60 overflow-y-auto border-b border-slate-800">
            <table className="w-full text-left font-mono">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Host</th>
                  <th className="py-2 px-3">Path</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Length</th>
                  <th className="py-2 px-3">Time (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <td className="py-1.5 px-3 text-slate-500">{log.id}</td>
                      <td className="py-1.5 px-3 text-slate-400">{log.timestamp}</td>
                      <td className="py-1.5 px-3">
                        <span className="font-bold text-slate-100">{log.method}</span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-300">{log.host}</td>
                      <td className="py-1.5 px-3 truncate max-w-xs">{log.path}</td>
                      <td className="py-1.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getStatusColor(log.statusCode)}`}>
                          {log.statusCode} {log.statusText}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-400">{log.contentLength} B</td>
                      <td className="py-1.5 px-3 text-slate-400">{log.durationMs}ms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Selected Inspector */}
          {selectedLog && (
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              <div className="p-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <span className="font-mono text-slate-300">
                  Transaction #{selectedLog.id}: <strong>{selectedLog.method} {selectedLog.path}</strong>
                </span>

                <button
                  onClick={() => {
                    const fullUrl = `http://${selectedLog.host}${selectedLog.path}`;
                    onSendToEditor(selectedLog.method, fullUrl, selectedLog.requestHeaders, selectedLog.requestBody);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-950 border border-sky-800 text-sky-200 hover:bg-sky-900 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send to Repeater</span>
                </button>
              </div>

              <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-hidden">
                {/* Request pane */}
                <div className="p-3 flex flex-col overflow-y-auto space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Request Headers & Body
                  </span>
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-2.5 rounded border border-slate-800">
                    {`${selectedLog.method} ${selectedLog.path} HTTP/1.1\n` +
                      Object.entries(selectedLog.requestHeaders)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('\n') +
                      (selectedLog.requestBody ? `\n\n${selectedLog.requestBody}` : '')}
                  </pre>
                </div>

                {/* Response pane */}
                <div className="p-3 flex flex-col overflow-y-auto space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Server Response
                  </span>
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-2.5 rounded border border-slate-800">
                    {`HTTP/1.1 ${selectedLog.statusCode} ${selectedLog.statusText}\n` +
                      Object.entries(selectedLog.responseHeaders)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('\n') +
                      `\n\n${selectedLog.responseBody}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interception Breakpoint Rules */}
      {activeSubTab === 'rules' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Add Breakpoint Rule</h3>
            <form onSubmit={handleCreateRule} className="flex gap-2">
              <select
                value={newRuleType}
                onChange={(e) => setNewRuleType(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="url_contains">URL contains</option>
                <option value="method_equals">Method equals</option>
                <option value="header_matches">Header matches</option>
                <option value="extension_not">File extension is NOT</option>
              </select>

              <input
                type="text"
                value={newRuleValue}
                onChange={(e) => setNewRuleValue(e.target.value)}
                placeholder="/api/ or POST or png|jpg"
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            </form>
          </div>

          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 font-semibold text-slate-300">
              Active Interception Filters
            </div>
            <div className="divide-y divide-slate-800">
              {breakpointRules.map((rule) => (
                <div key={rule.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => onToggleBreakpoint(rule.id)}
                      className="rounded accent-red-600 cursor-pointer"
                    />
                    <div>
                      <span className="font-mono text-slate-400 uppercase text-[10px] mr-2">
                        {rule.matchType.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-slate-200">{rule.value}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${rule.enabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
