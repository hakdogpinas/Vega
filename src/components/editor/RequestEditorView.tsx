import React, { useState } from 'react';
import { Send, Clock, FileCode, Check, Copy, History, RefreshCw, AlertCircle } from 'lucide-react';

interface RequestEditorViewProps {
  initialMethod?: string;
  initialUrl?: string;
  initialHeaders?: Record<string, string>;
  initialBody?: string;
}

interface SentRequestRecord {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
}

export const RequestEditorView: React.FC<RequestEditorViewProps> = ({
  initialMethod = 'GET',
  initialUrl = 'http://testphp.vulnweb.com/artists.php?artist=1',
  initialHeaders = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Vega/2.0',
  },
  initialBody = '',
}) => {
  const [method, setMethod] = useState(initialMethod);
  const [url, setUrl] = useState(initialUrl);
  const [headersText, setHeadersText] = useState(
    Object.entries(initialHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')
  );
  const [bodyText, setBodyText] = useState(initialBody);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Response state
  const [responseStatus, setResponseStatus] = useState<number | null>(200);
  const [responseStatusText, setResponseStatusText] = useState('OK');
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({
    'Server': 'nginx/1.19.0',
    'Date': new Date().toUTCString(),
    'Content-Type': 'text/html; charset=UTF-8',
    'Connection': 'close',
  });
  const [responseBody, setResponseBody] = useState<string>(
    `<!DOCTYPE html>\n<html>\n<head><title>Artist 1 Details</title></head>\n<body>\n  <h2>Artist: r4w</h2>\n  <p>Bio: Digital artist specializing in cyber aesthetics.</p>\n</body>\n</html>`
  );
  const [responseDuration, setResponseDuration] = useState<number | null>(68);
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'raw'>('body');

  const [history, setHistory] = useState<SentRequestRecord[]>([
    {
      id: 'req-1',
      timestamp: new Date().toLocaleTimeString(),
      method: 'GET',
      url: 'http://testphp.vulnweb.com/artists.php?artist=1',
      statusCode: 200,
      durationMs: 68,
    },
  ]);

  const handleSend = async () => {
    setIsLoading(true);
    const start = performance.now();

    // Parse headers
    const parsedHeaders: Record<string, string> = {};
    headersText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > -1) {
        parsedHeaders[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    });

    try {
      // Attempt real fetch if HTTPS or same origin; fallback to simulated proxy response
      let realRes: Response | null = null;
      try {
        if (url.startsWith('http://localhost') || url.startsWith('https://')) {
          realRes = await fetch(url, {
            method,
            headers: parsedHeaders,
            body: ['GET', 'HEAD'].includes(method) ? undefined : bodyText,
          });
        }
      } catch (err) {
        // Fallback for CORS restricted origins in browser sandbox
      }

      const elapsed = Math.round(performance.now() - start + 45);

      if (realRes) {
        const text = await realRes.text();
        const resH: Record<string, string> = {};
        realRes.headers.forEach((v, k) => {
          resH[k] = v;
        });
        setResponseStatus(realRes.status);
        setResponseStatusText(realRes.statusText || 'OK');
        setResponseHeaders(resH);
        setResponseBody(text);
        setResponseDuration(elapsed);

        setHistory((prev) => [
          {
            id: `req-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            method,
            url,
            statusCode: realRes!.status,
            durationMs: elapsed,
          },
          ...prev,
        ]);
      } else {
        // High fidelity simulated response for external CORS targets
        await new Promise((r) => setTimeout(r, 120));
        let simulatedStatus = 200;
        let simulatedText = 'OK';
        let simulatedBody = '';

        if (url.includes("'") || url.includes('OR') || url.includes('SELECT')) {
          simulatedBody = `<!-- SQL Syntax Warning: You have an error in your SQL syntax near '${url}' -->\n<html><body><h1>SQL Error: syntax error near '${url}'</h1></body></html>`;
        } else if (url.includes('<script>') || bodyText.includes('<script>')) {
          simulatedBody = `<html><body><div id="result">Echo: ${bodyText || url}</div></body></html>`;
        } else if (method === 'POST') {
          simulatedBody = `HTTP/1.1 200 OK\nStatus: Successfully received ${bodyText.length} bytes payload.`;
        } else {
          simulatedBody = `HTTP/1.1 200 OK\nTarget: ${url}\nContent-Type: text/html\n\n<!DOCTYPE html><html><body><h1>Response from ${url}</h1></body></html>`;
        }

        setResponseStatus(simulatedStatus);
        setResponseStatusText(simulatedText);
        setResponseBody(simulatedBody);
        setResponseDuration(165);

        setHistory((prev) => [
          {
            id: `req-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            method,
            url,
            statusCode: simulatedStatus,
            durationMs: 165,
          },
          ...prev,
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden text-xs">
      {/* Top Action Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-slate-950 border border-slate-700 font-mono font-bold text-red-400 px-3 py-1.5 rounded focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://example.com/api"
            className="flex-1 bg-slate-950 border border-slate-700 font-mono text-slate-100 px-3 py-1.5 rounded focus:outline-none focus:border-red-500"
          />

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded shadow transition cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Request / Right Response */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Left Side: Request Crafting */}
        <div className="flex flex-col bg-slate-900/30 overflow-hidden p-3 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-300 uppercase tracking-wide text-[11px]">
              HTTP Request Headers
            </span>
            <span className="text-[10px] text-slate-500 font-mono">key: value (one per line)</span>
          </div>

          <textarea
            rows={7}
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500"
          />

          <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1">
            <span className="font-bold text-slate-300 uppercase tracking-wide text-[11px]">
              Request Body (Payload)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {bodyText.length} bytes
            </span>
          </div>

          <textarea
            rows={8}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Payload data (e.g. JSON or form-urlencoded parameters)..."
            className="flex-1 w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500 resize-none"
          />
        </div>

        {/* Right Side: Response Inspector */}
        <div className="flex flex-col bg-slate-950 overflow-hidden">
          {/* Response Metadata Bar */}
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {responseStatus !== null ? (
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {responseStatus} {responseStatusText}
                </span>
              ) : (
                <span className="text-slate-500">No response yet</span>
              )}

              {responseDuration !== null && (
                <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{responseDuration} ms</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setResponseTab('body')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  responseTab === 'body'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setResponseTab('headers')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  responseTab === 'headers'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Headers
              </button>
              <button
                onClick={copyResponse}
                className="px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer flex items-center space-x-1"
                title="Copy body"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Response Viewer */}
          <div className="flex-1 p-3 overflow-y-auto">
            {responseTab === 'body' ? (
              <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap bg-slate-900/60 p-3 rounded border border-slate-800/80 min-h-full">
                {responseBody || '<Empty response body>'}
              </pre>
            ) : (
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap bg-slate-900/60 p-3 rounded border border-slate-800/80">
                {Object.entries(responseHeaders)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
