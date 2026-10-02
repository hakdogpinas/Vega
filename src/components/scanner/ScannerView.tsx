import React, { useState } from 'react';
import { 
  ScanAlert, 
  ScanInstance, 
  Severity 
} from '../../types/vega';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  Square, 
  Search, 
  ExternalLink, 
  Send, 
  ShieldAlert, 
  Info, 
  ChevronRight, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';

interface ScannerViewProps {
  scanInstance: ScanInstance;
  onOpenNewScan: () => void;
  onPauseScan: () => void;
  onResumeScan: () => void;
  onStopScan: () => void;
  onSendToEditor: (method: string, url: string, headers: Record<string, string>, body?: string) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  scanInstance,
  onOpenNewScan,
  onPauseScan,
  onResumeScan,
  onStopScan,
  onSendToEditor,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    scanInstance.alerts[0]?.id || ''
  );
  const [severityFilter, setSeverityFilter] = useState<Severity | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'overview' | 'request' | 'response'>('overview');
  const [copied, setCopied] = useState(false);

  // Filter alerts
  const filteredAlerts = scanInstance.alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    const matchesQuery =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.parameter && alert.parameter.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeverity && matchesQuery;
  });

  const selectedAlert =
    scanInstance.alerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0];

  const highCount = scanInstance.alerts.filter((a) => a.severity === 'High').length;
  const medCount = scanInstance.alerts.filter((a) => a.severity === 'Medium').length;
  const lowCount = scanInstance.alerts.filter((a) => a.severity === 'Low').length;
  const infoCount = scanInstance.alerts.filter((a) => a.severity === 'Info').length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToRepeater = () => {
    if (!selectedAlert) return;
    const fullUrl = selectedAlert.path.startsWith('http')
      ? selectedAlert.path
      : `http://${selectedAlert.host}${selectedAlert.path}`;
    onSendToEditor(selectedAlert.method, fullUrl, {}, selectedAlert.request.raw.split('\n\n')[1] || '');
  };

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'High':
        return 'bg-red-950 text-red-400 border border-red-800/80';
      case 'Medium':
        return 'bg-amber-950 text-amber-400 border border-amber-800/80';
      case 'Low':
        return 'bg-yellow-950 text-yellow-400 border border-yellow-800/80';
      case 'Info':
        return 'bg-blue-950 text-blue-400 border border-blue-800/80';
    }
  };

  const getCvssColor = (cvss?: number) => {
    if (!cvss) return 'text-slate-400';
    if (cvss >= 7.0) return 'text-red-400 bg-red-950/80 border-red-800';
    if (cvss >= 4.0) return 'text-amber-400 bg-amber-950/80 border-amber-800';
    return 'text-yellow-400 bg-yellow-950/80 border-yellow-800';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Banner / Scan Status */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-[11px] text-slate-400 block">Target Scope:</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              {scanInstance.targetUrl}
            </span>
          </div>

          <div className="h-7 w-[1px] bg-slate-800 mx-1" />

          {/* Action buttons */}
          {scanInstance.status === 'running' ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onPauseScan}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
              <button
                onClick={onStopScan}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white font-semibold cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          ) : scanInstance.status === 'paused' ? (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={onResumeScan}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
              <button
                onClick={onStopScan}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white font-semibold cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenNewScan}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-semibold shadow cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start New Scan</span>
            </button>
          )}
        </div>

        {/* Severity counts pill row */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSeverityFilter('High')}
            className={`px-2.5 py-1 rounded font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              severityFilter === 'High' ? 'ring-2 ring-red-500' : ''
            } bg-red-950/80 border border-red-900 text-red-300`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>High: {highCount}</span>
          </button>

          <button
            onClick={() => setSeverityFilter('Medium')}
            className={`px-2.5 py-1 rounded font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              severityFilter === 'Medium' ? 'ring-2 ring-amber-500' : ''
            } bg-amber-950/80 border border-amber-900 text-amber-300`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Med: {medCount}</span>
          </button>

          <button
            onClick={() => setSeverityFilter('Low')}
            className={`px-2.5 py-1 rounded font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              severityFilter === 'Low' ? 'ring-2 ring-yellow-500' : ''
            } bg-yellow-950/80 border border-yellow-900 text-yellow-300`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Low: {lowCount}</span>
          </button>

          <button
            onClick={() => setSeverityFilter('Info')}
            className={`px-2.5 py-1 rounded font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
              severityFilter === 'Info' ? 'ring-2 ring-blue-500' : ''
            } bg-blue-950/80 border border-blue-900 text-blue-300`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Info: {infoCount}</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-800 mx-1" />

          {/* Engine metrics */}
          <div className="hidden lg:flex items-center space-x-3 font-mono text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            <span>Reqs: <strong className="text-slate-200">{scanInstance.totalRequests}</strong></span>
            <span>Speed: <strong className="text-slate-200">{scanInstance.requestsPerSecond} r/s</strong></span>
            <span>URLs: <strong className="text-slate-200">{scanInstance.urlsDiscovered}</strong></span>
          </div>
        </div>
      </div>

      {/* Progress line */}
      <div className="w-full bg-slate-800 h-1.5">
        <div
          className={`h-full transition-all duration-300 ${
            scanInstance.status === 'running'
              ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse'
              : scanInstance.status === 'completed'
              ? 'bg-emerald-500'
              : 'bg-slate-600'
          }`}
          style={{ width: `${scanInstance.progress}%` }}
        />
      </div>

      {/* Active task description bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-slate-500">TASK:</span>
          <span className="text-slate-300 truncate">{scanInstance.currentTask}</span>
        </div>
        <span className="text-slate-500 ml-2 whitespace-nowrap">
          {scanInstance.progress}% ({scanInstance.status.toUpperCase()})
        </span>
      </div>

      {/* Main Split Body: Left List / Right Details */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Alerts List */}
        <div className="w-full md:w-5/12 lg:w-4/12 border-r border-slate-800 flex flex-col bg-slate-900/40">
          {/* Search & Filter Header */}
          <div className="p-2.5 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter alerts by title, path, type..."
                className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center space-x-1 text-[11px] overflow-x-auto pb-0.5">
              {(['All', 'High', 'Medium', 'Low', 'Info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded transition cursor-pointer whitespace-nowrap ${
                    severityFilter === sev
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Scrollable Table */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No security alerts matching current filters.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-3 transition cursor-pointer flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-4 border-l-red-500'
                        : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${getSeverityBadgeClass(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-100 truncate">
                        {alert.title}
                      </h4>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mt-1 truncate">
                        <span className="text-slate-300 font-bold">{alert.method}</span>
                        <span className="truncate">{alert.path}</span>
                      </div>
                      {alert.parameter && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                          Param: <span className="text-slate-300">{alert.parameter}</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-1" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Alert Detail Inspector */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-950 overflow-hidden">
          {selectedAlert ? (
            <>
              {/* Alert Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${getSeverityBadgeClass(
                        selectedAlert.severity
                      )}`}
                    >
                      {selectedAlert.severity}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {selectedAlert.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-2">
                    <span>Host: <strong className="text-slate-200">{selectedAlert.host}</strong></span>
                    <span>•</span>
                    <span>Path: <strong className="text-slate-200">{selectedAlert.path}</strong></span>
                    {selectedAlert.parameter && (
                      <>
                        <span>•</span>
                        <span>Parameter: <strong className="text-red-400">{selectedAlert.parameter}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSendToRepeater}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-sky-950 border border-sky-800 hover:bg-sky-900 text-sky-200 text-xs font-semibold transition cursor-pointer"
                    title="Send this request to Request Editor"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Repeater</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Overview, Request, Response */}
              <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 text-xs font-medium">
                <button
                  onClick={() => setDetailTab('overview')}
                  className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                    detailTab === 'overview'
                      ? 'border-red-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Finding Overview & Remediation
                </button>
                <button
                  onClick={() => setDetailTab('request')}
                  className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                    detailTab === 'request'
                      ? 'border-red-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HTTP Request Payload
                </button>
                <button
                  onClick={() => setDetailTab('response')}
                  className={`py-2 px-3 border-b-2 transition cursor-pointer ${
                    detailTab === 'response'
                      ? 'border-red-500 text-white font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Server Response Evidence ({selectedAlert.response.statusCode})
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-300 space-y-5">
                {detailTab === 'overview' && (
                  <div className="space-y-5 max-w-4xl">
                    {/* Metadata boxes */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Classification
                        </span>
                        <span className="font-semibold text-slate-200 mt-1 block">
                          {selectedAlert.type}
                        </span>
                      </div>

                      {selectedAlert.cvss && (
                        <div className="p-3 rounded bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            CVSS v3.1 Score
                          </span>
                          <span className={`font-bold font-mono text-sm mt-1 block ${getCvssColor(selectedAlert.cvss)}`}>
                            {selectedAlert.cvss} / 10.0
                          </span>
                        </div>
                      )}

                      <div className="p-3 rounded bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Detection Time
                        </span>
                        <span className="font-mono text-slate-300 mt-1 block">
                          {selectedAlert.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* CWE info */}
                    {selectedAlert.cwe && (
                      <div className="p-3 rounded bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center space-x-2">
                        <Info className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{selectedAlert.cwe}</span>
                      </div>
                    )}

                    {/* Technical Description */}
                    <div>
                      <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                        Vulnerability Description
                      </h4>
                      <p className="leading-relaxed bg-slate-900 p-3.5 rounded border border-slate-800 text-slate-200">
                        {selectedAlert.description}
                      </p>
                    </div>

                    {/* Impact */}
                    <div>
                      <h4 className="text-xs uppercase font-bold text-red-400 tracking-wider mb-2">
                        Security Impact
                      </h4>
                      <p className="leading-relaxed bg-slate-900 p-3.5 rounded border border-red-950 text-slate-200">
                        {selectedAlert.impact}
                      </p>
                    </div>

                    {/* Remediation Advice */}
                    <div>
                      <h4 className="text-xs uppercase font-bold text-emerald-400 tracking-wider mb-2">
                        Remediation Guidance
                      </h4>
                      <div className="leading-relaxed bg-slate-900 p-3.5 rounded border border-emerald-950/80 text-emerald-100">
                        {selectedAlert.remediation}
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === 'request' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">
                        Method & Headers Sent:
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedAlert.request.raw)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Raw'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 bg-slate-900 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap">
                      {selectedAlert.request.raw}
                    </pre>
                  </div>
                )}

                {detailTab === 'response' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          HTTP {selectedAlert.response.statusCode}
                        </span>
                        <span className="text-slate-400">Response Dump</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedAlert.response.raw)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Raw'}</span>
                      </button>
                    </div>
                    <pre className="p-3.5 bg-slate-900 rounded border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap">
                      {selectedAlert.response.raw}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select an alert from the left to view technical details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
