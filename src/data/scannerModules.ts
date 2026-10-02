import { ScannerModule } from '../types/vega';

export const INITIAL_MODULES: ScannerModule[] = [
  // Injection Checks
  {
    id: 'sqli',
    name: 'SQL Injection Checks',
    category: 'Injection',
    description: 'Probes parameters for SQL syntax error signatures, boolean-based differential behavior, and time delay injections.',
    enabled: true,
  },
  {
    id: 'blind_cmd',
    name: 'OS Command Injection',
    category: 'Injection',
    description: 'Injects OS shell operators and ping/sleep commands to detect server-side command execution.',
    enabled: true,
  },
  {
    id: 'xpath_xml',
    name: 'XPath & XML Injection',
    category: 'Injection',
    description: 'Checks for XML external entity (XXE) and XPath evaluation flaws in parameters and input payloads.',
    enabled: true,
  },
  {
    id: 'ognl_el',
    name: 'Expression Language / OGNL Injection',
    category: 'Injection',
    description: 'Probes for Apache Struts / Spring EL template execution vulnerabilities.',
    enabled: true,
  },

  // Cross-Site Scripting
  {
    id: 'xss_reflected',
    name: 'Reflected Cross-Site Scripting (XSS)',
    category: 'XSS',
    description: 'Tests URL parameters and form fields for unescaped HTML/JavaScript reflection.',
    enabled: true,
  },
  {
    id: 'xss_dom',
    name: 'DOM-based XSS Detection',
    category: 'XSS',
    description: 'Identifies JavaScript client sources (location.search, hash) flowing into dangerous sinks (innerHTML, eval).',
    enabled: true,
  },

  // File & Directory
  {
    id: 'dir_listing',
    name: 'Directory Listing & Indexing',
    category: 'File & Directory',
    description: 'Detects exposed web directory listings that expose sensitive internal assets or code files.',
    enabled: true,
  },
  {
    id: 'path_traversal',
    name: 'Directory & Path Traversal',
    category: 'File & Directory',
    description: 'Tests parameters for relative directory traversal dot-dot-slash sequence indicators (../../etc/passwd).',
    enabled: true,
  },
  {
    id: 'sensitive_files',
    name: 'Sensitive Files & Backups (.git, .env, .bak)',
    category: 'File & Directory',
    description: 'Scans for exposed version control (.git/config), environment configurations (.env), and source backups.',
    enabled: true,
  },
  {
    id: 'dir_404',
    name: 'Directory 404 Fingerprinting',
    category: 'File & Directory',
    description: 'Tests server custom error pages to detect information leakage and path differential behaviors.',
    enabled: true,
  },

  // Information Disclosure
  {
    id: 'debug_pages',
    name: 'Debug & Trace Endpoints',
    category: 'Information Disclosure',
    description: 'Detects exposed actuator endpoints, phpinfo(), swagger-ui, and stack trace dumps.',
    enabled: true,
  },
  {
    id: 'source_leak',
    name: 'Source Code Disclosure',
    category: 'Information Disclosure',
    description: 'Detects improper MIME handling returning unprocessed PHP, ASP, or template scripts.',
    enabled: true,
  },

  // Headers & SSL
  {
    id: 'csp_header',
    name: 'Content-Security-Policy (CSP) Check',
    category: 'Headers & SSL',
    description: 'Validates presence and rigor of CSP headers preventing unauthorized script execution.',
    enabled: true,
  },
  {
    id: 'cors_misconfig',
    name: 'CORS Misconfiguration',
    category: 'Headers & SSL',
    description: 'Checks for wildcard or null origin reflection in Access-Control-Allow-Origin headers.',
    enabled: true,
  },
  {
    id: 'cookie_flags',
    name: 'Cookie Security Flags (HttpOnly, Secure)',
    category: 'Headers & SSL',
    description: 'Audits Set-Cookie headers for missing Secure, HttpOnly, and SameSite protection.',
    enabled: true,
  },
  {
    id: 'ssl_tls_probe',
    name: 'SSL/TLS & Cipher Suite Probe',
    category: 'Headers & SSL',
    description: 'Analyzes HTTPS certificates, checks for SSLv2/v3, TLS 1.0 support, and weak ciphers (RC4, DES).',
    enabled: true,
  },
];
