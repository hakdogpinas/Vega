import React, { useState } from 'react';
import { ScanInstance, ScanAlert } from '../../types/vega';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Copy, 
  Check 
} from 'lucide-react';

interface ReportViewProps {
  scanInstance: ScanInstance;
}

export const ReportView: React.FC<ReportViewProps> = ({ scanInstance }) => {
  const [copied, setCopied] = useState(false);

  const highAlerts = scanInstance.alerts.filter((a) => a.severity === 'High');
  const medAlerts = scanInstance.alerts.filter((a) => a.severity === 'Medium');
  const lowAlerts = scanInstance.alerts.filter((a) => a.severity === 'Low');
  const infoAlerts = scanInstance.alerts.filter((a) => a.severity === 'Info');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scanInstance, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vega-security-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vega Web Security Audit Report - ${scanInstance.targetUrl}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; padding: 40px; margin: 0; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #131c38; border-radius: 8px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1, h2, h3 { color: #ffffff; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    .badge-high { background: #7f1d1d; color: #fca5a5; }
    .badge-medium { background: #78350f; color: #fcd34d; }
    .badge-low { background: #713f12; color: #fef08a; }
    .badge-info { background: #1e3a8a; color: #93c5fd; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 18px; margin-bottom: 20px; }
    pre { background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 12px; overflow-x: auto; font-family: monospace; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; text-align: center; }
    .stat-card { background: #0f172a; padding: 15px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ Vega Web Security Audit Report</h1>
    <p><strong>Target:</strong> ${scanInstance.targetUrl}</p>
    <p><strong>Audit Date:</strong> ${scanInstance.startTime} to ${scanInstance.endTime || 'Present'}</p>
    <div class="grid">
      <div class="stat-card"><h2 style="color:#ef4444;margin:0;">${highAlerts.length}</h2><div>HIGH SEVERITY</div></div>
      <div class="stat-card"><h2 style="color:#f59e0b;margin:0;">${medAlerts.length}</h2><div>MEDIUM</div></div>
      <div class="stat-card"><h2 style="color:#eab308;margin:0;">${lowAlerts.length}</h2><div>LOW</div></div>
      <div class="stat-card"><h2 style="color:#3b82f6;margin:0;">${infoAlerts.length}</h2><div>INFO</div></div>
    </div>
    <h2>Vulnerability Findings (${scanInstance.alerts.length})</h2>
    ${scanInstance.alerts
      .map(
        (a) => `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>${a.title}</h3>
          <span class="badge badge-${a.severity.toLowerCase()}">${a.severity.toUpperCase()}</span>
        </div>
        <p><strong>Endpoint:</strong> <code>${a.method} ${a.path}</code></p>
        ${a.parameter ? `<p><strong>Vulnerable Parameter:</strong> <code>${a.parameter}</code></p>` : ''}
        <p><strong>Description:</strong> ${a.description}</p>
        <p><strong>Impact:</strong> ${a.impact}</p>
        <p><strong>Remediation:</strong> ${a.remediation}</p>
        <h4>Evidence Request:</h4>
        <pre>${a.request.raw.replace(/</g, '&lt;')}</pre>
      </div>`
      )
      .join('')}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vega-audit-report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto text-xs p-6 space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              Web Application Security Assessment Report
            </h2>
          </div>
          <p className="text-slate-400 mt-1">
            Generated by Subgraph Vega Security Scanner for target{' '}
            <strong className="text-slate-200 font-mono">{scanInstance.targetUrl}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadHTML}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition cursor-pointer shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-red-900/60 rounded-lg p-4 text-center">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
            High Severity
          </span>
          <span className="text-3xl font-black text-red-500 font-mono mt-1 block">
            {highAlerts.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Requires immediate patch</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/60 rounded-lg p-4 text-center">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Medium Severity
          </span>
          <span className="text-3xl font-black text-amber-500 font-mono mt-1 block">
            {medAlerts.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Actionable risk</span>
        </div>

        <div className="bg-slate-900 border border-yellow-900/60 rounded-lg p-4 text-center">
          <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider block">
            Low Severity
          </span>
          <span className="text-3xl font-black text-yellow-500 font-mono mt-1 block">
            {lowAlerts.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Hardening recommended</span>
        </div>

        <div className="bg-slate-900 border border-blue-900/60 rounded-lg p-4 text-center">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
            Information
          </span>
          <span className="text-3xl font-black text-blue-500 font-mono mt-1 block">
            {infoAlerts.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Fingerprint & headers</span>
        </div>
      </div>

      {/* Detailed Vulnerability Inventory */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
          Detailed Findings & Vulnerability Evidence ({scanInstance.alerts.length})
        </h3>

        <div className="space-y-4">
          {scanInstance.alerts.map((alert, idx) => (
            <div
              key={alert.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                  <h4 className="font-bold text-slate-100 text-sm">{alert.title}</h4>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    alert.severity === 'High'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : alert.severity === 'Medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : alert.severity === 'Low'
                      ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">Resource:</span>{' '}
                  <span className="text-slate-200 font-bold">{alert.method} {alert.path}</span>
                </div>
                {alert.parameter && (
                  <div>
                    <span className="text-slate-500">Vulnerable Parameter:</span>{' '}
                    <span className="text-red-400 font-bold">{alert.parameter}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Description:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-800/80">
                  {alert.description}
                </p>
              </div>

              <div>
                <span className="text-emerald-400 font-semibold block mb-1">Remediation:</span>
                <div className="text-emerald-200 leading-relaxed bg-slate-950 p-2.5 rounded border border-emerald-950">
                  {alert.remediation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
