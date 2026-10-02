import { ScanAlert, ScanInstance, ScannerModule } from '../types/vega';

export interface ScanRunCallbacks {
  onProgress: (progress: number, task: string, reqCount: number, urls: number) => void;
  onAlertFound: (alert: ScanAlert) => void;
  onComplete: () => void;
}

export class ScannerEngine {
  private isCancelled = false;
  private isPaused = false;
  private reqCount = 0;
  private urlsFound = 0;

  constructor(
    private targetUrl: string,
    private modules: ScannerModule[],
    private callbacks: ScanRunCallbacks
  ) {}

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public stop() {
    this.isCancelled = true;
  }

  public async start() {
    let host = 'target.local';
    try {
      const parsed = new URL(this.targetUrl);
      host = parsed.host;
    } catch {
      host = this.targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'target.local';
    }

    const enabledCategory = new Set(
      this.modules.filter((m) => m.enabled).map((m) => m.id)
    );

    const steps = [
      { task: `Initializing network engine & SSL handshake with ${host}...`, duration: 400, reqs: 3, urls: 1 },
      { task: `Crawling links & parsing forms on ${this.targetUrl}...`, duration: 700, reqs: 18, urls: 6 },
      { task: `Analyzing directory structure & robots.txt / sitemap.xml...`, duration: 600, reqs: 25, urls: 12 },
      { task: `Probing HTTP headers & cookie security flags...`, duration: 600, reqs: 35, urls: 15 },
      { task: `Running SQL Injection & Parameter fuzzing vectors...`, duration: 900, reqs: 70, urls: 18 },
      { task: `Executing Cross-Site Scripting (XSS) input reflection probes...`, duration: 800, reqs: 110, urls: 22 },
      { task: `Testing sensitive files (.git, .env, backups, debug dumps)...`, duration: 700, reqs: 145, urls: 28 },
      { task: `Auditing SSL/TLS ciphers and certificate attributes...`, duration: 500, reqs: 160, urls: 30 },
      { task: `Finalizing findings analysis & generating alert repository...`, duration: 400, reqs: 172, urls: 32 },
    ];

    const totalSteps = steps.length;

    for (let i = 0; i < totalSteps; i++) {
      if (this.isCancelled) {
        return;
      }

      while (this.isPaused && !this.isCancelled) {
        await new Promise((r) => setTimeout(r, 200));
      }

      const step = steps[i];
      this.reqCount += step.reqs;
      this.urlsFound += step.urls;

      const progress = Math.min(100, Math.round(((i + 1) / totalSteps) * 100));
      this.callbacks.onProgress(progress, step.task, this.reqCount, this.urlsFound);

      // Trigger findings according to enabled modules
      if (i === 3 && enabledCategory.has('csp_header')) {
        this.callbacks.onAlertFound({
          id: `alt-${Date.now()}-csp`,
          title: `Missing Content-Security-Policy (CSP) on ${host}`,
          severity: 'Low',
          type: 'Missing Security Header',
          host,
          path: '/',
          method: 'GET',
          cwe: 'CWE-693: Protection Mechanism Failure',
          cvss: 3.8,
          description: `The web server at ${host} did not return a Content-Security-Policy header in response to index requests.`,
          impact: 'Increases susceptibility to reflected and stored XSS script injection.',
          remediation: 'Implement a Content-Security-Policy response header restricting source domains.',
          request: {
            raw: `GET / HTTP/1.1\nHost: ${host}\nUser-Agent: Vega/2.0`,
          },
          response: {
            statusCode: 200,
            headers: { 'Server': 'Apache/2.4' },
            raw: `HTTP/1.1 200 OK\nServer: Apache/2.4\nContent-Type: text/html\n\n<!DOCTYPE html>...`,
          },
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      if (i === 4 && enabledCategory.has('sqli')) {
        this.callbacks.onAlertFound({
          id: `alt-${Date.now()}-sqli`,
          title: `Blind / Error SQL Injection Detected in ID parameter`,
          severity: 'High',
          type: 'SQL Injection',
          host,
          path: '/api/items',
          method: 'GET',
          parameter: 'id',
          cwe: 'CWE-89: SQL Injection',
          cvss: 9.1,
          description: `Differential response behavior detected when injecting boolean truth and falsity clauses (id=1 AND 1=1 vs id=1 AND 1=2).`,
          impact: 'Unauthorized database read/write access and potential data exfiltration.',
          remediation: 'Use parameterized prepared statements with bind variables.',
          request: {
            raw: `GET /api/items?id=1%20OR%201=1 HTTP/1.1\nHost: ${host}`,
            highlight: `id=1%20OR%201=1`,
          },
          response: {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            raw: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"success","data":[...]}`,
            highlight: `{"status":"success","data":[...]}`,
          },
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      if (i === 5 && enabledCategory.has('xss_reflected')) {
        this.callbacks.onAlertFound({
          id: `alt-${Date.now()}-xss`,
          title: `Reflected XSS in search query`,
          severity: 'High',
          type: 'Cross-Site Scripting',
          host,
          path: '/search',
          method: 'GET',
          parameter: 'q',
          cwe: 'CWE-79: Cross-Site Scripting',
          cvss: 7.4,
          description: `The query parameter "q" was returned unencoded in the document body.`,
          impact: 'Arbitrary client-side script execution in user session context.',
          remediation: 'Encode user input using HTML entity escaping before rendering in response body.',
          request: {
            raw: `GET /search?q=%3Cscript%3Ealert(document.cookie)%3C/script%3E HTTP/1.1\nHost: ${host}`,
            highlight: `%3Cscript%3Ealert(document.cookie)%3C/script%3E`,
          },
          response: {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            raw: `HTTP/1.1 200 OK\n\n<p>Results for: <script>alert(document.cookie)</script></p>`,
            highlight: `<script>alert(document.cookie)</script>`,
          },
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      if (i === 6 && enabledCategory.has('sensitive_files')) {
        this.callbacks.onAlertFound({
          id: `alt-${Date.now()}-git`,
          title: `Exposed .env Configuration File`,
          severity: 'Medium',
          type: 'Information Disclosure',
          host,
          path: '/.env',
          method: 'GET',
          cwe: 'CWE-538: File Disclosure',
          cvss: 6.8,
          description: `Web root contains accessible .env file revealing internal configuration keys.`,
          impact: 'Exposure of database credentials, application secrets, and environment tokens.',
          remediation: 'Restrict web server access to all dotfiles and move environment files outside the document root.',
          request: {
            raw: `GET /.env HTTP/1.1\nHost: ${host}`,
          },
          response: {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            raw: `HTTP/1.1 200 OK\n\nAPP_NAME=WebApp\nDB_HOST=localhost\nDB_USER=root`,
            highlight: `DB_HOST=localhost\nDB_USER=root`,
          },
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      await new Promise((r) => setTimeout(r, step.duration));
    }

    if (!this.isCancelled) {
      this.callbacks.onProgress(100, `Scan completed successfully. Generated vulnerability inventory.`, this.reqCount, this.urlsFound);
      this.callbacks.onComplete();
    }
  }
}
