import { ScanAlert, HttpLogRecord, InterceptTransaction, DiscoveredEndpoint, TargetScopeRule, ScanInstance } from '../types/vega';

export const INITIAL_ALERTS: ScanAlert[] = [
  {
    id: 'alt-001',
    title: 'SQL Injection in "artist" Parameter',
    severity: 'High',
    type: 'SQL Injection',
    host: 'testphp.vulnweb.com',
    path: '/artists.php',
    method: 'GET',
    parameter: 'artist',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvss: 8.9,
    description: 'The parameter "artist" in /artists.php was found to be vulnerable to SQL injection. When injecting a single quote followed by an SQL comment (1\' OR \'1\'=\'1), the database returned all records and triggered a syntax warning in alternative tests.',
    impact: 'An attacker can read, modify, or delete database tables, bypass authentication, and potentially execute system commands or exfiltrate database users and password hashes.',
    remediation: 'Use parameterized queries or prepared statements (PDO with prepared statements in PHP, PreparedStatement in Java) rather than concatenating user input directly into SQL strings.',
    request: {
      raw: `GET /artists.php?artist=1'%20OR%20'1'='1 HTTP/1.1
Host: testphp.vulnweb.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Vega/2.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Connection: close`,
      highlight: `artist=1'%20OR%20'1'='1`
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'Date': 'Fri, 02 Oct 2026 04:12:00 GMT',
        'Content-Type': 'text/html; charset=UTF-8',
        'Connection': 'close',
      },
      raw: `HTTP/1.1 200 OK
Server: nginx/1.19.0
Date: Fri, 02 Oct 2026 04:12:00 GMT
Content-Type: text/html; charset=UTF-8
Connection: close

<html>
<body>
<h2>Artist Info</h2>
<p>Artist: r4w (ID: 1)</p>
<p>Artist: John Doe (ID: 2)</p>
<p>Artist: Blind Test (ID: 3)</p>
<!-- SQL statement: SELECT * FROM artists WHERE id = '1' OR '1'='1' -->
</body>
</html>`,
      highlight: `<!-- SQL statement: SELECT * FROM artists WHERE id = '1' OR '1'='1' -->`
    },
    timestamp: '2026-10-02 04:12:15'
  },
  {
    id: 'alt-002',
    title: 'Reflected Cross-Site Scripting (XSS) in "searchFor"',
    severity: 'High',
    type: 'Cross-Site Scripting',
    host: 'testphp.vulnweb.com',
    path: '/search.php',
    method: 'POST',
    parameter: 'searchFor',
    cwe: 'CWE-79: Improper Neutralization of Input During Web Page Generation',
    cvss: 7.2,
    description: 'The POST parameter "searchFor" is reflected into the HTML document body without context-sensitive HTML encoding or sanitization.',
    impact: 'Attackers can execute arbitrary JavaScript in the victim\'s browser, hijack active session tokens, perform unauthorized actions on behalf of the user, or spoof website contents.',
    remediation: 'Apply context-aware output encoding (such as htmlspecialchars with ENT_QUOTES in PHP) before writing user parameters into HTML, and enforce a restrictive Content-Security-Policy (CSP).',
    request: {
      raw: `POST /search.php?test=query HTTP/1.1
Host: testphp.vulnweb.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 53

searchFor=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E&goButton=go`,
      highlight: `%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E`
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'Content-Type': 'text/html',
        'X-Powered-By': 'PHP/5.6.40',
      },
      raw: `HTTP/1.1 200 OK
Server: nginx/1.19.0
Content-Type: text/html

<div id="results">
Search results for: <script>alert(document.domain)</script>
<p>No records matched your search query.</p>
</div>`,
      highlight: `<script>alert(document.domain)</script>`
    },
    timestamp: '2026-10-02 04:12:30'
  },
  {
    id: 'alt-003',
    title: 'Directory Listing Enabled in /admin/backups/',
    severity: 'Medium',
    type: 'Directory Listing',
    host: 'testphp.vulnweb.com',
    path: '/admin/backups/',
    method: 'GET',
    cwe: 'CWE-548: Exposure of Information Through Directory Listing',
    cvss: 5.3,
    description: 'The web server does not have index file restrictions configured for /admin/backups/, returning an automated Apache/Nginx directory listing of files.',
    impact: 'Attackers can inspect sensitive files, database dumps (.sql), archive backups (.zip, .tar.gz), and hidden configuration scripts.',
    remediation: 'Disable directory browsing in server configuration (e.g. Options -Indexes in Apache, autoindex off; in Nginx).',
    request: {
      raw: `GET /admin/backups/ HTTP/1.1
Host: testphp.vulnweb.com
Accept: */*`,
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'Content-Type': 'text/html; charset=UTF-8',
      },
      raw: `HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<html>
 <head>
  <title>Index of /admin/backups/</title>
 </head>
 <body>
<h1>Index of /admin/backups/</h1>
<pre><a href="?C=N;O=D">Name</a>                    <a href="?C=M;O=A">Last modified</a>      <a href="?C=S;O=A">Size</a>
<hr><a href="/admin/">Parent Directory</a>                             -   
<a href="db_dump_2026.sql">db_dump_2026.sql</a>        2026-09-12 14:02  2.4M  
<a href="config.php.bak">config.php.bak</a>          2026-08-01 11:34   12K  
<hr></pre>
</body></html>`,
      highlight: `<title>Index of /admin/backups/</title>`
    },
    timestamp: '2026-10-02 04:12:44'
  },
  {
    id: 'alt-004',
    title: 'Exposed Git Repository Metadata (.git/config)',
    severity: 'Medium',
    type: 'Information Disclosure',
    host: 'testphp.vulnweb.com',
    path: '/.git/config',
    method: 'GET',
    cwe: 'CWE-538: File and Directory Information Exposure',
    cvss: 6.5,
    description: 'The .git/ directory is publicly accessible on the web root. Vega successfully fetched .git/config, revealing repository remote URL and branch details.',
    impact: 'Attackers can reconstruct the complete source code of the application, including secrets, API keys, and commit history.',
    remediation: 'Block web access to dotfiles and hidden folders (e.g. location ~ /\\.git { deny all; }) and remove .git directories from public deployment builds.',
    request: {
      raw: `GET /.git/config HTTP/1.1
Host: testphp.vulnweb.com
Connection: close`,
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'Content-Type': 'text/plain',
      },
      raw: `[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true
[remote "origin"]
	url = git@github.com:acme-corp/testphp-app.git
	fetch = +refs/heads/*:refs/remotes/origin/*`,
      highlight: `git@github.com:acme-corp/testphp-app.git`
    },
    timestamp: '2026-10-02 04:13:01'
  },
  {
    id: 'alt-005',
    title: 'Missing Content-Security-Policy (CSP) Header',
    severity: 'Low',
    type: 'Missing Security Header',
    host: 'testphp.vulnweb.com',
    path: '/',
    method: 'GET',
    cwe: 'CWE-693: Protection Mechanism Failure',
    cvss: 3.8,
    description: 'The HTTP response does not include a Content-Security-Policy header. This header restricts which scripts, images, and external origins can execute.',
    impact: 'Increases the likelihood that XSS or clickjacking attacks succeed.',
    remediation: 'Define and deploy a Content-Security-Policy header restricting script-src to trusted domains or cryptographically secure nonces.',
    request: {
      raw: `GET / HTTP/1.1
Host: testphp.vulnweb.com`,
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'Content-Type': 'text/html; charset=UTF-8',
      },
      raw: `HTTP/1.1 200 OK
Server: nginx/1.19.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html><html><body><h1>Welcome</h1></body></html>`,
    },
    timestamp: '2026-10-02 04:13:10'
  },
  {
    id: 'alt-006',
    title: 'Session Cookie Missing "HttpOnly" and "Secure" Flags',
    severity: 'Low',
    type: 'Insecure Cookie',
    host: 'testphp.vulnweb.com',
    path: '/login.php',
    method: 'POST',
    parameter: 'PHPSESSID',
    cwe: 'CWE-614: Sensitive Cookie in HTTPS Session Without Secure Attribute',
    cvss: 4.1,
    description: 'The Set-Cookie directive for "PHPSESSID" was issued without the HttpOnly attribute and without the Secure flag.',
    impact: 'Session cookies can be read via JavaScript (document.cookie) in XSS exploits or intercepted over plaintext HTTP.',
    remediation: 'Configure session cookies with "HttpOnly; Secure; SameSite=Strict" in php.ini (session.cookie_httponly = 1, session.cookie_secure = 1).',
    request: {
      raw: `POST /login.php HTTP/1.1
Host: testphp.vulnweb.com
Content-Type: application/x-www-form-urlencoded

uname=test&pass=test`,
    },
    response: {
      statusCode: 302,
      headers: {
        'Set-Cookie': 'PHPSESSID=4a9f939e6a0c0b9d8e7f; path=/',
      },
      raw: `HTTP/1.1 302 Found
Set-Cookie: PHPSESSID=4a9f939e6a0c0b9d8e7f; path=/
Location: /userinfo.php`,
      highlight: `Set-Cookie: PHPSESSID=4a9f939e6a0c0b9d8e7f; path=/`
    },
    timestamp: '2026-10-02 04:13:22'
  },
  {
    id: 'alt-007',
    title: 'Server Version Fingerprint Leaked in HTTP Header',
    severity: 'Info',
    type: 'Information Disclosure',
    host: 'testphp.vulnweb.com',
    path: '/',
    method: 'GET',
    cwe: 'CWE-200: Information Exposure',
    cvss: 2.1,
    description: 'The server returns precise software version metadata: "Server: nginx/1.19.0" and "X-Powered-By: PHP/5.6.40".',
    impact: 'Aids attackers in pinpointing known CVE exploits for outdated software versions.',
    remediation: 'Configure server_tokens off in Nginx and expose_php = Off in php.ini.',
    request: {
      raw: `HEAD / HTTP/1.1
Host: testphp.vulnweb.com`,
    },
    response: {
      statusCode: 200,
      headers: {
        'Server': 'nginx/1.19.0',
        'X-Powered-By': 'PHP/5.6.40',
      },
      raw: `HTTP/1.1 200 OK
Server: nginx/1.19.0
X-Powered-By: PHP/5.6.40`,
      highlight: `Server: nginx/1.19.0\nX-Powered-By: PHP/5.6.40`
    },
    timestamp: '2026-10-02 04:13:30'
  }
];

