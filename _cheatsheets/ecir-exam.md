---
title:       "eCIR Exam"
summary:     "Certified Incident Responder (eLearnSecurity / INE)"
category:    "INE"
tags:        [ecir, ine]
updated:     2026-07-26
---

{% raw %}

## eCIR Field Guide (Full Edition) — Certified Incident Responder (eLearnSecurity / INE)

A comprehensive study, reference, and methodology pack for the **eCIR** exam — incident investigation, log analysis (Splunk & Elastic), PCAP/network-traffic analysis, endpoint & memory forensics, and a fully worked example.

> **Exam mindset:** eCIR rewards the **analyst mindset**, not memorized syntax. For every suspicious artifact you find, the reflex is *pivot and view it from every angle.* Saw a PowerShell launch? Find its process-create event, its network connections, its registry writes, its child processes, its parent. Note **everything** — IPs, hashes, timestamps, usernames, filenames — because you *will* reuse them. The exam is two hands-on scenarios (Splunk, then Elastic + a PCAP): for each, reconstruct **what happened, in what order, and which MITRE TTPs**, then write it up as a timeline.

---

## Table of Contents

1. Introduction to eCIR
2. Incident Response Mindset & Workflow
3. Log Sources & What They Tell You
4. Splunk SPL — Full Cheatsheet
5. Elastic / KQL — Full Cheatsheet
6. Windows Event Codes — Reference
7. Sysmon — Reference & Detections
8. PowerShell & Script-Based Attack Detection
9. Linux Incident Response
10. Web Attack Detection
11. Network & IDS Detection (Snort/Suricata/Zeek)
12. Wireshark / PCAP Investigation Methodology
13. Credential Access & Active Directory Attacks
14. Persistence Detection
15. Lateral Movement Detection
16. Command & Control / Exfiltration Detection
17. Endpoint & Memory Forensics (quick reference)
18. MITRE ATT&CK — Detection Mapping
19. Indicators of Compromise (IOC) Cheatsheet
20. Timeline Building & Report Template
21. Kerberos & Authentication Deep-Dive
22. Email / Phishing Analysis
23. Malware Triage Basics
24. Windows Disk Forensic Artifacts
25. Common Ports & Services Reference
26. Exam-Day Playbook
27. Glossary
28. Appendix A — Worked Example: Scenario 2 PCAP Report
29. Appendix B — Worked Example: Splunk Scenario (mini)
30. Appendix C — Quick "See X → Suspect Y" Table

---

## 1. Introduction to eCIR

The eCIR (eLearnSecurity Certified Incident Responder) tests the ability to investigate cyber incidents, analyze logs and network traffic, and think like a real SOC analyst — piecing together what happened during an attack and explaining it clearly, rather than reciting theory.

### Study path & platforms

- **HackTheBox (SOC Analyst Path)** — learn how logs are correlated; strong for **Splunk SPL** practice.
- **LetsDefend** — sharpens the SOC-analyst mindset: judging whether an event is suspicious, what to pivot to next, and how to build a per-machine event timeline.
- **Splunk Free** — hands-on SPL.
- **Elastic Stack on a VM** — KQL in Discover; timeline building.
- **Wireshark** — PCAP analysis.
- **Sysmon + Event Viewer** — generating and reading Windows endpoint telemetry.

### Exam format & advice

- Hands-on + report (an MCQ version has been announced — **check the official INE site for the current format**).
- Two scenarios: **(1) Splunk**, **(2) Elastic with a PCAP to analyze**. For each, reconstruct events into a timeline and map attacker techniques to **MITRE ATT&CK TTPs**.
- Don't over-invest in perfecting **SPL** or **KQL** syntax, or memorizing every Windows Event Code — understand them well enough to reason about what you find. **Mindset over syntax.**
- **Note everything** — a found attacker IP or initial-access point is a huge pivot you'll reuse repeatedly.
- Spot something suspicious → **view it from all perspectives** (network, registry, child processes, parent).
- Not easy, but very passable with good practice and an analyst mindset.

---

## 2. Incident Response Mindset & Workflow

**The core loop (run this per finding):**

1. **Spot** something suspicious (alert, odd process, weird connection).
2. **Pivot** — re-query the same event from other log sources / event types.
3. **Expand** — did it spawn children? Make network connections? Touch the registry? Drop files?
4. **Anchor** the artifacts (IP, host, user, PID, time) into your notes.
5. **Chain** — link this event to what came before and after.
6. **Map** to MITRE ATT&CK.

**Note-taking template (keep open the whole exam):**

```
[TIMESTAMP] HOST / USER
Source log      : (Splunk index / sourcetype / Sysmon EID / PCAP frame)
What happened   : one line
Key artifacts   : src.ip, dst.ip, hash, filename, PID, command line
MITRE           : Txxxx (Technique name)
Links to        : previous/next event
```

**IR lifecycle (NIST SP 800-61 / SANS PICERL):**

| Phase | Goal | Analyst focus |
|---|---|---|
| Preparation | Tooling, baselines, logging | Know normal before abnormal |
| **Identification** | Detect & scope the incident | **Bulk of the exam** |
| Containment | Stop the spread (short/long term) | Isolate hosts, disable accounts |
| Eradication | Remove attacker footholds | Kill persistence, rebuild |
| Recovery | Restore to normal | Validate, monitor |
| Lessons Learned | Improve | Detections, hardening |

**Attack-chain lens (order your findings this way):** Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery → Lateral Movement → Collection → Command & Control → Exfiltration → Impact.

**Pyramid of Pain** — detections built on **TTPs** (top) hurt attackers far more than hash/IP indicators (bottom): Hash → IP → Domain → Network/Host Artifact → Tool → **TTP**. Prioritize behavioral detections.

---

## 3. Log Sources & What They Tell You

| Source | Key content | Primary use |
|---|---|---|
| Windows Security log | Logons, priv use, process creation (4688), account/group changes | Auth, lateral movement, privilege abuse |
| Sysmon | Process create/network/registry/image-load/LSASS access | Endpoint behavioral detection |
| PowerShell logs | Script-block (4104), module (4103) | Script-based attacks, deobfuscation |
| Windows System log | Service installs (7045), driver loads | Persistence, BYOVD |
| IIS / Apache / Nginx | HTTP requests, status, user-agent | Web attacks, web shells |
| Firewall / proxy | Connections, allow/deny, bytes | C2, exfil, beaconing |
| IDS (Snort/Suricata) | Signature alerts | Known-bad traffic |
| Zeek (Bro) | conn/dns/http/ssl logs | Netflow-level pivoting |
| Linux auditd / syslog | execve, auth, sudo | Linux endpoint IR |
| PCAP | Full packet detail | Ground truth when logs are thin |

---

## 4. Splunk SPL — Full Cheatsheet

**Anatomy:** `index=<idx> sourcetype=<st> <filters> | <transform> | <stats/table/sort>` — pipe passes results left→right; filter early, transform later.

### Search & time

```spl
index=main sourcetype=WinEventLog:Security EventCode=4625     # failed logons
index=* "powershell" OR "cmd.exe"                             # free-text across all
index=main host=WIN-01 EventCode=4688 | head 50               # first 50 process creates
index=main earliest=-24h latest=now                           # relative time
index=main earliest="04/21/2019:16:00:00" latest="04/21/2019:18:00:00"   # absolute
```

### Core commands (know these cold)

