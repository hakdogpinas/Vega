import React, { useState, useRef } from 'react';
import { Header, Perspective } from './components/Header';
import { ScannerView } from './components/scanner/ScannerView';
import { NewScanModal } from './components/scanner/NewScanModal';
import { ProxyView } from './components/proxy/ProxyView';
import { RequestEditorView } from './components/editor/RequestEditorView';
import { SiteMapView } from './components/sitemap/SiteMapView';
import { ReportView } from './components/reports/ReportView';
import { 
  ScanInstance, 
  ScanAlert, 
  ScannerModule, 
  HttpLogRecord, 
  InterceptTransaction, 
  BreakpointRule, 
  DiscoveredEndpoint, 
  TargetScopeRule 
} from './types/vega';
import { INITIAL_MODULES } from './data/scannerModules';
import { 
  INITIAL_SCAN_INSTANCE, 
  INITIAL_LOGS, 
  INITIAL_INTERCEPT, 
  INITIAL_ENDPOINTS, 
  INITIAL_SCOPE 
} from './data/defaultData';
import { ScannerEngine } from './services/scannerEngine';

export function App() {
  const [currentPerspective, setCurrentPerspective] = useState<Perspective>('scanner');
  const [scanInstance, setScanInstance] = useState<ScanInstance>(INITIAL_SCAN_INSTANCE);
  const [isNewScanOpen, setIsNewScanOpen] = useState(false);
  const [modules, setModules] = useState<ScannerModule[]>(INITIAL_MODULES);

  // Proxy state
  const [isInterceptEnabled, setIsInterceptEnabled] = useState(true);
  const [interceptTransaction, setInterceptTransaction] = useState<InterceptTransaction | null>(INITIAL_INTERCEPT);
  const [logs, setLogs] = useState<HttpLogRecord[]>(INITIAL_LOGS);
  const [breakpointRules, setBreakpointRules] = useState<BreakpointRule[]>([
    { id: 'bp-1', enabled: true, matchType: 'method_equals', value: 'POST' },
    { id: 'bp-2', enabled: true, matchType: 'url_contains', value: '/cart.php' },
  ]);

  // Site map state
  const [endpoints, setEndpoints] = useState<DiscoveredEndpoint[]>(INITIAL_ENDPOINTS);
  const [scopeRules, setScopeRules] = useState<TargetScopeRule[]>(INITIAL_SCOPE);

  // Request Editor state
  const [editorState, setEditorState] = useState<{
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  }>({
    method: 'GET',
    url: 'http://testphp.vulnweb.com/artists.php?artist=1',
    headers: {
      'User-Agent': 'Vega/2.0 Web Security Testing Platform',
      'Accept': '*/*',
    },
  });

  const scannerEngineRef = useRef<ScannerEngine | null>(null);

  // Module toggle
  const handleToggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleSelectAllModules = (enable: boolean) => {
    setModules((prev) => prev.map((m) => ({ ...m, enabled: enable })));
  };

  // Start New Scan
  const handleStartScan = (targetUrl: string) => {
    if (scannerEngineRef.current) {
      scannerEngineRef.current.stop();
    }

    const newScan: ScanInstance = {
      id: `scan-${Date.now()}`,
      targetUrl,
      status: 'running',
      progress: 0,
      startTime: new Date().toLocaleTimeString(),
      totalRequests: 0,
      requestsPerSecond: 24.5,
      urlsDiscovered: 1,
      currentTask: 'Initializing automated security crawler and probe engines...',
      alerts: [],
    };

    setScanInstance(newScan);
    setCurrentPerspective('scanner');

    const engine = new ScannerEngine(targetUrl, modules, {
      onProgress: (progress, task, reqCount, urls) => {
        setScanInstance((prev) => ({
          ...prev,
          progress,
          currentTask: task,
          totalRequests: reqCount,
          urlsDiscovered: urls,
        }));
      },
      onAlertFound: (alert) => {
        setScanInstance((prev) => ({
          ...prev,
          alerts: [alert, ...prev.alerts],
        }));
      },
      onComplete: () => {
        setScanInstance((prev) => ({
          ...prev,
          status: 'completed',
          endTime: new Date().toLocaleTimeString(),
          currentTask: `Scan Completed — ${scanInstance.alerts.length} vulnerabilities found`,
        }));
      },
    });

    scannerEngineRef.current = engine;
    engine.start();
  };

  const handlePauseScan = () => {
    if (scannerEngineRef.current) {
      scannerEngineRef.current.pause();
      setScanInstance((prev) => ({ ...prev, status: 'paused' }));
    }
  };

  const handleResumeScan = () => {
    if (scannerEngineRef.current) {
      scannerEngineRef.current.resume();
      setScanInstance((prev) => ({ ...prev, status: 'running' }));
    }
  };

  const handleStopScan = () => {
    if (scannerEngineRef.current) {
      scannerEngineRef.current.stop();
      setScanInstance((prev) => ({
        ...prev,
        status: 'stopped',
        endTime: new Date().toLocaleTimeString(),
        currentTask: 'Scan stopped by user.',
      }));
    }
  };

  // Send to Editor (Repeater)
  const handleSendToEditor = (
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string
  ) => {
    setEditorState({
      method,
      url,
      headers: {
        'User-Agent': 'Vega/2.0 (Request-Repeater)',
        ...headers,
      },
      body,
    });
    setCurrentPerspective('editor');
  };

  // Proxy actions
  const handleForwardTransaction = (modified: InterceptTransaction) => {
    // Push into history log
    const newLog: HttpLogRecord = {
      id: logs.length + 101,
      timestamp: new Date().toLocaleTimeString(),
      method: modified.method as any,
      host: modified.host,
      path: modified.path,
      statusCode: 200,
      statusText: 'OK',
      contentType: 'application/json',
      contentLength: 154,
      durationMs: 86,
      requestHeaders: modified.headers,
      requestBody: modified.body,
      responseHeaders: {
        'Content-Type': 'application/json',
        'Server': 'Vega-Tampered-Mock/1.0',
      },
      responseBody: JSON.stringify({
        status: 'success',
        message: 'Transaction successfully modified and processed by server.',
        tampered_body: modified.body,
      }, null, 2),
    };

    setLogs((prev) => [newLog, ...prev]);
    setInterceptTransaction(null);
  };

  const handleDropTransaction = () => {
    setInterceptTransaction(null);
  };

  const handleGenerateTestTraffic = () => {
    const samplePayloads: InterceptTransaction[] = [
      {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        url: 'http://testphp.vulnweb.com/userinfo.php',
        host: 'testphp.vulnweb.com',
        path: '/userinfo.php',
        headers: {
          'Host': 'testphp.vulnweb.com',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'PHPSESSID=4a9f939e6a0c0b9d8e7f',
          'User-Agent': 'Mozilla/5.0 Firefox/110.0',
        },
        body: 'email=admin%40corp.internal&phone=555-0199&role=admin',
        status: 'intercepted',
      },
      {
        id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        url: 'http://testphp.vulnweb.com/api/v1/coupon',
        host: 'testphp.vulnweb.com',
        path: '/api/v1/coupon',
        headers: {
          'Host': 'testphp.vulnweb.com',
          'Content-Type': 'application/json',
        },
        body: '{"code":"VIP100_DISCOUNT","discount_rate":1.00}',
        status: 'intercepted',
      },
    ];

    const pick = samplePayloads[Math.floor(Math.random() * samplePayloads.length)];
    setInterceptTransaction(pick);
    setIsInterceptEnabled(true);
    setCurrentPerspective('proxy');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Header & Perspectives Navigation */}
      <Header
        currentPerspective={currentPerspective}
        onSelectPerspective={setCurrentPerspective}
        onOpenNewScan={() => setIsNewScanOpen(true)}
        alertCount={scanInstance.alerts.length}
        highAlertCount={scanInstance.alerts.filter((a) => a.severity === 'High').length}
        isProxyIntercepting={isInterceptEnabled && interceptTransaction !== null}
        scanStatus={scanInstance.status}
      />

      {/* Main Perspective Body */}
      <main className="flex-1 flex overflow-hidden">
        {currentPerspective === 'scanner' && (
          <ScannerView
            scanInstance={scanInstance}
            onOpenNewScan={() => setIsNewScanOpen(true)}
            onPauseScan={handlePauseScan}
            onResumeScan={handleResumeScan}
            onStopScan={handleStopScan}
            onSendToEditor={handleSendToEditor}
          />
        )}

        {currentPerspective === 'proxy' && (
          <ProxyView
            interceptTransaction={interceptTransaction}
            isInterceptEnabled={isInterceptEnabled}
            onToggleIntercept={() => setIsInterceptEnabled(!isInterceptEnabled)}
            onForwardTransaction={handleForwardTransaction}
            onDropTransaction={handleDropTransaction}
            onGenerateTestTraffic={handleGenerateTestTraffic}
            logs={logs}
            onClearLogs={() => setLogs([])}
            onSendToEditor={handleSendToEditor}
            breakpointRules={breakpointRules}
            onToggleBreakpoint={(id) =>
              setBreakpointRules((prev) =>
                prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
              )
            }
            onAddBreakpoint={(rule) =>
              setBreakpointRules((prev) => [
                ...prev,
                { id: `bp-${Date.now()}`, ...rule },
              ])
            }
          />
        )}

        {currentPerspective === 'editor' && (
          <RequestEditorView
            key={`${editorState.method}-${editorState.url}`}
            initialMethod={editorState.method}
            initialUrl={editorState.url}
            initialHeaders={editorState.headers}
            initialBody={editorState.body}
          />
        )}

        {currentPerspective === 'sitemap' && (
          <SiteMapView
            endpoints={endpoints}
            scopeRules={scopeRules}
            onToggleScopeRule={(id) =>
              setScopeRules((prev) =>
                prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
              )
            }
            onAddScopeRule={(pattern, type) =>
              setScopeRules((prev) => [
                ...prev,
                { id: `sc-${Date.now()}`, pattern, type, enabled: true },
              ])
            }
            onRemoveScopeRule={(id) =>
              setScopeRules((prev) => prev.filter((r) => r.id !== id))
            }
            onSendToEditor={handleSendToEditor}
          />
        )}

        {currentPerspective === 'reports' && (
          <ReportView scanInstance={scanInstance} />
        )}
      </main>

      {/* New Scan Configuration Modal */}
      <NewScanModal
        isOpen={isNewScanOpen}
        onClose={() => setIsNewScanOpen(false)}
        modules={modules}
        onToggleModule={handleToggleModule}
        onSelectAllModules={handleSelectAllModules}
        onStartScan={handleStartScan}
      />
    </div>
  );
}

export default App;