export const INITIAL_LOGS: HttpLogRecord[] = [
  {
    id: 101,
    timestamp: '04:12:02',
    method: 'GET',
    host: 'testphp.vulnweb.com',
    path: '/',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/html; charset=UTF-8',
    contentLength: 4210,
    durationMs: 74,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'User-Agent': 'Vega/2.0 (Scanner-Crawler)',
      'Accept': '*/*',
    },
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/html; charset=UTF-8',
      'Connection': 'keep-alive',
    },
    responseBody: '<!DOCTYPE html><html><head><title>ACME Art</title></head><body><h1>ACME Art Gallery</h1><a href="/artists.php">Artists</a></body></html>'
  },
  {
    id: 102,
    timestamp: '04:12:05',
    method: 'GET',
    host: 'testphp.vulnweb.com',
    path: '/artists.php?artist=1',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/html; charset=UTF-8',
    contentLength: 2150,
    durationMs: 82,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'User-Agent': 'Vega/2.0 (Scanner-Crawler)',
    },
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/html; charset=UTF-8',
    },
    responseBody: '<div><h2>Artist: r4w</h2><p>Description: Digital artworks.</p></div>'
  },
  {
    id: 103,
    timestamp: '04:12:15',
    method: 'GET',
    host: 'testphp.vulnweb.com',
    path: '/artists.php?artist=1%27%20OR%20%271%27=%271',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/html; charset=UTF-8',
    contentLength: 6420,
    durationMs: 145,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'User-Agent': 'Vega/2.0 (Scanner-Injector)',
    },
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/html; charset=UTF-8',
    },
    responseBody: '<!-- SQL statement: SELECT * FROM artists WHERE id = \'1\' OR \'1\'=\'1\' -->\n<div><h2>All Artists Displayed</h2></div>'
  },
  {
    id: 104,
    timestamp: '04:12:30',
    method: 'POST',
    host: 'testphp.vulnweb.com',
    path: '/search.php?test=query',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/html; charset=UTF-8',
    contentLength: 1840,
    durationMs: 98,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Vega/2.0 (Scanner-XSS)',
    },
    requestBody: 'searchFor=%3Cscript%3Ealert(document.domain)%3C%2Fscript%3E&goButton=go',
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/html',
    },
    responseBody: '<div id="results">Search results for: <script>alert(document.domain)</script></div>'
  },
  {
    id: 105,
    timestamp: '04:12:44',
    method: 'GET',
    host: 'testphp.vulnweb.com',
    path: '/admin/backups/',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/html; charset=UTF-8',
    contentLength: 890,
    durationMs: 65,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'User-Agent': 'Vega/2.0 (Scanner-DirFinder)',
    },
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/html',
    },
    responseBody: '<html><title>Index of /admin/backups/</title><body><a href="db_dump_2026.sql">db_dump_2026.sql</a></body></html>'
  },
  {
    id: 106,
    timestamp: '04:13:01',
    method: 'GET',
    host: 'testphp.vulnweb.com',
    path: '/.git/config',
    statusCode: 200,
    statusText: 'OK',
    contentType: 'text/plain',
    contentLength: 284,
    durationMs: 58,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'User-Agent': 'Vega/2.0 (Scanner-SensitiveFiles)',
    },
    responseHeaders: {
      'Server': 'nginx/1.19.0',
      'Content-Type': 'text/plain',
    },
    responseBody: '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n[remote "origin"]\n\turl = git@github.com:acme-corp/testphp-app.git'
  },
  {
    id: 107,
    timestamp: '04:13:22',
    method: 'POST',
    host: 'testphp.vulnweb.com',
    path: '/login.php',
    statusCode: 302,
    statusText: 'Found',
    contentType: 'text/html',
    contentLength: 312,
    durationMs: 110,
    requestHeaders: {
      'Host': 'testphp.vulnweb.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    requestBody: 'uname=test&pass=test',
    responseHeaders: {
      'Set-Cookie': 'PHPSESSID=4a9f939e6a0c0b9d8e7f; path=/',
      'Location': '/userinfo.php',
    },
    responseBody: 'Redirecting to /userinfo.php...'
  }
];

