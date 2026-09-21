---
title:       "OSDA Exam"
summary:     "SOC-200: Security Operations and Defensive Analysis"
category:    "OffSec"
tags:        [osda, offsec]
updated:     2026-07-26
---

{% raw %}

## SOC-200 / OSDA Cheatsheet

Detection-focused reference for OffSec's **SOC-200** course and the **OffSec Defense Analyst (OSDA)** exam.

> **Exam mindset:** OSDA is a *blue-team* exam. Your job is to **detect, correlate, and report** attacker activity from logs (ELK/Elastic Stack). For every attacker TTP below, the useful question is: *"What artifact does this leave, and which query surfaces it?"* Chain individual detections into a narrative (initial access → execution → privesc → lateral movement → persistence) — that narrative is what scores points.

---

## 0. Attacker Methodology & Defensive Frames

**Kill chain → detection mapping**

| Phase | Attacker action | Where to look |
|---|---|---|
| Recon / Initial Access | Phishing, exploit public-facing app | Web/proxy logs, mail gateway, IDS |
| Execution | Payload runs (macro, script, exploit) | Sysmon 1, Security 4688, PowerShell logs |
| Persistence | Autoruns, services, scheduled tasks | Sysmon 12/13, Security 4698/7045 |
| Priv Esc | Token abuse, service abuse, UAC bypass | Security 4672/4673, Sysmon 10 |
| Defense Evasion | AMSI/logging bypass, obfuscation | PowerShell 4104, Sysmon 7 |
| Cred Access | LSASS dump, Kerberoast, DCSync | Sysmon 10 (lsass), Security 4769/4662 |
| Lateral Movement | PsExec, WMI, WinRM, RDP, PtH | Security 4624 (type 3/9/10), 7045 |
| C2 / Exfil | Beaconing, tunneling | IDS, DNS logs, netflow, Sysmon 3/22 |

**Pyramid of Pain** — detections built on TTPs (top) hurt attackers more than hash/IP indicators (bottom). Prioritize behavioral detections.

**Growth mindset (course framing):** attackers adapt, so detections must be behavioral and revisable, not static signature lists.

---

## 1. ELK / KQL Fundamentals

### KQL syntax

```
field1: value1 and field2:"value 2" and not field3: value3* and field4.subfield <= 30
```

- `and` / `or` / `not` (case-insensitive); parentheses for grouping.
- `*` = wildcard. `:` = match. `>= <= > <` for numeric/date ranges.
- Quote values containing spaces/special chars. Escape `\` in Windows paths or use wildcards.
- **Free text**: bare term (`"psexec"`) searches across analyzed fields — good for hunting, noisy for precision.

### Core ECS fields to know cold

| Field | Meaning |
|---|---|
| `host.hostname` | Endpoint name |
| `event.code` | Windows Event ID / Sysmon ID |
| `data_stream.dataset` | Log source (e.g. `windows.sysmon_operational`, `windows.security`) |
| `event.action` / `event.outcome` | Normalized action + success/failure |
| `process.name` / `process.command_line` / `process.pid` | Process context |
| `process.parent.name` | Parent process (crucial for anomaly detection) |
| `user.name` / `user.domain` | Actor |
| `source.ip` / `destination.ip` / `destination.port` | Network 5-tuple |
| `winlog.event_data.*` | Raw Windows event fields not yet normalized |

### Query pattern templates

```kql
# Sysmon process creation on one host
host.hostname: "appsrv01" and data_stream.dataset: "windows.sysmon_operational" and event.code: "1"

# Web access, exclude local noise
"apache-access" and host.hostname: "web01" and not source.ip: 127.0.0.1

# Snort/IDS alerts, IPv4 only
tags: "snort.log" and network.type: "ipv4"
```

### OSQuery patterns

```sql
SELECT field1, field2 FROM table1 WHERE field1 = 'value1' AND field2 LIKE '%value2%';

-- Suspicious files dropped to Desktop
SELECT directory, filename FROM file
WHERE path LIKE 'C:\Users\%\Desktop\%' AND filename LIKE '%.txt';

-- Autoruns / persistence surface
SELECT name, path, source FROM startup_items;

