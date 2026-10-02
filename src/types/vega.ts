export type Severity = 'High' | 'Medium' | 'Low' | 'Info';

export interface ScanAlert {
  id: string;
  title: string;
  severity: Severity;
  type: string;
  path: string;
  method: string;
  host: string;
  parameter?: string;
  cwe?: string;
  cvss?: number;
  description: string;
  impact: string;
  remediation: string;
  request: {
    raw: string;
    highlight?: string;
  };
  response: {
    statusCode: number;
    headers: Record<string, string>;
    raw: string;
    highlight?: string;
  };
  timestamp: string;
}

export interface ScannerModule {
  id: string;
  name: string;
  category: 'Injection' | 'XSS' | 'File & Directory' | 'Information Disclosure' | 'Headers & SSL' | 'Logic';
  description: string;
  enabled: boolean;
}

export interface ScanInstance {
  id: string;
  targetUrl: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'stopped';
  progress: number; // 0 - 100
  startTime: string;
  endTime?: string;
  totalRequests: number;
  requestsPerSecond: number;
  urlsDiscovered: number;
  currentTask: string;
  alerts: ScanAlert[];
}

export interface HttpLogRecord {
  id: number;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  host: string;
  path: string;
  statusCode: number;
  statusText: string;
  contentType: string;
  contentLength: number;
  durationMs: number;
  requestHeaders: Record<string, string>;
  requestBody?: string;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

export interface InterceptTransaction {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  host: string;
  path: string;
  headers: Record<string, string>;
  body: string;
  status: 'intercepted' | 'forwarded' | 'dropped';
}

export interface BreakpointRule {
  id: string;
  enabled: boolean;
  matchType: 'url_contains' | 'method_equals' | 'header_matches' | 'extension_not';
  value: string;
}

export interface DiscoveredEndpoint {
  id: string;
  host: string;
  path: string;
  method: string;
  params: string[];
  statusCode: number;
  formsCount: number;
  inScope: boolean;
}

export interface TargetScopeRule {
  id: string;
  pattern: string;
  type: 'include' | 'exclude';
  enabled: boolean;
}