export const INITIAL_INTERCEPT: InterceptTransaction = {
  id: 'tx-4091',
  timestamp: '04:14:02',
  method: 'POST',
  url: 'http://testphp.vulnweb.com/cart.php?action=checkout',
  host: 'testphp.vulnweb.com',
  path: '/cart.php?action=checkout',
  headers: {
    'Host': 'testphp.vulnweb.com',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://testphp.vulnweb.com/cart.php',
    'Cookie': 'PHPSESSID=4a9f939e6a0c0b9d8e7f',
    'Accept': 'text/html,application/xhtml+xml',
    'Connection': 'keep-alive',
  },
  body: 'item_id=42&quantity=1&price=19.99&coupon=SUMMER2026',
  status: 'intercepted',
};

export const INITIAL_ENDPOINTS: DiscoveredEndpoint[] = [
  { id: 'ep-1', host: 'testphp.vulnweb.com', path: '/', method: 'GET', params: [], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-2', host: 'testphp.vulnweb.com', path: '/artists.php', method: 'GET', params: ['artist'], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-3', host: 'testphp.vulnweb.com', path: '/categories.php', method: 'GET', params: ['cat'], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-4', host: 'testphp.vulnweb.com', path: '/search.php', method: 'POST', params: ['searchFor', 'goButton'], statusCode: 200, formsCount: 1, inScope: true },
  { id: 'ep-5', host: 'testphp.vulnweb.com', path: '/login.php', method: 'POST', params: ['uname', 'pass'], statusCode: 302, formsCount: 1, inScope: true },
  { id: 'ep-6', host: 'testphp.vulnweb.com', path: '/userinfo.php', method: 'GET', params: [], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-7', host: 'testphp.vulnweb.com', path: '/cart.php', method: 'POST', params: ['item_id', 'quantity', 'price', 'coupon'], statusCode: 200, formsCount: 1, inScope: true },
  { id: 'ep-8', host: 'testphp.vulnweb.com', path: '/admin/backups/', method: 'GET', params: [], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-9', host: 'testphp.vulnweb.com', path: '/.git/config', method: 'GET', params: [], statusCode: 200, formsCount: 0, inScope: true },
  { id: 'ep-10', host: 'testphp.vulnweb.com', path: '/robots.txt', method: 'GET', params: [], statusCode: 200, formsCount: 0, inScope: true },
];

export const INITIAL_SCOPE: TargetScopeRule[] = [
  { id: 'sc-1', pattern: '^https?://testphp\\.vulnweb\\.com/.*$', type: 'include', enabled: true },
  { id: 'sc-2', pattern: '.*\\.(jpg|jpeg|png|gif|ico|svg|css|woff2?)$', type: 'exclude', enabled: true },
  { id: 'sc-3', pattern: '^https?://testphp\\.vulnweb\\.com/logout\\.php.*$', type: 'exclude', enabled: true },
];

export const INITIAL_SCAN_INSTANCE: ScanInstance = {
  id: 'scan-001',
  targetUrl: 'http://testphp.vulnweb.com',
  status: 'completed',
  progress: 100,
  startTime: '2026-10-02 04:12:00',
  endTime: '2026-10-02 04:13:35',
  totalRequests: 284,
  requestsPerSecond: 18.2,
  urlsDiscovered: 42,
  currentTask: 'Scan Complete - 7 Vulnerabilities Detected',
  alerts: INITIAL_ALERTS,
};