-- Listening processes (C2 / backdoor hunt)
SELECT DISTINCT p.name, l.port, l.protocol
FROM listening_ports l JOIN processes p ON l.pid = p.pid;
```

---

## 2. Windows Endpoint — Event IDs You Must Know

### Security log (channel: `Security`)

| ID | Event | Detection value |
|---|---|---|
| 4624 | Successful logon | **Logon Type** is key — see table below |
| 4625 | Failed logon | Brute force, password spray (watch counts per source) |
| 4634 / 4647 | Logoff | Session correlation |
| 4648 | Logon w/ explicit creds | `runas`, lateral movement, PtH indicators |
| 4672 | Special privileges assigned | Admin/SYSTEM logon |
| 4673 / 4674 | Privileged service call | Priv-esc / sensitive privilege use |
| 4688 | Process creation | Enable cmdline auditing! `process.command_line` |
| 4697 / 7045 | Service installed | PsExec, malicious service |
| 4698 / 4702 | Scheduled task created/updated | Persistence |
| 4720 / 4722 / 4738 | User created/enabled/changed | Account manipulation |
| 4728 / 4732 / 4756 | Member added to (global/local/universal) group | Privilege abuse (e.g. Domain Admins) |
| 4768 | Kerberos TGT requested (AS-REQ) | AS-REP roasting, initial auth |
| 4769 | Kerberos service ticket (TGS-REQ) | **Kerberoasting** (watch RC4/encryption type 0x17) |
| 4771 | Kerberos pre-auth failed | Kerberos brute force |
| 4776 | NTLM credential validation | NTLM auth, PtH |
| 4662 | Operation on AD object | **DCSync** (Replicating Directory Changes GUID) |
| 1102 | Security log cleared | Anti-forensics |

**Logon Types (event 4624**`winlog.event_data.LogonType`**)**

| Type | Meaning | Notable for |
|---|---|---|
| 2 | Interactive (console) | Physical/RDP console |
| 3 | Network | SMB, WMI, most **lateral movement** |
| 4 | Batch | Scheduled tasks |
| 5 | Service | Service account |
| 7 | Unlock |  |
| 8 | NetworkCleartext | Cleartext creds (IIS basic auth) |
| 9 | NewCredentials | `runas /netonly`, **PtH / overpass-the-hash** |
| 10 | RemoteInteractive | **RDP** |
| 11 | CachedInteractive | Cached domain creds |

### Sysmon (channel: `Microsoft-Windows-Sysmon/Operational`, dataset `windows.sysmon_operational`)

| ID | Event | Hunt for |
|---|---|---|
| 1 | Process create | Full cmdline, hashes, parent — the workhorse |
| 2 | File creation time changed | Timestomping (defense evasion) |
| 3 | Network connection | C2, beaconing, unusual dest ports |
| 5 | Process terminated | Session/timeline correlation |
| 6 | Driver loaded | Rootkits, BYOVD |
| 7 | Image/DLL loaded | DLL sideloading, unsigned modules, AMSI DLLs |
| 8 | CreateRemoteThread | Process injection |
| 10 | ProcessAccess | **LSASS access** (credential dumping) |
| 11 | File create | Dropped payloads, web shells |
| 12/13/14 | Registry object/value/key | Run keys, persistence, AMSI/ETW tamper |
| 15 | FileCreateStreamHash | ADS / mark-of-the-web abuse |
| 17/18 | Named pipe created/connected | PsExec, Cobalt Strike default pipes |
| 22 | DNS query | DNS tunneling, C2 domains |
| 23/26 | File delete | Evidence destruction |

**PowerShell logging**

- **4103** – module logging (pipeline). **4104** – script block logging (deobfuscated code — gold for detection). **400/403/600** – engine start/stop.

```kql
event.code: "4104" and powershell.file.script_block_text: (*FromBase64String* or *IEX* or *DownloadString* or *-enc*)
```

---

## 3. Initial Access Detections

### Web Attacks (proxy / apache-access / IIS logs)

**SQL injection**

```kql
"apache-access" and url.query: (*UNION* or *SELECT* or *' or 1=1* or *information_schema* or *sleep(* or *waitfor delay*)
```

- Also watch: bursts of 500s, abnormal response sizes, single IP hitting one param repeatedly.

**LFI / RFI / path traversal**

```kql
"apache-access" and url.query: (*../* or *..%2f* or */etc/passwd* or *php://* or *data://* or *http\://*)
```

**Command injection**

```kql
url.query: (*%3B* or *";"* or *|* or *`* or *$(* or *&&* or *whoami* or *nc%20* or *curl* or *wget*)
```

**Malicious file upload / web shell**

- Sysmon 11 (file create) writing `.php/.aspx/.jsp` into a web root; then the **web server process spawning cmd.exe/sh** (Sysmon 1 parent-child anomaly).

```kql
event.code: "1" and process.parent.name: ("w3wp.exe" or "httpd" or "apache2" or "nginx" or "php-fpm") and process.name: ("cmd.exe" or "powershell.exe" or "sh" or "bash" or "whoami")
```

### Credential Attacks

**SSH (auth.log / filebeat system)**

```kql
# Successful login — pivot on user.name, count by source.ip
event.action: "ssh_login" and event.outcome: success

# Brute force — many failures then a success from same source.ip
event.action: "ssh_login" and event.outcome: failure
```

- Correlate: N failures from `source.ip` followed by a success = likely successful brute force.

**Windows brute / spray**

```kql
event.code: "4625"          // count failures per source / per account
event.code: "4625" and winlog.event_data.SubStatus: "0xC000006A"   // bad password
```

- **Spray** = one password across many accounts (low failures per account, many accounts). **Brute** = many failures against few accounts.

---

## 4. Windows Server-Side Attacks

- Exploitation of a listening service → look for the **service process spawning a shell/child** (parent-child anomaly, section 3 web-shell query generalizes).
- Crashes/restarts of the vulnerable service (Application/System log) near the intrusion window.
- IDS/Snort alert on the exploit signature + matching `source.ip` in host telemetry.

```kql
event.code: "1" and process.parent.name: ("sqlservr.exe" or "tomcat*.exe" or "java.exe" or "spoolsv.exe") and process.name: ("cmd.exe" or "powershell.exe")
```

---

## 5. Windows Client-Side Attacks

**Malicious Office docs / macros** — Office app spawning script/shell:

```kql
event.code: "1" and process.parent.name: ("winword.exe" or "excel.exe" or "powerpnt.exe" or "outlook.exe") and process.name: ("cmd.exe" or "powershell.exe" or "wscript.exe" or "cscript.exe" or "mshta.exe" or "rundll32.exe" or "regsvr32.exe")
```

**LOLBins** (living-off-the-land) — legit binaries used maliciously: `mshta`, `rundll32`, `regsvr32`, `certutil` (download/encode), `bitsadmin`, `msbuild`, `installutil`, `wmic`.

```kql
process.name: "certutil.exe" and process.command_line: (*-urlcache* or *-decode* or *-encode*)
```

---

## 6. Windows Privilege Escalation

- **UAC bypass** — high-integrity child from auto-elevating binary; `fodhelper.exe`/`eventvwr.exe`/`sdclt.exe` spawning cmd; registry hijack in `HKCU\...\shell\open\command` (Sysmon 13).
- **Token manipulation / SeImpersonate** (Potato attacks) — service account → SYSTEM; watch 4672/4673 plus a service-account process spawning SYSTEM shell.
- **Service abuse** — 7045/4697 new service, or unquoted-path / weak-perms binary replacement (Sysmon 11 writing over a service exe).
- **Sensitive privilege use** — `event.code: "4673"` / `4674`.

```kql
event.code: "13" and registry.path: (*\\shell\\open\\command* or *ms-settings*)   // UAC-bypass reg hijack
```

---

## 7. Linux Endpoint & Detections

**Sources:** `auditd`, `/var/log/auth.log` (Debian) / `secure` (RHEL), `syslog`, `journald`, bash history, `/var/log/audit/audit.log`.

| Signal | Where |
|---|---|
| Auth success/failure | auth.log / secure, `event.action: ssh_login` |
| sudo abuse | auth.log `sudo:` entries, auditd `execve` |
| New user / passwd change | `useradd`, `passwd`, `/etc/passwd` writes |
| Cron persistence | `/etc/cron*`, `crontab -e`, auditd file watches |
| Suspicious execve | auditd `type=EXECVE` |
| SUID abuse (privesc) | auditd, GTFOBins binaries run as root |
| Reverse shell | process w/ socket to external IP (`bash -i`, `nc`, `python -c`) |

```kql
# Linux server-side / reverse shell indicators
process.name: ("bash" or "sh" or "nc" or "ncat" or "python*" or "perl") and process.command_line: (*"-i"* or *"/dev/tcp/"* or *"nc "* or *"-e /bin/"*)

# sudo to root by unexpected user
event.dataset: "system.auth" and process.name: "sudo" and message: *COMMAND=*
```

**Linux privesc hunts:** SUID GTFOBins execution, dirty-cow/kernel-exploit compiles (`gcc` in `/tmp`), writable `/etc/passwd` or cron, capability abuse (`getcap`).

---

## 8. Network Detections (Snort / Suricata / Zeek)

- **Snort/Suricata** alerts land in ELK with `tags: "snort.log"` (or `event.dataset: suricata.eve`). Pivot from `rule.name` / `signature` to host telemetry via `source.ip`/`destination.ip`.

```kql
tags: "snort.log" and network.type: "ipv4" and not destination.ip: 10.0.0.0/8
```

- Snort rule anatomy (read, don't necessarily write):

```
alert tcp any any -> $HOME_NET 445 (msg:"SMB exploit attempt"; content:"|FF|SMB"; sid:1000001; rev:1;)
```

- **Beaconing** — regular-interval, similar-size connections to one destination (jitter aside). Aggregate `destination.ip` + count + interval.
- **Zeek** conn/dns/http logs give netflow-level pivoting when packet payload isn't logged.

---

## 9. Antivirus Alerts & Evasion Detections

- **AV/Defender alerts** are a signal *and* a pivot — take the flagged path/hash and hunt the process tree around detonation time.
- **AMSI bypass** — PowerShell 4104 containing `amsiInitFailed`, `[Ref].Assembly`, `System.Management.Automation.AmsiUtils`, reflection to patch amsi.dll.
- **ETW tampering** — patching `EtwEventWrite`, disabling logging providers.
- **Obfuscation** — long base64 blobs, `-EncodedCommand`, char-array reassembly, backtick splitting → script-block logging (4104) deobfuscates it for you.

```kql
event.code: "4104" and powershell.file.script_block_text: (*AmsiUtils* or *amsiInitFailed* or *EtwEventWrite* or *VirtualProtect*)
```

---

## 10. Network Evasion & Tunneling

- **DNS tunneling** — high volume of TXT/NULL queries, long/high-entropy subdomains, many unique subdomains under one parent domain.

```kql
event.code: "22" and dns.question.name: *   // then aggregate: count unique subdomains per registered domain
```

- **HTTP(S) tunneling / C2 over 443** — long-lived connections, odd JA3, self-signed certs, no matching browser/user process (Sysmon 3 with unexpected parent).
- **ICMP / port-forwarding tunnels** — abnormal ICMP payload sizes; SSH `-L/-R/-D` on internal hosts.
- Pivot IDS tunneling alerts against `destination.ip` reputation + host process owning the socket.

---

## 11. Active Directory Enumeration Detections

- **BloodHound / SharpHound** — burst of LDAP queries, mass `4662` object reads, many `4769` service-ticket requests in a short window, session enumeration (SAMR/`4661`), reads of `objectClass=user/computer/group`.
- **LDAP recon** — `event.code: 4662` spikes; unusual account querying `adminCount`, `servicePrincipalName`.
- **Kerberoast prep** — enumerating SPNs (`4769` for many distinct services from one user).

```kql
# Kerberoasting — RC4 (0x17) service tickets, often many services / one account
event.code: "4769" and winlog.event_data.TicketEncryptionType: "0x17"

# AS-REP roasting — TGT requested for accounts w/ preauth disabled
event.code: "4768" and winlog.event_data.PreAuthType: "0"
```

---

## 12. Windows Lateral Movement Detections

| Technique | Primary artifacts |
|---|---|
| **PsExec** | 7045 (`PSEXESVC` service), 4624 type 3, named pipe (Sysmon 17/18), `psexesvc.exe` |
| **WMI (wmiexec)** | `wmiprvse.exe` spawning cmd/powershell (Sysmon 1), 4624 type 3 |
| **WinRM (PS remoting)** | `wsmprovhost.exe` as parent, 4624, port 5985/5986 |
| **RDP** | 4624 **type 10**, 4778/4779, `mstsc`/`rdpclip` |
| **Scheduled task (schtasks /s)** | 4698 on remote host |
| **Pass-the-Hash** | 4624 **type 9** / 4648, NTLM `4776`, `sekurlsa` |
| **Overpass-the-hash** | 4768 with RC4 right after PtH |

```kql
# Remote-service style lateral movement (PsExec-like)
event.code: "7045" and winlog.event_data.ServiceName: (*PSEXESVC* or *PAExec* or *RemCom*)

# WMI/WinRM remote exec parents
event.code: "1" and process.parent.name: ("wmiprvse.exe" or "wsmprovhost.exe") and process.name: ("cmd.exe" or "powershell.exe")

# RDP interactive logon
event.code: "4624" and winlog.event_data.LogonType: "10"
```

---

## 13. Active Directory Persistence & Cred Access Detections

| Attack | Detection |
|---|---|
| **DCSync** | `4662` with replication GUIDs `1131f6aa-…`/`1131f6ad-…` (Replicating Directory Changes) from a **non-DC** account |
| **Golden Ticket** | TGT anomalies: 4769 without preceding 4768, mismatched domain/RID, absurd ticket lifetime, `krbtgt` misuse |
| **Silver Ticket** | Service ticket use (4624/4634 on service) with **no** corresponding 4768/4769 at the DC |
| **DCShadow** | Rogue DC registration, unusual replication source |
| **Skeleton Key** | LSASS patched on DC (Sysmon 10 access to lsass on DC), RC4 downgrade |
| **AdminSDHolder / ACL abuse** | 4662/5136 modifying `CN=AdminSDHolder`, ACL changes on privileged objects |
| **Malicious GPO** | 5136/5137 directory changes to GPO objects |
| **New DA member** | 4728/4756 adding to Domain/Enterprise Admins |

```kql
# DCSync from non-DC
event.code: "4662" and winlog.event_data.Properties: (*1131f6aa-9c07-11d1-f79f-00c04fc2dcd2* or *1131f6ad-9c07-11d1-f79f-00c04fc2dcd2*) and not user.name: *$
```

**LSASS dumping (cred access)** — Sysmon 10 access to `lsass.exe` with dump-style access masks (0x1010/0x1410), or 4688/1 for `procdump`/`comsvcs.dll MiniDump`/`rundll32 ... MiniDump`:

```kql
(event.code: "10" and winlog.event_data.TargetImage: *lsass.exe*) or (process.command_line: (*comsvcs.dll*MiniDump* or *procdump*lsass* or *sekurlsa*))
```

---

## 14. SIEM Workflow — ELK Part I & II

**Part I (Intro to ELK):** index/data-stream patterns, Discover, KQL filters, field pivoting, saving searches, timeline building.

**Part II (Combining the logs):** correlate across sources into one attack story:

1. **Anchor** on the strongest alert (IDS hit, AV detection, 4104 obfuscation, LSASS access).
2. **Pivot** on shared keys: `source.ip` ↔ `host.hostname` ↔ `user.name` ↔ `process.pid`/`process.entity_id` ↔ time window.
3. **Walk the process tree** (parent → child) with Sysmon 1 + Security 4688.
4. **Trace lateral movement** across hosts via logon type + timestamps.
5. **Confirm persistence & impact**, then write the timeline.

**Exam reporting tip:** for each finding record — timestamp, host, user, source→dest, technique (MITRE ID), the evidence field/query, and how it links to the next step. That chain *is* the report.

---

## 15. Quick Reference — "See X → Suspect Y"

| Observation | Likely technique |
|---|---|
| Office app → powershell/cmd | Malicious macro / client-side exec |
| Web server process → cmd/sh | Web shell |
| `certutil -urlcache` / `bitsadmin` | Payload download (LOLBin) |
| 4769 with 0x17, many services | Kerberoasting |
| 4768, PreAuthType 0 | AS-REP roasting |
| 4624 type 3 + 7045 PSEXESVC | PsExec lateral movement |
| 4624 type 10 | RDP lateral movement |
| 4624 type 9 / 4648 + NTLM | Pass-the-Hash |
| Sysmon 10 → lsass | Credential dumping |
| 4662 replication GUID, non-DC | DCSync |
| 1102 / audit.log cleared | Anti-forensics |
| Many TXT DNS, long subdomains | DNS tunneling |
| fodhelper/eventvwr → cmd | UAC bypass |

---

*Fill in host-specific field names as you meet them in the labs — encryption-type codes,*`winlog.event_data.*`*names, and dataset strings can vary by ingest pipeline. Verify each query against your actual ELK index before relying on it in the exam.*

{% endraw %}