| Command | Purpose |
|---|---|
| `stats count by f` / `stats count values(f) dc(f) by g` | Aggregate, list distinct, distinct-count |
| `table f1 f2` / `fields f1 f2` | Choose columns |
| `sort -count` / `sort _time` | Order (`-` = descending) |
| `dedup f` | One row per unique value |
| `top f` / `rare f` | Most / least common — outlier hunting |
| `eval new=expr` | Derive fields (`if`, `case`, `like`, `match`) |
| `rex field=f "(?<cap>regex)"` | Regex extraction |
| `timechart span=1h count by f` | Time buckets (spikes, beaconing) |
| `transaction f maxspan=5m` | Group related events into sessions |
| `lookup` / `inputlookup` | Enrich against known-bad / asset lists |
| `iplocation ip` / `geostats` | Geo-enrich |
| `bin _time span=1m` | Bucket for custom aggregation |
| `eventstats` / `streamstats` | Add aggregates without collapsing rows |

### Detection query cookbook

```spl
# --- Brute force / password spray ---
index=main EventCode=4625 | stats count by src_ip, Account_Name | sort -count
index=main EventCode=4625 | stats dc(Account_Name) as accounts by src_ip | where accounts>10   # spray

# Failed-then-success from one source (successful brute)
index=main (EventCode=4625 OR EventCode=4624)
| stats count(eval(EventCode=4625)) as fails count(eval(EventCode=4624)) as success by src_ip, Account_Name
| where fails>10 AND success>0

# --- Execution ---
index=main (EventCode=4688 OR EventCode=1) | table _time host ParentImage Image CommandLine
index=main EventCode=1 ParentImage IN ("*winword.exe","*excel.exe","*outlook.exe","*w3wp.exe","*httpd*") Image IN ("*cmd.exe","*powershell.exe","*wscript.exe","*cscript.exe","*mshta.exe","*rundll32.exe","*regsvr32.exe")

# Encoded / download PowerShell
index=main (EventCode=4104 OR EventCode=1) (CommandLine="*-enc*" OR CommandLine="*FromBase64String*" OR CommandLine="*DownloadString*" OR CommandLine="*IEX*" OR CommandLine="*Invoke-Expression*")

# LOLBins
index=main EventCode=1 ((Image="*certutil.exe" AND CommandLine="*urlcache*") OR Image="*bitsadmin.exe" OR Image="*mshta.exe" OR (Image="*rundll32.exe" AND CommandLine="*javascript*"))

# --- Discovery ---
index=main EventCode=1 Image IN ("*whoami.exe","*net.exe","*net1.exe","*nltest.exe","*ipconfig.exe","*systeminfo.exe","*tasklist.exe","*arp.exe") | stats count by host, Image, CommandLine

# --- Credential access ---
index=main EventCode=10 TargetImage="*lsass.exe" | table _time host SourceImage GrantedAccess
index=main EventCode=1 (CommandLine="*comsvcs.dll*MiniDump*" OR CommandLine="*procdump*lsass*" OR CommandLine="*sekurlsa*" OR CommandLine="*mimikatz*")

# --- Persistence ---
index=main (EventCode=7045 OR EventCode=4697) | table _time host Service_Name Service_File_Name
index=main EventCode=4698 | table _time host Task_Name    # scheduled task
index=main EventCode=13 TargetObject="*\\CurrentVersion\\Run*"   # run key

# --- Lateral movement ---
index=main EventCode=4624 Logon_Type IN (3,9,10) | stats count by src_ip, Account_Name, Logon_Type
index=main EventCode=4624 Logon_Type=10 | table _time host src_ip Account_Name   # RDP

# --- C2 / network ---
index=main EventCode=3 | stats count by Image, DestinationIp, DestinationPort | sort -count
index=main EventCode=3 DestinationIp=<ip> | timechart span=1m count      # beaconing
index=main EventCode=22 | stats dc(QueryName) as uniq by host | sort -uniq   # DNS tunneling surface

# --- Anti-forensics ---
index=main EventCode=1102                # security log cleared
index=main EventCode=1 CommandLine="*wevtutil*cl*"
```

**Tips:** `stats count by … | sort -count` finds outliers fast; `top`/`rare` surface the single weird value; `transaction`/`streamstats` stitch a host's story; widen the time picker once you find an anchor; use `lookup` to tag known-bad IPs/hashes.

---

## 5. Elastic / KQL — Full Cheatsheet

**Syntax:** `field: value and field2: "two words" and not field3: bad* and bytes >= 1000` — `and`/`or`/`not`, `*` wildcard, quotes for phrases, ranges with `>= <= > <`, parentheses to group.

**Core ECS fields:** `host.hostname`, `event.code`, `event.action`, `event.outcome`, `data_stream.dataset`, `process.name`, `process.command_line`, `process.parent.name`, `process.entity_id`, `user.name`, `source.ip`, `destination.ip`, `destination.port`, `dns.question.name`, `url.original`, `http.request.method`, `winlog.event_data.*`.

```kql
# Process create on a host
host.hostname: "WIN-01" and event.code: "1"

# Office/web spawning a shell
event.code: "1" and process.parent.name: ("winword.exe" or "excel.exe" or "outlook.exe" or "w3wp.exe") and process.name: ("cmd.exe" or "powershell.exe" or "mshta.exe" or "wscript.exe" or "rundll32.exe")

# Encoded PowerShell (script-block)
event.code: "4104" and powershell.file.script_block_text: (*FromBase64String* or *IEX* or *DownloadString* or *-enc* or *Invoke-Expression*)

# LOLBin download
process.name: "certutil.exe" and process.command_line: (*-urlcache* or *-decode*)

# LSASS access
event.code: "10" and winlog.event_data.TargetImage: *lsass.exe*

# Lateral movement logon types
event.code: "4624" and winlog.event_data.LogonType: ("3" or "9" or "10")

# New service
event.code: ("7045" or "4697")

# Scheduled task
event.code: "4698"

# Run-key persistence
event.code: "13" and registry.path: *\\CurrentVersion\\Run*

# DNS tunneling surface
event.code: "22" and dns.question.name: *

# Web attack in proxy/access logs
event.dataset: ("apache.access" or "nginx.access") and url.query: (*UNION* or *../* or */etc/passwd* or *<script* or *' or 1=1*)
```

Use **Discover** to filter, add columns, read raw `winlog.event_data.*`, then build a timeline by sorting on `@timestamp`. Save searches; use **KQL + filter pills** together.

---

## 6. Windows Event Codes — Reference

### Security log (channel: Security)

| ID | Event | Detection value |
|---|---|---|
| 4624 | Successful logon | **Logon Type** (see below) |
| 4625 | Failed logon | Brute force / spray |
| 4634 / 4647 | Logoff | Session correlation |
| 4648 | Logon w/ explicit creds | runas, lateral, PtH |
| 4672 | Special privileges assigned | Admin/SYSTEM logon |
| 4673 / 4674 | Privileged service / object | Priv use |
| 4688 | Process creation | Enable cmdline auditing |
| 4689 | Process termination | Session timeline |
| 4697 / 7045 | Service installed | PsExec, persistence |
| 4698 / 4702 | Scheduled task created/updated | Persistence |
| 4720 / 4722 / 4738 | User created/enabled/changed | Account manipulation |
| 4724 / 4723 | Password reset/change | Account takeover |
| 4728 / 4732 / 4756 | Added to (global/local/universal) group | Privilege abuse (Domain Admins) |
| 4768 | Kerberos TGT (AS-REQ) | AS-REP roast if PreAuth=0 |
| 4769 | Kerberos service ticket (TGS-REQ) | Kerberoast if enc 0x17 |
| 4771 | Kerberos pre-auth failed | Kerberos brute force |
| 4776 | NTLM credential validation | NTLM auth, PtH |
| 4662 | Operation on AD object | DCSync (replication GUIDs) |
| 5140 / 5145 | Network share accessed / detailed | Share access, lateral |
| 1102 | Security log cleared | Anti-forensics |

### Logon Types (4624 `LogonType`)

| Type | Meaning | Notable for |
|---|---|---|
| 2 | Interactive (console) | Physical / RDP console |
| 3 | Network | SMB, WMI — **lateral movement** |
| 4 | Batch | Scheduled tasks |
| 5 | Service | Service account |
| 7 | Unlock |  |
| 8 | NetworkCleartext | Cleartext creds (IIS basic) |
| 9 | NewCredentials | runas /netonly — **PtH / overpass-the-hash** |
| 10 | RemoteInteractive | **RDP** |
| 11 | CachedInteractive | Cached domain creds |

### PowerShell channel

`4104` script-block (deobfuscated code — read this) · `4103` module/pipeline · `400/403/600` engine start/stop.

---

## 7. Sysmon — Reference & Detections

| EID | Event | Hunt for |
|---|---|---|
| 1 | Process create | Full cmdline, hashes, parent |
| 2 | File creation time changed | Timestomping |
| 3 | Network connection | C2, beaconing, odd dest ports |
| 5 | Process terminated | Timeline correlation |
| 6 | Driver loaded | Rootkits, BYOVD |
| 7 | Image/DLL loaded | DLL sideloading, unsigned modules |
| 8 | CreateRemoteThread | Process injection |
| 9 | RawAccessRead | Disk raw read (evasion) |
| 10 | ProcessAccess | **LSASS access** (cred dumping) |
| 11 | File create | Dropped payloads, web shells |
| 12/13/14 | Registry object/value/key | Run keys, persistence, tamper |
| 15 | FileCreateStreamHash | ADS / mark-of-the-web abuse |
| 17/18 | Named pipe created/connected | PsExec, C2 frameworks |
| 22 | DNS query | Tunneling, C2 domains |
| 23/26 | File delete | Evidence destruction |
| 25 | Process tampering | Process hollowing/herpaderping |

**Golden signals:** parent-child anomalies (EID 1), LSASS access (EID 10), unusual outbound (EID 3), Run-key/registry persistence (EID 13), named pipes matching C2 defaults (EID 17/18).

---

## 8. PowerShell & Script-Based Attack Detection

**Obfuscation indicators (4104):** `-enc`/`-EncodedCommand`, `FromBase64String`, `[char[]]`, backtick splitting, string reversal, `-join`, `Invoke-Expression`/`IEX`, `DownloadString`/`DownloadFile`, `Net.WebClient`, `Reflection.Assembly`, `[Ref].Assembly`.

**AMSI / logging bypass (4104):** `amsiInitFailed`, `AmsiUtils`, `System.Management.Automation.AmsiUtils`, `VirtualProtect`, `EtwEventWrite` patching.

```spl
index=main EventCode=4104 (Message="*amsiInitFailed*" OR Message="*AmsiUtils*" OR Message="*EtwEventWrite*" OR Message="*FromBase64String*" OR Message="*IEX*")
```

```kql
event.code: "4104" and powershell.file.script_block_text: (*AmsiUtils* or *amsiInitFailed* or *EtwEventWrite* or *VirtualProtect* or *FromBase64String*)
```

**Tip:** script-block logging (4104) records the **deobfuscated** code — even if the attacker sent base64, you often see the plaintext here.

---

## 9. Linux Incident Response

**Sources:** `auditd` (`/var/log/audit/audit.log`), `/var/log/auth.log` (Debian) / `secure` (RHEL), `syslog`, `journald`, `~/.bash_history`, `/var/log/cron`.

| Signal | Where / how |
|---|---|
| Auth success/failure | auth.log/secure; `event.action: ssh_login` |
| sudo abuse | auth.log `sudo:`; auditd `execve` |
| New user / passwd change | `useradd`, `passwd`, `/etc/passwd` writes |
| Cron persistence | `/etc/cron*`, `crontab -e`, auditd file watch |
| Suspicious execve | auditd `type=EXECVE` |
| SUID abuse (privesc) | GTFOBins binaries run as root |
| Reverse shell | process w/ socket to external IP (`bash -i`, `nc`, `python -c`) |
| Rootkit / persistence | `/etc/ld.so.preload`, `.bashrc`, systemd units |

```kql
# Reverse shell / suspicious exec
process.name: ("bash" or "sh" or "nc" or "ncat" or "python*" or "perl") and process.command_line: (*"-i"* or *"/dev/tcp/"* or *"-e /bin/"*)

# sudo to root by unexpected user
event.dataset: "system.auth" and process.name: "sudo" and message: *COMMAND=*
```

```bash
# Triage on a live/imaged host
last -f /var/log/wtmp                 # logins
grep -Ei "accepted|failed" /var/log/auth.log
ausearch -m execve --start recent     # recent process execs
cat /etc/passwd | awk -F: '$3<1000'   # system accounts / anomalies
crontab -l; ls -la /etc/cron.*        # persistence
find / -perm -4000 -type f 2>/dev/null # SUID hunt
```

---

## 10. Web Attack Detection

Work IIS/Apache/Nginx access logs (or `apache.access`/`nginx.access` datasets).

```spl
# SQL injection
index=web sourcetype=access_combined (uri_query="*UNION*" OR uri_query="*information_schema*" OR uri_query="*' OR 1=1*" OR uri_query="*sleep(*" OR uri_query="*waitfor delay*")

# LFI / path traversal
index=web (uri_query="*../*" OR uri_query="*..%2f*" OR uri_query="*/etc/passwd*" OR uri_query="*php://*")

# Command injection
index=web (uri_query="*;*" OR uri_query="*|*" OR uri_query="*`*" OR uri_query="*$(*" OR uri_query="*whoami*" OR uri_query="*nc *")

# Web shell = server process spawning a shell
index=main EventCode=1 ParentImage IN ("*w3wp.exe","*httpd*","*nginx*","*php-cgi*") Image IN ("*cmd.exe","*powershell.exe","*sh","*bash")

# Bursts of errors / scanning
index=web | stats count by status, src_ip | where status>=400
```

**Signals:** spikes of 4xx/5xx, abnormal response sizes, one IP hammering one parameter, odd user-agents (sqlmap, nikto, curl, empty), unexpected `.php/.aspx/.jsp` written to web root.

---

## 11. Network & IDS Detection (Snort / Suricata / Zeek)

- **Snort/Suricata** alerts land with `tags: "snort.log"` or `event.dataset: suricata.eve`. Pivot from `rule.name`/`signature` to host telemetry via `source.ip`/`destination.ip`.

```kql
tags: "snort.log" and network.type: "ipv4" and not destination.ip: 10.0.0.0/8
```

- **Snort rule anatomy** (read, don't necessarily write):

```
alert tcp any any -> $HOME_NET 445 (msg:"SMB exploit attempt"; content:"|FF|SMB"; sid:1000001; rev:1;)
```

- **Zeek** conn/dns/http/ssl logs give netflow-level pivoting when payloads aren't captured. `conn.log` (5-tuple + bytes), `dns.log` (queries), `http.log` (URIs/UAs), `ssl.log` (JA3/cert).
- **Beaconing** — regular-interval, similar-size connections to one destination (aggregate `destination.ip` + count + interval; watch for low jitter).

---

## 12. Wireshark / PCAP Investigation Methodology

Each step is a real `tshark`/`capinfos` command (parenthetical = what it reveals); `tshark` uses the **same display filters** as the Wireshark filter bar.

### Step 0 — Facts about the capture

```bash
capinfos capture.pcap
# packet count, byte rate, FIRST/LAST packet time, SHA-256 (record the hash for the report)
```

### Step 1 — What protocols exist? (scope)

```bash
tshark -r capture.pcap -q -z io,phs
# kerberos/ldap/smb/dcerpc = AD activity; irc/tftp/unusual high ports = follow up
```

*Wireshark:* Statistics → Protocol Hierarchy.

### Step 2 — Who talks to whom? (actors)

```bash
tshark -r capture.pcap -q -z conv,ip     # top talkers by bytes
tshark -r capture.pcap -q -z conv,tcp    # per-flow breakdown
tshark -r capture.pcap -q -z endpoints,ip
```

*Wireshark:* Statistics → Conversations / Endpoints (sort by Bytes).

### Step 3 — Resolve names & identities

```bash
tshark -r capture.pcap -Y "dhcp" -T fields -e ip.src -e dhcp.option.hostname
tshark -r capture.pcap -Y "kerberos" -T fields -e ip.src -e kerberos.realm -e kerberos.CNameString -e kerberos.SNameString
tshark -r capture.pcap -Y "ntlmssp.auth.username" -T fields -e ntlmssp.auth.domain -e ntlmssp.auth.username -e ntlmssp.auth.hostname
```

### Step 4 — Authentication analysis

```bash
# Kerberos msg_type: 10 AS-REQ · 11 AS-REP · 12 TGS-REQ · 13 TGS-REP · 14 AP-REQ · 15 AP-REP · 30 KRB-ERROR
tshark -r capture.pcap -Y "kerberos.msg_type" -T fields -e frame.time -e ip.src -e ip.dst -e kerberos.msg_type -e kerberos.CNameString -e kerberos.etype
# etype 0x17/23 = RC4 (Kerberoast/downgrade); 0x12/18 = AES256
```

### Step 5 — SMB (shares, files, lateral movement)

```bash
tshark -r capture.pcap -Y "smb2.tree" -T fields -e smb2.tree            # shares (IPC$, SysVol, custom)
tshark -r capture.pcap -Y "smb2.filename" -T fields -e frame.time -e smb2.filename
```

### Step 6 — MS-RPC / DCERPC (enumeration & AD attacks)

```bash
tshark -r capture.pcap -Y "dcerpc.cn_bind_to_uuid" -T fields -e ip.src -e ip.dst -e dcerpc.cn_bind_to_uuid
tshark -r capture.pcap -Y "samr || drsuapi || srvsvc || lsarpc" -T fields -e frame.time -e ip.src -e dcerpc.opnum
```

**Key UUIDs:** DRSUAPI `e3514235-4b06-11d1-ab04-00c04fc2dcd2` · SAMR `12345778-…-89ac` · LSARPC `12345778-…-89ab` · SRVSVC `4b324fc8-1670-01d3-1278-5a47bf6ee188` · Netlogon `12345678-…cffb`. **Watch:** DRSUAPI **opnum 3 =**`DsGetNCChanges`**= DCSync**. (Opnum 0/1/12 = Bind/Unbind/CrackNames — *not* DCSync; verify before claiming replication.)

### Step 7 — Web, DNS & C2 hunting

```bash
tshark -r capture.pcap -Y "http.request" -T fields -e http.host -e http.request.method -e http.request.uri -e http.user_agent
tshark -r capture.pcap -Y "dns.flags.response==0" -T fields -e dns.qry.name | sort | uniq -c | sort -rn
tshark -r capture.pcap -Y "tls.handshake.type==1" -T fields -e tls.handshake.extensions_server_name   # SNI for C2
```

### Step 8 — Carve transferred files (prove what was taken)

```bash
tshark -r capture.pcap --export-objects "smb,./out_smb" -q
tshark -r capture.pcap --export-objects "http,./out_http" -q
grep -rl "cpassword" ./out_smb     # e.g. check GPP files for a recoverable password
```

*Wireshark:* File → Export Objects → SMB / HTTP; Follow → TCP/HTTP Stream to read full exchanges.

### Handy Wireshark display filters

```
ip.addr==10.0.0.5 && tcp.port==445
http.request.method=="POST"
http.user_agent contains "powershell"
dns.qry.name contains "xxxx"          # long/odd subdomains
frame contains "password"             # cleartext creds
smb2.cmd==5                           # SMB2 Create (file access)
tcp.flags.syn==1 && tcp.flags.ack==0  # SYN scan
icmp.data.len > 48                    # ICMP tunneling
```

### Triage principles

- **Separate signal from noise** — OCSP/CRL, Windows Update, SSDP, bulk LLMNR/NBNS are usually benign; document as excluded so they aren't mistaken for C2.
- **Prove, don't assume** — if an attack is plausible (e.g. DCSync), find the confirming packet or state it was checked and absent.
- **Anchor every claim** to a frame number and timestamp.

---

## 13. Credential Access & Active Directory Attacks

| Attack | What to look for |
|---|---|
| **LSASS dumping** | Sysmon 10 access to `lsass.exe` (mask 0x1010/0x1410); `procdump`, `comsvcs.dll MiniDump`, `rundll32 … MiniDump`, `mimikatz` |
| **Kerberoasting** | 4769 with encryption type **0x17 (RC4)**, many distinct services from one user |
| **AS-REP roasting** | 4768 with **PreAuthType 0** |
| **Pass-the-Hash** | 4624 **type 9** / 4648 + NTLM 4776 |
| **Overpass-the-hash** | 4768 with RC4 right after PtH |
| **DCSync** | 4662 with replication GUIDs `1131f6aa-…`/`1131f6ad-…` from a **non-DC**; in PCAP, DRSUAPI `DsGetNCChanges` (opnum 3) |
| **Golden Ticket** | TGS without preceding TGT, absurd ticket lifetime, `krbtgt` misuse |
| **Silver Ticket** | Service access with no matching TGT/TGS at the DC |
| **GPP cpassword** | Bulk SysVol reads of `Groups.xml`/`ScheduledTasks.xml`; carve and check for `cpassword` |

```kql
# Kerberoasting
event.code: "4769" and winlog.event_data.TicketEncryptionType: "0x17"
# AS-REP roasting
event.code: "4768" and winlog.event_data.PreAuthType: "0"
# DCSync from non-DC
event.code: "4662" and winlog.event_data.Properties: (*1131f6aa-9c07-11d1-f79f-00c04fc2dcd2* or *1131f6ad-9c07-11d1-f79f-00c04fc2dcd2*) and not user.name: *$
```

---

## 14. Persistence Detection

| Mechanism | Artifact |
|---|---|
| Run/RunOnce keys | Sysmon 13 `\CurrentVersion\Run*`; reg.exe |
| Scheduled task | 4698; `schtasks`; Sysmon 1 `taskeng.exe`/`svchost` children |
| New service | 7045 / 4697; Sysmon 1 `services.exe` child |
| WMI event subscription | `__EventFilter`/`CommandLineEventConsumer` (Sysmon 19/20/21) |
| Startup folder | Sysmon 11 file create in Startup |
| Registry logon scripts / Winlogon | Sysmon 13 `Userinit`/`Shell` changes |
| DLL search-order / sideloading | Sysmon 7 unsigned/unexpected module |
| Accessibility / IFEO | `sethc.exe`, `Debugger` reg value |

```spl
index=main (EventCode=7045 OR EventCode=4697 OR EventCode=4698)
| table _time host EventCode Service_Name Service_File_Name Task_Name
```

---

## 15. Lateral Movement Detection

| Technique | Primary artifacts |
|---|---|
| **PsExec** | 7045 (`PSEXESVC`), 4624 type 3, named pipe (Sysmon 17/18) |
| **WMI (wmiexec)** | `wmiprvse.exe` spawning cmd/powershell; 4624 type 3 |
| **WinRM (PS remoting)** | `wsmprovhost.exe` parent; ports 5985/5986 |
| **RDP** | 4624 **type 10**, 4778/4779, `mstsc`/`rdpclip` |
| **Scheduled task (schtasks /s)** | 4698 on remote host |
| **Pass-the-Hash** | 4624 **type 9** / 4648, NTLM 4776 |
| **Admin share copy** | 5140/5145 to `ADMIN$`/`C$`; SMB2 write of exe/dll |

```kql
event.code: "7045" and winlog.event_data.ServiceName: (*PSEXESVC* or *PAExec* or *RemCom*)
event.code: "1" and process.parent.name: ("wmiprvse.exe" or "wsmprovhost.exe") and process.name: ("cmd.exe" or "powershell.exe")
event.code: "4624" and winlog.event_data.LogonType: "10"
```

---

## 16. Command & Control / Exfiltration Detection

- **Beaconing** — regular interval + similar size to one dest; `timechart span=1m` (Splunk) or Sysmon 3 aggregation.
- **DNS tunneling** — high volume of TXT/NULL queries, long/high-entropy subdomains, many unique subdomains under one parent.
- **HTTP(S) C2** — long-lived sessions, odd JA3, self-signed cert/odd SNI on 443, unexpected user-agent, no owning browser process.
- **Ingress tool transfer** — `certutil`/`bitsadmin`/`curl`/`powershell DownloadString` pulling payloads.
- **Exfil** — large outbound POST/PUT, big transfer to unknown IP, archive creation before upload.

```spl
# Possible exfil: large outbound
index=main EventCode=3 | stats sum(bytes_out) as out by host, DestinationIp | sort -out
# DNS tunneling surface
index=main EventCode=22 | stats dc(QueryName) as uniq by host | where uniq>200
```

---

## 17. Endpoint & Memory Forensics (quick reference)

**Key Windows artifacts:** Prefetch (`C:\Windows\Prefetch`, execution evidence), Amcache/Shimcache (program execution), `$MFT` (file timeline), Registry hives (SYSTEM/SOFTWARE/NTUSER — persistence, USB, run keys), Event logs (`.evtx`), Recycle Bin, Jump Lists, SRUM.

**Volatility 3 quick commands (if a memory image is provided):**

```bash
vol -f mem.raw windows.pslist          # processes
vol -f mem.raw windows.pstree          # parent-child tree
vol -f mem.raw windows.netscan         # network connections
vol -f mem.raw windows.cmdline         # process command lines
vol -f mem.raw windows.malfind         # injected code
vol -f mem.raw windows.dlllist --pid N # loaded DLLs
vol -f mem.raw windows.handles --pid N # handles
```

**What to look for:** unusual parent-child (e.g. `services.exe`→`cmd.exe`), processes with no disk path, injected regions (malfind), connections to odd IPs, `lsass` accessed by non-system processes.

---

## 18. MITRE ATT&CK — Detection Mapping

| Tactic | Technique | ID | Evidence |
|---|---|---|---|
| Initial Access | Phishing | T1566 | Mail→Office→shell |
| Initial Access | Exploit Public-Facing App | T1190 | Web process spawning shell |
| Execution | PowerShell | T1059.001 | 4104 / `-enc`/`IEX` |
| Execution | Cmd Shell | T1059.003 | cmd.exe children |
| Persistence | Registry Run Keys | T1547.001 | Sysmon 13 |
| Persistence | Scheduled Task | T1053.005 | 4698 |
| Persistence | New Service | T1543.003 | 7045 |
| Priv Esc | Bypass UAC | T1548.002 | fodhelper/eventvwr→cmd |
| Priv Esc | Token Impersonation | T1134 | 4673/4674 |
| Defense Evasion | Obfuscated Files | T1027 | base64/encoded |
| Defense Evasion | Impair Defenses | T1562 | AMSI/ETW patch, 1102 |
| Cred Access | LSASS Dump | T1003.001 | Sysmon 10→lsass |
| Cred Access | DCSync | T1003.006 | 4662 replication GUID / DRSUAPI opnum 3 |
| Cred Access | Kerberoasting | T1558.003 | 4769 enc 0x17 |
| Cred Access | GPP Passwords | T1552.006 | SysVol GPP reads |
| Discovery | Account/Group Discovery | T1087/T1069 | SAMR, net, LDAP |
| Discovery | Network Share Discovery | T1135 | SRVSVC enum |
| Lateral Movement | Remote Services / PsExec | T1021 / T1570 | 7045 PSEXESVC, 4624 type 3 |
| Lateral Movement | RDP | T1021.001 | 4624 type 10 |
| C2 | App-Layer Protocol | T1071 | HTTP/DNS beaconing |
| C2 | Ingress Tool Transfer | T1105 | certutil/bitsadmin |
| Exfil | Exfil over C2 | T1041 | large outbound |

---

## 19. Indicators of Compromise (IOC) Cheatsheet

Track and pivot on these throughout an investigation:

- **Network:** attacker IPs, C2 domains, JA3 hashes, ports, user-agents.
- **Host:** file hashes (MD5/SHA1/SHA256), file paths, service/task names, registry keys, named pipes, mutexes.
- **Account:** compromised usernames, created accounts, privileged-group additions.
- **Behavioral (highest value):** parent-child chains, LOLBin usage, logon-type patterns, beacon intervals.

Keep a running IOC table; re-search each new IOC across **all** log sources and the full time range.

---

## 20. Timeline Building & Report Template

**Timeline row format:** `time | host | user | action | evidence (source + ID/frame) | MITRE`.

**Report skeleton:**

```
1. Executive Summary        (what happened, impact, severity — plain language)
2. Scope & Assets           (hosts, accounts, IPs involved)
3. Timeline of Events       (chronological, evidence-anchored)
4. Detailed Findings        (per finding: what, evidence, interpretation)
5. MITRE ATT&CK Mapping
6. Indicators of Compromise
7. Recommendations          (containment, eradication, hardening, detections)
8. Appendix                 (queries used, carved files, method)
```

**Golden rule:** every claim ties to evidence (event ID + timestamp, or frame number). If an attack is plausible but unproven, say it was checked and excluded.

---

## 21. Kerberos & Authentication Deep-Dive

Understanding the ticket flow makes Kerberos attacks obvious in logs/PCAP.

**Normal flow:**

1. **AS-REQ / AS-REP** (msg 10/11) — client proves identity to the KDC and receives a **TGT** (encrypted with the `krbtgt` key). Pre-authentication timestamp is encrypted with the user's password hash.
2. **TGS-REQ / TGS-REP** (msg 12/13) — client presents the TGT and requests a **service ticket (TGS)** for a specific SPN.
3. **AP-REQ / AP-REP** (msg 14/15) — client presents the service ticket to the target service.

- **KRB-ERROR** (msg 30) — errors, e.g. `KRB5KDC_ERR_PREAUTH_REQUIRED` (the expected first response before pre-auth).

**Encryption types:** `0x12` = AES256, `0x11` = AES128, `0x17` = **RC4** (weak — downgrade/roasting signal), `0x03` = DES (legacy).

**Attacks mapped to the flow:**

| Attack | Where it shows | Signal |
|---|---|---|
| **AS-REP roasting** | AS-REQ (4768) | account with pre-auth disabled → roastable hash; `PreAuthType 0` |
| **Kerberoasting** | TGS-REQ (4769) | many SPN tickets, **RC4 (0x17)** requested for offline cracking |
| **Pass-the-Ticket** | AP-REQ | reused ticket from another host/user |
| **Golden Ticket** | forged TGT | TGS without a preceding TGT, huge lifetime, `krbtgt` |
| **Silver Ticket** | forged TGS | service access with no DC-side TGS request |
| **Overpass-the-Hash** | AS-REQ | RC4 TGT right after an NTLM logon |

**Windows vs NTLM:** NTLM (4776) is challenge-response and used for local/legacy/IP-based auth; Kerberos is used with hostnames in a domain. A sudden shift to NTLM or RC4 is worth a look (downgrade).

---

## 22. Email / Phishing Analysis

**Header analysis (top to bottom = newest to oldest):**

- `Received:` chain — trace the true origin (bottom-most external hop); mismatches with the claimed sender are suspicious.
- `Return-Path` / `From` / `Reply-To` mismatch — spoofing.
- **SPF / DKIM / DMARC** results (`Authentication-Results`) — `fail`/`softfail` = spoof risk.
- `Message-ID` domain not matching sender domain.
- Display-name spoofing (friendly name ≠ actual address).

**Attachment / link triage:**

- Hash the attachment → check reputation; detonate only in a sandbox.
- Office docs: look for macros (`vbaProject.bin`), external template injection, embedded objects.
- Archives hiding double extensions (`invoice.pdf.exe`), LNK files, ISO/IMG containers.
- URLs: decode redirects, check for look-alike/homoglyph domains, credential-harvest landing pages.

**In logs:** mail gateway logs (sender, subject, verdict), then pivot to endpoint — did the user open it? (Office→shell in Sysmon 1), did it beacon out (Sysmon 3)?

---

## 23. Malware Triage Basics

**Static (no execution):**

```bash
file suspicious.bin                 # type
sha256sum suspicious.bin            # hash → reputation lookup
strings -n 8 suspicious.bin | less  # URLs, IPs, commands, mutexes
# PE specifics: imports, sections, compile time, packer signatures (e.g. UPX)
```

Look for: embedded IPs/domains/URLs, suspicious API imports (`VirtualAlloc`, `WriteProcessMemory`, `CreateRemoteThread`), high-entropy sections (packing), unusual PE timestamps.

**Dynamic (sandbox only):** process tree, files dropped, registry changes, network callbacks, mutexes created. Map observed behavior to MITRE.

**Golden rule:** never run unknown samples outside an isolated VM/sandbox. For the exam you mostly *observe artifacts of* malware in logs rather than reverse it.

---

## 24. Windows Disk Forensic Artifacts

| Artifact | Location | Tells you |
|---|---|---|
| **Prefetch** | `C:\Windows\Prefetch\*.pf` | Program executed, run count, last run |
| **Amcache** | `Amcache.hve` | Executed binaries + SHA1 |
| **Shimcache** | `SYSTEM` hive (AppCompatCache) | Programs present/executed |
| **$MFT** | Volume root | Full file timeline (created/modified/accessed) |
| **UserAssist** | `NTUSER.DAT` | GUI program execution by user |
| **ShellBags** | `NTUSER.DAT`/`UsrClass.dat` | Folders browsed (incl. deleted) |
| **Run keys** | `SOFTWARE`/`NTUSER.DAT` | Persistence |
| **USB history** | `SYSTEM` (USBSTOR) | Removable media |
| **Jump Lists / LNK** | `AppData\...\Recent` | Recently opened files |
| **Browser history** | per-browser SQLite | Downloads, visited URLs |
| **Event logs** | `C:\Windows\System32\winevt\Logs\*.evtx` | Everything in Sections 6–7 |
| **SRUM** | `SRUDB.dat` | Per-app network/resource usage |

**Timeline tip:** combine `$MFT`, event logs, Prefetch, and registry timestamps into one super-timeline; anchor on the intrusion window.

---

## 25. Common Ports & Services Reference

| Port | Service | IR relevance |
|---|---|---|
| 21 | FTP | Cleartext creds, exfil |
| 22 | SSH | Linux auth, tunneling (`-L/-R/-D`) |
| 23 | Telnet | Cleartext |
| 25/587/465 | SMTP | Phishing, exfil |
| 53 | DNS | Tunneling / C2 |
| 80/443 | HTTP/S | Web attacks, C2 |
| 88 | Kerberos | AD auth (roasting) |
| 135 | RPC EPM | WMI, DCOM |
| 137–139 | NetBIOS | Legacy name res, poisoning |
| 389/636 | LDAP/LDAPS | AD enumeration |
| 445 | SMB | Lateral movement, shares |
| 464 | kpasswd | Kerberos password change |
| 1433 | MSSQL | DB attacks, `xp_cmdshell` |
| 3268/3269 | Global Catalog | AD enumeration |
| 3389 | RDP | Lateral movement |
| 5985/5986 | WinRM | PS remoting lateral movement |
| 5357 | WSDAPI | Device discovery |

---

## 26. Exam-Day Playbook

1. Read the scenario prompt — it hints at log sources and the questions asked.
2. Find an anchor — an alert, weird process, suspicious IP, failed-logon spike.
3. Pivot every artifact — one event → process-create, network, registry, children, parent.
4. Note relentlessly — IPs, hashes, filenames, PIDs, timestamps, users (reused later).
5. Widen the time window around each anchor.
6. Build the timeline in order; each row = time, host, user, action, evidence, MITRE ID.
7. Map TTPs as you go, not at the end.
8. Write the story — initial access → what they did → how it spread → impact.

*Build the analyst reflex over perfect syntax: see something → view it from all angles → note it → chain it.*

---

## 27. Glossary

- **SPL** — Search Processing Language (Splunk's query language).
- **KQL** — Kibana Query Language (Elastic's query language).
- **ECS** — Elastic Common Schema (normalized field names).
- **Sysmon** — System Monitor; Sysinternals tool producing rich endpoint telemetry.
- **TTP** — Tactics, Techniques & Procedures (attacker behavior).
- **IOC** — Indicator of Compromise.
- **LOLBin** — Living-Off-the-Land Binary (legit tool abused, e.g. certutil).
- **TGT / TGS** — Kerberos Ticket-Granting Ticket / Service Ticket.
- **SPN** — Service Principal Name (Kerberos service identifier).
- **PtH / PtT** — Pass-the-Hash / Pass-the-Ticket.
- **DCSync** — abusing replication (DsGetNCChanges) to pull password hashes.
- **GPP** — Group Policy Preferences (historically leaked `cpassword`).
- **AMSI** — Antimalware Scan Interface (often bypassed by script attacks).
- **ETW** — Event Tracing for Windows (telemetry source attackers tamper with).
- **C2** — Command & Control.
- **Beaconing** — periodic C2 check-ins at regular intervals.
- **JA3** — TLS client fingerprint.
- **PICERL** — SANS IR lifecycle (Prep, Identify, Contain, Eradicate, Recover, Lessons).
- **MFT** — Master File Table (NTFS file metadata / timeline).
- **BYOVD** — Bring Your Own Vulnerable Driver.

---

## Appendix A — Worked Example: Scenario 2 PCAP Incident Report

> **Example / training material.** A complete incident report produced from the lab capture `scenario2-traffic-capture.pcap` using the Section 12 methodology. Illustrative only — the environment is a training domain; the analysis demonstrates method and reporting style.

|  |  |
|---|---|
| **Capture file** | `scenario2-traffic-capture.pcap` |
| **SHA-256** | `1fe44854416989533fde54848fdb764afb5c4e08ec25d8da4b26f003de1385a6` |
| **Format** | libpcap (Ethernet) · 14,119 packets · 4.64 MB |
| **Capture window** | 2019-04-21 16:17:52 → 17:59:58 UTC (~1h 42m) |
| **Environment** | Active Directory domain `TESTDOMAIN.COM` (lab) |
| **Classification** | Internal AD reconnaissance / credentialed enumeration |
| **Severity** | Medium–High (privilege-mapping recon against a DC; no confirmed exfiltration or credential replication) |

## A1. Executive Summary

The capture records **systematic Active Directory reconnaissance from a single internal host,**`HR1`**(192.168.220.101)**, aimed at the domain controller `W2012r2-DC01` (192.168.220.11) and, later, a second workstation (192.168.220.102). Over ~100 minutes HR1 authenticated to the DC on a ~5-minute cadence and enumerated across **Kerberos, LDAP/CLDAP, SMB/SMB2** and **MS-RPC** (SAMR, DRSUAPI, LSARPC, SRVSVC, Netlogon), using identities `vulnscan` (Kerberos), `luser` (NTLM), `HR1$` (machine) and an **anonymous NULL** SMB session. The cadence and the account name `vulnscan` fit an **authenticated vulnerability scan / AD assessment tool**; regardless of intent the behavior matches an adversary's discovery phase.

**Verified by file carving:** the GPP `ScheduledTasks.xml` files read from SysVol contain **no**`cpassword` — they deploy the environment's own **Sysmon** and **Autoruns** as SYSTEM; `secret.txt`**was never read** (listed only). **Ruled out:** no **DCSync** (DRSUAPI did only Bind/`DsCrackNames`, no `DsGetNCChanges`); external web traffic (OCSP/CRL/Windows Update/SSDP) is benign, not C2.

## A2. Assets & Identities

| Host / IP | Role | Evidence |
|---|---|---|
| **192.168.220.11** | DC `W2012r2-DC01.testdomain.com` | KDC, LDAP, SysVol, DRSUAPI, SAMR responder |
| **192.168.220.101** | Workstation `HR1` — **source of recon** | DHCP `HR1`; Kerberos `hr1$`; NTLM `HR1` |
| **192.168.220.102** | Workstation — **lateral recon target** | SRVSVC share enumeration target |
| **192.168.220.100** | Workstation `VICTIM` — passive | DHCP `VICTIM`; no offensive activity |
| **192.168.220.1** | Gateway | Routing/broadcast |

Identities from HR1: `TESTDOMAIN\vulnscan` (Kerberos, ~5-min cadence) · `TESTDOMAIN\luser` (NTLM) · `TESTDOMAIN\HR1$` · NULL/anonymous.

## A3. Timeline of Events (UTC)

| Time | Source → Dest | Activity | Evidence (frame) |
|---|---|---|---|
| 16:17:52 | HR1 | Capture begins; SSDP/Chrome, OCSP/CRL cert checks (benign) | 1+ |
| 16:18:33 | HR1 → DC | First Kerberos AS-REQ for `vulnscan` (AES256/RC4 offered) | 142 |
| 16:23–16:48 | HR1 → DC | Repeating `vulnscan` Kerberos auth every ~5 min (automated) | 873, 1428, 1826, 2242, 3094, 3913 |
| 16:27:36 | HR1 → DC | SMB2 tree connect to `\\W2012R2-DC01\IPC$` (RPC transport) | — |
| 16:28:23 | HR1 → DC | **DRSUAPI** bind + `DsCrackNames`; **LSARPC**; Netlogon | 1305–1334 |
| 16:28:24 | HR1 → DC | **SysVol** — reads `gpt.ini` for 4 GPOs | — |
| 16:51:10 | HR1 → DC | Second DRSUAPI `DsCrackNames`; reads **GPP**`ScheduledTasks.xml` ×2; `audit.csv` | 4552–4679 |
| 17:00:00 | HR1 → DC | Browses `\\192.168.220.11\share`: lists `autoruns, filebeat, sysmon, secret.txt`; downloads `sysmon\config.xml`, `Sysmon64.exe` | 5945–5966 |
| 17:09:05 | HR1 → DC | **SAMR** — enumerates `Domain Admins`**group members** | 8177–8226 |
| 17:13:50 | HR1 → **192.168.220.102** | SMB2 to `IPC$`; **SRVSVC** share enumeration | 8982–8992 |
| 17:17:31 / 17:17:49 | HR1 → 192.168.220.102 | Repeat SRVSVC share enumeration | 9318+ |
| 17:59:58 | — | Capture ends | 14119 |

## A4. Detailed Findings

**A4.1 Repeated credentialed Kerberos auth (**`vulnscan`**).** TGT requests every ~5 min; fixed cadence + account name indicate an automated authenticated scan. Etypes AES256 (0x12) and RC4 (0x17) offered.

**A4.2 AD object enumeration via LDAP + DRSUAPI**`DsCrackNames`**.** HR1 binds DRSUAPI and issues `DsCrackNames` (opnum 12) alongside CLDAP/LDAP. **No**`DsGetNCChanges`**(opnum 3) — this is not DCSync.**

**A4.3 SysVol / GPP reads — technique exercised, no credential exposed.** HR1 pulls `ScheduledTasks.xml` from two GPOs plus `audit.csv`. Both XML files were carved and contain **no**`cpassword`; they define legitimate SYSTEM tasks deploying **Autoruns** (`\\192.168.220.11\Share\autoruns\install.bat`) and **Sysmon** (`\\192.168.220.11\share\sysmon\sysmon.bat`). Classic GPP credential-hunt (MS14-025) that returned nothing; also discloses the defensive posture.

**A4.4 Access to a share with security tooling and**`secret.txt`**.** HR1 browses `\\192.168.220.11\share` (contents: `autoruns`, `filebeat`, `sysmon`, `secret.txt`) and **downloads the Sysmon config and binary**. Carving confirms `secret.txt`**was never transferred** — filename disclosed only, no exfiltration.

**A4.5 Domain Admins enumeration via SAMR — privilege recon.** `SamrConnect5` → `OpenDomain` → `LookupNames("Domain Admins")` → `OpenGroup` → `GetMembersInGroup`. Maps who holds Domain Admin.

**A4.6 Lateral reconnaissance to 192.168.220.102.** SRVSVC share enumeration, repeated — discovery extended beyond the DC.

**A4.7 Anonymous (NULL) SMB session.** NULL logon from HR1 alongside authenticated ones — consistent with anonymous enumeration.

**A4.8 Benign / noise (excluded).** External HTTP = OCSP/CRL/Windows Update via `Microsoft-CryptoAPI`; SSDP M-SEARCH (Chrome); high-volume LLMNR/NBNS = normal name resolution. Repeated `wpad` queries seen but **no malicious responder answered** (no poisoning).

## A5. MITRE ATT&CK Mapping

| Tactic | Technique | ID | Evidence |
|---|---|---|---|
| Discovery | Domain Account Discovery | T1087.002 | SAMR user/group enumeration |
| Discovery | Permission Groups Discovery — Domain Groups | T1069.002 | SAMR `Domain Admins` lookup |
| Discovery | Network Share Discovery | T1135 | SRVSVC share enum (DC and .102) |
| Discovery | Remote System Discovery | T1018 | LDAP/CLDAP + pivot to .102 |
| Discovery | System Owner/User Discovery | T1033 | LDAP + DRSUAPI `DsCrackNames` |
| Credential Access | Unsecured Credentials — GPP | T1552.006 | GPP `ScheduledTasks.xml` reads *(attempted; no*`cpassword`*— nothing obtained)* |
| Credential Access | Valid Accounts / Brute-force *(context)* | T1078 / T1110 | `vulnscan` auth, NULL session |
| Collection | Data from Network Shared Drive | T1039 | Sysmon config/binary downloaded from DC share |

*Not observed:* T1003.006 (DCSync) — explicitly checked and absent.

## A6. Recommendations

1. Identify the process/tool on **HR1** driving `vulnscan`; if sanctioned scanning, document/exempt, else isolate and treat as compromised.
2. The two GPP files here contain **no**`cpassword` (verified) — no rotation needed from them; as hygiene, sweep all domain GPP files for `cpassword`.
3. Remove `secret.txt` and sensitive material from `\\192.168.220.11\share`; restrict ACLs (not exfiltrated here, but filename disclosed).
4. Disable **anonymous/NULL SMB**; enforce **SMB signing**.
5. Alert on **SAMR/LSARPC privileged-group enumeration** (4662 / SACLs on Domain Admins).
6. Alert on **bulk SysVol GPP reads** (`ScheduledTasks.xml`/`Groups.xml`).
7. Disable **WPAD/LLMNR/NBT-NS** to close the poisoning surface.
8. Baseline `vulnscan`; page on cadence/target deviation.

## A7. Carved File Evidence

| File (from `\\W2012r2-DC01\...`) | Size | Verdict |
|---|---|---|
| `...{827E717C}\...\ScheduledTasks.xml` | 1728 B | Task **"Autoruns"** as SYSTEM → `install.bat`. **No**`cpassword`**.** |
| `...{B0E29731}\...\ScheduledTasks.xml` | 1755 B | Task **"Sysmon"** as SYSTEM → `sysmon.bat`. **No**`cpassword`**.** |
| `...{8C77C602}\...\audit.csv` | 1871 B | Advanced audit policy (defensive config) |
| `sysmon\config.xml` | ~104 KB | Sysmon configuration (downloaded by HR1) |
| `sysmon\Sysmon64.exe` | ~1.45 MB | Sysmon binary (downloaded by HR1) |
| `secret.txt` | — | **Not transferred** — listed only; contents never read |

**Interpretation:** the GPP/SysVol artifacts are the environment's **own monitoring deployment** (Sysmon + Autoruns via SYSTEM scheduled tasks). HR1 downloaded the Sysmon config and binary — the clearest data-access event, useful for evasion planning — but obtained **no credentials** and did **not** read `secret.txt`.

---

## Appendix B — Worked Example: Splunk Scenario (mini)

> **Example / training material.** An illustrative walkthrough of how you'd work a Splunk scenario end-to-end. Field names are generic — adapt to the actual index/sourcetypes on the exam.

**Prompt (typical):** *"A workstation is suspected compromised via a phishing email. Determine initial access, what executed, and whether the attacker moved laterally."*

**Step 1 — Establish the window & host.** Start broad, find the anchor.

```spl
index=* host=WKSTN-07 | stats count by sourcetype   # what telemetry exists
index=main host=WKSTN-07 EventCode=1 | timechart span=1h count   # activity spikes
```

**Step 2 — Initial access: Office spawning a shell.**

```spl
index=main host=WKSTN-07 EventCode=1 ParentImage IN ("*winword.exe","*excel.exe","*outlook.exe")
| table _time ParentImage Image CommandLine
```

*Found:* `winword.exe → powershell.exe -enc <base64>` at 09:14 → **T1566 / T1059.001**. Note the time as the anchor.

**Step 3 — Deobfuscate & find the payload pull.**

```spl
index=main host=WKSTN-07 EventCode=4104 | table _time Message   # script-block shows plaintext
index=main host=WKSTN-07 EventCode=3 Image="*powershell.exe"     # where did it call out?
```

*Found:* PowerShell `DownloadString` from `http://185.x.x.x/a.ps1`, then a Sysmon 3 connection to that IP → **T1105 (Ingress Tool Transfer)**. Record the C2 IP as an IOC.

**Step 4 — Persistence check.**

```spl
index=main host=WKSTN-07 (EventCode=13 TargetObject="*\\Run*") OR EventCode=7045 OR EventCode=4698
```

*Found:* Run-key added pointing to the dropped payload → **T1547.001**.

**Step 5 — Credential access.**

```spl
index=main host=WKSTN-07 EventCode=10 TargetImage="*lsass.exe"
```

*Found:* `powershell.exe` accessing `lsass` → **T1003.001**. Attacker likely has creds now — pivot on any new accounts used.

**Step 6 — Lateral movement.**

```spl
index=main EventCode=4624 Logon_Type IN (3,10) Account_Name=<compromised_user>
| stats count by ComputerName, src_ip, Logon_Type
```

*Found:* type 3 logons from WKSTN-07 to SRV-DB01 → **T1021**. Scope now includes a second host.

**Step 7 — Build the timeline & write it up.**

```
09:14  WKSTN-07  jdoe   winword.exe → powershell -enc         Sysmon 1 / 4104   T1566, T1059.001
09:14  WKSTN-07  jdoe   PS DownloadString 185.x.x.x/a.ps1     Sysmon 3          T1105
09:15  WKSTN-07  jdoe   Run-key persistence                   Sysmon 13         T1547.001
09:16  WKSTN-07  jdoe   lsass access (cred dump)              Sysmon 10         T1003.001
09:22  SRV-DB01  jdoe   network logon from WKSTN-07           4624 type 3       T1021
```

**Lesson:** each finding fed the next pivot. That chain — not any single query — is the answer.

---

## Appendix C — Quick "See X → Suspect Y"

| Observation | Likely technique |
|---|---|
| Office app → powershell/cmd | Malicious macro / client-side exec |
| Web server process → cmd/sh | Web shell |
| `certutil -urlcache` / `bitsadmin` | Payload download (LOLBin) |
| 4769 enc 0x17, many services | Kerberoasting |
| 4768 PreAuthType 0 | AS-REP roasting |
| 4624 type 3 + 7045 PSEXESVC | PsExec lateral movement |
| 4624 type 10 | RDP lateral movement |
| 4624 type 9 / 4648 + NTLM | Pass-the-Hash |
| Sysmon 10 → lsass | Credential dumping |
| 4662 replication GUID, non-DC | DCSync |
| DRSUAPI opnum 3 (PCAP) | DCSync |
| SAMR LookupNames("Domain Admins") | Privileged-group recon |
| 1102 / audit.log cleared | Anti-forensics |
| Many TXT DNS, long subdomains | DNS tunneling |
| fodhelper/eventvwr → cmd | UAC bypass |
| Bulk SysVol GPP reads | GPP credential hunt |

---

*End of guide. All queries and filters are templates — validate against the actual data set before relying on them. Appendix A is illustrative training material.*

{% endraw %}
